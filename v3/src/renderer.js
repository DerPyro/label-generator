import { CONFIG } from './config.js';
import { getRenderPlan } from './model.js';

const images = new Map();
const fonts = new Map();
const renderJobs = new WeakMap();
const assetUrl = (path, config) => {
  const url = new URL(path, new URL('../', import.meta.url));
  if (url.protocol !== 'blob:') url.searchParams.set('v', config.assetVersion);
  return url.href;
};

function loadImage(path, config) {
  const url = assetUrl(path, config);
  const key = `${config.assetVersion}:${config.width}x${config.height}:${url}`;
  if (!images.has(key)) {
    const task = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth !== config.width || img.naturalHeight !== config.height) {
          reject(new Error(`${path}: Erwartet ${config.width} × ${config.height} px, erhalten ${img.naturalWidth} × ${img.naturalHeight} px.`));
        } else resolve(img);
      };
      img.onerror = () => reject(new Error(`PNG-Layer konnte nicht geladen werden: ${path}`));
      img.src = url;
    });
    images.set(key, task);
    if (images.size > 96) images.delete(images.keys().next().value);
    task.catch(() => images.delete(key));
  }
  return images.get(key);
}

function loadFont(config) {
  const { family, fontPath } = config.typography;
  const key = `${config.assetVersion}:${family}:${fontPath}`;
  const scopedFamily = `${family}_${[...key].reduce((hash,char)=>(Math.imul(hash,31)+char.charCodeAt(0))|0,0) >>> 0}`;
  if (!fonts.has(key)) {
    const task = (async () => {
      try {
        const font = new FontFace(scopedFamily, `url("${assetUrl(fontPath, config)}")`, { weight: config.typography.fontWeight || '400 700', style: 'normal' });
        await font.load();
        document.fonts.add(font);
        await document.fonts.load(`600 88px "${scopedFamily}"`);
        return scopedFamily;
      } catch {
        throw new Error(`Etikettenschrift konnte nicht geladen werden: ${fontPath}`);
      }
    })();
    fonts.set(key, task);
    task.catch(() => fonts.delete(key));
  }
  return fonts.get(key);
}

export async function preloadAssets(config = CONFIG) {
 const paths=new Set([config.base.path,...config.genetics.map(x=>x.path),...config.thc.map(x=>x.path),...config.cbd.map(x=>x.path),...Object.values(config.masks||{})]);
 await Promise.all([loadFont(config),...[...paths].map(path=>loadImage(path,config))]);
}

function wrapText(ctx, text, width) {
  const lines = [];
  let line = '';
  // Split overlong individual words by Unicode characters rather than clipping them.
  for (const word of text.split(' ')) {
    if (ctx.measureText(word).width > width) {
      if (line) { lines.push(line); line = ''; }
      let chunk = '';
      for (const char of word) {
        if (chunk && ctx.measureText(chunk + char).width > width) { lines.push(chunk); chunk = ''; }
        chunk += char;
      }
      line = chunk;
    } else if (line && ctx.measureText(`${line} ${word}`).width > width) {
      lines.push(line); line = word;
    } else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  return lines;
}

const formatPercent = value => `${Number(value.toFixed(2)).toString().replace('.', ',')} %`;

function drawText(ctx, input, config) {
  const type = config.typography;
  const area = type.name;
  let size = area.maxSize;
  let lines;
  do {
    ctx.font = `600 ${size}px "${type.family}"`;
    lines = wrapText(ctx, input.name, area.maxWidth);
    if (lines.length <= area.maxLines) break;
    size -= 1;
  } while (size >= area.minSize);
  if (lines.length > area.maxLines) throw new Error('Der Sortenname passt nicht in das Textfeld. Bitte kürzen.');

  // Readability backing belongs to dynamic typography, never to the PNG layers.
  ctx.fillStyle = type.panel;
  type.panels.forEach(panel => {
    ctx.beginPath();
    ctx.roundRect(panel.x, panel.y, panel.width, panel.height, panel.radius);
    ctx.fill();
  });
  ctx.fillStyle = type.ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `600 ${size}px "${type.family}"`;
  const startY = area.centerY - ((lines.length - 1) * size * area.lineHeight) / 2;
  lines.forEach((line, index) => ctx.fillText(line, area.centerX, startY + index * size * area.lineHeight));
  let producer = null;
  if (input.producer) {
    const style = type.producer;
    let fontSize = style.maxSize;
    ctx.font = `400 ${fontSize}px "${type.family}"`;
    while (fontSize > style.minSize && ctx.measureText(input.producer).width > style.maxWidth) {
      fontSize--;
      ctx.font = `400 ${fontSize}px "${type.family}"`;
    }
    const width = Math.min(style.maxWidth, ctx.measureText(input.producer).width);
    ctx.fillText(input.producer, style.x, style.y, style.maxWidth);
    producer = { text: input.producer, fontSize, y: style.y, maxWidth: style.maxWidth, width };
  }
  ctx.font = `400 ${type.year.size}px "${type.family}"`;
  ctx.fillText(`’${String(input.year).slice(-2)}`, type.year.x, type.year.y);
  ctx.font = `400 ${type.footer.size}px "${type.family}"`;
  ctx.fillText(`THC: ${formatPercent(input.thc)}  |  CBD: ${formatPercent(input.cbd)}`, type.footer.x, type.footer.y, type.footer.maxWidth);
  ctx.fillText(`Indica: ${formatPercent(input.indica)}  |  Sativa: ${formatPercent(input.sativa)}`, type.footer.x, type.footer.y + type.footer.gap, type.footer.maxWidth);
  return { lines, fontSize: size, producer };
}

/** Invalidate pending preview work without affecting shared image downloads. */
export function cancelRender(canvas){renderJobs.set(canvas,(renderJobs.get(canvas)??0)+1);}

export async function renderLabel(canvas, input, { config = CONFIG, visibility = {} } = {}) {
 const job=(renderJobs.get(canvas)??0)+1;renderJobs.set(canvas,job);
 const plan=getRenderPlan(input,config);
 const [loaded,masked,fontFamily]=await Promise.all([
  Promise.all(plan.layers.map(layer=>Promise.all(layer.sources.map(source=>loadImage(source.path,config))))),
  Promise.all(plan.layers.map(layer=>config.masks?.[layer.id]?loadImage(config.masks[layer.id],config):null)),
  loadFont(config)
 ]);
 if(renderJobs.get(canvas)!==job)return {plan,textLayout:null,committed:false};
 const drawConfig={...config,typography:{...config.typography,family:fontFamily}};
 const buffer=document.createElement('canvas');buffer.width=config.width;buffer.height=config.height;
 const ctx=buffer.getContext('2d');if(!ctx)throw new Error('Canvas-Rendering ist in diesem Browser nicht verfügbar.');
 if(config.shape==='circle'){ctx.beginPath();ctx.arc(config.width/2,config.height/2,Math.min(config.width,config.height)/2,0,2*Math.PI);ctx.clip();}
 const mixed=document.createElement('canvas');mixed.width=config.width;mixed.height=config.height;
 const mixedCtx=mixed.getContext('2d');if(!mixedCtx)throw new Error('Canvas-Rendering ist in diesem Browser nicht verfügbar.');
 let textLayout=null;
 plan.layers.forEach((layer,index)=>{
  if(visibility[layer.id]===false)return;
  mixedCtx.clearRect(0,0,mixed.width,mixed.height);mixedCtx.globalCompositeOperation='source-over';mixedCtx.globalAlpha=1;
  if(layer.id==='text'){textLayout=drawText(mixedCtx,plan.input,drawConfig);}
  else layer.sources.forEach((source,sourceIndex)=>{mixedCtx.globalAlpha=source.weight;mixedCtx.drawImage(loaded[index][sourceIndex],0,0);});
  mixedCtx.globalAlpha=1;
  if(masked[index]){mixedCtx.globalCompositeOperation='destination-in';mixedCtx.drawImage(masked[index],0,0);mixedCtx.globalCompositeOperation='source-over';}
  ctx.drawImage(mixed,0,0);
 });
 const committed=renderJobs.get(canvas)===job;
 if(committed){canvas.width=config.width;canvas.height=config.height;canvas.getContext('2d').drawImage(buffer,0,0);}
 return {plan,textLayout,committed};
}

export function canvasToPng(canvas) {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('PNG-Export ist fehlgeschlagen.')), 'image/png');
    } catch {
      reject(new Error('PNG-Export blockiert. Bitte v3 über einen lokalen Webserver oder GitHub Pages öffnen.'));
    }
  });
}

