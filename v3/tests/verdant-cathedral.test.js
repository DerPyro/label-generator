import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {validateManifest,resolvePackConfig} from '../src/texturepacks.js';
import {getLayerLevel,getRenderPlan} from '../src/model.js';
import {decodePng} from '../scripts/normalize-watercolor.js';
const root=new URL('../texturepacks/stained-glass-verdant-cathedral/',import.meta.url);
const manifest=validateManifest(JSON.parse(await readFile(new URL('pack.json',root),'utf8')));
const sample={name:'Cathedral',producer:'Botanical',year:2026,sativa:50,thc:20,cbd:10};
const luminance=color=>{const v=color.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});return v[0]*.2126+v[1]*.7152+v[2]*.0722;};
test('Verdant Cathedral: 21/9/7 native scales, exclusive boundaries, endpoints and static architecture',()=>{
 for(const layout of manifest.layouts){
  const config=resolvePackConfig(manifest,layout.id,root);
  assert.deepEqual(layout.zIndex,{base:0,genetics:100,thc:200,cbd:300,foreground:400});
  assert.equal(typeof layout.layers.foreground,'string');
  for(const [key,bounds,max]of [['genetics',Array.from({length:20},(_,i)=>(i+1)*5),100],['thc',[5,10,15,20,25,30,35,40],40],['cbd',[2,5,8,11,14,17],20]]){
   assert.deepEqual(layout.layers[key].map(x=>x.below),[...bounds,undefined]);
   assert.equal(getLayerLevel(0,key,config.thresholds),1);assert.equal(getLayerLevel(max,key,config.thresholds),bounds.length+1);
   bounds.forEach((v,i)=>{assert.equal(getLayerLevel(v-.0001,key,config.thresholds),i+1);assert.equal(getLayerLevel(v,key,config.thresholds),i+2);assert.equal(getLayerLevel(Math.min(max,v+.0001),key,config.thresholds),i+2);});
  }
  for(const sativa of [0,50,100])for(const thc of [0,20,40])for(const cbd of [0,10,20]){
   const plan=getRenderPlan({...sample,sativa,thc,cbd},config);
   assert.equal(plan.elements.find(x=>x.id==='foreground').assetPath,layout.layers.foreground);
   assert.deepEqual(plan.elements.map(x=>x.zIndex),[0,100,200,300,400,...Array(11).fill(500)]);
  }
  assert.deepEqual(layout.typography.fields.filter(f=>f.source!=='static').map(f=>f.source).sort(),['cbd','indica','name','producer','sativa','thc','year']);
  for(const source of ['thc','cbd','indica','sativa'])assert.ok(layout.typography.fields.find(f=>f.source===source).fontSize>=40,'Values must remain prominent');
 }
});
test('Verdant Cathedral: whole-glass tint, upper astronomy and strictly cumulative lower floral growth',async()=>{
 for(const layout of manifest.layouts){
  const load=async asset=>{const bytes=await readFile(new URL(asset,root));assert.equal(bytes[24],8);assert.equal(bytes[25],6);const image=decodePng(bytes);assert.equal(image.width,layout.width);assert.equal(image.height,layout.height);return image.pixels;};
  const foreground=await load(layout.layers.foreground);
  await load(layout.layers.base);
  for(const key of ['genetics','thc','cbd']){
   let previous=null,previousCount=-1;const hashes=new Set();
   for(const rule of layout.layers[key]){
    const pixels=await load(rule.asset);hashes.add(createHash('sha256').update(pixels).digest('hex'));let painted=0;
    for(let i=3;i<pixels.length;i+=4){
     const a=pixels[i];if(a)painted++;
     if(foreground[i]===255)assert.equal(a,0,'Overlay collides with fixed lead');
     if(key==='genetics'&&previous)assert.equal(a,previous[i],'Glass geometry changed');
     const y=Math.floor((i-3)/4/layout.width);
     if(a&&key==='thc')assert.ok(y<480,'Astronomy enters text/lower zone');
     if(a&&key==='cbd')assert.ok(y>(layout.shape==='circle'?940:1190),'Botany must grow only at bottom');
     if(['cbd','thc'].includes(key)&&previous?.[i])assert.deepEqual(pixels.subarray(i-3,i+1),previous.subarray(i-3,i+1),'Established motif moved or faded');
    }
    if(['cbd','thc'].includes(key))assert.ok(painted>previousCount,'Growth must add pixels');
    if(key==='genetics'){
     // Text area, upper and lower panes all carry the same genetic hue.
     const cx=Math.floor(layout.width/2),ys=layout.shape==='circle'?[180,550,700,1080]:[150,600,900,1350];
     for(const y of ys)assert.ok(pixels[(y*layout.width+cx)*4+3]>240,'Genetics left a central/top/bottom pane uncolored');
     for(const field of layout.typography.fields.filter(f=>['thc','cbd','indica','sativa'].includes(f.source))){
      const i=(Math.round(field.y)*layout.width+Math.round(field.x))*4;
      assert.ok((luminance([...pixels.subarray(i,i+3)])+.05)/(luminance([16,37,44])+.05)>=4.5,'Percentage contrast below 4.5:1');
     }
    }
    if(layout.shape==='circle')for(const p of [0,layout.width-1,(layout.height-1)*layout.width,layout.width*layout.height-1])assert.equal(pixels[p*4+3],0);
    previous=pixels;previousCount=painted;
   }
   assert.equal(hashes.size,layout.layers[key].length,'Duplicate stage image');
  }
 }
});
