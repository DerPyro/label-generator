import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateManifest, resolvePackConfig, manifestAssetPaths } from '../src/texturepacks.js';
import { getRenderPlan } from '../src/model.js';
import { buildPackArchive, inspectPackArchive } from '../src/pack-archive.js';
import { setLanguage, layerLabel, t } from '../src/i18n.js';

const root = new URL('../texturepacks/woodland/', import.meta.url);
const original = JSON.parse(await readFile(new URL('pack.json', root), 'utf8'));
function fixture() {
 const manifest=structuredClone(original);
 manifest.layouts=[manifest.layouts[0]];
 const layers=manifest.layouts[0].layers;
 for(const [id,bounds] of Object.entries({genetics:[25,50,75],thc:[5,10],cbd:[]})){
  const paths=layers[id];
  layers[id]=[...bounds.map((below,i)=>({below,asset:paths[i]})),{asset:paths[bounds.length]}];
 }
 return manifest;
}
const data={name:'Custom scales',year:2026,sativa:50,thc:5,cbd:20};
const resolve=manifest=>resolvePackConfig(manifest,undefined,root);

test('Independent scales select exact boundaries, decimals, endpoints and the Indica complement',()=>{
 const config=resolve(fixture());
 assert.deepEqual(['genetics','thc','cbd'].map(id=>config[id].length),[4,3,1]);
 for(const [id,inputKey,values] of [
  ['genetics','sativa',[[0,1],[24.999,1],[25,2],[49.999,2],[50,3],[75,4],[100,4]]],
  ['thc','thc',[[0,1],[4.999,1],[5,2],[9.999,2],[10,3],[40,3]]],
  ['cbd','cbd',[[0,1],[0.1,1],[20,1]]]
 ]) for(const [value,level] of values){
  const plan=getRenderPlan({...data,[inputKey]:value},config);
  assert.equal(plan.levels[id],level,`${id} ${value}`);
  const layer=plan.layers.find(layer=>layer.id===id);
  assert.equal(layer.path,config[id][level-1].path);
  assert.equal(layer.totalLevels,config[id].length);
 }
 assert.equal(getRenderPlan({...data,sativa:undefined,indica:75},config).levels.genetics,2);
 const many=fixture();many.layouts[0].layers.thc=Array.from({length:64},(_,i)=>i===63?{asset:`thc/${i}.png`}:{below:(i+1)/2,asset:`thc/${i}.png`});
 assert.equal(getRenderPlan({...data,thc:40},resolve(many)).levels.thc,64);
});

test('Custom rules reject missing catch-alls, unordered bounds, unreachable ranges, mixed entries and unsafe assets',()=>{
 const badRules=[[],[{below:5,asset:'a.png'}],[{asset:'a.png'},{asset:'b.png'}],
  [{below:0,asset:'a.png'},{asset:'b.png'}],[{below:41,asset:'a.png'},{asset:'b.png'}],
  [{below:10,asset:'a.png'},{below:5,asset:'b.png'},{asset:'c.png'}],
  [{below:5,asset:'a.png'},{below:5,asset:'b.png'},{asset:'c.png'}],
  [{below:'5',asset:'a.png'},{asset:'b.png'}],[{below:NaN,asset:'a.png'},{asset:'b.png'}],
  [{below:5,asset:'a.png'},{asset:'a.png'}],[{asset:'../a.png'}],[{asset:'https://example.com/a.png'}],
  [{asset:'a.png',unknown:true}],['a.png',{asset:'b.png'}],Array.from({length:65},(_,i)=>({asset:`${i}.png`}))];
 for(const rules of badRules){const manifest=fixture();manifest.layouts[0].layers.thc=rules;assert.throws(()=>validateManifest(manifest));}
 for(const [id,max] of [['genetics',100],['cbd',20]]){const manifest=fixture();manifest.layouts[0].layers[id]=[{below:max+1,asset:'a.png'},{asset:'b.png'}];assert.throws(()=>validateManifest(manifest));}
});

test('Custom and default scales coexist in one layout and survive ZIP import/export with checked assets',async()=>{
 const manifest=fixture();manifest.layouts[0].layers.genetics=original.layouts[0].layers.genetics;
 const files=Object.fromEntries(await Promise.all(manifestAssetPaths(manifest).map(async path=>[path,new Uint8Array(await readFile(new URL(path,root)))])));
 const archive=buildPackArchive(manifest,files);
 const inspected=await inspectPackArchive(archive);
 assert.deepEqual(inspected.manifest,manifest);
 assert.deepEqual(getRenderPlan(data,resolve(inspected.manifest)).levels,{genetics:4,thc:2,cbd:1});
 const path=manifest.layouts[0].layers.thc[1].asset;
 const missing={...files};delete missing[path];
 assert.throws(()=>buildPackArchive(manifest,missing),/fehlt/);
 const wrong={...files,[path]:files[path].slice()};new DataView(wrong[path].buffer).setUint32(16,64);
 assert.throws(()=>buildPackArchive(manifest,wrong),/CRC|Abmessungen/);
});

test('Level labels translate with arbitrary totals',()=>{
 setLanguage('en');
 try{assert.equal(layerLabel('thc · Stufe 2/3'),'THC · Level 2/3');assert.equal(t('Stufe 12 / 64 · '),'Level 12 / 64 · ');}
 finally{setLanguage('de');}
});
