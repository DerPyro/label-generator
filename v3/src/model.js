import { CONFIG, THRESHOLDS, LAYER_ORDER } from './config.js';

function number(value, label, min, max) {
  if ((typeof value === 'string' && !value.trim()) || value === null || value === undefined || typeof value === 'boolean') {
    throw new Error(`${label} fehlt.`);
  }
  const result = Number(value);
  if (!Number.isFinite(result) || result < min || result > max) {
    throw new Error(`${label} muss zwischen ${min} und ${max} liegen.`);
  }
  return result;
}

export function normalizeInput(input, config = CONFIG) {
  if (!input || typeof input !== 'object') throw new Error('Etikettenangaben fehlen.');
  const name = String(input.name ?? '').trim().replace(/\s+/gu, ' ');
  if (!name) throw new Error('Bitte einen Sortennamen eingeben.');
  if (name.length > 200) throw new Error('Der Sortenname darf höchstens 200 Zeichen enthalten.');
  const producer = String(input.producer ?? '').trim().replace(/\s+/gu, ' ');
  if (producer.length > 120) throw new Error('Der Seed-Produzent darf höchstens 120 Zeichen enthalten.');
  const year = number(input.year, 'Erntejahr', 1900, 9999);
  if (!Number.isInteger(year)) throw new Error('Das Erntejahr muss eine ganze Zahl sein.');
  const hasSativa = input.sativa !== undefined;
  const hasIndica = input.indica !== undefined;
  const sativa = hasSativa ? number(input.sativa, 'Sativa', 0, 100) : 100 - number(input.indica, 'Indica', 0, 100);
  const indica = hasIndica ? number(input.indica, 'Indica', 0, 100) : 100 - sativa;
  if (Math.abs(indica + sativa - 100) > 1e-8) throw new Error('Indica und Sativa müssen zusammen 100 % ergeben.');
  return { name, producer, year, indica, sativa, thc: number(input.thc, 'THC', 0, config.limits.thc), cbd: number(input.cbd, 'CBD', 0, config.limits.cbd) };
}


/** @returns {import('./types.d.ts').LayerLevel} */
export function getLayerLevel(value, layer, thresholds = THRESHOLDS) {
 const boundaries=thresholds[layer];
 if(!Array.isArray(boundaries)||boundaries.length!==7||boundaries.some((n,i)=>!Number.isFinite(n)||(i>0&&n<=boundaries[i-1]))) throw new Error(`Ungültige siebenstufige Grenzwerte für ${layer}.`);
 if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>boundaries[6]) throw new Error(`Ungültiger Wert für ${layer}.`);
 return boundaries.findIndex(max=>value<=max)+1;
}

export function selectLayers(input, config = CONFIG) {
 const model=normalizeInput(input,config);
 const result={base:{...config.base,id:'base',sources:[{path:config.base.path,weight:1}]}};
 for(const [id,value] of [['genetics',model.sativa],['thc',model.thc],['cbd',model.cbd]]) {
  const level=getLayerLevel(value,id,config.thresholds||THRESHOLDS);
  const sprites=config[id];
  if(!Array.isArray(sprites)||sprites.length!==7)throw new Error(`Für ${id} werden genau sieben Sprites benötigt.`);
  const sprite=sprites.find(x=>x.level===level)||sprites[level-1];
  if(!sprite?.path)throw new Error(`Sprite ${id}/${level} fehlt.`);
  result[id]={id,level,label:`${sprite.label||id} · Stufe ${level}/7`,path:sprite.path,assetPath:sprite.assetPath,sources:[{path:sprite.path,weight:1}],...(config.masks?.[id]?{mask:config.masks[id]}:{})};
 }
 if(config.masks?.base)result.base.mask=config.masks.base;
 return result;
}

export function getRenderPlan(input, config = CONFIG) {
 const model=normalizeInput(input,config);const selected=selectLayers(model,config);
 const order=config.layerOrder||LAYER_ORDER;
 if(order.length!==5||new Set(order).size!==5||order.some(id=>!LAYER_ORDER.includes(id)))throw new Error('Ungültige Layer-Reihenfolge.');
 return {input:model,assetVersion:config.assetVersion,packId:config.packId||config.id,packVersion:config.packVersion,layoutId:config.layoutId||config.format,width:config.width,height:config.height,levels:Object.fromEntries(['genetics','thc','cbd'].map(id=>[id,selected[id].level])),layers:order.map(id=>id==='text'?{id:'text',label:'Dynamischer Text',sources:[],...(config.masks?.text?{mask:config.masks.text}:{})}:selected[id])};
}
