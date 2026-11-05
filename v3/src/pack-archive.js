import { Inflate, zipSync } from '../vendor/fflate.browser.js';
import { validateManifest, validateAssetPath } from './texturepacks.js';

export const ARCHIVE_LIMITS = Object.freeze({
  // The illustrated three-layout Watercolor Forest pack is about 102 MiB.
  // Keep pixel, per-file and expanded-byte bounds independently enforced.
  archiveBytes: 128 * 1024 * 1024,
  totalBytes: 150 * 1024 * 1024,
  files: 256,
  fileBytes: 16 * 1024 * 1024,
  manifestBytes: 256 * 1024,
  decodedPixels: 128 * 1024 * 1024,
  chunkBytes: 1024,
});

const utf8 = new TextDecoder('utf-8', { fatal: true });
const encoder = new TextEncoder();
const fail = message => { throw new Error(`ZIP-Texturepack: ${message}`); };
const u16 = (bytes, offset) => bytes[offset] | bytes[offset + 1] << 8;
const u32 = (bytes, offset) => (bytes[offset] | bytes[offset + 1] << 8 | bytes[offset + 2] << 16 | bytes[offset + 3] << 24) >>> 0;
const crcTable = Uint32Array.from({ length: 256 }, (_, initial) => {
  let value = initial;
  for (let i = 0; i < 8; i++) value = value & 1 ? 0xedb88320 ^ value >>> 1 : value >>> 1;
  return value >>> 0;
});
function crcStep(crc, bytes) {
  for (let i = 0; i < bytes.length; i++) crc = crcTable[(crc ^ bytes[i]) & 255] ^ crc >>> 8;
  return crc >>> 0;
}

function safePath(value, directory = false) {
  if (typeof value !== 'string' || value.length > 240 || /[\\:\x00-\x1f\x7f]/.test(value)) fail('Ungültiger Dateipfad im Archiv.');
  const path = directory && value.endsWith('/') ? value.slice(0, -1) : value;
  try { validateAssetPath(path); } catch { fail(`Unsicherer Dateipfad: ${value}`); }
  if (!directory && !/\.(png|ttf|otf|woff2?|json|txt|md)$/i.test(path)) fail(`Nicht unterstützte Datei: ${path}`);
  return path;
}
function readName(bytes) {
  try { return utf8.decode(bytes); } catch { fail('Dateinamen müssen gültiges UTF-8 / ASCII sein.'); }
}
function checkExtra(bytes, start, size) {
  const end = start + size;
  while (start < end) {
    if (start + 4 > end) fail('Beschädigte ZIP-Zusatzdaten.');
    const tag = u16(bytes, start), length = u16(bytes, start + 2);
    if (start + 4 + length > end) fail('Beschädigte ZIP-Zusatzdaten.');
    if ([1, 0x9901, 0x7075].includes(tag)) fail('ZIP64, verschlüsselte ZIPs und alternative Dateinamen werden nicht unterstützt.');
    start += 4 + length;
  }
}

/** Read and bound all metadata before allocating any decompressed file buffer. */
function directoryEntries(bytes) {
  if (bytes.length > ARCHIVE_LIMITS.archiveBytes) fail(`Das Archiv ist größer als ${ARCHIVE_LIMITS.archiveBytes / 1024 / 1024} MiB.`);
  if (bytes.length < 22) fail('Keine gültige ZIP-Datei.');
  let eocd = -1;
  for (let offset = bytes.length - 22; offset >= Math.max(0, bytes.length - 65557); offset--) {
    if (u32(bytes, offset) === 0x06054b50 && offset + 22 + u16(bytes, offset + 20) === bytes.length) { eocd = offset; break; }
  }
  if (eocd < 0) fail('ZIP-Endverzeichnis fehlt oder ist beschädigt.');
  if (u16(bytes, eocd + 4) || u16(bytes, eocd + 6) || u16(bytes, eocd + 8) !== u16(bytes, eocd + 10)) fail('Mehrteilige ZIP-Archive werden nicht unterstützt.');
  const count = u16(bytes, eocd + 10), size = u32(bytes, eocd + 12), start = u32(bytes, eocd + 16);
  if (count === 65535 || start === 0xffffffff || size === 0xffffffff) fail('ZIP64 wird nicht unterstützt.');
  if (!count || count > ARCHIVE_LIMITS.files) fail(`Das ZIP muss 1 bis ${ARCHIVE_LIMITS.files} Einträge enthalten.`);
  if (start + size !== eocd) fail('Ungültige Position des ZIP-Verzeichnisses.');
  const entries = [], names = new Set();
  let cursor = start, total = 0;
  for (let i = 0; i < count; i++) {
    if (cursor + 46 > eocd || u32(bytes, cursor) !== 0x02014b50) fail('Beschädigtes ZIP-Dateiverzeichnis.');
    const flags = u16(bytes, cursor + 8), method = u16(bytes, cursor + 10);
    const crc = u32(bytes, cursor + 16), compressed = u32(bytes, cursor + 20), uncompressed = u32(bytes, cursor + 24);
    const nameLength = u16(bytes, cursor + 28), extraLength = u16(bytes, cursor + 30), commentLength = u16(bytes, cursor + 32);
    const offset = u32(bytes, cursor + 42), external = u32(bytes, cursor + 38), mode = external >>> 16;
    const next = cursor + 46 + nameLength + extraLength + commentLength;
    if (next > eocd || !nameLength || u16(bytes, cursor + 34)) fail('Ungültiger ZIP-Dateieintrag.');
    if (flags & ~0x080e || flags & 1 || ![0, 8].includes(method)) fail('Verschlüsselung oder diese ZIP-Kompression wird nicht unterstützt.');
    if ([compressed, uncompressed, offset].includes(0xffffffff)) fail('ZIP64 wird nicht unterstützt.');
    const rawName = readName(bytes.subarray(cursor + 46, cursor + 46 + nameLength));
    const directory = rawName.endsWith('/');
    const type = mode & 0xf000;
    if (type && type !== (directory ? 0x4000 : 0x8000)) fail(`Links oder Spezialdateien sind nicht erlaubt: ${rawName}`);
    if ((external & 16) && !directory) fail('Widersprüchlicher ZIP-Verzeichniseintrag.');
    const name = safePath(rawName, directory), folded = name.toLowerCase();
    if (names.has(folded)) fail(`Doppelter Dateipfad: ${name}`);
    names.add(folded);
    if (directory && (uncompressed || compressed)) fail('ZIP-Verzeichnisse dürfen keine Daten enthalten.');
    if (uncompressed > ARCHIVE_LIMITS.fileBytes) fail(`Datei ist größer als 16 MB: ${name}`);
    if (name.split('/').at(-1) === 'pack.json' && uncompressed > ARCHIVE_LIMITS.manifestBytes) fail('pack.json ist größer als 256 KB.');
    total += uncompressed;
    if (total > ARCHIVE_LIMITS.totalBytes) fail('Entpackte Daten sind größer als 150 MB.');
    checkExtra(bytes, cursor + 46 + nameLength, extraLength);
    if (offset + 30 > start || u32(bytes, offset) !== 0x04034b50) fail('Lokaler ZIP-Dateikopf fehlt.');
    const localFlags = u16(bytes, offset + 6), localMethod = u16(bytes, offset + 8);
    const localNameLength = u16(bytes, offset + 26), localExtra = u16(bytes, offset + 28);
    const dataStart = offset + 30 + localNameLength + localExtra;
    if (dataStart > start || localFlags !== flags || localMethod !== method || readName(bytes.subarray(offset + 30, offset + 30 + localNameLength)) !== rawName) fail('Lokaler ZIP-Dateikopf stimmt nicht mit dem Verzeichnis überein.');
    checkExtra(bytes, offset + 30 + localNameLength, localExtra);
    let dataEnd = dataStart + compressed;
    if (dataEnd > start) fail('ZIP-Dateidaten liegen außerhalb des Archivs.');
    if (flags & 8) {
      let descriptor = dataEnd;
      if (u32(bytes, descriptor) === 0x08074b50) descriptor += 4;
      if (descriptor + 12 > start || u32(bytes, descriptor) !== crc || u32(bytes, descriptor + 4) !== compressed || u32(bytes, descriptor + 8) !== uncompressed) fail('Beschädigter ZIP-Datenabschluss.');
      dataEnd = descriptor + 12;
    } else if (u32(bytes, offset + 14) !== crc || u32(bytes, offset + 18) !== compressed || u32(bytes, offset + 22) !== uncompressed) fail('ZIP-Größen oder Prüfsummen widersprechen sich.');
    entries.push({ name, rawName, directory, flags, method, crc, compressed, uncompressed, offset, dataStart, dataEnd });
    cursor = next;
  }
  if (cursor !== eocd) fail('Ungültige Länge des ZIP-Verzeichnisses.');
  let end = 0;
  for (const entry of [...entries].sort((a, b) => a.offset - b.offset)) {
    if (entry.offset !== end) fail('Überlappende, versteckte oder nicht unterstützte ZIP-Einträge.');
    end = entry.dataEnd;
  }
  if (end !== start) fail('Nicht aufgeführte ZIP-Daten vor dem Dateiverzeichnis.');
  return entries;
}

function pngInfo(bytes, path, dimensions) {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (bytes.length < 33 || signature.some((byte, index) => bytes[index] !== byte)) fail(`Ungültige PNG-Datei: ${path}`);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.getUint32(8) !== 13 || readName(bytes.subarray(12, 16)) !== 'IHDR') fail(`PNG-Kopf fehlt: ${path}`);
  const width = view.getUint32(16), height = view.getUint32(20);
  if (!width || !height || width > 4096 || height > 4096 || bytes[24] !== 8 || bytes[25] !== 6 || bytes[26] || bytes[27] || bytes[28] > 1) fail(`PNG muss 8-Bit-RGBA mit höchstens 4096 × 4096 Pixeln sein: ${path}`);
  if (dimensions && (width !== dimensions.width || height !== dimensions.height)) fail(`Falsche PNG-Abmessungen für ${path}: ${width} × ${height}, erwartet ${dimensions.width} × ${dimensions.height}.`);
  let cursor = 8, sawData = false, ended = false;
  while (cursor < bytes.length) {
    if (cursor + 12 > bytes.length) fail(`Beschädigte PNG-Datei: ${path}`);
    const size = view.getUint32(cursor), type = readName(bytes.subarray(cursor + 4, cursor + 8));
    if (cursor + 12 + size > bytes.length) fail(`Beschädigte PNG-Blöcke: ${path}`);
    const crc = (crcStep(0xffffffff, bytes.subarray(cursor + 4, cursor + 8 + size)) ^ 0xffffffff) >>> 0;
    if (crc !== view.getUint32(cursor + 8 + size)) fail(`PNG-CRC-Prüfsumme stimmt nicht: ${path}`);
    if (type === 'acTL') fail(`Animierte PNG-Dateien werden nicht unterstützt: ${path}`);
    if (type === 'IDAT') sawData = true;
    cursor += 12 + size;
    if (type === 'IEND') { if (size || cursor !== bytes.length) fail(`Ungültiges PNG-Ende: ${path}`); ended = true; break; }
  }
  if (!sawData || !ended) fail(`Unvollständige PNG-Datei: ${path}`);
  return { width, height };
}
function fontInfo(bytes, path) {
  const ext = path.split('.').at(-1).toLowerCase();
  if (bytes.length < ({ ttf: 12, otf: 12, woff: 44, woff2: 48 }[ext] || 12)) fail(`Ungültige Schriftdatei: ${path}`);
  const header = String.fromCharCode(...bytes.subarray(0, 4));
  const valid = ext === 'ttf' ? u32(bytes, 0) === 0x00000100 || header === 'true' : header === ({ otf: 'OTTO', woff: 'wOFF', woff2: 'wOF2' }[ext]);
  if (!valid) fail(`Ungültiger Schriftkopf: ${path}`);
}
function validateFiles(manifest, files) {
  manifest = validateManifest(manifest);
  const requireFile = path => {
    const bytes = files[path];
    if (!(bytes instanceof Uint8Array)) fail(`Benötigte Datei fehlt: ${path}`);
    return bytes;
  };
  for (const design of manifest.layouts) {
    for (const path of [design.layers.base, ...design.layers.genetics, ...design.layers.thc, ...design.layers.cbd, ...Object.values(design.masks || {})]) pngInfo(requireFile(path), path, design);
  }
  for (const design of manifest.layouts) if (design.preview) pngInfo(requireFile(design.preview), design.preview);
  if (manifest.preview) pngInfo(requireFile(manifest.preview), manifest.preview);
  for (const font of manifest.fonts) fontInfo(requireFile(font.path), font.path);
  let decodedPixels = 0;
  for (const [path, bytes] of Object.entries(files)) {
    safePath(path);
    if (path.toLowerCase().endsWith('/pack.json') || (path.toLowerCase() === 'pack.json' && path !== 'pack.json')) fail('pack.json muss eindeutig im Pack-Wurzelverzeichnis liegen.');
    if (/\.png$/i.test(path)) {
      const size = pngInfo(bytes, path);
      decodedPixels += size.width * size.height;
      if (decodedPixels > ARCHIVE_LIMITS.decodedPixels) fail('Die PNGs enthalten insgesamt zu viele Bildpunkte für einen sicheren Browser-Import. Bitte die Auflösung reduzieren.');
    }
    if (/\.(ttf|otf|woff2?)$/i.test(path)) fontInfo(bytes, path);
  }
}

export async function inspectPackArchive(bytesOrBlob) {
  let bytes;
  const kind = Object.prototype.toString.call(bytesOrBlob);
  if ((kind === '[object Blob]' || kind === '[object File]') && typeof bytesOrBlob.arrayBuffer === 'function') {
    if (!Number.isFinite(bytesOrBlob.size) || bytesOrBlob.size < 0) fail('Ungültige ZIP-Datei.');
    if (bytesOrBlob.size > ARCHIVE_LIMITS.archiveBytes) fail(`Das Archiv ist größer als ${ARCHIVE_LIMITS.archiveBytes / 1024 / 1024} MiB.`);
    bytes = new Uint8Array(await bytesOrBlob.arrayBuffer());
  } else if (ArrayBuffer.isView(bytesOrBlob) && bytesOrBlob.BYTES_PER_ELEMENT === 1) bytes = new Uint8Array(bytesOrBlob.buffer, bytesOrBlob.byteOffset, bytesOrBlob.byteLength);
  else if (kind === '[object ArrayBuffer]') bytes = new Uint8Array(bytesOrBlob);
  else fail('Bitte eine ZIP-Datei auswählen.');
  const entries = directoryEntries(bytes);
  const manifests = entries.filter(entry => !entry.directory && entry.name.split('/').at(-1) === 'pack.json');
  if (manifests.length !== 1) fail('Das Archiv muss genau eine pack.json enthalten.');
  const manifestEntry = manifests[0], parts = manifestEntry.name.split('/');
  if (parts.length > 2) fail('pack.json muss im ZIP-Wurzelverzeichnis oder in einem einzelnen Pack-Ordner liegen.');
  const prefix = parts.length === 2 ? `${parts[0]}/` : '';
  if (prefix && entries.some(entry => !entry.directory && !entry.name.startsWith(prefix))) fail('Alle Dateien müssen im selben Pack-Ordner liegen.');
  const files = Object.create(null);
  let totalBytes = 0, pushes = 0;
  for (const entry of entries) {
    if (entry.directory) continue;
    const name = entry.name.slice(prefix.length), chunks = [];
    let actual = 0, crc = 0xffffffff;
    const accept = (chunk) => {
      actual += chunk.length; totalBytes += chunk.length;
      if (actual > ARCHIVE_LIMITS.fileBytes || actual > entry.uncompressed || totalBytes > ARCHIVE_LIMITS.totalBytes || (name === 'pack.json' && actual > ARCHIVE_LIMITS.manifestBytes)) fail(`Entpackte Größen überschreiten das Limit: ${name}`);
      crc = crcStep(crc, chunk); chunks.push(chunk.slice());
    };
    const compressed = bytes.subarray(entry.dataStart, entry.dataStart + entry.compressed);
    if (entry.method === 0) {
      if (entry.compressed !== entry.uncompressed) fail(`Ungültige gespeicherte Dateigröße: ${name}`);
      for (let offset = 0; offset < compressed.length; offset += ARCHIVE_LIMITS.chunkBytes) accept(compressed.subarray(offset, offset + ARCHIVE_LIMITS.chunkBytes));
    } else {
      const inflate = new Inflate(accept);
      try {
        if (!compressed.length) fail(`Leere komprimierte Datei: ${name}`);
        for (let offset = 0; offset < compressed.length; offset += ARCHIVE_LIMITS.chunkBytes) {
          inflate.push(compressed.subarray(offset, offset + ARCHIVE_LIMITS.chunkBytes), offset + ARCHIVE_LIMITS.chunkBytes >= compressed.length);
          if (++pushes % 256 === 0) await new Promise(resolve => setTimeout(resolve, 0));
        }
      } catch (error) { fail(`Datei konnte nicht sicher entpackt werden (${name}): ${error.message}`); }
    }
    if (actual !== entry.uncompressed || ((crc ^ 0xffffffff) >>> 0) !== entry.crc) fail(`CRC-Prüfsumme oder Größe stimmt nicht: ${name}`);
    const result = new Uint8Array(actual);
    let offset = 0; for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; }
    files[name] = result;
  }
  let manifest;
  try { manifest = JSON.parse(utf8.decode(files['pack.json'])); } catch { fail('pack.json enthält kein gültiges UTF-8-JSON.'); }
  validateFiles(manifest, files);
  return { manifest: validateManifest(manifest), files, totalBytes };
}

export function buildPackArchive(manifest, files) {
  manifest = validateManifest(manifest);
  if (!files || typeof files !== 'object' || Array.isArray(files)) fail('Pack-Dateien fehlen.');
  const canonical = Object.create(null), names = new Set();
  for (const [path, bytes] of Object.entries(files)) {
    safePath(path);
    if (!(bytes instanceof Uint8Array)) fail(`Datei ist kein Byte-Array: ${path}`);
    if (names.has(path.toLowerCase())) fail(`Doppelter Dateipfad: ${path}`);
    names.add(path.toLowerCase()); canonical[path] = bytes;
  }
  try { canonical['pack.json'] = encoder.encode(JSON.stringify(manifest, null, 2)); } catch { fail('Manifest konnte nicht serialisiert werden.'); }
  if (Object.keys(canonical).length > ARCHIVE_LIMITS.files) fail('Zu viele Dateien im Pack.');
  if (canonical['pack.json'].length > ARCHIVE_LIMITS.manifestBytes) fail('pack.json ist größer als 256 KB.');
  let total = 0;
  for (const [path, bytes] of Object.entries(canonical)) {
    if (bytes.length > ARCHIVE_LIMITS.fileBytes) fail(`Datei ist größer als 16 MB: ${path}`);
    total += bytes.length;
  }
  if (total > ARCHIVE_LIMITS.totalBytes) fail('Entpackte Daten sind größer als 150 MB.');
  validateFiles(manifest, canonical);
  const content = Object.create(null);
  for (const path of Object.keys(canonical).sort()) content[path] = [canonical[path], { mtime: new Date(1980, 0, 1), level: /\.png$/i.test(path) ? 0 : 6 }];
  const archive = zipSync(content);
  if (archive.length > ARCHIVE_LIMITS.archiveBytes) fail(`Das Archiv ist größer als ${ARCHIVE_LIMITS.archiveBytes / 1024 / 1024} MiB.`);
  return archive;
}
