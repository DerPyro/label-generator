import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { zipSync, strToU8 } from '../vendor/fflate.browser.js';
import { inspectPackArchive, buildPackArchive, ARCHIVE_LIMITS } from '../src/pack-archive.js';
import { validateManifest, manifestAssetPaths } from '../src/texturepacks.js';

async function fixture() {
  const root = new URL('../texturepacks/woodland/', import.meta.url);
  const manifest = validateManifest(JSON.parse(await readFile(new URL('pack.json', root), 'utf8')));
  const paths = manifestAssetPaths(manifest);
  const files = Object.create(null);
  for (const path of paths) files[path] = new Uint8Array(await readFile(new URL(path, root)));
  files['fonts/OFL.txt'] = new Uint8Array(await readFile(new URL('fonts/OFL.txt', root)));
  files['pack.json'] = strToU8(JSON.stringify(manifest));
  return { manifest, files };
}
const original = await fixture();
const copyFiles = () => Object.fromEntries(Object.entries(original.files).map(([path, bytes]) => [path, bytes.slice()]));
const zip = files => zipSync(files, { mtime: new Date(1980, 0, 1), level: 0 });
function centralOffsets(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let end = bytes.length - 22;
  while (end >= 0 && view.getUint32(end, true) !== 0x06054b50) end--;
  let cursor = view.getUint32(end + 16, true);
  const offsets = [];
  for (let i = 0; i < view.getUint16(end + 10, true); i++) {
    offsets.push(cursor);
    cursor += 46 + view.getUint16(cursor + 28, true) + view.getUint16(cursor + 30, true) + view.getUint16(cursor + 32, true);
  }
  return offsets;
}
function setMetadata(bytes, callback, index = 0) {
  const result = bytes.slice();
  const view = new DataView(result.buffer);
  const central = centralOffsets(result)[index];
  const local = view.getUint32(central + 42, true);
  callback(view, central, local);
  return result;
}

test('Vollständiges Pack: deterministischer ZIP-Export und Import ohne Asset-Verlust', async () => {
  const archive = buildPackArchive(original.manifest, original.files);
  assert.deepEqual(archive, buildPackArchive(original.manifest, original.files));
  const inspected = await inspectPackArchive(archive);
  assert.equal(inspected.manifest.id, 'woodland');
  assert.equal(inspected.totalBytes, Object.values(inspected.files).reduce((n, bytes) => n + bytes.length, 0));
  for (const [path, bytes] of Object.entries(original.files)) if (path !== 'pack.json') assert.deepEqual(inspected.files[path], bytes, path);
  assert.equal(Object.keys(inspected.files).length, Object.keys(original.files).length);
  assert.equal((await inspectPackArchive(new Blob([archive]))).manifest.id, 'woodland');
});
test('Ein Wrapper-Ordner wird vollständig und konsistent entfernt', async () => {
  const wrapped = Object.fromEntries(Object.entries(original.files).map(([path, bytes]) => [`woodland-example/${path}`, bytes]));
  const inspected = await inspectPackArchive(zip(wrapped));
  assert.ok(inspected.files['pack.json']);
  assert.ok(inspected.files['rectangular/base.png']);
  assert.ok(Object.keys(inspected.files).every(path => !path.startsWith('woodland-example/')));
  await assert.rejects(() => inspectPackArchive(zip({ ...wrapped, 'outside.txt': strToU8('outside') })), /selben Pack-Ordner/);
});
test('Traversal, absolute Pfade, Backslashes, ausführbare Dateien und mehrdeutige Pfade werden abgewiesen', async () => {
  for (const path of ['../outside.txt', '/absolute.txt', 'C:/outside.txt', 'folder\\file.txt', 'a/../file.txt', 'script.js', 'image.svg']) {
    await assert.rejects(() => inspectPackArchive(zip({ ...original.files, [path]: strToU8('unsafe') })), /Pfad|Datei/);
    assert.throws(() => buildPackArchive(original.manifest, { ...original.files, [path]: strToU8('unsafe') }), /Pfad|Datei/);
  }
  await assert.rejects(() => inspectPackArchive(zip({ ...original.files, 'README.md': strToU8('one'), 'readme.md': strToU8('two') })), /Doppelter/);
  assert.throws(() => buildPackArchive(original.manifest, { ...original.files, 'nested/pack.json': strToU8('{}') }), /eindeutig/);
});
test('Fehlende Assets, inkompatible Manifeste und falsche PNG-Formate werden kontrolliert gemeldet', async () => {
  const missing = copyFiles(); delete missing['circular/cbd/7.png'];
  await assert.rejects(() => inspectPackArchive(zip(missing)), /Benötigte Datei fehlt/);
  const wrong = structuredClone(original.manifest); wrong.compatibilityVersion = 99;
  await assert.rejects(() => inspectPackArchive(zip({ ...original.files, 'pack.json': strToU8(JSON.stringify(wrong)) })), /Inkompatible/);
  const dimensions = copyFiles(); new DataView(dimensions['rectangular/base.png'].buffer).setUint32(16, 1);
  await assert.rejects(() => inspectPackArchive(zip(dimensions)), /Abmessungen/);
  const rgb = copyFiles(); rgb['rectangular/base.png'][25] = 2;
  await assert.rejects(() => inspectPackArchive(zip(rgb)), /RGBA/);
  const font = copyFiles(); font['fonts/label-serif.ttf'].fill(0, 0, 4);
  await assert.rejects(() => inspectPackArchive(zip(font)), /Schriftkopf/);
  const crc = copyFiles(); crc['rectangular/base.png'][29] ^= 1;
  await assert.rejects(() => inspectPackArchive(zip(crc)), /PNG-CRC/);
});
test('CRC-Fehler, Verschlüsselung und Symlinks werden vor der Installation abgefangen', async () => {
  const base = zip(original.files);
  const badCrc = setMetadata(base, (view, central, local) => { view.setUint32(central + 16, 1, true); view.setUint32(local + 14, 1, true); });
  await assert.rejects(() => inspectPackArchive(badCrc), /CRC/);
  const encrypted = setMetadata(base, (view, central, local) => { view.setUint16(central + 8, 1, true); view.setUint16(local + 6, 1, true); });
  await assert.rejects(() => inspectPackArchive(encrypted), /Verschlüsselung/);
  const symlink = setMetadata(base, (view, central) => { view.setUint16(central + 4, 0x0314, true); view.setUint32(central + 38, 0xa1ff0000, true); });
  await assert.rejects(() => inspectPackArchive(symlink), /Links oder Spezialdateien/);
  const unsupported = setMetadata(base, (view, central, local) => { view.setUint16(central + 10, 99, true); view.setUint16(local + 8, 99, true); });
  await assert.rejects(() => inspectPackArchive(unsupported), /Kompression/);
});
test('ZIP-Limits werden anhand von Metadaten und tatsächlicher entpackter Größe durchgesetzt', async () => {
  assert.equal(ARCHIVE_LIMITS.archiveBytes, 128 * 1024 * 1024);
  await assert.rejects(() => inspectPackArchive(new Uint8Array(ARCHIVE_LIMITS.archiveBytes + 1)), /128 MiB/);
  const base = zip(original.files);
  const tooBig = setMetadata(base, (view, central, local) => { view.setUint32(central + 24, ARCHIVE_LIMITS.fileBytes + 1, true); view.setUint32(local + 22, ARCHIVE_LIMITS.fileBytes + 1, true); });
  await assert.rejects(() => inspectPackArchive(tooBig), /16 MB/);
  const many = { ...original.files }; for (let i = 0; i < 257; i++) many[`extra-${i}.txt`] = new Uint8Array();
  await assert.rejects(() => inspectPackArchive(zip(many)), /256/);
  const bigJson = { ...original.files, 'pack.json': new Uint8Array(ARCHIVE_LIMITS.manifestBytes + 1) };
  await assert.rejects(() => inspectPackArchive(zip(bigJson)), /256 KB/);
  // A highly compressible stream lies about its output size in BOTH headers.
  // Streaming extraction must stop on actual output, not trust those headers.
  const bomb = zipSync({ 'bomb.txt': new Uint8Array(4 * 1024 * 1024), 'pack.json': original.files['pack.json'] }, { level: 9 });
  const dishonest = setMetadata(bomb, (view, central, local) => { view.setUint32(central + 24, 10, true); view.setUint32(local + 22, 10, true); });
  await assert.rejects(() => inspectPackArchive(dishonest), /Größen überschreiten|sicher entpackt/);
});
test('Beschädigte oder mehrdeutige ZIP-Strukturen werden abgewiesen', async () => {
  await assert.rejects(() => inspectPackArchive(new Uint8Array([1,2,3])), /ZIP/);
  await assert.rejects(() => inspectPackArchive(zip({ 'readme.txt': strToU8('no manifest') })), /genau eine/);
  await assert.rejects(() => inspectPackArchive(zip({ ...original.files, 'nested/pack.json': original.files['pack.json'] })), /genau eine/);
  const base = zip(original.files);
  await assert.rejects(() => inspectPackArchive(base.slice(0, -8)), /ZIP/);
  const overlap = setMetadata(base, (view, central) => view.setUint32(central + 42, 1, true), 1);
  await assert.rejects(() => inspectPackArchive(overlap), /ZIP-Dateikopf/);
});

test('Stark komprimierte Bilddateien dürfen das gesamte Dekodierbudget nicht überschreiten', async () => {
  const manifest = structuredClone(original.manifest), files = copyFiles();
  const crc32 = bytes => { let crc = 0xffffffff; for (const byte of bytes) { crc ^= byte; for(let i=0;i<8;i++)crc=crc&1?0xedb88320^(crc>>>1):crc>>>1; } return (crc^0xffffffff)>>>0; };
  for (const design of manifest.layouts) {
    design.width = 4096; design.height = 4096;
    for(const path of [design.layers.base,...design.layers.genetics,...design.layers.thc,...design.layers.cbd]) {
      const bytes=files[path], view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
      view.setUint32(16,4096);view.setUint32(20,4096);view.setUint32(29,crc32(bytes.subarray(12,29)));
    }
  }
  files['pack.json']=strToU8(JSON.stringify(manifest));
  await assert.rejects(inspectPackArchive(zip(files)),/zu viele Bildpunkte/);
});

test('Legacy-ZIPs migrieren zu Layouts und neue ZIPs behalten beliebige Layout-IDs', async () => {
  const manifest = structuredClone(original.manifest);
  const legacy = {...manifest, formats:Object.fromEntries(manifest.layouts.filter(x=>['rectangular','circular'].includes(x.id)).map(({id,name,...design})=>[id,design]))};
  delete legacy.layouts;
  const importedLegacy = await inspectPackArchive(zip({...original.files,'pack.json':strToU8(JSON.stringify(legacy))}));
  assert.equal(importedLegacy.manifest.formats, undefined);
  assert.deepEqual(importedLegacy.manifest.layouts.map(x=>x.id), ['rectangular','circular']);
  manifest.layouts = manifest.layouts.map((layout,index)=>({...layout,id:`custom-layout-${index+1}`,name:`Eigenes Layout ${index+1}`}));
  const imported = await inspectPackArchive(buildPackArchive(manifest, original.files));
  assert.deepEqual(imported.manifest.layouts.map(x=>x.id), manifest.layouts.map(x=>x.id));
  assert.deepEqual(imported.manifest.layouts.map(x=>[x.width,x.height]),manifest.layouts.map(x=>[x.width,x.height]));
});
