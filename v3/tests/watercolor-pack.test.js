import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { TexturePackManager, validateManifest } from '../src/texturepacks.js';
import { ARCHIVE_LIMITS, inspectPackArchive } from '../src/pack-archive.js';

const root = new URL('../texturepacks/', import.meta.url);
const watercolorRoot = new URL('watercolor-forest/', root);
const manifest = async () => validateManifest(JSON.parse(await readFile(new URL('pack.json', watercolorRoot), 'utf8')));

// Decode the rendered pixel content rather than hashing ancillary PNG metadata.
// System.Drawing and imagegen delivery files use non-interlaced RGBA PNGs here.
function rgbaPixels(bytes, label) {
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', label);
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
  assert.equal(bytes[24], 8, `${label}: 8-bit PNG`);
  assert.equal(bytes[25], 6, `${label}: RGBA`);
  assert.equal(bytes[28], 0, `${label}: non-interlaced PNG`);
  const chunks = [];
  for (let cursor = 8; cursor < bytes.length;) {
    const length = bytes.readUInt32BE(cursor);
    assert.ok(cursor + length + 12 <= bytes.length, `${label}: vollständiger PNG-Chunk`);
    if (bytes.subarray(cursor + 4, cursor + 8).toString() === 'IDAT') chunks.push(bytes.subarray(cursor + 8, cursor + 8 + length));
    cursor += length + 12;
  }
  const stride = width * 4;
  const raw = inflateSync(Buffer.concat(chunks), { maxOutputLength: (stride + 1) * height });
  assert.equal(raw.length, (stride + 1) * height, label);
  const pixels = Buffer.allocUnsafe(stride * height);
  const paeth = (left, up, corner) => {
    const prediction = left + up - corner;
    const a = Math.abs(prediction - left), b = Math.abs(prediction - up), c = Math.abs(prediction - corner);
    return a <= b && a <= c ? left : b <= c ? up : corner;
  };
  for (let y = 0; y < height; y++) {
    const line = y * (stride + 1), target = y * stride, filter = raw[line];
    assert.ok(filter <= 4, `${label}: unterstützter PNG-Filter`);
    for (let x = 0; x < stride; x++) {
      const left = x >= 4 ? pixels[target + x - 4] : 0;
      const up = y ? pixels[target + x - stride] : 0;
      const corner = y && x >= 4 ? pixels[target + x - stride - 4] : 0;
      const prediction = filter === 0 ? 0 : filter === 1 ? left : filter === 2 ? up : filter === 3 ? Math.floor((left + up) / 2) : paeth(left, up, corner);
      pixels[target + x] = (raw[line + 1 + x] + prediction) & 255;
    }
  }
  return { width, height, pixels };
}

test('Watercolor Forest enthält drei illustrierte Layouts mit je sieben tatsächlich verschiedenen Sprite-Stufen', async () => {
  const pack = await manifest();
  assert.equal(pack.id, 'watercolor-forest');
  assert.equal(pack.status, 'illustrated');
  assert.deepEqual(new Set(pack.layouts.map(layout => layout.id)), new Set(['classic-portrait', 'wide-landscape', 'round-lid']));
  for (const layout of pack.layouts) {
    const base = rgbaPixels(await readFile(new URL(layout.layers.base, watercolorRoot)), layout.layers.base);
    assert.equal(base.width, layout.width); assert.equal(base.height, layout.height);
    for (const layer of ['genetics', 'thc', 'cbd']) {
      const signatures = new Set();
      for (const [index, path] of layout.layers[layer].entries()) {
        const { width, height, pixels } = rgbaPixels(await readFile(new URL(path, watercolorRoot)), path);
        assert.equal(width, layout.width, path); assert.equal(height, layout.height, path);
        signatures.add(createHash('sha256').update(pixels).digest('hex'));
        if (layer !== 'genetics') {
          let transparent = 0, painted = 0;
          for (let offset = 3; offset < pixels.length; offset += 4) {
            if (pixels[offset] < 255) transparent++;
            if (pixels[offset] > 0) painted++;
          }
          assert.ok(transparent > 0, `${path}: transparenter Overlay-Hintergrund`);
          if (layer === 'cbd' || index > 0) assert.ok(painted > 0, `${path}: Illustration vorhanden`);
          // Separate paintings can vary in footprint; do not demand monotonic
          // pixel counts or conflate a recolour with more ornament growth.
        }
      }
      assert.equal(signatures.size, 7, `${layout.id}/${layer}: sieben verschiedene Pixelbilder`);
    }
  }
});

test('Watercolor Forest lässt sich vollständig innerhalb der Browser-Limits als ZIP exportieren und wieder prüfen', async t => {
  const fetchImpl = async url => {
    try {
      const bytes = await readFile(new URL(url));
      return { ok: true, status: 200, json: async () => JSON.parse(bytes.toString()), arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) };
    } catch { return { ok: false, status: 404 }; }
  };
  const manager = new TexturePackManager({ catalogUrl: new URL('catalog.json', root), fetchImpl, importedStore: null });
  t.after(() => manager.dispose());
  assert.ok((await manager.listPacks()).some(pack => pack.id === 'watercolor-forest' && pack.source === 'bundled'));
  const zip = await manager.exportPack('watercolor-forest', '1.0.0');
  assert.ok(zip.size <= ARCHIVE_LIMITS.archiveBytes, 'Ausgeliefertes Pack bleibt importierbar');
  const restored = await inspectPackArchive(zip);
  assert.equal(restored.manifest.layouts.length, 3);
  assert.ok(restored.totalBytes <= ARCHIVE_LIMITS.totalBytes);
  assert.ok(restored.files['fonts/OFL.txt']); assert.ok(restored.files['ASSET-LICENSE.txt']);
});
