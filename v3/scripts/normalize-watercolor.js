// Developer-only PNG encoding utility. No resizing, recoloring or artwork edits.
// RGB samples become RGBA with alpha 255; existing RGBA samples stay identical.
import { readFile, writeFile, readdir, rename, rm, mkdir, access } from 'node:fs/promises';
import { deflateSync, inflateSync } from 'node:zlib';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const SIGNATURE = Buffer.from('89504e470d0a1a0a', 'hex');
const colorChunks = new Set(['cHRM', 'gAMA', 'iCCP', 'sRGB', 'cICP']);
const crcTable = Array.from({ length: 256 }, (_, byte) => {
  for (let bit = 0; bit < 8; bit++) byte = (byte >>> 1) ^ ((byte & 1) ? 0xedb88320 : 0);
  return byte >>> 0;
});
const crc32 = bytes => {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
};
const paeth = (left, above, corner) => {
  const predicted = left + above - corner;
  const a = Math.abs(predicted - left), b = Math.abs(predicted - above), c = Math.abs(predicted - corner);
  return a <= b && a <= c ? left : b <= c ? above : corner;
};
function chunk(type, bytes) {
  const out = Buffer.alloc(bytes.length + 12);
  out.writeUInt32BE(bytes.length); out.write(type, 4, 4, 'ascii'); bytes.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, -4)), out.length - 4);
  return out;
}

/** Decode supported PNGs to exact RGBA sample bytes, checking CRCs first. */
export function decodePng(bytes) {
  if (!Buffer.isBuffer(bytes)) bytes = Buffer.from(bytes);
  if (!bytes.subarray(0, 8).equals(SIGNATURE)) throw Error('Keine PNG-Datei.');
  const idats = [], profiles = [];
  let header, ended = false, afterData = false;
  for (let offset = 8; offset < bytes.length;) {
    if (offset + 12 > bytes.length) throw Error('Unvollständiger PNG-Chunk.');
    const length = bytes.readUInt32BE(offset), end = offset + length + 12;
    if (end > bytes.length) throw Error('Unvollständige PNG-Daten.');
    const type = bytes.toString('ascii', offset + 4, offset + 8), data = bytes.subarray(offset + 8, end - 4);
    if (crc32(bytes.subarray(offset + 4, end - 4)) !== bytes.readUInt32BE(end - 4)) throw Error(`PNG-Prüfsumme ungültig: ${type}.`);
    if (!header && type !== 'IHDR') throw Error('PNG-Kopf muss zuerst stehen.');
    if (type === 'IHDR') {
      if (header || length !== 13 || offset !== 8) throw Error('Ungültiger PNG-Kopf.');
      header = Buffer.from(data);
    } else if (type === 'IDAT') {
      if (afterData) throw Error('Getrennte PNG-Datenblöcke sind ungültig.');
      idats.push(data);
    } else {
      if (idats.length) afterData = true;
      if (type === 'IEND') {
        if (length || !idats.length || end !== bytes.length) throw Error('Ungültiges PNG-Ende.');
        ended = true; break;
      }
      if (type === 'tRNS') throw Error('PNG-tRNS-Transparenz wird nicht unterstützt; bitte RGBA liefern.');
      if ((type.charCodeAt(0) & 32) === 0 && type !== 'PLTE') throw Error(`Nicht unterstützter kritischer PNG-Chunk: ${type}.`);
      // Preserve color interpretation; discard textual/provenance metadata only.
      if (colorChunks.has(type)) {
        if (idats.length) throw Error('PNG-Farbprofil steht nach den Bilddaten.');
        profiles.push({ type, data: Buffer.from(data) });
      }
    }
    offset = end;
  }
  if (!ended || !header) throw Error('PNG ist unvollständig.');
  const width = header.readUInt32BE(0), height = header.readUInt32BE(4), color = header[9];
  if (!width || !height || width > 4096 || height > 4096 || header[8] !== 8 || ![2, 6].includes(color) || header[10] || header[11] || header[12]) {
    throw Error('Unterstützt werden nur nicht verschachtelte 8-Bit-RGB-/RGBA-PNGs bis 4096 × 4096.');
  }
  const channels = color === 6 ? 4 : 3, stride = width * channels;
  const raw = inflateSync(Buffer.concat(idats), { maxOutputLength: (stride + 1) * height });
  if (raw.length !== (stride + 1) * height) throw Error('Falsche entpackte PNG-Länge.');
  const decoded = Buffer.allocUnsafe(stride * height);
  for (let y = 0; y < height; y++) {
    const line = y * (stride + 1), target = y * stride, filter = raw[line];
    if (filter > 4) throw Error('Nicht unterstützter PNG-Filter.');
    for (let x = 0; x < stride; x++) {
      const left = x >= channels ? decoded[target + x - channels] : 0;
      const above = y ? decoded[target + x - stride] : 0;
      const corner = y && x >= channels ? decoded[target + x - stride - channels] : 0;
      const prediction = filter === 0 ? 0 : filter === 1 ? left : filter === 2 ? above : filter === 3 ? (left + above) >>> 1 : paeth(left, above, corner);
      decoded[target + x] = (raw[line + 1 + x] + prediction) & 255;
    }
  }
  if (channels === 4) return { width, height, pixels: decoded, profiles };
  const pixels = Buffer.allocUnsafe(width * height * 4);
  for (let source = 0, target = 0; source < decoded.length; source += 3, target += 4) {
    pixels[target] = decoded[source]; pixels[target + 1] = decoded[source + 1]; pixels[target + 2] = decoded[source + 2]; pixels[target + 3] = 255;
  }
  return { width, height, pixels, profiles };
}

/** Encode exact sample bytes with adaptive filters and maximum deflate. */
export function encodeRgba({ width, height, pixels, profiles = [] }) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width > 4096 || height > 4096 || pixels.length !== width * height * 4) throw Error('Ungültige RGBA-Abmessungen.');
  const stride = width * 4, raw = Buffer.allocUnsafe((stride + 1) * height);
  const candidates = Array.from({ length: 5 }, () => Buffer.allocUnsafe(stride));
  for (let y = 0; y < height; y++) {
    const source = y * stride;
    const scores = [0, 0, 0, 0, 0];
    for (let x = 0; x < stride; x++) {
      const value = pixels[source + x], left = x >= 4 ? pixels[source + x - 4] : 0;
      const above = y ? pixels[source + x - stride] : 0, corner = y && x >= 4 ? pixels[source + x - stride - 4] : 0;
      const predictions = [0, left, above, (left + above) >>> 1, paeth(left, above, corner)];
      for (let filter = 0; filter < 5; filter++) {
        const residual = (value - predictions[filter]) & 255;
        candidates[filter][x] = residual; scores[filter] += Math.min(residual, 256 - residual);
      }
    }
    let selected = 0;
    for (let filter = 1; filter < 5; filter++) if (scores[filter] < scores[selected]) selected = filter;
    const target = y * (stride + 1); raw[target] = selected; candidates[selected].copy(raw, target + 1);
  }
  const header = Buffer.alloc(13); header.writeUInt32BE(width); header.writeUInt32BE(height, 4); header[8] = 8; header[9] = 6;
  return Buffer.concat([SIGNATURE, chunk('IHDR', header), ...profiles.filter(item => colorChunks.has(item.type)).map(item => chunk(item.type, item.data)), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

async function atomicWrite(filename, bytes) {
  const temporary = filename + `.normalizing-${process.pid}`;
  try { await writeFile(temporary, bytes, { flag: 'wx' }); await rename(temporary, filename); }
  finally { await rm(temporary, { force: true }); }
}
async function pngFiles(root) {
  const files = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const filename = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...await pngFiles(filename));
    else if (entry.isFile() && /\.png$/i.test(entry.name)) files.push(filename);
  }
  return files.sort();
}
async function exists(filename) { try { await access(filename); return true; } catch { return false; } }
/** Only constant paper/clear structural assets; dimensions come from the pack. */
export function baselineImage({ width, height, shape }, clear = false) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 64 || height < 64 || width > 4096 || height > 4096 || !['rectangle', 'circle'].includes(shape) || (shape === 'circle' && width !== height)) throw Error('Ungültige Baseline-Geometrie.');
  const pixels = Buffer.alloc(width * height * 4);
  if (!clear) for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const offset = (y * width + x) * 4;
    pixels[offset] = 246; pixels[offset + 1] = 241; pixels[offset + 2] = 224;
    pixels[offset + 3] = shape === 'circle' ? Math.round(255 * Math.max(0, Math.min(1, width / 2 + 0.5 - Math.hypot(x + 0.5 - width / 2, y + 0.5 - height / 2)))) : 255;
  }
  return { width, height, pixels };
}
function baselinePath(root, relative) {
  if (typeof relative !== 'string' || !relative || path.isAbsolute(relative) || !relative.endsWith('.png')) throw Error('Ungültiger Baseline-Pfad.');
  const filename = path.resolve(root, relative), remaining = path.relative(root, filename);
  if (!remaining || remaining === '..' || remaining.startsWith('..' + path.sep) || path.isAbsolute(remaining)) throw Error('Baseline-Pfad verlässt das Pack-Verzeichnis.');
  return filename;
}
async function initBaselines(root) {
  const manifest = JSON.parse(await readFile(path.join(root, 'pack.json'), 'utf8'));
  if (!Array.isArray(manifest.layouts) || !manifest.layouts.length) throw Error('Layouts fehlen im Pack-Manifest.');
  for (const layout of manifest.layouts) {
    for (const kind of ['base', 'clear']) {
      const filename = baselinePath(root, kind === 'base' ? layout.layers?.base : layout.layers?.thc?.[0]);
      if (await exists(filename)) continue; // Never replace authored graphics.
      const image = baselineImage(layout, kind === 'clear');
      await mkdir(path.dirname(filename), { recursive: true }); await atomicWrite(filename, encodeRgba(image));
      console.log('Erstellt: ' + path.relative(root, filename));
    }
  }
}

async function main() {
  const root = fileURLToPath(new URL('../texturepacks/watercolor-forest/', import.meta.url));
  if (process.argv.slice(2).some(arg => arg !== '--init-baselines')) throw Error('Verwendung: node scripts/normalize-watercolor.js [--init-baselines]');
  if (process.argv.includes('--init-baselines')) await initBaselines(root);
  let before = 0, after = 0;
  for (const filename of await pngFiles(root)) {
    const source = await readFile(filename), image = decodePng(source), normalized = encodeRgba(image);
    const check = decodePng(normalized);
    if (!image.pixels.equals(check.pixels)) throw Error('PNG-Pixelprüfung fehlgeschlagen: ' + filename);
    await atomicWrite(filename, normalized); before += source.length; after += normalized.length;
    console.log(`${path.relative(root, filename)}: ${source.length} → ${normalized.length} Bytes, ${image.width} × ${image.height}, RGBA`);
  }
  console.log(`Gesamt: ${before} → ${after} Bytes. RGB und Alpha unverändert; Farbprofile erhalten.`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main().catch(error => { console.error(error.message); process.exitCode = 1; });
