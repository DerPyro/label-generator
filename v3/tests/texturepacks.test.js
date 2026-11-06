import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { TexturePackManager, validateManifest, validateAssetPath, resolvePackConfig, getLayouts, chooseComparableLayout } from '../src/texturepacks.js';
import { getRenderPlan } from '../src/model.js';

const packRoot = new URL('../texturepacks/', import.meta.url);
const catalog = JSON.parse(await readFile(new URL('catalog.json', packRoot), 'utf8'));
const bundledIds = catalog.packs.map(pack => pack.id);
const readPack = async id => validateManifest(JSON.parse(await readFile(new URL(`${id}/pack.json`, packRoot), 'utf8')));
const fetchFile = async url => {
  try { const text = await readFile(new URL(url), 'utf8'); return { ok: true, status: 200, json: async () => JSON.parse(text) }; }
  catch { return { ok: false, status: 404 }; }
};
const makeManager = () => new TexturePackManager({ catalogUrl: new URL('catalog.json', packRoot), fetchImpl: fetchFile });
const sample = { name: 'Euphoria', year: 2026, sativa: 20, thc: 9, cbd: 10 };

test('Alle Bundled-Packs haben gültige Manifeste und eigene Layouts', async () => {
  assert.ok(bundledIds.includes('woodland') && bundledIds.includes('ink'), 'Technische Referenzpacks bleiben verfügbar');
  for (const id of bundledIds) {
    const manifest = await readPack(id);
    assert.deepEqual(validateManifest(manifest), manifest);
    assert.ok(manifest.layouts.length >= 2);
    const circle = manifest.layouts.find(layout => layout.shape === 'circle');
    assert.equal(circle.width, circle.height);
  }
});
test('Manifest weist ungültige Metadaten, Versionen, Formate, Grenzen und Layer zurück', async () => {
  const original = await readPack('woodland');
  const mutations = [
    m => { m.id = '../bad'; }, m => { m.version = 'latest'; }, m => { m.compatibilityVersion = 1; },
    m => { delete m.author; }, m => { m.layouts.push({...m.layouts[0],id:'bad/id'}); },
    m => { m.layouts.find(x => x.id === 'circular').height = 1300; }, m => { m.layouts.find(x => x.id === 'rectangular').width = -1; },
    m => { m.layouts.find(x => x.id === 'rectangular').layers.thc.pop(); }, m => { m.layouts.find(x => x.id === 'rectangular').layers.cbd[6] = m.layouts.find(x => x.id === 'rectangular').layers.cbd[0]; },
    m => { m.layerOrder = ['base', 'text']; }, m => { m.layouts.find(x => x.id === 'rectangular').typography.fields[0].maxLines = 0; },
    m => { m.layouts.find(x => x.id === 'rectangular').typography.decorations[0].width = 9000; },
    m => { m.fonts[0].path = '../font.ttf'; }, m => { m.layouts.find(x => x.id === 'rectangular').masks = { bad: 'mask.png' }; },
  ];
  for (const mutate of mutations) { const pack = structuredClone(original); mutate(pack); assert.throws(() => validateManifest(pack)); }
});
test('Pfade bleiben packlokal und dürfen keine URL-/Traversal-Tricks enthalten', () => {
  for (const path of ['../a.png', '/a.png', 'https://example.com/a.png', 'a\\b.png', './a.png', 'a//b.png', 'a/../b.png', 'a.png?v=2', 'a%2epng', 'a.png#x', 'data:image/png;base64,x']) assert.throws(() => validateAssetPath(path, 'png'), path);
  assert.equal(validateAssetPath('circular/genetics/1.png', 'png'), 'circular/genetics/1.png');
});
test('Pack-Verwaltung lädt statisch, prüft Versionen und bewahrt Eingabedaten beim Wechsel', async () => {
  const manager = makeManager(); const packs = await manager.listPacks();
  assert.deepEqual(packs.map(x => x.id), bundledIds);
  assert.ok(packs.find(pack => pack.id === 'woodland').preview.endsWith('/woodland/preview.png'));
  const first = await manager.getConfig('woodland', 'rectangular', '1.0.0');
  const second = await manager.getConfig('ink', 'circular');
  assert.equal(getRenderPlan(sample, first).input.name, getRenderPlan(sample, second).input.name);
  assert.equal(second.width, second.height); assert.equal(second.shape, 'circle');
  assert.notEqual(first.base.path, second.base.path);
  await assert.rejects(manager.getConfig('woodland', 'triangular'), /unterstützt/);
  await assert.rejects(manager.loadPack('woodland', '0.0.1'), /Version/);
  await assert.rejects(manager.loadPack('missing'), /nicht installiert/);
  const manifest = await manager.loadPack('woodland'); manifest.name = 'Mutated';
  assert.notEqual((await manager.loadPack('woodland')).name, 'Mutated');
});
test('Projekt-Pages-Unterverzeichnisse und optionale Masken werden korrekt aufgelöst', async () => {
  const manifest = await readPack('woodland'); manifest.layouts.find(x => x.id === 'rectangular').masks = { thc: 'rectangular/sky-mask.png' };
  manifest.layouts.find(x => x.id === 'rectangular').zIndex.cbd = 600;
  const config = resolvePackConfig(manifest, 'rectangular', 'https://user.github.io/label-generator/v3/texturepacks/woodland/');
  assert.equal(config.base.path, 'https://user.github.io/label-generator/v3/texturepacks/woodland/rectangular/base.png');
  assert.equal(config.masks.thc, 'https://user.github.io/label-generator/v3/texturepacks/woodland/rectangular/sky-mask.png');
  assert.equal(config.zIndex.cbd, 600);
});
test('Fehlende oder ungültige JSON-Dateien erzeugen kontrollierte Fehler', async () => {
  const missing = new TexturePackManager({ fetchImpl: async () => ({ ok: false, status: 404 }) });
  await assert.rejects(missing.listPacks(), /fehlt/);
  const invalid = new TexturePackManager({ fetchImpl: async () => ({ ok: true, json: () => { throw Error('syntax'); } }) });
  await assert.rejects(invalid.listPacks(), /Ungültige JSON/);
});
test('Alle Sprite-PNGs sind vorhanden, RGBA und je Layout dimensionsgleich', async () => {
  let total = 0;
  let expected = 0;
  for (const id of bundledIds) {
    const manifest = await readPack(id);
    expected += manifest.layouts.length * 22;
    for (const design of manifest.layouts) {
      const format = design.id;
      const paths = [design.layers.base, ...design.layers.genetics, ...design.layers.thc, ...design.layers.cbd];
      assert.equal(paths.length, 22); assert.equal(new Set(paths).size, 22);
      for (const path of paths) {
        const png = await readFile(new URL(`${id}/${path}`, packRoot)); total++;
        assert.equal(png.subarray(1, 4).toString(), 'PNG', path);
        assert.equal(png.readUInt32BE(16), design.width, path); assert.equal(png.readUInt32BE(20), design.height, path);
        assert.equal(png[25], 6, `${id}/${format}/${path}: RGBA`);
      }
    }
    const font = await readFile(new URL(`${id}/${manifest.fonts[0].path}`, packRoot)); assert.ok(font.length > 1000);
  }
  assert.equal(total, expected);
  assert.equal(total % 22, 0);
});

test('Dynamische Layouts erlauben freie IDs, Seitenverhältnisse und unabhängige Konturen', async () => {
  const manifest = await readPack('woodland');
  const portrait = { ...structuredClone(manifest.layouts.find(x => x.id === 'rectangular')), id: 'classic-portrait', name: 'Hochformat' };
  const circle = { ...structuredClone(manifest.layouts.find(x => x.shape === 'circle')), id: 'round-lid', name: 'Deckel' };
  const landscape = { ...structuredClone(circle), id: 'wide-landscape', name: 'Querformat', shape: 'rectangle', width: 1800 };
  const banner = { ...structuredClone(circle), id: 'banderole', name: 'Banderole', shape: 'rectangle', width: 4096 };
  manifest.layouts = [portrait, landscape, circle, banner];
  const normalized = validateManifest(manifest);
  assert.deepEqual(getLayouts(normalized).map(x => x.id), ['classic-portrait', 'wide-landscape', 'round-lid', 'banderole']);
  for (const layout of normalized.layouts) {
    const config = resolvePackConfig(normalized, layout.id, 'https://example.test/repo/v3/pack/');
    assert.equal(config.layoutId, layout.id); assert.equal(config.layoutName, layout.name);
    assert.equal(config.shape, layout.shape); assert.equal(config.width / config.height, layout.width / layout.height);
    assert.deepEqual(['genetics','thc','cbd'].map(layer => config[layer].length), [7,7,7]);
    assert.equal(getRenderPlan(sample, config).input.name, sample.name);
  }
  assert.equal(resolvePackConfig(normalized, undefined, 'https://example.test/').layoutId, 'classic-portrait');
  assert.equal(chooseComparableLayout(normalized.layouts, {shape:'rectangle',width:1500,height:1000}).id, 'wide-landscape');
  assert.equal(chooseComparableLayout(normalized.layouts, {layoutId:'round-lid'}).id, 'round-lid');
  assert.equal(chooseComparableLayout([portrait], circle).id, 'classic-portrait');
});

test('Alte Manifeste werden mit Aktualisierungshinweis abgewiesen', async () => {
  const source = await readPack('woodland'); source.compatibilityVersion=1;
  assert.throws(()=>validateManifest(source),/compatibilityVersion 2.*aktualisieren/);
});

test('Ungültige und widersprüchliche dynamische Layoutdefinitionen werden abgefangen', async () => {
  const original = await readPack('woodland');
  const mutations = [
    m => { m.layouts = []; }, m => { m.layouts = {}; },
    m => { m.formats = {}; }, m => { m.layouts.push(structuredClone(m.layouts[0])); },
    m => { m.layouts[0].id = 'Bad ID'; }, m => { delete m.layouts[0].name; },
    m => { m.layouts[0].shape = 'hexagon'; },
    m => { m.layouts.find(x => x.shape === 'circle').width += 1; },
    m => { m.layouts[0].preview = '../preview.png'; },
    m => { m.layouts[0].bleedMm = -1; }, m => { m.layouts[0].bleedMm = '2'; },
  ];
  for (const mutation of mutations) { const manifest = structuredClone(original); mutation(manifest); assert.throws(() => validateManifest(manifest)); }
  const manifest = structuredClone(original); manifest.layouts[0].preview = 'preview.png'; manifest.layouts[0].bleedMm = 2;
  const config = resolvePackConfig(manifest, manifest.layouts[0].id, 'https://example.test/pack/');
  assert.equal(config.preview, 'https://example.test/pack/preview.png'); assert.equal(config.bleedMm, 2);
});
