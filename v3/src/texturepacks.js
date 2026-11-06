import { validateSchema } from './manifest-schema.js';
import { LIMITS, THRESHOLDS, LAYER_LABELS } from './config.js';
import { IndexedDBPackStore } from './pack-store.js';
import { inspectPackArchive, buildPackArchive } from './pack-archive.js';
import { preloadAssets, renderLabel } from './renderer.js';

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

/** Schema checks are shared with the published JSON Schema; references require semantic checks. */
export function validateManifest(manifest) {
 if(!object(manifest))fail('Manifest muss ein JSON-Objekt sein.');
 if(manifest.compatibilityVersion!==2)fail('Inkompatibles Texturepack. Bitte auf die neue Spezifikation (compatibilityVersion 2) aktualisieren.');
 validateSchema(manifest);
 const families=new Set();
 for(const font of manifest.fonts){
  if(families.has(font.family))fail('Schriftfamilien müssen eindeutig sein.');
  families.add(font.family);validateAssetPath(font.path,'(?:ttf|otf|woff|woff2)');
 }
 const ids=new Set();
 for(const layout of manifest.layouts){
  if(ids.has(layout.id))fail('Layout-IDs müssen eindeutig sein.');ids.add(layout.id);
  if(layout.shape==='circle'&&layout.width!==layout.height)fail('Ein Kreis benötigt quadratische Canvas-Abmessungen.');
  const {fields,decorations}=layout.typography;
  const all=[...fields,...fields.flatMap(field=>field.background?[field.background]:[]),...decorations];
  if(all.length>128)fail('Höchstens 128 Elemente pro Layout sind erlaubt.');
  const elementIds=new Set(['base','genetics','thc','cbd','text']);
  for(const element of all){if(elementIds.has(element.id))fail('Element-IDs müssen eindeutig sein.');elementIds.add(element.id);}
  for(const field of fields){
   if(!families.has(field.font))fail('Die Textschrift muss in fonts registriert sein.');
   if(field.source==='static'&&field.text===undefined)fail('Statischer Text fehlt.');
   if(field.format==='percent'&&!['thc','cbd','indica','sativa'].includes(field.source))fail('percent benötigt eine Prozent-Datenquelle.');
   if(['year-full','year-short'].includes(field.format)&&field.source!=='year')fail('Jahresformate benötigen die Datenquelle year.');
   if(!field.path&&(field.x===undefined||field.y===undefined))fail('Text benötigt x und y oder einen Kreisbogen.');
   if(field.path&&(field.x!==undefined||field.y!==undefined||field.maxLines>1||field.wrap===true||field.maxWidth!==undefined))fail('Kreisbögen verwenden centerX/centerY und genau eine Zeile, ohne maxWidth.');
   if((field.minFontSize??8)>Math.min(field.fontSize,field.maxFontSize??512))fail('Ungültiger Schriftgrößenbereich.');
   if(field.maxFontSize!==undefined&&field.maxFontSize<field.fontSize)fail('maxFontSize muss mindestens fontSize betragen.');
   if(field.background&&field.background.relativeTo!==field.id)fail('Ein Feldhintergrund benötigt relativeTo mit der eigenen Textfeld-ID.');
  }
  for(const decoration of all.filter(element=>element.type)){
   if(decoration.relativeTo&&!fields.some(field=>field.id===decoration.relativeTo))fail('relativeTo muss auf ein Textfeld zeigen; zyklische Abhängigkeiten sind nicht erlaubt.');
   if(decoration.type==='sprite'){
    if(!decoration.asset)fail('Sprite benötigt ein PNG-Asset.');validateAssetPath(decoration.asset,'png');
    if(['color','radius','padding','border'].some(key=>decoration[key]!==undefined))fail('Sprite unterstützt keine geometrischen Flächeneigenschaften.');
   }else if(!decoration.color||decoration.asset!==undefined)fail('Rechteck benötigt eine Farbe und kein Asset.');
   const padding=decoration.padding||0;
   if((decoration.width+2*padding)*(decoration.scale??1)>16384||(decoration.height+2*padding)*(decoration.scale??1)>16384)fail('Skalierung ist zu groß.');
  }
 }
 return structuredClone(manifest);
}

/** Validated layouts using compatibilityVersion 2 exclusively. */
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

  return {
    id: manifest.id, packId: manifest.id, packName: manifest.name, packVersion: manifest.version,
    assetVersion: `${manifest.id}@${manifest.version}`, assetStatus: manifest.status || 'illustrated',
    layoutId: design.id, layoutName: design.name, format: design.id,
    preview: design.preview ? resolve(design.preview) : null, bleedMm: design.bleedMm || 0,
    width: design.width, height: design.height, shape: design.shape, limits: LIMITS, thresholds: THRESHOLDS,
    base: { id: 'base', label: 'Papier & Grundform', path: resolve(design.layers.base), assetPath: design.layers.base },
    ...Object.fromEntries(['genetics', 'thc', 'cbd'].map(id => [id, design.layers[id].map((path, index) => ({ level: index + 1, label: LAYER_LABELS[id][index], path: resolve(path), assetPath: path }))])),
    zIndex: {...design.zIndex},
    fonts: manifest.fonts.map(font=>({...font,path:resolve(font.path)})),
    typography: {
     fields: design.typography.fields.map(field=>({...structuredClone(field),...(field.background?{background:{...field.background,...(field.background.asset?{asset:resolve(field.background.asset)}:{})}}:{})})),
     decorations: design.typography.decorations.map(element=>({...structuredClone(element),...(element.asset?{asset:resolve(element.asset)}:{})}))
    },
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
  for(const element of [...format.typography.decorations,...format.typography.fields.flatMap(field=>field.background?[field.background]:[])])if(element.asset)paths.add(element.asset);
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
    if(!object(catalog)||catalog.compatibilityVersion!==2||!Array.isArray(catalog.packs)||!catalog.packs.length)fail('Ungültiger Pack-Katalog.');
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
   }catch(error){this.warning='Ein gespeichertes Texturepack ist nicht verfügbar: '+error.message;}
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
   if(existing.contentHash!==contentHash)fail('Diese Pack-ID und Version ist bereits mit anderen Dateien installiert. Bitte die Version erhöhen.');
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
