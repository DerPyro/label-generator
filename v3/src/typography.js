/** Safe, locale-stable value formatting. No expressions or HTML are evaluated. */
export function formatField(field,input) {
 const value=field.source==='static'?field.text:input[field.source];
 if(value===undefined||value===null||value==='')return '';
 let text;
 switch(field.format||'raw'){
  case 'percent': text=`${Number(Number(value).toFixed(2)).toString().replace('.',',')} %`;break;
  case 'year-full': text=String(value);break;
  case 'year-short': text=String(value).slice(-2);break;
  default:text=String(value);
 }
 return `${field.prefix||''}${text}${field.suffix||''}`;
}

export function elementTransform(element,fields) {
 const parent=element.relativeTo?fields.find(field=>field.id===element.relativeTo):null;
 if(element.relativeTo&&!parent)throw Error(`Ungültige Textreferenz: ${element.relativeTo}`);
 const rotation=(parent?.rotation||0)*Math.PI/180;
 return {x:(parent?.x??parent?.path?.centerX??0)+(element.x||0)*Math.cos(rotation)-(element.y||0)*Math.sin(rotation),
  y:(parent?.y??parent?.path?.centerY??0)+(element.x||0)*Math.sin(rotation)+(element.y||0)*Math.cos(rotation),rotation:(element.rotation||0)+(parent?.rotation||0)};
}

// Use the same advances for measurement and drawing, including kerning-free
// individually drawn glyphs and negative spacing that can reverse the pen.
function glyphRun(ctx,text,spacing){
 let cursor=0,left=0,right=0;
 const glyphs=[...text].map(char=>{
  const width=ctx.measureText(char).width,x=cursor;
  left=Math.min(left,x);right=Math.max(right,x+width);cursor+=width+spacing;
  return {char,x,width};
 });
 return {glyphs,left,width:right-left};
}
const measure=(ctx,text,spacing)=>spacing?glyphRun(ctx,text,spacing).width:ctx.measureText(text).width;
function wrap(ctx,text,width,spacing,enabled) {
 if(!enabled)return text.split('\n');
 const lines=[];
 for(const paragraph of text.split('\n')){
  let line='';
  for(const word of paragraph.split(' ')){
   if(line&&measure(ctx,`${line} ${word}`,spacing)>width){lines.push(line);line='';}
   if(measure(ctx,word,spacing)>width){
    for(const char of word){if(line&&measure(ctx,line+char,spacing)>width){lines.push(line);line='';}line+=char;}
   }else line+=(line?' ':'')+word;
  }
  lines.push(line);
 }
 return lines;
}

/** Clockwise angles increase from +X, in the canvas's downward Y coordinate system. */
export function arcSweep(path) {
 const sign=path.direction==='clockwise'?1:-1;
 const delta=((sign*(path.endAngle-path.startAngle))%360+360)%360;
 return {sign,radians:(delta||360)*Math.PI/180};
}

export function layoutText(ctx,field,input,family=field.font) {
 const text=formatField(field,input),spacing=field.letterSpacing||0;
 if(!text)return {text:'',lines:[],fontSize:field.fontSize,width:0,height:0};
 if(field.path&&/[\r\n]/.test(text))throw Error(`Textfeld „${field.id}“: Kreisbogen-Text darf keine Zeilenumbrüche enthalten.`);
 let size=Math.min(field.fontSize,field.maxFontSize??field.fontSize);
 const min=field.minFontSize??size;
 const width=field.path?arcSweep(field.path).radians*field.path.radius:(field.maxWidth??8192);
 let lines,span,height;
 while(size>=min){
  ctx.font=`${field.fontWeight||400} ${size}px "${family}"`;
  lines=field.path?[text]:wrap(ctx,text,width,spacing,field.wrap!==false);
  span=field.path?glyphRun(ctx,text,spacing).width:Math.max(0,...lines.map(line=>measure(ctx,line,spacing)));
  height=size+(lines.length-1)*size*(field.lineHeight||1.2);
  if(span<=width+.001&&lines.length<=(field.maxLines||1)&&height<=(field.maxHeight??Infinity))break;
  if(size===min)throw Error(`Textfeld „${field.id}“ ist zu klein. Text kürzen oder Layout anpassen.`);
  size=Math.max(min,size-1);
 }
 return {text,lines,fontSize:size,width:span,height};
}

function shadow(ctx,value){if(value){ctx.shadowColor=value.color;ctx.shadowBlur=value.blur||0;ctx.shadowOffsetX=value.offsetX||0;ctx.shadowOffsetY=value.offsetY||0;}}

export function drawTextField(ctx,field,layout,family=field.font) {
 if(!layout.text)return;
 ctx.save();
 try{
  ctx.globalAlpha=field.opacity??1;
  ctx.fillStyle=field.color;ctx.font=`${field.fontWeight||400} ${layout.fontSize}px "${family}"`;
  ctx.textAlign=field.align||'center';ctx.textBaseline='middle';shadow(ctx,field.shadow);
  const spacing=field.letterSpacing||0;
  if(field.path){
   const p=field.path,{sign,radians}=arcSweep(p);
   ctx.textBaseline=field.verticalAlign==='top'?'top':field.verticalAlign==='bottom'?'bottom':'middle';
   ctx.translate(p.centerX,p.centerY);ctx.rotate((field.rotation||0)*Math.PI/180);
   const run=glyphRun(ctx,layout.text,spacing);
   const offset=(field.align==='left'?0:field.align==='right'?1:.5)*(radians-layout.width/p.radius);
   ctx.textAlign='center';
   run.glyphs.forEach(({char,x,width})=>{
    const angle=p.startAngle*Math.PI/180+sign*(offset+(x-run.left+width/2)/p.radius);
    ctx.save();ctx.translate(Math.cos(angle)*p.radius,Math.sin(angle)*p.radius);ctx.rotate(angle+sign*Math.PI/2);
    ctx.fillText(char,0,0);ctx.restore();
   });
  }else{
   ctx.translate(field.x,field.y);ctx.rotate((field.rotation||0)*Math.PI/180);
   const lineHeight=layout.fontSize*(field.lineHeight||1.2);
   const first=field.verticalAlign==='top'?layout.fontSize/2:field.verticalAlign==='bottom'?-layout.height+layout.fontSize/2:-(layout.lines.length-1)*lineHeight/2;
   layout.lines.forEach((line,index)=>{
    if(!spacing){ctx.fillText(line,0,first+index*lineHeight);return;}
    const run=glyphRun(ctx,line,spacing),full=run.width;
    const start=(ctx.textAlign==='left'?0:ctx.textAlign==='right'?-full:-full/2)-run.left;
    const align=ctx.textAlign;ctx.textAlign='left';
    for(const {char,x} of run.glyphs)ctx.fillText(char,start+x,first+index*lineHeight);
    ctx.textAlign=align;
   });
  }
 }finally{ctx.restore();}
}

export function drawDecoration(ctx,element,fields,image){
 const t=elementTransform(element,fields),scale=element.scale??1;
 ctx.save();
 try{
  ctx.translate(t.x,t.y);ctx.rotate(t.rotation*Math.PI/180);ctx.scale(scale,scale);ctx.globalAlpha=element.opacity??1;shadow(ctx,element.shadow);
  const padding=element.padding||0,w=element.width+2*padding,h=element.height+2*padding;
  const x=-element.width*(element.anchorX??.5)-padding,y=-element.height*(element.anchorY??.5)-padding;
  if(element.type==='sprite'){ctx.drawImage(image,x,y,w,h);return;}
  ctx.beginPath();ctx.roundRect(x,y,w,h,Math.min(element.radius||0,w/2,h/2));
  ctx.fillStyle=element.color;ctx.fill();
  if(element.border){ctx.strokeStyle=element.border.color;ctx.lineWidth=element.border.width;ctx.stroke();}
 }finally{ctx.restore();}
}
