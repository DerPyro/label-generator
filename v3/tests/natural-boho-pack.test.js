import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { decodePng } from '../scripts/normalize-watercolor.js';
import { validateManifest, TexturePackManager } from '../src/texturepacks.js';
import { inspectPackArchive, ARCHIVE_LIMITS } from '../src/pack-archive.js';
import { THRESHOLDS } from '../src/config.js';
const root = new URL('../texturepacks/natural-boho/', import.meta.url);
const manifest = async () => validateManifest(JSON.parse(await readFile(new URL('pack.json', root), 'utf8')));

test('Natural Boho: eigene Geometrien, lizenzierte lokale Fontfamilien und geordnete Textplaketten', async () => {
  const pack = await manifest();
  assert.equal(pack.id, 'natural-boho'); assert.equal(pack.version, '1.0.0'); assert.equal(pack.status, 'illustrated');
  assert.deepEqual(pack.layouts.map(l => [l.id, l.width, l.height, l.shape]), [['classic-portrait', 1024, 1536, 'rectangle'], ['round-lid', 1254, 1254, 'circle']]);
  assert.equal(new Set(pack.fonts.map(f => f.path)).size, 2);
  for (const font of pack.fonts) assert.match(await readFile(new URL(font.path.replace(/[^/]+$/, 'OFL.txt'), root), 'utf8'), /SIL OPEN FONT LICENSE/);
  for (const layout of pack.layouts) {
    const name = layout.typography.fields.find(f => f.source === 'name');
    assert.equal(name.background.type, 'sprite'); assert.ok(name.background.zIndex > layout.zIndex.cbd); assert.ok(name.zIndex > name.background.zIndex);
    assert.ok(layout.typography.decorations.some(d => d.type === 'sprite' && d.zIndex > name.zIndex));
    assert.deepEqual(new Set(layout.typography.fields.map(f => f.source)), new Set(['name', 'year', 'producer', 'thc', 'cbd', 'indica', 'sativa']));
  }
  assert.deepEqual(THRESHOLDS, { genetics: [14,29,44,59,74,89,100], thc: [5,11,17,23,29,35,40], cbd: [2,5,8,11,14,17,20] });
});

test('Natural Boho: 44 echte RGBA-Illustrationen, sieben verschiedene Stufen und wachsende Detailflächen', async () => {
  for (const layout of (await manifest()).layouts) {
    for (const category of ['base', 'genetics', 'thc', 'cbd']) {
      const signatures = new Set(), painted = [];
      for (const asset of category === 'base' ? [layout.layers.base] : layout.layers[category]) {
        const bytes = await readFile(new URL(asset, root)); assert.equal(bytes[24], 8); assert.equal(bytes[25], 6);
        const image = decodePng(bytes); assert.equal(image.width, layout.width); assert.equal(image.height, layout.height);
        signatures.add(createHash('sha256').update(image.pixels).digest('hex'));
        let clear = 0, ink = 0;
        for (let i = 3; i < image.pixels.length; i += 4) { if (!image.pixels[i]) clear++; if (image.pixels[i] > 32) ink++; }
        if (category !== 'base') assert.ok(clear > image.width * image.height * .2, asset + ': echte transparente Freifläche');
        if (layout.shape === 'circle') assert.equal(image.pixels[3], 0, asset + ': transparente Kreisecke');
        painted.push(ink);
      }
      assert.equal(signatures.size, category === 'base' ? 1 : 7, category + ': unterschiedliche Bildinhalte');
      if (category === 'thc' || category === 'cbd') assert.ok(painted[6] > painted[0] * 1.2, category + ': Stufe 7 besitzt mehr bemalte Detailfläche als Stufe 1');
    }
  }
});

test('Natural Boho: Katalogintegration und vollständiger ZIP-Roundtrip mit beiden Fontlizenzen', async t => {
  const fetchImpl = async url => {
    try { const bytes = await readFile(new URL(url)); return { ok: true, json: async () => JSON.parse(bytes.toString()), arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) }; }
    catch { return { ok: false, status: 404 }; }
  };
  const manager = new TexturePackManager({ catalogUrl: new URL('../texturepacks/catalog.json', import.meta.url), fetchImpl, importedStore: null }); t.after(() => manager.dispose());
  assert.ok((await manager.listPacks()).some(p => p.id === 'natural-boho' && p.source === 'bundled'));
  const zip = await manager.exportPack('natural-boho', '1.0.0'); assert.ok(zip.size <= ARCHIVE_LIMITS.archiveBytes);
  const restored = await inspectPackArchive(zip); assert.equal(restored.manifest.layouts.length, 2);
  for (const path of ['fonts/shrikhand/OFL.txt', 'fonts/lora/OFL.txt', 'README.md', 'ASSET-LICENSE.txt', 'PROMPTS.md']) assert.ok(restored.files[path], path);
});
