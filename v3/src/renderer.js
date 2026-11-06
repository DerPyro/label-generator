import { CONFIG } from './config.js';
import { getRenderPlan } from './model.js';
import { layoutText, drawTextField, drawDecoration } from './typography.js';

const images=new Map(),fonts=new Map(),renderJobs=new WeakMap();
const assetUrl=(path,config)=>{
 const url=new URL(path,new URL('../',import.meta.url));
 if(url.protocol!=='blob:')url.searchParams.set('v',config.assetVersion);
 return url.href;
};

function loadImage(path,config,fullCanvas=true){
 const url=assetUrl(path,config),key=`${config.assetVersion}:${fullCanvas?`${config.width}x${config.height}`:'sprite'}:${url}`;
 if(!images.has(key)){
  const task=new Promise((resolve,reject)=>{
   const img=new Image();
   img.onload=()=>{
    if(!img.naturalWidth||!img.naturalHeight||img.naturalWidth>4096||img.naturalHeight>4096||fullCanvas&&(img.naturalWidth!==config.width||img.naturalHeight!==config.height))reject(Error(`${path}: Ungültige PNG-Abmessungen; Canvas-Layer benötigen ${config.width} × ${config.height} px.`));
    else resolve(img);
   };
   img.onerror=()=>reject(Error(`PNG-Layer konnte nicht geladen werden: ${path}`));img.src=url;
  });
  images.set(key,task);if(images.size>160)images.delete(images.keys().next().value);task.catch(()=>images.delete(key));
 }
 return images.get(key);
}

export function loadFonts(config){
 return Promise.all(config.fonts.map(font=>{
  const key=`${config.assetVersion}:${font.family}:${font.path}:${font.weight||'400 700'}`;
  const scopedFamily='Pack_'+Array.from(new TextEncoder().encode(key),byte=>byte.toString(16).padStart(2,'0')).join('');
  if(!fonts.has(key)){
   const task=(async()=>{
    try{
     const face=new FontFace(scopedFamily,`url("${assetUrl(font.path,config)}")`,{weight:font.weight||'400 700',style:'normal'});
     await face.load();document.fonts.add(face);await document.fonts.load(`400 32px "${scopedFamily}"`);return [font.family,scopedFamily];
    }catch{throw Error(`Etikettenschrift konnte nicht geladen werden: ${font.path}`);}
   })();fonts.set(key,task);task.catch(()=>fonts.delete(key));
  }
  return fonts.get(key);
 })).then(entries=>Object.fromEntries(entries));
}

function decorations(config){return [...config.typography.decorations,...config.typography.fields.flatMap(field=>field.background?[field.background]:[])];}
export async function preloadAssets(config=CONFIG){
 const paths=new Set([config.base.path,...['genetics','thc','cbd'].flatMap(id=>config[id].map(x=>x.path)),...(config.foreground?(Array.isArray(config.foreground)?config.foreground:[config.foreground]).map(x=>x.path):[]),...Object.values(config.masks||{})]);
 await Promise.all([loadFonts(config),...[...paths].map(path=>loadImage(path,config)),...decorations(config).filter(e=>e.asset).map(e=>loadImage(e.asset,config,false))]);
}

/** Invalidate pending preview work without affecting shared image downloads. */
export function cancelRender(canvas){renderJobs.set(canvas,(renderJobs.get(canvas)??0)+1);}

/** Preview, PNG and PDF all consume this exact sorted element list. */
export async function renderLabel(canvas,input,{config=CONFIG,visibility={}}={}){
 const job=(renderJobs.get(canvas)??0)+1;renderJobs.set(canvas,job);
 const plan=getRenderPlan(input,config);
 const [families,loaded,masks]=await Promise.all([
  loadFonts(config),
  Promise.all(plan.elements.map(element=>element.type==='layer'?Promise.all(element.sources.map(source=>loadImage(source.path,config))):element.type==='sprite'?loadImage(element.asset,config,false):null)),
  Promise.all(plan.elements.map(element=>config.masks?.[element.category]?loadImage(config.masks[element.category],config):null))
 ]);
 if(renderJobs.get(canvas)!==job)return {plan,textLayout:null,committed:false};
 const buffer=document.createElement('canvas');buffer.width=config.width;buffer.height=config.height;
 const ctx=buffer.getContext('2d');if(!ctx)throw Error('Canvas-Rendering ist in diesem Browser nicht verfügbar.');
 if(config.shape==='circle'){ctx.beginPath();ctx.arc(config.width/2,config.height/2,Math.min(config.width,config.height)/2,0,2*Math.PI);ctx.clip();}
 const mixed=document.createElement('canvas');mixed.width=config.width;mixed.height=config.height;
 const m=mixed.getContext('2d');if(!m)throw Error('Canvas-Rendering ist in diesem Browser nicht verfügbar.');
 const textLayout={};
 for(const [index,element] of plan.elements.entries()){
  if(visibility[element.category]===false||visibility[element.id]===false)continue;
  m.clearRect(0,0,mixed.width,mixed.height);m.globalCompositeOperation='source-over';m.globalAlpha=1;
  if(element.type==='layer')element.sources.forEach((source,i)=>{m.globalAlpha=source.weight;m.drawImage(loaded[index][i],0,0);});
  else if(element.type==='text'){
   const layout=layoutText(m,element,plan.input,families[element.font]);textLayout[element.id]=layout;
   drawTextField(m,element,layout,families[element.font]);
  }else drawDecoration(m,element,config.typography.fields,loaded[index]);
  m.globalAlpha=1;
  if(masks[index]){m.globalCompositeOperation='destination-in';m.drawImage(masks[index],0,0);m.globalCompositeOperation='source-over';}
  ctx.drawImage(mixed,0,0);
 }
 const committed=renderJobs.get(canvas)===job;
 if(committed){canvas.width=config.width;canvas.height=config.height;const target=canvas.getContext('2d');if(!target)throw Error('Canvas-Rendering ist nicht verfügbar.');target.drawImage(buffer,0,0);}
 return {plan,textLayout,committed};
}

export function canvasToPng(canvas){
 return new Promise((resolve,reject)=>{
  try{canvas.toBlob(blob=>blob?resolve(blob):reject(Error('PNG-Export ist fehlgeschlagen.')),'image/png');}
  catch{reject(Error('PNG-Export blockiert. Bitte v3 über einen lokalen Webserver oder GitHub Pages öffnen.'));}
 });
}
