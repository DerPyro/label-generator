// Reproducible, CC0 geometric PNG artwork. No external services are used.
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { deflateSync } from 'node:zlib';
import { validateManifest } from '../src/texturepacks.js';
const root=new URL('../examples/',import.meta.url);
function png(width,height,pixel){
 const raw=Buffer.alloc((width*4+1)*height);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++)raw.set(pixel(x,y),y*(width*4+1)+1+x*4);
 const chunk=(type,data)=>{
  const body=Buffer.concat([Buffer.from(type),data]);let crc=0xffffffff;
  for(const byte of body){crc^=byte;for(let bit=0;bit<8;bit++)crc=crc&1?0xedb88320^(crc>>>1):crc>>>1;}
  const out=Buffer.alloc(data.length+12);out.writeUInt32BE(data.length);body.copy(out,4);out.writeUInt32BE((crc^0xffffffff)>>>0,out.length-4);return out;
 };
 const header=Buffer.alloc(13);header.writeUInt32BE(width);header.writeUInt32BE(height,4);header[8]=8;header[9]=6;
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);
}
async function file(pack,path,data){const url=new URL(`${pack}/${path}`,root);await mkdir(new URL('./',url),{recursive:true});await writeFile(url,data);}
const clear=[0,0,0,0];
for(const pack of ['template','composition']){
 const large=pack==='composition',size=large?512:128;
 const fonts=[{family:'Lora',path:'fonts/lora/label-serif.ttf',weight:'400 700'}];
 for(const [from,to]of [['label-serif.ttf','label-serif.ttf'],['OFL.txt','OFL.txt']])await file(pack,`fonts/lora/${to}`,await readFile(new URL(`../texturepacks/woodland/fonts/${from}`,import.meta.url)));
 if(large){
  await mkdir(new URL('composition/fonts/abel/',root),{recursive:true});
  // Downloaded once from google/fonts; subsequent regeneration uses retained files.
  try{await rename(new URL('composition/fonts/Abel-Regular.ttf',root),new URL('composition/fonts/abel/Abel-Regular.ttf',root));await rename(new URL('composition/fonts/Abel-OFL.txt',root),new URL('composition/fonts/abel/OFL.txt',root));}catch(error){if(error.code!=='ENOENT')throw error;}
  await readFile(new URL('composition/fonts/abel/OFL.txt',root));
  fonts.push({family:'Abel',path:'fonts/abel/Abel-Regular.ttf',weight:'400'});
 }
 const layouts=[];
 for(const shape of large?['rectangle','circle']:['rectangle']){
  const id=shape==='circle'?'round-lid':'portrait',w=size,h=shape==='circle'?size:Math.round(size*1.5);
  const prefix=`layouts/${id}`;
  await file(pack,`${prefix}/base.png`,png(w,h,(x,y)=>{
   if(shape==='circle'&&Math.hypot(x-w/2,y-h/2)>w/2-2)return clear;
   const edge=x<5||x>w-6||y<5||y>h-6;return edge?[126,102,55,255]:[245,237,215,255];
  }));
  const layers={base:`${prefix}/base.png`};
  for(const layer of ['genetics','thc','cbd']){
   layers[layer]=[];
   for(let level=1;level<=7;level++){
    const path=`${prefix}/${layer}/${level}.png`;layers[layer].push(path);
    await file(pack,path,png(w,h,(x,y)=>{
     const nx=x/w,ny=y/h;
     if(layer==='genetics')return ny>.76&&ny<.9&&nx>.12&&nx<.88?[40+level*9,76+level*8,68,255]:clear;
     if(layer==='thc')return ny>.1&&ny<.13&&nx>.2&&nx<.2+level*.08?[118,142,163,190]:clear;
     return ny>.9&&ny<.93&&Math.abs(nx-.5)<level*.04?[159,128,58,220]:clear;
    }));
   }
  }
  const field={id:'strain-name',source:'name',font:'Lora',x:w/2,y:h*.43,fontSize:large?38:16,minFontSize:large?16:8,maxWidth:w*.8,maxLines:2,lineHeight:1.15,color:'#253e32',zIndex:500};
  const typography={fields:[field],decorations:[]};
  if(large){
   field.rotation=-4;
   field.background={id:'name-plaque',type:'sprite',asset:'decorations/plaque.png',relativeTo:field.id,x:0,y:0,width:450,height:110,zIndex:450};
   typography.fields.push({id:'producer',source:'producer',font:'Abel',x:w/2,y:h*.58,fontSize:26,minFontSize:14,maxWidth:400,color:'#253e32',zIndex:500});
   typography.fields.push({id:'harvest',source:'year',format:'year-full',prefix:'Ernte ',font:'Abel',x:w/2,y:h*.68,fontSize:24,color:'#253e32',zIndex:500});
   typography.fields.push({id:'thc-value',source:'thc',format:'percent',prefix:'THC: ',font:'Abel',x:w*.3,y:h*.82,fontSize:24,color:'#ffffff',zIndex:500});
   typography.fields.push({id:'cbd-value',source:'cbd',format:'percent',prefix:'CBD: ',font:'Abel',x:w*.7,y:h*.82,fontSize:24,color:'#ffffff',zIndex:500});
   typography.decorations.push({id:'foreground',type:'sprite',asset:'decorations/ornament.png',relativeTo:'strain-name',x:180,y:0,width:90,height:120,zIndex:600});
   if(shape==='circle')typography.fields.push({id:'round-title',source:'static',text:'BOTANICAL COLLECTION',font:'Lora',fontSize:22,minFontSize:12,color:'#735c31',path:{type:'arc',centerX:w/2,centerY:h/2,radius:205,startAngle:-150,endAngle:-30,direction:'clockwise'},letterSpacing:1,zIndex:500});
  }
  layouts.push({id,name:shape==='circle'?'Runder Deckel':'Hochformat',width:w,height:h,shape,layers,zIndex:{base:0,genetics:100,thc:200,cbd:300},typography});
 }
 if(large){
  await file(pack,'decorations/plaque.png',png(450,110,(x,y)=>{
   const edge=x<8||x>441||y<8||y>101;return edge?[173,140,65,230]:[255,251,236,245];
  }));
  await file(pack,'decorations/ornament.png',png(90,120,(x,y)=>{
   const a=(x-45)/38,b=(y-60)/55;return Math.abs(a)+Math.abs(b)<1?[174,140,61,210]:clear;
  }));
 }
 const manifest={id:large?'composition-demo':'starter-template',name:large?'Composition Demo':'Starter Template',description:large?'Zwei Schriften, Textplakette, Vordergrund, Rotation und Kreisbogen.':'Kleines gültiges Ausgangspack mit einem Textfeld.',author:'label-generator contributors',version:'1.0.0',compatibilityVersion:2,fonts,layouts};
 validateManifest(manifest);await file(pack,'pack.json',JSON.stringify(manifest,null,2)+'\n');
 await file(pack,'ASSET-LICENSE.txt','Geometric PNG artwork generated by scripts/create-example-packs.js: CC0-1.0.\nLora: SIL OFL 1.1, Copyright 2011 The Lora Project Authors. See fonts/lora/OFL.txt.\n'+(large?'Abel: SIL OFL 1.1, Copyright 2011 Matthew Desmond. See fonts/abel/OFL.txt. Source: https://github.com/google/fonts/tree/main/ofl/abel\n':''));
}
