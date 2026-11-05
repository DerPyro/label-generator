import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG, LIMITS, THRESHOLDS } from '../src/config.js';
import { normalizeInput, getLayerLevel, selectLayers, getRenderPlan } from '../src/model.js';
const sample={name:'Super Silver Haze',year:2026,sativa:75,thc:20,cbd:3};
for(const layer of ['genetics','thc','cbd'])test(`${layer}: sieben Stufen und alle lückenlosen Dezimalgrenzen`,()=>{
 assert.equal(getLayerLevel(0,layer),1);
 for(const [index,max] of THRESHOLDS[layer].entries()){
  assert.equal(getLayerLevel(max,layer),index+1);assert.equal(getLayerLevel(max-.000001,layer),index+1);
  if(index<6)assert.equal(getLayerLevel(max+.000001,layer),index+2);
 }
 for(const value of [-.1,THRESHOLDS[layer][6]+.1,NaN,Infinity,'2',undefined])assert.throws(()=>getLayerLevel(value,layer));
});
test('THC40 und CBD20 zulässig; darüber Validierungsfehler',()=>{
 assert.deepEqual(LIMITS,{thc:40,cbd:20});assert.equal(normalizeInput({...sample,thc:40,cbd:20}).cbd,20);
 for(const patch of [{thc:40.1},{cbd:20.1},{thc:-1},{cbd:''},{sativa:101},{indica:-1}])assert.throws(()=>normalizeInput({...sample,...patch}));
});
test('Gegenanteil ergänzt, widersprüchliche Genetik abgewiesen',()=>{
 assert.equal(normalizeInput(sample).indica,25);assert.equal(normalizeInput({...sample,sativa:undefined,indica:80}).sativa,20);
 assert.equal(normalizeInput({...sample,sativa:33.3,indica:66.7}).sativa,33.3);
 assert.throws(()=>normalizeInput({...sample,indica:70}),/100/);assert.throws(()=>normalizeInput({...sample,sativa:undefined,indica:undefined}));
});
test('Name, Jahr und optionaler Produzent normalisiert',()=>{
 assert.equal(normalizeInput({...sample,name:'  Super   Silver Haze  '}).name,'Super Silver Haze');
 assert.equal(normalizeInput(sample).producer,'');assert.equal(normalizeInput({...sample,producer:' Royal   Queen Seeds '}).producer,'Royal Queen Seeds');
 for(const patch of [{name:' '},{name:'x'.repeat(201)},{producer:'x'.repeat(121)},{year:2026.5},{year:NaN},{thc:true}])assert.throws(()=>normalizeInput({...sample,...patch}));
});
test('Genau ein eigenes Sprite pro gewählter Stufe ohne Überblendung',()=>{
 const selected=selectLayers(sample);
 for(const [id,level] of [['genetics',6],['thc',4],['cbd',2]]){
  assert.equal(selected[id].level,level);assert.ok(selected[id].path.endsWith(`/${id}/${level}.png`));
  assert.deepEqual(selected[id].sources,[{path:selected[id].path,weight:1}]);assert.equal(selected[id].growth,undefined);
 }
});
test('Alle343 visuellen Kombinationen erreichbar',()=>{
 const combos=new Set();for(const sativa of THRESHOLDS.genetics)for(const thc of THRESHOLDS.thc)for(const cbd of THRESHOLDS.cbd)combos.add(Object.values(getRenderPlan({...sample,sativa,thc,cbd}).levels).join('-'));
 assert.equal(combos.size,343);
});
test('Deterministischer Renderplan und konfigurierbare Reihenfolge',()=>{
 assert.deepEqual(getRenderPlan(sample),getRenderPlan({...sample}));const order=['base','genetics','text','thc','cbd'];
 assert.deepEqual(getRenderPlan(sample,{...CONFIG,layerOrder:order}).layers.map(x=>x.id),order);
 assert.throws(()=>getRenderPlan(sample,{...CONFIG,layerOrder:['base','text']}));
 const plan=getRenderPlan(sample);assert.equal(plan.packId,'woodland');assert.equal(plan.packVersion,'1.0.0');assert.equal(plan.layoutId,'rectangular');assert.equal(plan.format,undefined);
});
test('Zentrale Regeln und Sprite-Sätze austauschbar',()=>{
 const custom={...CONFIG,thresholds:{...THRESHOLDS,thc:[1,2,3,4,5,6,40]},thc:CONFIG.thc.map((x,i)=>({...x,path:`custom-${i+1}.png`}))};
 assert.equal(selectLayers({...sample,thc:3},custom).thc.path,'custom-3.png');
 assert.throws(()=>selectLayers(sample,{...CONFIG,thc:CONFIG.thc.slice(1)}));assert.throws(()=>getLayerLevel(3,'thc',{thc:[1,2,3]}));
});
