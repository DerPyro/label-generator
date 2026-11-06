import { validateManifest,resolvePackConfig,manifestAssetPaths,TexturePackManager } from '../src/texturepacks.js';
import { renderLabel,canvasToPng,loadFonts } from '../src/renderer.js';
import { layoutText } from '../src/typography.js';
import { buildPackArchive,inspectPackArchive } from '../src/pack-archive.js';
import { layoutSheets,generatePdf } from '../src/print.js';
import { PDFDocument } from '../vendor/pdf-lib.esm.min.js';
import { IndexedDBPackStore } from '../src/pack-store.js';

export async function checkTypography(check){
 const assert=(condition,message)=>{if(!condition)throw Error(message);};
 const input={name:'Silver Haze',producer:'Botanical Studio',year:2026,sativa:80,thc:24.5,cbd:1.2};
 const root=new URL('../examples/composition/',import.meta.url);
 const manifest=validateManifest(await (await fetch(new URL('pack.json',root))).json());
 await check('Neue Typografie: zwei echte Fonts, PNG-Hintergrund, Vordergrund, Rotation und Bogentext',async()=>{
  const artifacts={};
  for(const layout of manifest.layouts){
   const config=resolvePackConfig(manifest,layout.id,root),canvas=document.createElement('canvas');
   const families=await loadFonts(config);assert(families.Lora!==families.Abel,'Schriftfamilien kollidieren');
   const ctx=canvas.getContext('2d');ctx.font=`30px "${families.Lora}"`;const serif=ctx.measureText('Botanical Studio').width;ctx.font=`30px "${families.Abel}"`;assert(Math.abs(serif-ctx.measureText('Botanical Studio').width)>1,'Beide Schriftdateien rendern gleich');
   const result=await renderLabel(canvas,input,{config});assert(result.committed,'Rendering nicht übernommen');
   const ids=result.plan.elements.map(e=>e.id);assert(ids.indexOf('name-plaque')<ids.indexOf('strain-name')&&ids.indexOf('foreground')>ids.indexOf('strain-name'),'Reihenfolge falsch');
   if(layout.shape==='circle')assert(result.textLayout['round-title'].width>0,'Bogentext fehlt');
   artifacts['composition-'+layout.id+'.png']=canvas.toDataURL();
   const blob=await canvasToPng(canvas);assert(blob.size>2000,'PNG fehlt');
  }
  window.__packArtifacts={...window.__packArtifacts,...artifacts};
 });
 await check('Vorschau, PNG und PDF zeichnen exakt dieselbe zIndex-Komposition',async()=>{
  const m=structuredClone(manifest);const d=m.layouts[0];
  d.typography.decorations.push({id:'pixel-probe',type:'rect',x:40,y:40,width:40,height:40,anchorX:0,anchorY:0,color:'#ff0000',zIndex:900});
  const config=resolvePackConfig(m,d.id,root),preview=document.createElement('canvas');await renderLabel(preview,input,{config});
  const blob=await canvasToPng(preview),image=await createImageBitmap(blob),decoded=document.createElement('canvas');decoded.width=config.width;decoded.height=config.height;decoded.getContext('2d').drawImage(image,0,0);image.close();
  const pixel=[...decoded.getContext('2d').getImageData(50,50,1,1).data];assert(pixel.join(',')==='255,0,0,255','Vordergrund nicht oben');
  const entries=[{id:'probe',data:input,packId:m.id,packVersion:m.version,layoutId:d.id,quantity:1,widthMm:60}];
  const configs=new Map([[`${m.id}@${m.version}:${d.id}`,config]]),layout=layoutSheets(entries,configs,{cropMarks:false});let used=false;
  const pdf=await generatePdf(layout,async(entry,c)=>{const canvas=document.createElement('canvas');await renderLabel(canvas,entry.data,{config:c});assert(canvas.toDataURL()===preview.toDataURL(),'PDF verwendet andere Komposition');used=true;return canvas;});
  assert(used&&(await PDFDocument.load(pdf)).getPageCount()===1,'PDF fehlt');
  config.typography.decorations.at(-1).zIndex=-1;const behind=document.createElement('canvas');await renderLabel(behind,input,{config});assert([...behind.getContext('2d').getImageData(50,50,1,1).data].join(',')!=='255,0,0,255','zIndex wird ignoriert');
 });
 await check('Beispiel-ZIP importiert zusätzliche Sprites und beide Schriftfamilien',async()=>{
  const files={};for(const path of [...manifestAssetPaths(manifest),'ASSET-LICENSE.txt','fonts/lora/OFL.txt','fonts/abel/OFL.txt'])files[path]=new Uint8Array(await (await fetch(new URL(path,root))).arrayBuffer());
  const zip=buildPackArchive(manifest,files),inspected=await inspectPackArchive(zip);assert(inspected.files['decorations/plaque.png'],'Sprite fehlt im ZIP');
  const store=new IndexedDBPackStore({dbName:'label-v3-composition-test-'+Date.now()}),manager=new TexturePackManager({importedStore:store});
  try{await manager.importPack(zip);const config=await manager.getConfig(manifest.id,'round-lid',manifest.version);const canvas=document.createElement('canvas');await renderLabel(canvas,input,{config});assert(canvas.width===512,'Importiertes Beispiel nicht gerendert');}finally{await store.remove(manifest.id,manifest.version);manager.dispose();store.close();}
 });
 await check('Altes lokal installiertes Pack und sein Warenkorbeintrag verursachen keinen Absturz',async()=>{
  const key='label-generator-v3-print-cart',original=localStorage.getItem(key),store=new IndexedDBPackStore(),id='old-typography-test',version='1.0.0';
  const old={...structuredClone(manifest),id,version,compatibilityVersion:1};
  const frame=document.createElement('iframe');frame.style.cssText='width:390px;height:600px';
  try{
   await store.put({manifest:old,files:{},contentHash:'1'.repeat(64),totalBytes:0,importedAt:Date.now()});
   localStorage.setItem(key,JSON.stringify({schemaVersion:2,entries:[{id:'old-entry',data:input,packId:id,packVersion:version,layoutId:'portrait',quantity:1,widthMm:60}]}));
   const loaded=new Promise(resolve=>frame.onload=resolve);frame.src='../index.html?old-test='+Date.now();document.body.append(frame);await loaded;
   const doc=frame.contentDocument;let ready=false;
   for(let i=0;i<400;i++){if(!doc.querySelector('#export').disabled&&doc.body.textContent.includes('aktualisieren')){ready=true;break;}await new Promise(resolve=>setTimeout(resolve,20));}
   assert(ready,'Altes Pack wurde nicht verständlich abgewiesen oder Vorschau blieb blockiert');
  }finally{frame.remove();await store.remove(id,version);store.close();if(original===null)localStorage.removeItem(key);else localStorage.setItem(key,original);}
 });
}
