import { LIMITS, THRESHOLDS, LAYER_ORDER, LAYER_LABELS } from './config.js';
import { IndexedDBPackStore } from './pack-store.js';
import { inspectPackArchive, buildPackArchive } from './pack-archive.js';
import { preloadAssets, renderLabel } from './renderer.js';

const layoutIdPattern = /^[a-z][a-z0-9-]{0,63}$/;
const legacyNames = { rectangular: 'Klassisches Hochformat', circular: 'Runder Deckel' };
const fail = message => { throw new Error(`Texturepack: ${message}`); };
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const finite = (value, min, max) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
const versionPattern = /^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/;

/** Only plain pack-relative file paths are accepted; no network or parent paths. */
export function validateAssetPath(path, extension = null) {
  if (typeof path !== 'string' || !path || !/^[a-zA-Z0-9_./-]+$/.test(path) || path.startsWith('/') ||
    path.split('/').some(segment => !segment || segment === '.' || segment === '..') ||
    (extension && !new RegExp(`\\.${extension}$`, 'i').test(path))) fail(`Ungültiger Asset-Pfad: ${String(path)}`);
  return path;
}

function validateOrder(order) {
  if (!Array.isArray(order) || order.length !== 5 || new Set(order).size !== 5 || order.some(id => !LAYER_ORDER.includes(id))) fail('Layer-Reihenfolge muss base, genetics, thc, cbd und text genau einmal enthalten.');
}

function validateTypography(type, width, height, fonts) {
  if (!object(type) || typeof type.family !== 'string' || !fonts.some(font => font.family === type.family)) fail('Die Textschrift muss in fonts registriert sein.');
  for (const key of ['ink', 'panel']) {
    if (typeof type[key] !== 'string' || !/^(#[0-9a-fA-F]{3,8}|rgba?\([\d.,%\s]+\)|hsla?\([\d.,%\s]+\)|black|white|transparent)$/.test(type[key])) fail(`Ungültige Textfarbe ${key}.`);
  }
  if (!Array.isArray(type.panels) || type.panels.length > 12) fail('Textflächen fehlen oder sind ungültig.');
  for (const panel of type.panels) {
    if (!object(panel) || !finite(panel.x, 0, width) || !finite(panel.y, 0, height) || !finite(panel.width, 1, width) || !finite(panel.height, 1, height) || panel.x + panel.width > width || panel.y + panel.height > height || !finite(panel.radius, 0, Math.min(panel.width, panel.height) / 2)) fail('Eine Textfläche liegt außerhalb des Canvas.');
  }
  const name = type.name;
  if (!object(name) || !finite(name.centerX, 0, width) || !finite(name.centerY, 0, height) || !finite(name.maxWidth, 1, width) || !Number.isInteger(name.maxLines) || !finite(name.maxLines, 1, 4) || !finite(name.minSize, 8, 200) || !finite(name.maxSize, name.minSize, 250) || !finite(name.lineHeight, 1, 2)) fail('Ungültiges Layout für Sortennamen.');
  const producer = type.producer;
  if (!object(producer) || !finite(producer.x, 0, width) || !finite(producer.y, 0, height) || !finite(producer.maxWidth, 1, width) || !finite(producer.minSize, 8, 200) || !finite(producer.maxSize, producer.minSize, 250)) fail('Ungültiges Produzentenlayout.');
  const year = type.year;
  if (!object(year) || !finite(year.x, 0, width) || !finite(year.y, 0, height) || !finite(year.size, 8, 200)) fail('Ungültiges Jahreslayout.');
  const footer = type.footer;
  if (!object(footer) || !finite(footer.x, 0, width) || !finite(footer.y, 0, height) || !finite(footer.gap, 1, 200) || footer.y + footer.gap > height || !finite(footer.size, 8, 150) || !finite(footer.maxWidth, 1, width)) fail('Ungültiges Fußzeilenlayout.');
}

/** @param {unknown} manifest @returns {import('./types.d.ts').TexturePackManifest} */
export function validateManifest(manifest) {
  if (!object(manifest)) fail('Manifest muss ein JSON-Objekt sein.');
  if (typeof manifest.id !== 'string' || !/^[a-z][a-z0-9-]{0,63}$/.test(manifest.id)) fail('Ungültige ID.');
  for (const field of ['name', 'description', 'author']) if (typeof manifest[field] !== 'string' || !manifest[field].trim() || manifest[field].length > 1000) fail(`${field} fehlt oder ist ungültig.`);
  if (typeof manifest.version !== 'string' || !versionPattern.test(manifest.version)) fail('Version muss die Form 1.0.0 besitzen.');
  if (manifest.compatibilityVersion !== 1) fail('Inkompatible Manifest-Version. Unterstützt wird Version 1.');
  if (manifest.status !== undefined && !['placeholder', 'illustrated'].includes(manifest.status)) fail('Ungültiger Asset-Status.');
  if (manifest.preview !== undefined) validateAssetPath(manifest.preview, 'png');
  if (!Array.isArray(manifest.fonts) || !manifest.fonts.length || manifest.fonts.length > 8) fail('Mindestens eine lokale Schrift ist erforderlich.');
  const families = new Set();
  for (const font of manifest.fonts) {
    if (!object(font) || typeof font.family !== 'string' || !/^[a-zA-Z][a-zA-Z0-9 -]{0,63}$/.test(font.family) || families.has(font.family)) fail('Schriftfamilien müssen eindeutig und gültig sein.');
    families.add(font.family); validateAssetPath(font.path, '(?:ttf|woff2|woff|otf)');
    if (font.weight !== undefined && (typeof font.weight !== 'string' || !/^[1-9]00(?: [1-9]00)?$/.test(font.weight))) fail('Ungültige Schriftgewichte.');
  }
  validateOrder(manifest.layerOrder);
  if (manifest.layouts !== undefined && manifest.formats !== undefined) fail('layouts und das alte formats dürfen nicht gleichzeitig definiert sein.');
  let layouts = manifest.layouts;
  if (layouts === undefined) {
    if (!object(manifest.formats) || !Object.keys(manifest.formats).length || Object.keys(manifest.formats).some(id => !Object.hasOwn(legacyNames, id))) fail('Unbekanntes oder fehlendes Etikettenformat.');
    for (const [id, design] of Object.entries(manifest.formats)) {
      if (!object(design) || design.shape !== (id === 'circular' ? 'circle' : 'rectangle')) fail(`Ungültige Kontur für altes Format ${id}.`);
    }
    layouts = Object.entries(manifest.formats).map(([id, design]) => ({ ...design, id, name: legacyNames[id] }));
  }
  if (!Array.isArray(layouts) || !layouts.length) fail('Mindestens ein Layout ist erforderlich.');
  const ids = new Set();
  for (const design of layouts) {
    if (!object(design) || typeof design.id !== 'string' || !layoutIdPattern.test(design.id) || ids.has(design.id)) fail('Layout-IDs müssen eindeutig und gültig sein.');
    ids.add(design.id);
    const format = design.id;
    if (typeof design.name !== 'string' || !design.name.trim() || design.name.length > 120) fail(`Layoutname fehlt für ${format}.`);
    if (design.preview !== undefined) validateAssetPath(design.preview, 'png');
    if (design.bleedMm !== undefined && !finite(design.bleedMm, 0, 20)) fail(`Ungültige Beschnittinformation für ${format}.`);
    if (!object(design) || !Number.isInteger(design.width) || !Number.isInteger(design.height) || !finite(design.width, 64, 4096) || !finite(design.height, 64, 4096)) fail(`Ungültige Canvas-Abmessungen für ${format}.`);
    if (!['rectangle', 'circle'].includes(design.shape) || (design.shape === 'circle' && design.width !== design.height)) fail(`Ungültige Kontur für ${format}.`);
    if (!object(design.layers)) fail(`Layer fehlen für ${format}.`);
    validateAssetPath(design.layers.base, 'png');
    for (const layer of ['genetics', 'thc', 'cbd']) {
      const sprites = design.layers[layer];
      if (!Array.isArray(sprites) || sprites.length !== 7 || new Set(sprites).size !== 7) fail(`${format}/${layer} benötigt genau sieben verschiedene PNGs.`);
      sprites.forEach(path => validateAssetPath(path, 'png'));
    }
    if (design.layerOrder !== undefined) validateOrder(design.layerOrder);
    if (design.masks !== undefined) {
      if (!object(design.masks) || Object.keys(design.masks).some(id => !LAYER_ORDER.includes(id))) fail('Ungültige Maskenliste.');
      Object.values(design.masks).forEach(path => validateAssetPath(path, 'png'));
    }
    validateTypography(design.typography, design.width, design.height, manifest.fonts);
  }
  const normalized = structuredClone(manifest);
  delete normalized.formats;
  normalized.layouts = structuredClone(layouts);
  return normalized;
}

/** Canonical layouts, including read-time migration of old packs. */
export function getLayouts(manifest) { return validateManifest(manifest).layouts; }

/** Returns a layout object: identity, closest ratio of the same shape, then the first layout. */
export function chooseComparableLayout(layouts, previous = null) {
  if (!Array.isArray(layouts) || !layouts.length) fail('Keine Layouts verfügbar.');
  if (!previous) return layouts[0];
  const exact = layouts.find(layout => layout.id === (previous.layoutId || previous.id || previous.format));
  if (exact) return exact;
  const sameShape = layouts.filter(layout => layout.shape === previous.shape);
  if (!sameShape.length || !finite(previous.width, 1, 4096) || !finite(previous.height, 1, 4096)) return layouts[0];
  const ratio = previous.width / previous.height;
  return sameShape.reduce((best, layout) => Math.abs(Math.log(layout.width / layout.height / ratio)) < Math.abs(Math.log(best.width / best.height / ratio)) ? layout : best);
}

export function resolvePackConfig(manifest, layoutId, baseUrl, assetResolver = null) {
  manifest = validateManifest(manifest);
  const design = layoutId === undefined ? manifest.layouts[0] : manifest.layouts.find(layout => layout.id === layoutId);
  if (!design) fail(`Pack „${manifest.name}“ unterstützt Layout ${layoutId} nicht.`);
  const root = new URL(baseUrl);
  const resolve = assetResolver || (path => new URL(path, root).href);
  const font = manifest.fonts.find(item => item.family === design.typography.family);
  return {
    id: manifest.id, packId: manifest.id, packName: manifest.name, packVersion: manifest.version,
    assetVersion: `${manifest.id}@${manifest.version}`, assetStatus: manifest.status || 'illustrated',
    layoutId: design.id, layoutName: design.name, format: design.id,
    preview: design.preview ? resolve(design.preview) : null, bleedMm: design.bleedMm || 0,
    width: design.width, height: design.height, shape: design.shape, limits: LIMITS, thresholds: THRESHOLDS,
    base: { id: 'base', label: 'Papier & Grundform', path: resolve(design.layers.base), assetPath: design.layers.base },
    ...Object.fromEntries(['genetics', 'thc', 'cbd'].map(id => [id, design.layers[id].map((path, index) => ({ level: index + 1, label: LAYER_LABELS[id][index], path: resolve(path), assetPath: path }))])),
    layerOrder: [...(design.layerOrder || manifest.layerOrder)],
    typography: { ...structuredClone(design.typography), fontPath: resolve(font.path), fontWeight: font.weight || '400 700' },
    masks: Object.fromEntries(Object.entries(design.masks || {}).map(([id, path]) => [id, resolve(path)])),
  };
}

/** Files referenced by a manifest; license files are retained separately by ZIP import. */
export function manifestAssetPaths(manifest) {
 manifest=validateManifest(manifest);
 const paths=new Set(manifest.fonts.map(font=>font.path));
 if(manifest.preview)paths.add(manifest.preview);
 for(const format of manifest.layouts){
  if(format.preview)paths.add(format.preview);
  paths.add(format.layers.base);
  for(const id of ['genetics','thc','cbd'])for(const path of format.layers[id])paths.add(path);
  for(const path of Object.values(format.masks||{}))paths.add(path);
 }
 return [...paths];
}
const keyFor=(id,version)=>id+'@'+version;
const mimeFor=path=>/\.png$/i.test(path)?'image/png':/\.woff2$/i.test(path)?'font/woff2':/\.woff$/i.test(path)?'font/woff':/\.otf$/i.test(path)?'font/otf':/\.ttf$/i.test(path)?'font/ttf':'application/octet-stream';
async function validatePackAssets(config){
 await preloadAssets(config);
 const canvas=document.createElement('canvas');
 await renderLabel(canvas,{name:'Texturepack',year:2026,sativa:50,thc:20,cbd:10},{config});
}

/** Bundled and browser-local packs share validation and the existing renderer. */
export class TexturePackManager {
 constructor({catalogUrl=new URL('../texturepacks/catalog.json',import.meta.url),fetchImpl=globalThis.fetch,importedStore=(globalThis.indexedDB?new IndexedDBPackStore():null),validateImportedAssets=validatePackAssets}={}){
  this.catalogUrl=new URL(catalogUrl);this.fetchImpl=fetchImpl.bind(globalThis);this.importedStore=importedStore;this.validateImportedAssets=validateImportedAssets;
  this.packs=new Map();this.catalogTask=null;this.localResources=new Map();this.warning=null;this.importQueue=Promise.resolve();
 }
 async readJson(url){
  let response;try{response=await this.fetchImpl(url.href);}catch{fail('Datei konnte nicht geladen werden: '+url.pathname);}
  if(!response.ok)fail('Datei fehlt oder ist nicht erreichbar: '+url.pathname+' ('+response.status+')');
  try{return await response.json();}catch{fail('Ungültige JSON-Datei: '+url.pathname);}
 }
 async catalog(){
  if(!this.catalogTask){
   const task=this.readJson(this.catalogUrl).then(catalog=>{
    if(!object(catalog)||catalog.compatibilityVersion!==1||!Array.isArray(catalog.packs)||!catalog.packs.length)fail('Ungültiger Pack-Katalog.');
    const ids=new Set();for(const entry of catalog.packs){
     if(!object(entry)||!/^[a-z][a-z0-9-]{0,63}$/.test(entry.id||'')||ids.has(entry.id)||typeof entry.name!=='string'||!entry.name.trim()||!versionPattern.test(entry.version||''))fail('Ungültiger oder doppelter Pack-Eintrag.');
     ids.add(entry.id);validateAssetPath(entry.manifest,'json');if(entry.preview)validateAssetPath(entry.preview,'png');
    }return catalog;
   });this.catalogTask=task;task.catch(()=>{if(this.catalogTask===task)this.catalogTask=null;});
  }return this.catalogTask;
 }
 async localRecords(){
  if(!this.importedStore)return [];
  try{return await this.importedStore.list();}catch(error){this.warning='Lokal gespeicherte Texturepacks sind nicht verfügbar: '+error.message;return [];}
 }
 resource(record){
  const key=keyFor(record.manifest.id,record.manifest.version);
  if(!this.localResources.has(key)){
   const urls=new Map();
   const resolve=path=>{if(!record.files[path])fail('Importierte Datei fehlt: '+path);if(!urls.has(path))urls.set(path,URL.createObjectURL(new Blob([record.files[path]],{type:mimeFor(path)})));return urls.get(path);};
   this.localResources.set(key,{record,urls,resolve});
  }return this.localResources.get(key);
 }
 release(id,version){const key=keyFor(id,version),resource=this.localResources.get(key);if(resource){for(const url of resource.urls.values())URL.revokeObjectURL(url);this.localResources.delete(key);}this.packs.delete(key);}
 dispose(){for(const resource of this.localResources.values())for(const url of resource.urls.values())URL.revokeObjectURL(url);this.localResources.clear();}
 async listPacks(){
  const bundled=(await this.catalog()).packs.map(entry=>({...entry,source:'bundled',preview:entry.preview?new URL(entry.preview,this.catalogUrl).href:null}));
  const locals=[];for(const record of await this.localRecords()){
   try{const manifest=validateManifest(record.manifest);if(bundled.some(x=>x.id===manifest.id&&x.version===manifest.version))continue;
    locals.push({id:manifest.id,version:manifest.version,name:manifest.name,description:manifest.description,status:manifest.status||'illustrated',source:'imported',layouts:manifest.layouts.map(({id,name,shape,width,height})=>({id,name,shape,width,height})),preview:manifest.preview?this.resource(record).resolve(manifest.preview):null,totalBytes:record.totalBytes});
   }catch(error){this.warning='Ein gespeichertes Texturepack ist beschädigt: '+error.message;}
  }return [...bundled,...locals];
 }
 async recordFor(id,version){
  if(!this.importedStore)return null;
  if(version){const cached=this.localResources.get(keyFor(id,version));if(cached)return cached.record;return this.importedStore.get(id,version);}
  return (await this.localRecords()).filter(record=>record.manifest.id===id).sort((a,b)=>(b.importedAt||0)-(a.importedAt||0))[0]||null;
 }
 async bundledManifest(entry){
  const key=keyFor(entry.id,entry.version);
  if(!this.packs.has(key)){const task=this.readJson(new URL(entry.manifest,this.catalogUrl)).then(manifest=>{manifest=validateManifest(manifest);if(manifest.id!==entry.id||manifest.version!==entry.version)fail('Pack-ID oder Version stimmt nicht mit dem Katalog überein.');return manifest;});this.packs.set(key,task);task.catch(()=>this.packs.delete(key));}
  return structuredClone(await this.packs.get(key));
 }
 async loadPack(id,version){
  const bundled=(await this.catalog()).packs.find(pack=>pack.id===id&&(version===undefined||pack.version===version));
  if(bundled)return this.bundledManifest(bundled);
  const record=await this.recordFor(id,version);if(record)return validateManifest(record.manifest);
  fail('Pack „'+id+'“'+(version?' in Version '+version:'')+' ist nicht installiert.');
 }
 async getConfig(id,layoutId,version){
  const catalog=await this.catalog(),entry=catalog.packs.find(pack=>pack.id===id&&(version===undefined||pack.version===version));
  if(entry){const manifest=await this.bundledManifest(entry);return resolvePackConfig(manifest,layoutId,new URL('./',new URL(entry.manifest,this.catalogUrl)));}
  const record=await this.recordFor(id,version);if(!record)fail('Pack „'+id+'“'+(version?' in Version '+version:'')+' ist nicht installiert.');
  const resource=this.resource(record);const config=resolvePackConfig(record.manifest,layoutId,this.catalogUrl,resource.resolve);config.assetVersion+=':'+record.contentHash;config.source='imported';return config;
 }
 importPack(archive){
  const task=this.importQueue.then(()=>this.installArchive(archive));this.importQueue=task.catch(()=>{});return task;
 }
 async installArchive(archive){
  if(!this.importedStore)fail('Der Browser unterstützt keinen dauerhaften Texturepack-Speicher (IndexedDB).');
  if(!globalThis.crypto?.subtle)fail('ZIP-Import benötigt HTTPS oder einen lokalen Entwicklungsserver.');
  const inspected=await inspectPackArchive(archive),manifest=inspected.manifest;
  const bundled=(await this.catalog()).packs.find(x=>x.id===manifest.id&&x.version===manifest.version);
  if(bundled)fail('Diese Pack-ID und Version gehören zu einem mitgelieferten Pack. Bitte eine eigene ID oder neue Version verwenden.');
  const digestInput=[];
  const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])])):value;
  for(const path of Object.keys(inspected.files).filter(x=>x!=='pack.json').sort()){
   const digest=await crypto.subtle.digest('SHA-256',inspected.files[path]);digestInput.push(path+':'+Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join(''));
  }
  digestInput.unshift(JSON.stringify(canonical(manifest)));const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(digestInput.join('\n')));const contentHash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
  const existing=await this.importedStore.get(manifest.id,manifest.version);
  if(existing){
   // Old imports hashed their formats manifest. A read-time layout migration may
   // change that hash without changing a single asset or its meaning.
   let identicalLegacy=false;
   if(existing.contentHash!==contentHash&&existing.manifest.formats){
    const oldPaths=Object.keys(existing.files).filter(path=>path!=='pack.json').sort(),newPaths=Object.keys(inspected.files).filter(path=>path!=='pack.json').sort();
    identicalLegacy=JSON.stringify(canonical(validateManifest(existing.manifest)))===JSON.stringify(canonical(manifest))&&JSON.stringify(oldPaths)===JSON.stringify(newPaths)&&oldPaths.every(path=>existing.files[path].length===inspected.files[path].length&&existing.files[path].every((byte,index)=>byte===inspected.files[path][index]));
   }
   if(existing.contentHash!==contentHash&&!identicalLegacy)fail('Diese Pack-ID und Version ist bereits mit anderen Dateien installiert. Bitte die Version erhöhen.');
   return {id:manifest.id,version:manifest.version,name:manifest.name,source:'imported',duplicate:true};
  }
  const record={manifest,files:inspected.files,totalBytes:inspected.totalBytes,contentHash,importedAt:Date.now()};
  const resource=this.resource(record);
  try{
   for(const layout of manifest.layouts){
    const config=resolvePackConfig(manifest,layout.id,this.catalogUrl,resource.resolve);config.assetVersion+=':'+contentHash;await this.validateImportedAssets(config);
   }
   await this.importedStore.put(record);
  }catch(error){this.release(manifest.id,manifest.version);throw new Error('Texturepack wurde nicht installiert: '+error.message);}
  return {id:manifest.id,version:manifest.version,name:manifest.name,source:'imported',duplicate:false};
 }
 async removePack(id,version){
  if((await this.catalog()).packs.some(x=>x.id===id&&x.version===version))fail('Mitgelieferte Packs können nicht entfernt werden.');
  if(!this.importedStore||!await this.importedStore.get(id,version))fail('Dieses lokale Pack ist nicht installiert.');
  await this.importedStore.remove(id,version);this.release(id,version);
 }
 async exportPack(id,version){
  const manifest=await this.loadPack(id,version),entry=(await this.catalog()).packs.find(x=>x.id===id&&x.version===manifest.version);
  let files;
  if(entry){
   files={};const root=new URL('./',new URL(entry.manifest,this.catalogUrl));const paths=manifestAssetPaths(manifest);
   const optional=new Set(['ASSET-LICENSE.txt','LICENSE.txt','LICENSE.md','README.md','PROMPTS.md']);
   for(const font of manifest.fonts)optional.add(font.path.replace(/[^/]+$/,'OFL.txt'));
   paths.push(...optional);
   for(const path of new Set(paths)){
    const response=await this.fetchImpl(new URL(path,root).href);
    if(!response.ok){if(optional.has(path))continue;fail('Exportdatei fehlt: '+path);}
    files[path]=new Uint8Array(await response.arrayBuffer());
   }
  }else{const record=await this.recordFor(id,manifest.version);files=record.files;}
  return new Blob([buildPackArchive(manifest,files)],{type:'application/zip'});
 }
}
