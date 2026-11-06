import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { formatField,layoutText,drawTextField,drawDecoration,elementTransform,arcSweep } from '../src/typography.js';
import { validateManifest,resolvePackConfig,manifestAssetPaths } from '../src/texturepacks.js';
import { manifestSchema,validateSchema } from '../src/manifest-schema.js';
import { getRenderPlan } from '../src/model.js';
import { loadFonts } from '../src/renderer.js';
import { inspectPackArchive,buildPackArchive } from '../src/pack-archive.js';
const root=new URL('../examples/composition/',import.meta.url);
const manifest=JSON.parse(await readFile(new URL('pack.json',root),'utf8'));
const config=()=>resolvePackConfig(manifest,'portrait',root);
const input={name:'Test',producer:'Producer',year:2026,thc:24.5,cbd:1.2,sativa:80,indica:20};
function context(){
 const calls=[];return {calls,font:'',textAlign:'center',measureText(text){return {width:[...text].reduce((sum,c)=>sum+(c==='W'?15:7),0)*Number(this.font.match(/(\d+)px/)?.[1]||20)/20};},
  ...Object.fromEntries(['save','restore','translate','rotate','scale','fillText','drawImage','beginPath','roundRect','fill','stroke'].map(name=>[name,(...args)=>calls.push([name,...args])]))};
}
test('Published JSON Schema is exactly the runtime schema, and all examples validate',async()=>{
 const published=JSON.parse(await readFile(new URL('../schemas/texturepack.schema.json',import.meta.url),'utf8'));
 assert.deepEqual(published,manifestSchema);
 for(const name of ['composition','template']){
  const m=JSON.parse(await readFile(new URL(`../examples/${name}/pack.json`,import.meta.url),'utf8'));
  assert.doesNotThrow(()=>validateSchema(m,published));assert.deepEqual(validateManifest(m),m);
 }
});
test('Formatting uses defined raw, percent and year formats, prefixes and suffixes',()=>{
 for(const [field,expected]of [[{source:'thc',format:'percent',prefix:'THC: '},'THC: 24,5 %'],[{source:'cbd',format:'percent',prefix:'CBD '},'CBD 1,2 %'],[{source:'year',format:'year-full',prefix:'Ernte '},'Ernte 2026'],[{source:'year',format:'year-short'},'26'],[{source:'sativa',format:'percent',suffix:' Sativa'},'80 % Sativa'],[{source:'static',text:'<b>Literal</b>'},'<b>Literal</b>'],[{source:'name',format:'raw'},'Test']])assert.equal(formatField(field,input),expected);
 assert.equal(formatField({source:'producer',prefix:'By '},{producer:''}),'');
});
test('Independent and repeated sources retain individual geometry and fonts',()=>{
 const m=structuredClone(manifest),layout=m.layouts[0];
 layout.typography.fields.push({...layout.typography.fields[0],id:'name-copy',x:10,y:20,font:'Abel',background:undefined});delete layout.typography.fields.at(-1).background;
 const c=resolvePackConfig(m,'portrait',root),plan=getRenderPlan(input,c);
 const names=plan.elements.filter(e=>e.source==='name');assert.equal(names.length,2);assert.notEqual(names[0].font,names[1].font);assert.notEqual(names[0].x,names[1].x);
 assert.equal(plan.input.name,'Test');
});
test('Shared zIndex list mixes layers, backgrounds, decorations and text with stable ties',()=>{
 const c=config(),plan=getRenderPlan(input,c),ids=plan.elements.map(e=>e.id);
 assert.ok(ids.indexOf('name-plaque')<ids.indexOf('strain-name'));assert.ok(ids.indexOf('foreground')>ids.indexOf('strain-name'));
 assert.deepEqual(plan.elements.map(e=>e.zIndex),plan.elements.map(e=>e.zIndex).sort((a,b)=>a-b));
 for(const f of c.typography.fields)f.zIndex=100;
 c.typography.fields[0].background.zIndex=100;c.typography.decorations[0].zIndex=100;
 assert.deepEqual(getRenderPlan(input,c).elements.filter(e=>e.zIndex===100).map(e=>e.id),['genetics','name-plaque','foreground',...c.typography.fields.map(f=>f.id)]);
 c.zIndex.cbd=900;assert.equal(getRenderPlan(input,c).elements.at(-1).id,'cbd');
});
test('Text wrapping, width/height fitting and controlled rejection work independently of shape',()=>{
 const ctx=context(),f={id:'fit',source:'name',font:'Lora',fontSize:40,minFontSize:10,maxWidth:70,maxLines:2,maxHeight:40};
 const result=layoutText(ctx,f,{name:'WWWW WWWW'});assert.ok(result.fontSize<40);assert.ok(result.width<=70);assert.ok(result.height<=40);
 assert.throws(()=>layoutText(ctx,{...f,maxWidth:1,minFontSize:40},{name:'WWWW'}),/Textfeld.*fit/);
 assert.deepEqual(layoutText(ctx,{...f,maxWidth:200,fontSize:20,minFontSize:10,wrap:false},{name:'A\nB'}).lines,['A','B']);
 assert.deepEqual(layoutText(ctx,{...f,source:'producer',maxHeight:1},{producer:''}),{text:'',lines:[],fontSize:40,width:0,height:0});
});
test('Spaced text measures exactly the glyph advances drawn, including kerning and negative spacing',()=>{
 const ctx=context();ctx.measureText=text=>({width:[...text].length===1?15:5});
 const field={id:'spaced',source:'name',font:'Lora',fontSize:20,maxWidth:31,letterSpacing:1,color:'#000'};
 const layout=layoutText(ctx,field,{name:'AV'});assert.equal(layout.width,31);
 drawTextField(ctx,{...field,x:0,y:0},layout);const glyphs=ctx.calls.filter(c=>c[0]==='fillText');assert.equal(glyphs[0][2],-15.5);assert.equal(glyphs[1][2],.5);
 assert.throws(()=>layoutText(ctx,{...field,maxWidth:30},{name:'AV'}),/Textfeld/);
 const arc={...manifest.layouts[1].typography.fields.at(-1),source:'name',letterSpacing:-20,path:{type:'arc',centerX:0,centerY:0,radius:10,startAngle:0,endAngle:90,direction:'clockwise'}};
 assert.throws(()=>layoutText(ctx,arc,{name:'W'.repeat(100)}),/Textfeld/);
});
test('Color syntax and root filenames use the same rules in JSON Schema and runtime',()=>{
 const fieldSchema=manifestSchema.properties.layouts.items.properties.typography.properties.fields.items;
 for(const color of ['#12345','#1234567','rgb(,)','hsl(30%,50%,50%)','rgb(10%,20,30)']){
  const m=structuredClone(manifest);m.layouts[0].typography.fields[0].color=color;
  assert.throws(()=>validateManifest(m));assert.throws(()=>validateSchema(m.layouts[0].typography.fields[0],fieldSchema));
 }
 for(const color of ['#abc','#abcd','#abcdef','#abcdef12','rgb(10,20,30)','rgba(10%,20%,30%,0.5)','hsl(-30,50%,40%)','hsla(30,50%,40%,25%)']){
  const m=structuredClone(manifest);m.layouts[0].typography.fields[0].color=color;
  assert.doesNotThrow(()=>validateManifest(m));
 }
 const m=structuredClone(manifest);m.layouts[0].typography.fields[0].background.asset='plaque.v2.png';m.fonts[0].path='my.font.ttf';assert.doesNotThrow(()=>validateManifest(m));
});
test('Rotation and letter spacing use balanced local canvas transformations',()=>{
 const ctx=context(),field={...manifest.layouts[0].typography.fields[0],letterSpacing:2},layout=layoutText(ctx,field,input);
 drawTextField(ctx,field,layout,'Scoped');assert.ok(ctx.calls.some(c=>c[0]==='translate'&&c[1]===field.x&&c[2]===field.y));assert.ok(ctx.calls.some(c=>c[0]==='rotate'&&c[1]===field.rotation*Math.PI/180));
 assert.equal(ctx.calls[0][0],'save');assert.equal(ctx.calls.at(-1)[0],'restore');assert.equal(ctx.calls.filter(c=>c[0]==='fillText').length,4);
});
test('Arc uses actual glyph widths, clockwise/counterclockwise sweeps and rejects overflow',()=>{
 const field={...manifest.layouts[1].typography.fields.at(-1),source:'name'},ctx=context();
 const wide=layoutText(ctx,field,{name:'WW'}),narrow=layoutText(ctx,field,{name:'ii'});assert.ok(wide.width>narrow.width);
 drawTextField(ctx,field,wide);const positions=ctx.calls.filter(c=>c[0]==='translate');assert.equal(positions.length,3);assert.notEqual(positions[1][1],positions[2][1]);
 assert.equal(arcSweep({startAngle:-150,endAngle:-30,direction:'clockwise'}).sign,1);
 assert.equal(arcSweep({startAngle:-30,endAngle:-150,direction:'counterclockwise'}).sign,-1);
 assert.throws(()=>layoutText(ctx,{...field,path:{...field.path,radius:1},minFontSize:22},{name:'W'.repeat(200)}),/Textfeld/);
 assert.throws(()=>layoutText(ctx,field,{name:'A\nB'}),/Zeilenumbrüche/);
});
test('Linked sprite inherits parent position and rotation; standalone sprite stays independent',()=>{
 const fields=[{id:'title',x:100,y:200,rotation:90}];
 const linked={id:'plaque',type:'sprite',relativeTo:'title',x:10,y:20,width:100,height:30,rotation:5,opacity:.5};
 const t=elementTransform(linked,fields);assert.ok(Math.abs(t.x-80)<1e-8);assert.ok(Math.abs(t.y-210)<1e-8);assert.equal(t.rotation,95);
 assert.deepEqual(elementTransform({...linked,relativeTo:undefined},fields),{x:10,y:20,rotation:5});
 const ctx=context();drawDecoration(ctx,linked,fields,{});assert.equal(ctx.calls.filter(c=>c[0]==='drawImage').length,1);assert.equal(ctx.calls.at(-1)[0],'restore');
 assert.throws(()=>elementTransform({...linked,relativeTo:'missing'},fields),/referenz/);
});
test('Geometric backgrounds support padding, border, shadow, opacity and radius',()=>{
 const ctx=context();drawDecoration(ctx,{type:'rect',x:10,y:20,width:100,height:40,padding:5,radius:8,color:'#fff',border:{color:'#000',width:2},shadow:{color:'#000',blur:8},zIndex:400},[],null);
 assert.deepEqual(ctx.calls.find(c=>c[0]==='roundRect'),['roundRect',-55,-25,110,50,8]);assert.ok(ctx.calls.some(c=>c[0]==='stroke'));
});
test('Unsafe geometry, references, cycles, IDs, fonts and unknown schema properties are rejected',()=>{
 const mutations=[m=>m.layouts[0].typography.fields[0].font='Missing',m=>m.layouts[0].typography.fields[0].rotation=Infinity,m=>m.layouts[0].typography.fields[0].zIndex=NaN,m=>m.layouts[0].typography.fields[0].fontSize=-1,m=>m.layouts[0].typography.fields[0].x=900000,m=>m.layouts[0].typography.fields[0].background.asset='https://bad/a.png',m=>m.layouts[0].typography.fields[0].background.relativeTo='foreground',m=>m.layouts[0].typography.decorations[0].relativeTo='foreground',m=>m.layouts[0].typography.fields[1].id='strain-name',m=>m.layouts[0].typography.fields[0].relativeTo='foreground',m=>m.layouts[0].typography.fields[0].format='value => eval(value)',m=>m.layouts[0].typography.fields[0].minFontSize=500,m=>m.layouts[0].typography.fields.push(...Array.from({length:129},(_,i)=>({...m.layouts[0].typography.fields[1],id:'extra-'+i}))),m=>m.layouts[0].typography.fields[0].background.scale=9,m=>m.layouts[0].typography.fields[0].background.width=8192];
 for(const mutate of mutations){const m=structuredClone(manifest);mutate(m);if(m.layouts[0].typography.fields[0].background.width===8192)m.layouts[0].typography.fields[0].background.scale=8;assert.throws(()=>validateManifest(m));}
});
test('Multiple font families are loaded once and isolated across pack identities',async t=>{
 const faces=[];const oldFont=globalThis.FontFace,oldDocument=globalThis.document;
 globalThis.FontFace=class{constructor(family,url){this.family=family;this.url=url;faces.push(this);}async load(){return this;}};
 globalThis.document={fonts:{add(){},async load(){}}};t.after(()=>{globalThis.FontFace=oldFont;globalThis.document=oldDocument;});
 const c=config(),first=await loadFonts(c),again=await loadFonts(c),other=await loadFonts({...c,assetVersion:'different@1'});
 assert.equal(Object.keys(first).length,2);assert.notEqual(first.Lora,first.Abel);assert.notEqual(first.Lora,other.Lora);assert.deepEqual(first,again);assert.equal(faces.length,4);
});
test('ZIP round trip validates additional PNG sizes, references and required files',async()=>{
 const files={};for(const path of [...manifestAssetPaths(manifest),'ASSET-LICENSE.txt','fonts/lora/OFL.txt','fonts/abel/OFL.txt'])files[path]=new Uint8Array(await readFile(new URL(path,root)));
 const inspected=await inspectPackArchive(buildPackArchive(manifest,files));assert.ok(inspected.files['decorations/plaque.png']);assert.ok(inspected.files['decorations/ornament.png']);assert.deepEqual(inspected.manifest,manifest);
 delete files['decorations/plaque.png'];assert.throws(()=>buildPackArchive(manifest,files),/fehlt/);
});
