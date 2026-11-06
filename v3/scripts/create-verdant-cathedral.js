// Deterministic full-resolution separation of the two original Imagegen masters.
// Run from the repository root. Losslessly normalized masters travel in the ZIP.
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {decodePng,encodeRgba} from './normalize-watercolor.js';

const root='v3/texturepacks/stained-glass-verdant-cathedral';
const source=root+'/masters';
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t);};
function hsv(r,g,b){r/=255;g/=255;b/=255;const v=Math.max(r,g,b),m=Math.min(r,g,b),d=v-m;let h=0;if(d)h=v===r?(g-b)/d+(g<b?6:0):v===g?(b-r)/d+2:(r-g)/d+4;return [h/6,v?d/v:0,v];}
function rgb(h,s,v){h=(h%1+1)%1;const k=n=>(n+h*6)%6;return [5,3,1].map(n=>255*v*(1-s*Math.max(0,Math.min(k(n),4-k(n),1))));}
async function png(path,width,height,pixels){await writeFile(root+'/'+path,encodeRgba({width,height,pixels}));}
const manifest={id:'stained-glass-verdant-cathedral',name:'Stained Glass – Verdant Cathedral',description:'Gotisches Bleiglas und botanischer Jugendstil: 21 Glasfarben, neun Lichtstufen und sieben kumulative Pflanzenornamente.',author:'Label Generator contributors · OpenAI Imagegen original artwork',version:'1.0.0',compatibilityVersion:2,status:'illustrated',preview:'preview.png',fonts:[{family:'Lora',path:'fonts/lora/label-serif.ttf',weight:'400 700'},{family:'Abel',path:'fonts/abel/Abel-Regular.ttf',weight:'400'}],layouts:[]};
for(const family of ['lora','abel']){
 await mkdir(`${root}/fonts/${family}`,{recursive:true});
 for(const filename of [family==='lora'?'label-serif.ttf':'Abel-Regular.ttf','OFL.txt'])await copyFile(`v3/examples/composition/fonts/${family}/${filename}`,`${root}/fonts/${family}/${filename}`);
}
for(const id of ['classic-portrait','round-lid']){
 const {width:w,height:h,pixels:master}=decodePng(await readFile(`${source}/${id}.png`));
 const round=id==='round-lid';
 if(w!==(round?1254:1024)||h!==(round?1254:1536))throw Error('Master must have exact native dimensions; no upscaling.');
 const dir=`layouts/${id}`;
 for(const sub of ['genetics','thc','cbd'])await mkdir(`${root}/${dir}/${sub}`,{recursive:true});
 const count=w*h,alpha=new Uint8Array(count),center=new Uint8Array(count),metal=new Uint8Array(count),plant=new Uint8Array(count),stage=new Uint8Array(count),hues=new Float32Array(count),sats=new Float32Array(count),values=new Float32Array(count);
 const base=Buffer.alloc(count*4),foreground=Buffer.alloc(count*4),plaque=Buffer.alloc(count*4);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const p=y*w+x,i=p*4,r=master[i],g=master[i+1],b=master[i+2];
  const [hu,sa,va]=hsv(r,g,b);hues[p]=hu;sats[p]=sa;values[p]=va;
  const distance=Math.hypot(x+.5-w/2,y+.5-h/2);
  alpha[p]=round?Math.round(Math.min(master[i+3],255*clamp(w/2-distance))):master[i+3];
  // The opal lancet is detected from the master, not redrawn over its boundary.
  const inCenter=round?(distance<310||(distance<337&&r>140&&g>140&&b>120&&sa<.32)):(x>215&&x<805&&y>320&&y<1300&&r>140&&g>140&&b>120&&sa<.3);
  center[p]=inCenter?255:0;
  const isMetal=!inCenter&&(va<.44||(hu>.055&&hu<.17&&r>g*1.05));
  metal[p]=isMetal?255:0;
  // Green foliage and pale flowers occupy the existing botanical glass cells.
  const botanicalZone=round?(distance>335&&distance<575):((x<205||x>820||y>1320)&&x>25&&x<w-25&&y>25&&y<h-25);
  plant[p]=botanicalZone&&!inCenter&&!isMetal&&((hu>.15&&hu<.32&&sa>.25)||(sa<.38&&va>.62))?255:0;
  if(alpha[p]){
   for(let c=0;c<3;c++){base[i+c]=inCenter?master[i+c]:Math.round(master[i+c]*.44);foreground[i+c]=master[i+c];plaque[i+c]=master[i+c];}
   base[i+3]=alpha[p];foreground[i+3]=isMetal?alpha[p]:0;plaque[i+3]=inCenter?Math.round(alpha[p]*.9):0;
  }
 }
 // Include the veins, stamens and highlights inside a botanical piece. A hard
 // per-pixel hue selection alone leaves colored pinholes in the pale flowers.
 const seed=plant.slice();
 for(let y=5;y<h-5;y++)for(let x=5;x<w-5;x++){
  const p=y*w+x;if(seed[p]||metal[p]||center[p]||!alpha[p])continue;
  let nearby=false;
  for(let dy=-5;dy<=5&&!nearby;dy++)for(let dx=-5;dx<=5;dx++)if(dx*dx+dy*dy<=25&&seed[p+dy*w+dx]){nearby=true;break;}
  if(nearby)plant[p]=255;
 }
 // Connected pieces are revealed whole; already revealed pixels never move or fade.
 const seen=new Uint8Array(count),queue=new Int32Array(count);
 for(let start=0;start<count;start++)if(plant[start]&&!seen[start]){
  let head=0,tail=1,sumX=0,sumY=0,sumS=0;queue[0]=start;seen[start]=1;
  while(head<tail){const p=queue[head++],x=p%w,y=Math.floor(p/w);sumX+=x;sumY+=y;sumS+=sats[p];
   for(const [dx,dy]of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]]){const nx=x+dx,ny=y+dy,q=ny*w+nx;if(nx>=0&&nx<w&&ny>=0&&ny<h&&plant[q]&&!seen[q]){seen[q]=1;queue[tail++]=q;}}
  }
  const x=sumX/tail,y=sumY/tail;
  let level=round?1+Math.floor(clamp(Math.abs(Math.atan2(y-h/2,x-w/2))/Math.PI)*5.99):1+Math.floor(clamp(y/h)*5.99);
  if(sumS/tail<.38)level=Math.max(3,level); // blossoms follow the first leaves
  if(tail<18)level=7;
  for(let q=0;q<tail;q++)stage[queue[q]]=level;
 }
 await png(`${dir}/base.png`,w,h,base);await png(`${dir}/foreground.png`,w,h,foreground);
 await png(`${dir}/opal-medallion.png`,w,h,plaque);
 const stops=[.73,.59,.46,.24,.035];
 for(let level=0;level<21;level++){
  const pixels=Buffer.alloc(count*4),t=level/20,segment=Math.min(3,Math.floor(t*4)),f=t*4-segment;
  const hue=stops[segment]*(1-f)+stops[segment+1]*f;
  for(let p=0;p<count;p++){
   if(!alpha[p]||center[p]||metal[p])continue;
   const i=p*4;
   // Preserve the master's individual pane variation, ripples and thickness.
   const offset=(hues[p]-.46)*.32;
   const col=rgb(hue+offset,clamp(sats[p]*.65+.26,.36,.92),clamp(values[p]*.83+.035));
   for(let c=0;c<3;c++)pixels[i+c]=Math.round(col[c]);pixels[i+3]=alpha[p];
  }
  await png(`${dir}/genetics/${level+1}.png`,w,h,pixels);
 }
 for(let level=0;level<9;level++){
  const pixels=Buffer.alloc(count*4);
  for(let p=0;p<count;p++){
   if(!alpha[p]||center[p]||metal[p])continue;
   const i=p*4,x=p%w,y=Math.floor(p/w);
   const beam=.35+.65*Math.exp(-(((x/w-.5)/.45)**2+((y/h-.25)/.7)**2));
   const reflection=smooth(.48,.96,values[p]);
   pixels[i]=255;pixels[i+1]=249;pixels[i+2]=228;
   pixels[i+3]=Math.round((3+level*5.3)*reflection*beam*alpha[p]/255);
  }
  await png(`${dir}/thc/${level+1}.png`,w,h,pixels);
 }
 for(let level=1;level<=7;level++){
  const pixels=Buffer.alloc(count*4);
  for(let p=0;p<count;p++)if(stage[p]&&stage[p]<=level&&alpha[p]){const i=p*4;master.copy(pixels,i,i,i+3);pixels[i+3]=alpha[p];}
  await png(`${dir}/cbd/${level}.png`,w,h,pixels);
 }
 const scale=(category,bounds)=>[...bounds.map((below,i)=>({below,asset:`${dir}/${category}/${i+1}.png`})),{asset:`${dir}/${category}/${bounds.length+1}.png`}];
 const field=(source,x,y,size,width,extra={})=>({id:source==='name'?'strain-name':['thc','cbd'].includes(source)?source+'-value':source,source,font:'Lora',x,y,fontSize:size,minFontSize:Math.min(size,28),maxWidth:width,maxLines:1,align:'center',verticalAlign:'middle',color:'#193b36',zIndex:500,...extra});
 const fields=round?[
  field('name',627,510,66,480,{minFontSize:18,maxLines:8,maxHeight:160,lineHeight:1.05,fontWeight:600}),
  field('producer',627,638,30,525,{minFontSize:14,maxLines:4,maxHeight:62,lineHeight:1.05}),
  field('year',627,709,32,500,{format:'year-full',prefix:'Ernte '}),
  field('thc',492,780,32,246,{font:'Abel',format:'percent',prefix:'THC  '}),field('cbd',762,780,32,246,{font:'Abel',format:'percent',prefix:'CBD  '}),
  field('indica',509,822,29,230,{font:'Abel',format:'percent',prefix:'Indica  '}),field('sativa',745,822,29,230,{font:'Abel',format:'percent',prefix:'Sativa  '})
 ]:[
  field('name',512,680,72,530,{minFontSize:18,maxLines:8,maxHeight:210,lineHeight:1.05,fontWeight:600}),
  field('producer',512,865,32,520,{minFontSize:14,maxLines:4,maxHeight:85,lineHeight:1.1}),
  field('year',512,964,35,490,{format:'year-full',prefix:'Ernte '}),
  field('thc',375,1064,36,250,{font:'Abel',format:'percent',prefix:'THC  '}),field('cbd',649,1064,36,250,{font:'Abel',format:'percent',prefix:'CBD  '}),
  field('indica',375,1140,32,250,{font:'Abel',format:'percent',prefix:'Indica  '}),field('sativa',649,1140,32,250,{font:'Abel',format:'percent',prefix:'Sativa  '})
 ];
 manifest.layouts.push({id,name:round?'Botanische Fensterrosette':'Gotisches Spitzbogenfenster',width:w,height:h,shape:round?'circle':'rectangle',bleedMm:0,preview:`${id}-preview.png`,layers:{base:`${dir}/base.png`,genetics:scale('genetics',Array.from({length:20},(_,i)=>(i+1)*5)),thc:scale('thc',[5,10,15,20,25,30,35,40]),cbd:scale('cbd',[2,5,8,11,14,17]),foreground:`${dir}/foreground.png`},zIndex:{base:0,genetics:100,thc:200,cbd:300,foreground:400},typography:{fields,decorations:[{id:'opal-text-medallion',type:'sprite',asset:`${dir}/opal-medallion.png`,x:w/2,y:h/2,width:w,height:h,zIndex:450}]}});
 console.log(`${id}: ${w} × ${h}; 39 layers + opal plaque`);
}
await writeFile(`${root}/pack.json`,JSON.stringify(manifest,null,2)+'\n');
console.log('Manifest and local OFL fonts written. Generate previews with tests/verdant-cathedral.html.');

