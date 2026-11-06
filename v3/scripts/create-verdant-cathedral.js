// Build version 1.1 from the four original Imagegen masters. No upscaling.
// All glass, including the text area, follows genetics; ornaments are independent.
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {decodePng,encodeRgba} from './normalize-watercolor.js';
const root='v3/texturepacks/stained-glass-verdant-cathedral';
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const manifestOnly=process.argv.includes('--manifest-only');
async function png(path,w,h,pixels){
 if(manifestOnly)return;
 const bytes=encodeRgba({width:w,height:h,pixels});
 for(let attempt=0;;attempt++)try{await writeFile(`${root}/${path}`,bytes);break;}
 catch(error){if(attempt>=3||!['UNKNOWN','EBUSY','EPERM'].includes(error.code))throw error;await new Promise(resolve=>setTimeout(resolve,200));}
}
async function master(name){const file=`${root}/masters/${name}.png`,decoded=decodePng(await readFile(file));if(!manifestOnly)await writeFile(file,encodeRgba(decoded));return decoded;}
// Sample straight-alpha sources in premultiplied space to avoid dark matte edges.
function sample(image,x,y){
 const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,out=[0,0,0,0];
 for(const[dx,dy,weight]of [[0,0,(1-fx)*(1-fy)],[1,0,fx*(1-fy)],[0,1,(1-fx)*fy],[1,1,fx*fy]]){
  const px=clamp(ix+dx,0,image.width-1),py=clamp(iy+dy,0,image.height-1),i=(py*image.width+px)*4,a=image.pixels[i+3]/255;
  for(let c=0;c<3;c++)out[c]+=image.pixels[i+c]*a*weight;out[3]+=a*weight;
 }
 if(out[3])for(let c=0;c<3;c++)out[c]/=out[3];out[3]*=255;return out;
}
function trim(image,box=[0,0,image.width,image.height]){
 const[x0,y0,bw,bh]=box;let left=x0+bw,right=x0,top=y0+bh,bottom=y0;
 for(let y=y0;y<y0+bh;y++)for(let x=x0;x<x0+bw;x++)if(image.pixels[(y*image.width+x)*4+3]>24){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
 return [left,top,right-left+1,bottom-top+1];
}
function paste(target,w,h,image,box,cx,cy,width,maxHeight){
 const[bx,by,bw,bh]=box,scale=Math.min(width/bw,maxHeight/bh,1),dw=Math.round(bw*scale),dh=Math.round(bh*scale),left=Math.round(cx-dw/2),top=Math.round(cy-dh/2);
 for(let y=0;y<dh;y++)for(let x=0;x<dw;x++){
  const tx=left+x,ty=top+y;if(tx<0||tx>=w||ty<0||ty>=h)continue;
  const color=sample(image,bx+(x+.5)/scale-.5,by+(y+.5)/scale-.5),i=(ty*w+tx)*4,a=color[3]/255;
  if(color[3]<12)continue;
  const old=target[i+3]/255,total=a+old*(1-a);
  for(let c=0;c<3;c++)target[i+c]=Math.round((color[c]*a+target[i+c]*old*(1-a))/total);target[i+3]=Math.round(total*255);
 }
}
const astronomy=await master('astronomy-atlas'),flora=await master('floral-growth');
const cuts=[0,350,755,1145,1536];
const symbols=Array.from({length:8},(_,i)=>trim(astronomy,[cuts[i%4],i<4?0:512,cuts[i%4+1]-cuts[i%4],512]));
const flowerBox=trim(flora);
const manifest={id:'stained-glass-verdant-cathedral',name:'Stained Glass – Verdant Cathedral',description:'Das ganze Glas zeigt die Genetikfarbe. THC füllt oben einen astronomischen Himmel; CBD lässt unten ein florales Ornament wachsen.',author:'Label Generator contributors · OpenAI Imagegen original artwork',version:'1.1.0',compatibilityVersion:2,status:'illustrated',preview:'preview.png',fonts:[{family:'Lora',path:'fonts/lora/label-serif.ttf',weight:'400 700'}],layouts:[]};
await mkdir(`${root}/fonts/lora`,{recursive:true});
for(const name of ['label-serif.ttf','OFL.txt'])await copyFile(`v3/examples/composition/fonts/lora/${name}`,`${root}/fonts/lora/${name}`);
for(const id of ['classic-portrait','round-lid']){
 const image=await master(id),{width:w,height:h,pixels:original}=image,round=id==='round-lid',dir=`layouts/${id}`;
 if(w!==(round?1254:1024)||h!==(round?1254:1536))throw Error('Native masters must match the canvas.');
 for(const sub of ['genetics','thc','cbd'])await mkdir(`${root}/${dir}/${sub}`,{recursive:true});
 const n=w*h,alpha=new Uint8Array(n),metal=new Uint8Array(n),luminance=new Float32Array(n),seed=new Uint8Array(n);
 for(let p=0;p<n;p++){
  const i=p*4,x=p%w,y=Math.floor(p/w),l=(original[i]*.2126+original[i+1]*.7152+original[i+2]*.0722)/255;
  luminance[p]=l;alpha[p]=round?Math.round(Math.min(original[i+3],255*clamp(w/2-Math.hypot(x+.5-w/2,y+.5-h/2)))):original[i+3];
  seed[p]=l<.30?1:0;
 }
 // Capture silver highlights next to each dark came as part of the same frame.
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const p=y*w+x;let found=seed[p];
  for(let dy=-2;dy<=2&&!found;dy++)for(let dx=-2;dx<=2;dx++){const nx=x+dx,ny=y+dy;if(nx>=0&&nx<w&&ny>=0&&ny<h&&seed[ny*w+nx]){found=1;break;}}
  metal[p]=found?255:0;
 }
 const base=Buffer.alloc(n*4),foreground=Buffer.alloc(n*4);
 for(let p=0;p<n;p++)if(alpha[p]){const i=p*4;base[i]=21;base[i+1]=29;base[i+2]=36;base[i+3]=alpha[p];if(metal[p]){for(let c=0;c<3;c++)foreground[i+c]=original[i+c];foreground[i+3]=alpha[p];}}
 await png(`${dir}/base.png`,w,h,base);await png(`${dir}/foreground.png`,w,h,foreground);
 const palette=[[166,142,219],[127,176,222],[120,202,184],[231,195,107],[230,147,126]];
 for(let level=0;level<21;level++){
  const pixels=Buffer.alloc(n*4),t=level/5,segment=Math.min(3,Math.floor(t)),f=t-segment,color=palette[segment].map((v,c)=>v*(1-f)+palette[segment+1][c]*f);
  for(let p=0;p<n;p++)if(alpha[p]&&!metal[p]){const i=p*4,l=luminance[p],light=.58+.49*l;for(let c=0;c<3;c++)pixels[i+c]=Math.round(clamp(color[c]*light,0,255));pixels[i+3]=alpha[p];}
  await png(`${dir}/genetics/${level+1}.png`,w,h,pixels);
 }
 const placements=round?[
  [627,172,128,145],[627,372,132,132],[858,285,126,110],[396,285,108,108],
  [995,405,102,105],[259,405,106,112],[447,148,104,105],[807,148,115,65]
 ]:[
  [512,188,116,128],[512,360,150,150],[697,392,126,104],[327,392,108,108],
  [164,278,104,110],[860,278,110,116],[326,143,104,108],[698,143,126,65]
 ];
 const astral=Buffer.alloc(n*4);
 for(let level=0;level<9;level++){
  if(level){const[cx,cy,width,height]=placements[level-1];paste(astral,w,h,astronomy,symbols[level-1],cx,cy,width,height);}
  const pixels=Buffer.from(astral);
  for(let p=0;p<n;p++){const i=p*4;if(metal[p]||!alpha[p])pixels.fill(0,i,i+4);else pixels[i+3]=Math.round(pixels[i+3]*alpha[p]/255);}
  await png(`${dir}/thc/${level+1}.png`,w,h,pixels);
 }
 const fullFlower=Buffer.alloc(n*4);
 const flowerCenter=round?{x:627,y:1071,w:680,h:250}:{x:512,y:1348,w:642,h:290};
 paste(fullFlower,w,h,flora,flowerBox,flowerCenter.x,flowerCenter.y,flowerCenter.w,flowerCenter.h);
 if(round)for(const x of [350,904])paste(fullFlower,w,h,flora,flowerBox,x,1027,240,190);
 // Propagate from the root along the actual plant silhouette. Geodesic growth
 // follows the stems and leaves rather than revealing a horizontally sliced image.
 const top=round?940:Math.round(flowerCenter.y-flowerCenter.h/2),bottom=Math.round(flowerCenter.y+flowerCenter.h/2);
 const graph=new Uint8Array(n),distance=new Int32Array(n).fill(-1),queue=new Int32Array(n);
 const roots=(round?[627,350,904]:[512]).map(x=>({x,pixel:-1,score:Infinity}));
 for(let y=Math.max(3,top-3);y<Math.min(h-3,bottom+3);y++)for(let x=round?210:Math.max(3,Math.floor(flowerCenter.x-flowerCenter.w/2)-3);x<(round?1044:Math.min(w-3,Math.ceil(flowerCenter.x+flowerCenter.w/2)+3));x++){
  const p=y*w+x;if(!fullFlower[p*4+3])continue;
  for(const root of roots)if(Math.abs(x-root.x)<16){const score=Math.abs(x-root.x)+(bottom-y)*2;if(score<root.score){root.score=score;root.pixel=p;}}
  for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++)if(dx*dx+dy*dy<=9)graph[p+dy*w+dx]=1;
 }
 let head=0,tail=0,maxDistance=0;for(const root of roots)if(root.pixel>=0){queue[tail++]=root.pixel;distance[root.pixel]=0;}
 while(head<tail){const p=queue[head++],x=p%w,y=Math.floor(p/w),next=distance[p]+1;
  for(const[dx,dy]of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]]){const nx=x+dx,ny=y+dy,q=ny*w+nx;if(nx>=0&&nx<w&&ny>=0&&ny<h&&graph[q]&&distance[q]<0){distance[q]=next;maxDistance=Math.max(maxDistance,next);queue[tail++]=q;}}
 }
 for(let level=1;level<=7;level++){
  const pixels=Buffer.alloc(n*4),threshold=maxDistance*[.12,.28,.44,.60,.74,.88,1][level-1];
  for(let p=0;p<n;p++){
   const i=p*4;if(metal[p]||!alpha[p]||!fullFlower[i+3]||(level<7&&(distance[p]<0||distance[p]>threshold)))continue;
   fullFlower.copy(pixels,i,i,i+3);pixels[i+3]=Math.round(fullFlower[i+3]*alpha[p]/255);
  }
  await png(`${dir}/cbd/${level}.png`,w,h,pixels);
 }
 const field=(source,x,y,size,width,extra={})=>({id:source==='name'?'strain-name':`${source}-value`,source,font:'Lora',x,y,fontSize:size,minFontSize:Math.min(size,30),maxWidth:width,maxLines:1,align:'center',verticalAlign:'middle',fontWeight:600,color:'#10252c',zIndex:500,...extra});
 const fields=round?[
  field('name',627,536,68,550,{minFontSize:18,maxLines:8,maxHeight:145,lineHeight:1.04}),
  field('producer',627,648,29,540,{minFontSize:13,maxLines:4,maxHeight:62,fontWeight:400,lineHeight:1.05}),
  field('year',627,707,29,500,{format:'year-full',prefix:'Ernte ',fontWeight:400}),
  field('thc',492,792,49,238,{format:'percent'}),field('cbd',762,792,49,238,{format:'percent'}),
  field('indica',506,884,40,220,{format:'percent'}),field('sativa',748,884,40,220,{format:'percent'})
 ]:[
  field('name',512,650,78,560,{minFontSize:18,maxLines:8,maxHeight:180,lineHeight:1.04}),
  field('producer',512,807,34,545,{minFontSize:14,maxLines:4,maxHeight:80,fontWeight:400,lineHeight:1.05}),
  field('year',512,887,31,500,{format:'year-full',prefix:'Ernte ',fontWeight:400}),
  field('thc',366,996,57,265,{format:'percent'}),field('cbd',658,996,57,265,{format:'percent'}),
  field('indica',366,1104,46,265,{format:'percent'}),field('sativa',658,1104,46,265,{format:'percent'})
 ];
 for(const[key,text,y]of [['thc','THC',round?745:942],['cbd','CBD',round?745:942],['indica','INDICA',round?845:1056],['sativa','SATIVA',round?845:1056]]){
  const value=fields.find(f=>f.source===key);fields.push({...field('static',value.x,y,round?21:24,240),id:`caption-${key}`,text,letterSpacing:2,minFontSize:round?21:24});
 }
 const scale=(category,bounds)=>[...bounds.map((below,i)=>({below,asset:`${dir}/${category}/${i+1}.png`})),{asset:`${dir}/${category}/${bounds.length+1}.png`}];
 manifest.layouts.push({id,name:round?'Astronomische Fensterrosette':'Botanisches Himmelsfenster',width:w,height:h,shape:round?'circle':'rectangle',bleedMm:0,preview:`${id}-preview.png`,layers:{base:`${dir}/base.png`,genetics:scale('genetics',Array.from({length:20},(_,i)=>(i+1)*5)),thc:scale('thc',[5,10,15,20,25,30,35,40]),cbd:scale('cbd',[2,5,8,11,14,17]),foreground:`${dir}/foreground.png`},zIndex:{base:0,genetics:100,thc:200,cbd:300,foreground:400},typography:{fields,decorations:[]}});
 console.log(`${id}: full-glass genetics, eight cumulative astronomical motifs, seven bottom-up floral states.`);
}
await writeFile(`${root}/pack.json`,JSON.stringify(manifest,null,2)+'\n');
