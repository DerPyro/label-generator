import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateManifest, resolvePackConfig, manifestAssetPaths } from '../src/texturepacks.js';
import { getRenderPlan } from '../src/model.js';
import { getSpriteOrder, withSpriteOrder } from '../src/sprite-order.js';
import { PrintCartService } from '../src/cart.js';
import { buildPackArchive, inspectPackArchive } from '../src/pack-archive.js';
import { baselineImage, encodeRgba } from '../scripts/normalize-watercolor.js';

const root=new URL('../examples/template/',import.meta.url);
const original=JSON.parse(await readFile(new URL('pack.json',root),'utf8'));
const data={name:'Foreground',year:2026,sativa:50,thc:20,cbd:3};
function fixture(){const pack=structuredClone(original),layout=pack.layouts[0];layout.layers.foreground=layout.layers.cbd[6];layout.zIndex.foreground=250;return pack;}
const resolve=pack=>resolvePackConfig(pack,undefined,root);

test('Foreground is optional, independent of text, masked and ordered between weather and ornaments',()=>{
 assert.equal(resolve(original).foreground,undefined);
 const manifest=fixture();manifest.layouts[0].masks={foreground:manifest.layouts[0].layers.thc[0]};
 const config=resolve(manifest),plan=getRenderPlan(data,config);
 assert.deepEqual(plan.elements.filter(e=>e.type==='layer').map(e=>e.id),['base','genetics','thc','foreground','cbd']);
 const front=plan.layers.find(e=>e.id==='foreground');assert.equal(front.path,config.foreground.path);
 assert.equal(plan.elements.find(e=>e.id==='foreground').category,'foreground');assert.ok(config.masks.foreground.endsWith('/thc/1.png'));
 assert.equal(front.level,undefined);
 const order=['foreground','base','genetics','thc','cbd'];
 assert.deepEqual(getSpriteOrder(config),['base','genetics','thc','foreground','cbd']);
 assert.deepEqual(getRenderPlan(data,withSpriteOrder(config,order)).elements.filter(e=>e.type==='layer').map(e=>e.id),order);
 assert.throws(()=>withSpriteOrder(config,['base','genetics','thc','cbd']));
});

test('Foreground can follow seven standard genetics bounds or its own independent Sativa scale',()=>{
 const manifest=fixture(),layout=manifest.layouts[0];layout.layers.foreground=[...layout.layers.genetics];
 let config=resolve(manifest);
 for(const [sativa,index]of [[0,0],[14,0],[14.1,1],[100,6]])assert.equal(getRenderPlan({...data,sativa},config).layers.find(e=>e.id==='foreground').path,config.foreground[index].path);
 layout.layers.foreground=[{below:50,asset:layout.layers.genetics[0]},{asset:layout.layers.genetics[6]}];
 config=resolve(manifest);
 for(const [sativa,index]of [[0,0],[49.99,0],[50,1],[100,1]])assert.equal(getRenderPlan({...data,sativa},config).layers.find(e=>e.id==='foreground').path,config.foreground[index].path);
 assert.equal(getRenderPlan({...data,sativa:undefined,indica:100},config).layers.find(e=>e.id==='foreground').level,1);
});

test('Foreground validation catches missing zIndex/assets, orphan masks, duplicates, unsafe paths and reserved IDs',()=>{
 for(const mutate of [
  l=>{delete l.zIndex.foreground;},l=>{delete l.layers.foreground;},l=>{l.layers.foreground='../a.png';},
  l=>{l.layers.foreground=[{below:50,asset:'a.png'}];},l=>{l.layers.foreground=[{below:50,asset:'a.png'},{asset:'a.png'}];},
  l=>{l.typography.fields[0].id='foreground';},l=>{delete l.layers.foreground;delete l.zIndex.foreground;l.masks={foreground:'mask.png'};}
 ]){const pack=fixture();mutate(pack.layouts[0]);assert.throws(()=>validateManifest(pack));}
});

test('Five-layer orders persist through cart reload and respect existing four-layer packs',()=>{
 let saved;const storage={getItem:()=>saved,setItem:(_,value)=>{saved=value;}};
 const cart=new PrintCartService({storage}),config=resolve(fixture()),spriteOrder=getSpriteOrder(config);
 cart.add({id:'front',data,packId:'starter-template',packVersion:'1.0.0',layoutId:'portrait',spriteOrder});
 assert.deepEqual(new PrintCartService({storage}).list()[0].spriteOrder,spriteOrder);
 assert.throws(()=>withSpriteOrder(resolve(original),spriteOrder));
});

test('Foreground assets survive a checked ZIP round trip and require native canvas dimensions',async()=>{
 const manifest=fixture(),layout=manifest.layouts[0];layout.layers.foreground=[{asset:layout.layers.foreground}];
 const files=Object.fromEntries(await Promise.all(manifestAssetPaths(manifest).map(async path=>[path,new Uint8Array(await readFile(new URL(path,root)))])));
 const inspected=await inspectPackArchive(buildPackArchive(manifest,files));assert.deepEqual(inspected.manifest,manifest);
 assert.equal(resolve(inspected.manifest).foreground.length,1);
 const missing={...files};delete missing[layout.layers.foreground[0].asset];assert.throws(()=>buildPackArchive(manifest,missing),/fehlt/);
 layout.layers.foreground=[{asset:'foreground.png'}];
 const wrong={...files,'foreground.png':new Uint8Array(encodeRgba(baselineImage({width:64,height:64,shape:'rectangle'})))};
 assert.throws(()=>buildPackArchive(manifest,wrong),/Abmessungen/);
});
