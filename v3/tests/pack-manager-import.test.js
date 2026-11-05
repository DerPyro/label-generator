import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { TexturePackManager,manifestAssetPaths } from '../src/texturepacks.js';
import { MemoryPackStore } from '../src/pack-store.js';
import { buildPackArchive,inspectPackArchive } from '../src/pack-archive.js';
const root=new URL('../texturepacks/',import.meta.url);
const bundledCount=JSON.parse(await readFile(new URL('catalog.json',root),'utf8')).packs.length;
const fixture=JSON.parse(await readFile(new URL('woodland/pack.json',root),'utf8'));
const files={};for(const path of [...manifestAssetPaths(fixture),'fonts/OFL.txt','ASSET-LICENSE.txt'])files[path]=new Uint8Array(await readFile(new URL('woodland/'+path,root)));
const localManifest=(version='1.2.3')=>({...structuredClone(fixture),id:'local-forest',name:'Lokaler Wald',version});
const fetchImpl=async url=>{try{const bytes=await readFile(new URL(url));return {ok:true,status:200,json:async()=>JSON.parse(bytes.toString()),arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)};}catch{return {ok:false,status:404};}};
const make=(options={})=>new TexturePackManager({catalogUrl:new URL('catalog.json',root),fetchImpl,importedStore:new MemoryPackStore(),validateImportedAssets:async config=>assert.ok(config.base.path.startsWith('blob:')),...options});

test('Mitgeliefertes Pack wird mit Grafiken, Manifest und Lizenzen als ZIP exportiert',async t=>{
 const manager=make();t.after(()=>manager.dispose());const archive=await manager.exportPack('woodland','1.0.0');
 const inspected=await inspectPackArchive(archive);assert.equal(inspected.manifest.id,'woodland');assert.ok(inspected.files['fonts/OFL.txt']);assert.ok(inspected.files['ASSET-LICENSE.txt']);
});
test('Import und identischer Reimport bleiben persistent und verändern vorhandene Daten nicht',async t=>{
 const store=new MemoryPackStore(),manager=make({importedStore:store});t.after(()=>manager.dispose());
 const zip=buildPackArchive(localManifest(),files);const first=await manager.importPack(zip);assert.equal(first.duplicate,false);
 const saved=await store.get('local-forest','1.2.3');const again=await manager.importPack(zip);assert.equal(again.duplicate,true);assert.equal((await store.get('local-forest','1.2.3')).importedAt,saved.importedAt);
 const restored=make({importedStore:store});t.after(()=>restored.dispose());const list=await restored.listPacks();assert.equal(list.filter(x=>x.source==='imported').length,1);
 const config=await restored.getConfig('local-forest','circular','1.2.3');assert.equal(config.width,config.height);assert.ok(config.base.path.startsWith('blob:'));assert.match(config.assetVersion,/[a-f0-9]{64}$/);
});
test('Versionen koexistieren und ein Inhaltswechsel unter derselben Version wird abgewiesen',async t=>{
 const manager=make();t.after(()=>manager.dispose());await manager.importPack(buildPackArchive(localManifest(),files));
 const changed=localManifest();changed.name='Geänderter Wald';await assert.rejects(manager.importPack(buildPackArchive(changed,files)),/Version erhöhen/);
 assert.equal((await manager.loadPack('local-forest','1.2.3')).name,'Lokaler Wald');
 const newer=localManifest('2.0.0');newer.name='Neuer Wald';await manager.importPack(buildPackArchive(newer,files));
 assert.equal((await manager.loadPack('local-forest','2.0.0')).name,'Neuer Wald');
 await manager.removePack('local-forest','1.2.3');await assert.rejects(manager.getConfig('local-forest','rectangular','1.2.3'),/nicht installiert/);
 assert.equal((await manager.loadPack('local-forest','2.0.0')).version,'2.0.0');await assert.rejects(manager.removePack('woodland','1.0.0'),/Mitgelieferte/);
});
test('Bilddekodierung oder Speicherfehler verhindern die gesamte Installation',async t=>{
 const store=new MemoryPackStore(),manager=make({importedStore:store,validateImportedAssets:async()=>{throw Error('PNG lässt sich nicht dekodieren');}});t.after(()=>manager.dispose());
 await assert.rejects(manager.importPack(buildPackArchive(localManifest(),files)),/nicht installiert.*dekodieren/);assert.equal((await store.list()).length,0);assert.equal(manager.localResources.size,0);
 const failed=make({importedStore:{get:async()=>null,put:async()=>{throw Error('Speicher voll');},list:async()=>[]}});t.after(()=>failed.dispose());
 await assert.rejects(failed.importPack(buildPackArchive(localManifest(),files)),/Speicher voll/);assert.equal(failed.localResources.size,0);
});
test('Mitgelieferte Versionen sind geschützt und fehlender lokaler Speicher lässt sie nutzbar',async t=>{
 const manager=make();t.after(()=>manager.dispose());await assert.rejects(manager.importPack(buildPackArchive(fixture,files)),/mitgelieferten/);
 const noStore=make({importedStore:null});t.after(()=>noStore.dispose());assert.equal((await noStore.listPacks()).length,bundledCount);await assert.rejects(noStore.importPack(buildPackArchive(localManifest(),files)),/IndexedDB/);
 const unavailable=make({importedStore:{list:async()=>{throw Error('Zugriff blockiert');}}});t.after(()=>unavailable.dispose());assert.equal((await unavailable.listPacks()).length,bundledCount);assert.match(unavailable.warning,/blockiert/);
});
test('Gleichzeitige Importe derselben Version werden seriell und unveränderlich verarbeitet',async t=>{
 const manager=make();t.after(()=>manager.dispose());const changed=localManifest();changed.name='Anderer Inhalt';
 const result=await Promise.allSettled([manager.importPack(buildPackArchive(localManifest(),files)),manager.importPack(buildPackArchive(changed,files))]);
 assert.equal(result[0].status,'fulfilled');assert.equal(result[1].status,'rejected');assert.equal((await manager.loadPack('local-forest','1.2.3')).name,'Lokaler Wald');
 const exported=await inspectPackArchive(await manager.exportPack('local-forest','1.2.3'));assert.equal(exported.manifest.name,'Lokaler Wald');
});

test('Bereits importierte Legacy-Packs bleiben nutzbar und identischer Reimport trotz altem Hash erlaubt',async t=>{
 const store=new MemoryPackStore(),manager=make({importedStore:store});t.after(()=>manager.dispose());
 const manifest=localManifest();
 const layouts=manifest.layouts || Object.entries(manifest.formats).map(([id,design])=>({...design,id}));
 const legacy={...manifest,formats:Object.fromEntries(layouts.filter(x=>['rectangular','circular'].includes(x.id)).map(({id,name,...design})=>[id,design]))};delete legacy.layouts;
 await store.put({manifest:legacy,files,contentHash:'0'.repeat(64),totalBytes:Object.values(files).reduce((n,bytes)=>n+bytes.length,0),importedAt:1});
 assert.deepEqual((await manager.loadPack('local-forest','1.2.3')).layouts.map(x=>x.id),['rectangular','circular']);
 assert.equal((await manager.getConfig('local-forest','circular','1.2.3')).shape,'circle');
 assert.equal((await manager.importPack(buildPackArchive(legacy,files))).duplicate,true);
 assert.equal((await store.get('local-forest','1.2.3')).importedAt,1);
 const changed={...legacy,name:'Changed'};await assert.rejects(manager.importPack(buildPackArchive(changed,files)),/Version erhöhen/);
});
