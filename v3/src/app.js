import { getRenderPlan } from './model.js';
import { renderLabel, canvasToPng } from './renderer.js';
import { TexturePackManager, getLayouts, chooseComparableLayout } from './texturepacks.js';
import { PrintCartService } from './cart.js';
import { SheetEditor, findPlacement, movePlacement } from './sheet-editor.js';
import { configKey, getPhysicalSize, layoutSheets, generatePdf, cropMarkSegments, preparePrintImage } from './print.js';

const $ = selector => document.querySelector(selector);
const fields = Object.fromEntries(['name','producer','year','thc','cbd','sativa'].map(id=>[id,$('#'+id)]));
const manager = new TexturePackManager();
const cart = new PrintCartService();
const visibility = {base:true,genetics:true,thc:true,cbd:true,text:true};
const preview = $('#preview');
const renderCache = new Map();
let packs = [];
let current = null;
let requestId = 0;
let editingId = null;
let editingVersion = null;
let busy = false;
let pdfBusy = false;
let sheetRequest = 0;
let sheetDrawRequest = 0;
let currentLayout = null;
let automaticLayout = null;
let sheetEditor = null;
let selectedPlacementId = null;
let drag = null;
let sheetTimer;
let packBusy = false;
let layoutPackKey = null;
let activeConfig = null;
let requestedLayoutId = null;
let layoutGalleryRequest = 0;
const packKey = pack => `${pack.id}@${pack.version}`;
function selectedPack(){const [id,version]=$('#pack').value.split('@');return {id,version};}
fields.year.value = new Date().getFullYear();

function report(selector, message) {
 const target=$(selector);target.textContent=message||'';target.hidden=!message;
}
function notice(message){report('#app-notice',message);}
function setEditorEnabled(enabled){$('#export').disabled=!enabled;$('#add-cart').disabled=!enabled;}
function readData(){
 for(const field of Object.values(fields))if(!field.checkValidity())throw Error('Bitte prüfe die Angabe „'+(field.labels?.[0]?.textContent.trim()||field.name)+'“.');
 return Object.fromEntries(Object.entries(fields).map(([key,input])=>[key,input.value]));
}
function editorSize(config){
 for(const id of ['width-mm','editor-quantity'])if(!$('#'+id).checkValidity())throw Error('Bitte eine gültige Druckgröße und ganze Stückzahl eingeben.');
 const size=getPhysicalSize(config,Number($('#width-mm').value));
 $('#size-label').textContent=config.shape==='circle'?'Durchmesser in mm':'Breite in mm';
 $('#physical-size').textContent=`${size.widthMm.toLocaleString('de-DE')} × ${size.heightMm.toLocaleString('de-DE',{maximumFractionDigits:2})} mm · ${Math.round(size.dpi)} dpi`;
 report('#dpi-warning',size.dpi<300?'Diese Größe ergibt weniger als 300 dpi. Für schärferen Druck ein kleineres Etikett oder höher aufgelöste Pack-Grafiken wählen.':'');
 return size;
}
function updateOutputs(){
 for(const key of ['thc','cbd']){
  const value=Number(fields[key].value).toLocaleString('de-DE',{maximumFractionDigits:1});
  $('#'+key+'-output').value=value;fields[key].setAttribute('aria-valuetext',`${value} Prozent ${key.toUpperCase()}`);
 }
 const sativa=Number(fields.sativa.value);$('#sativa-output').value=sativa;$('#indica-output').value=100-sativa;
 fields.sativa.setAttribute('aria-valuetext',`${sativa} Prozent Sativa, ${100-sativa} Prozent Indica`);
}
function showLayers(plan){
 const list=$('#layer-list');list.replaceChildren(...plan.layers.map(layer=>{
  const row=document.createElement('label');row.className='layer-row';
  const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.checked=visibility[layer.id]!==false;
  checkbox.setAttribute('aria-label',`${layer.label} anzeigen`);checkbox.addEventListener('change',()=>{visibility[layer.id]=checkbox.checked;updatePreview();});
  const description=document.createElement('div'),label=document.createElement('span'),path=document.createElement('code');
  label.textContent=layer.label;path.textContent=layer.id==='text'?'Dynamischer Text':`${layer.level?'Stufe '+layer.level+' / 7 · ':''}${layer.assetPath||new URL(layer.path).pathname.split('/').slice(-3).join('/')}`;
  description.append(label,path);row.append(checkbox,description);return row;
 }));
}
function updateLayoutSelection(layoutId){
 for(const button of $('#layout-gallery').querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.dataset.layoutId===layoutId));
}
function drawLayoutGallery(manifest){
 const token=++layoutGalleryRequest;
 $('#layout-gallery').replaceChildren(...getLayouts(manifest).map(layout=>{
  const button=document.createElement('button');button.type='button';button.className='layout-card';button.dataset.layoutId=layout.id;
  const stage=document.createElement('span');stage.className='layout-thumb';stage.setAttribute('aria-hidden','true');
  const title=document.createElement('strong'),dimensions=document.createElement('small');title.textContent=layout.name;
  dimensions.textContent=`${layout.width} × ${layout.height} px${layout.shape==='circle'?' · rund':''}`;
  stage.textContent='Vorschau …';button.append(stage,title,dimensions);button.setAttribute('aria-pressed',String($('#layout').value===layout.id));
  button.addEventListener('click',()=>{$('#layout').value=layout.id;editingVersion=null;updatePreview();});
  manager.getConfig(manifest.id,layout.id,manifest.version).then(async config=>{
   if(config.preview){
    const thumbnail=new Image();thumbnail.src=config.preview;thumbnail.alt='';await thumbnail.decode();
    if(token===layoutGalleryRequest&&button.isConnected)stage.replaceChildren(thumbnail);return;
   }
   const image=document.createElement('canvas');await renderLabel(image,{name:'Deine Sorte',year:new Date().getFullYear(),sativa:75,thc:20,cbd:3},{config});
   if(token!==layoutGalleryRequest||!button.isConnected)return;
   const thumb=document.createElement('canvas');thumb.width=Math.max(1,Math.round(120*layout.width/Math.max(layout.width,layout.height)));thumb.height=Math.max(1,Math.round(120*layout.height/Math.max(layout.width,layout.height)));thumb.getContext('2d').drawImage(image,0,0,thumb.width,thumb.height);stage.replaceChildren(thumb);
  }).catch(()=>{if(token===layoutGalleryRequest&&button.isConnected)stage.textContent='Vorschau fehlt';});
  return button;
 }));
}
async function updatePreview(){
 const request=++requestId;current=null;busy=true;setEditorEnabled(false);updateOutputs();report('#form-error','');$('#loading').hidden=false;
 $('#render-status').textContent='Vorschau wird aktualisiert …';
 try{
  const data=readData(),selection=selectedPack(),packId=selection.id;
  let layoutId=$('#layout').value;
  if(!packId)throw Error('Bitte zuerst ein Texturepack auswählen.');
  const manifest=await manager.loadPack(packId,selection.version||editingVersion||undefined);
  if(request!==requestId)return;
  const layouts=getLayouts(manifest),key=packKey(manifest);
  if(layoutPackKey!==key||requestedLayoutId){
   layoutId=requestedLayoutId||chooseComparableLayout(layouts,activeConfig).id;
   if(!layouts.some(layout=>layout.id===layoutId))layoutId=layouts[0].id;
   requestedLayoutId=null;layoutPackKey=key;
   $('#layout').replaceChildren(...layouts.map(layout=>{const option=document.createElement('option');option.value=layout.id;option.textContent=layout.name;return option;}));
   $('#layout').value=layoutId;$('#layout').disabled=layouts.length===1;
   drawLayoutGallery(manifest);
  }
  if(!layouts.some(layout=>layout.id===layoutId))throw Error('Das gewählte Layout ist in diesem Texturepack nicht vorhanden.');
  updateLayoutSelection(layoutId);
  const config=await manager.getConfig(packId,layoutId,selection.version||editingVersion||undefined);
  const size=editorSize(config);const plan=getRenderPlan(data,config);
  if(request!==requestId)return;
  const result=await renderLabel(preview,data,{config,visibility:{...visibility}});
  if(request!==requestId||!result.committed)return;
  activeConfig=config;current={data:plan.input,config,packId,packVersion:config.packVersion,layoutId,widthMm:size.widthMm,quantity:Number($('#editor-quantity').value)};
  showLayers(plan);$('#asset-version').textContent=`${config.packName||packId} · ${config.packVersion} · ${config.layoutName}`;
  $('.asset-notice').textContent=config.assetStatus==='illustrated'?'Illustrationen · Texturepack':'Beispielassets · Platzhalter';
  preview.setAttribute('aria-label',`Etikett für ${plan.input.name}${plan.input.producer?' von '+plan.input.producer:''}, Ernte ${plan.input.year}, ${plan.input.thc} Prozent THC, ${plan.input.cbd} Prozent CBD, ${plan.input.sativa} Prozent Sativa.`);
  $('#render-status').textContent=`${plan.width} × ${plan.height} px · bereit`;
  $('.export-note').textContent=`${plan.width} × ${plan.height} px · transparenter Außenbereich`;
 }catch(error){if(request===requestId){report('#form-error',error.message);$('#render-status').textContent='Angaben oder Texturepack prüfen';}}
 finally{if(request===requestId){busy=false;$('#loading').hidden=true;setEditorEnabled(Boolean(current));}}
}
function download(blob,filename){const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download=filename;document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);}
function endEditing(){editingId=null;editingVersion=null;$('#add-cart').textContent='Zum Druckwarenkorb hinzufügen';$('#edit-cancel').hidden=true;}
function safeName(name){return name.replace(/[<>:"/\\|?*\u0000-\u001f]/g,'-')||'Etikett';}
async function renderEntry(entry,config){
 const key=JSON.stringify([entry.data,entry.packId,entry.packVersion,entry.layoutId]);
 if(!renderCache.has(key)){
  const task=(async()=>{const canvas=document.createElement('canvas');await renderLabel(canvas,entry.data,{config});return canvas;})();
  renderCache.set(key,task);task.catch(()=>renderCache.delete(key));
  // A small in-memory working set; saved cart entries remain plain configuration.
  if(renderCache.size>80)renderCache.delete(renderCache.keys().next().value);
 }
 return renderCache.get(key);
}
async function entryConfig(entry){return manager.getConfig(entry.packId,entry.layoutId,entry.packVersion);}
async function editEntry(entry){
 try{
  await entryConfig(entry);
  for(const [key,input]of Object.entries(fields))input.value=entry.data[key]??'';
  $('#pack').value=`${entry.packId}@${entry.packVersion}`;requestedLayoutId=entry.layoutId;$('#width-mm').value=entry.widthMm;$('#editor-quantity').value=entry.quantity;
  editingId=entry.id;editingVersion=entry.packVersion;$('#add-cart').textContent='Änderungen im Warenkorb speichern';$('#edit-cancel').hidden=false;
  await updatePreview();$('#editor-title').scrollIntoView({behavior:'smooth'});
 }catch(error){report('#cart-error',error.message);}
}
function updateCart(){
 const entries=cart.list();$('#cart-count').textContent=entries.reduce((sum,x)=>sum+x.quantity,0);$('#clear-cart').disabled=!entries.length;
 const list=$('#cart-list');list.replaceChildren();
 if(!entries.length){const empty=document.createElement('p');empty.className='empty-state';empty.textContent='Dein Druckwarenkorb ist leer. Stelle oben ein Etikett zusammen und füge es hinzu.';list.append(empty);}
 for(const entry of entries){
  const row=document.createElement('article');row.className='cart-row';row.dataset.entryId=entry.id;
  const thumb=document.createElement('div');thumb.className='cart-thumb';
  const description=document.createElement('div');description.className='cart-description';
  const title=document.createElement('strong');title.textContent=entry.data.name;
  const info=document.createElement('p');
  const describe=config=>`${config?.packName||packs.find(x=>x.id===entry.packId&&x.version===entry.packVersion)?.name||entry.packId} · v${entry.packVersion} · ${config?.layoutName||entry.layoutId} · ${entry.widthMm} mm ${config?.shape==='circle'?'Durchmesser':'Breite'} · THC ${entry.data.thc} % / CBD ${entry.data.cbd} %`;
  info.textContent=describe();
  description.append(title,info);
  const quantityField=document.createElement('div');quantityField.className='field';
  const label=document.createElement('label');label.textContent='Stückzahl';label.htmlFor='qty-'+entry.id;
  const quantity=document.createElement('input');quantity.id=label.htmlFor;quantity.type='number';quantity.min='1';quantity.max='999';quantity.step='1';quantity.value=entry.quantity;
  quantity.addEventListener('change',()=>{try{cart.update(entry.id,{quantity:Number(quantity.value)});report('#cart-error','');updateCart();}catch(error){report('#cart-error',error.message);quantity.value=entry.quantity;}});
  quantityField.append(label,quantity);
  const actions=document.createElement('div');actions.className='cart-actions';
  for(const [name,fn]of [['Bearbeiten',()=>editEntry(entry)],['Entfernen',()=>{try{cart.remove(entry.id);if(editingId===entry.id)endEditing();updateCart();}catch(error){report('#cart-error',error.message);}}]]){const button=document.createElement('button');button.className='text-button';button.type='button';button.textContent=name;button.addEventListener('click',fn);actions.append(button);}
  row.append(thumb,description,quantityField,actions);list.append(row);
  entryConfig(entry).then(config=>{if(row.isConnected)info.textContent=describe(config);return renderEntry(entry,config);}).then(canvas=>{if(!row.isConnected)return;const small=document.createElement('canvas');small.width=120;small.height=Math.round(120*canvas.height/canvas.width);small.getContext('2d').drawImage(canvas,0,0,small.width,small.height);thumb.replaceChildren(small);}).catch(error=>{thumb.textContent='!';info.textContent+=' · '+error.message;});
 }
 scheduleSheets();
 drawPackGallery();
}
function readPrintSettings(){
 for(const input of $('#print-form').querySelectorAll('input[type=number]'))if(!input.checkValidity())throw Error('Bitte gültige Druckmaße eingeben.');
 return {widthMm:$('#print-width').value===''?undefined:Number($('#print-width').value),orientation:$('#orientation').value,marginMm:Number($('#margin-mm').value),gapMm:Number($('#gap-mm').value),bleedMm:Number($('#bleed-mm').value),cropMarks:$('#crop-marks').checked,calibration:$('#calibration').checked,mixSizes:$('#mix-sizes').checked};
}
function scheduleSheets(){
 cancelDrag();
 if(sheetEditor?.canUndo)notice('Der Druckbogen wird wegen geänderter Etiketten oder Druckeinstellungen neu angeordnet.');
 clearTimeout(sheetTimer);$('#export-pdf').disabled=true;currentLayout=null;sheetEditor=null;automaticLayout=null;selectedPlacementId=null;sheetRequest++;syncManualControls();sheetTimer=setTimeout(updateSheets,100);
}
async function updateSheets(){
 const request=++sheetRequest;$('#export-pdf').disabled=true;currentLayout=null;report('#print-error','');report('#print-warnings','');
 try{
  const entries=cart.list(),settings=readPrintSettings();
  if(!entries.length&&!settings.calibration){$('#sheet-summary').textContent='Füge zuerst Etiketten hinzu.';const canvas=$('#sheet-preview');canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);return;}
  const configs=new Map();await Promise.all(entries.map(async entry=>configs.set(configKey(entry),await entryConfig(entry))));
  if(request!==sheetRequest)return;
  const layout=layoutSheets(entries,configs,settings);automaticLayout=layout;sheetEditor=new SheetEditor(layout);currentLayout=layout;syncSheetPages();syncManualControls();
  report('#print-warnings',layout.warnings.join(' '));
  await drawSheet(layout,Number($('#sheet-page').value),request);
  if(request===sheetRequest)$('#export-pdf').disabled=pdfBusy||!layout.pages.length;
 }catch(error){if(request===sheetRequest){currentLayout=null;report('#print-error',error.message);$('#sheet-summary').textContent='Druckeinstellungen prüfen';}}
}
async function drawSheet(layout,index,request=sheetRequest){
 const drawRequest=++sheetDrawRequest;
 const page=layout.pages[index];if(!page)return;
 const canvas=$('#sheet-preview'),buffer=document.createElement('canvas'),scale=2;
 buffer.width=Math.round(page.widthMm*scale);buffer.height=Math.round(page.heightMm*scale);const ctx=buffer.getContext('2d');ctx.scale(scale,scale);ctx.fillStyle='white';ctx.fillRect(0,0,page.widthMm,page.heightMm);
 if(page.calibration){ctx.strokeStyle='black';ctx.lineWidth=.2;ctx.strokeRect((page.widthMm-100)/2,(page.heightMm-100)/2,100,100);ctx.font='4px sans-serif';ctx.fillStyle='black';ctx.textAlign='center';ctx.fillText('100 × 100 mm · Tatsächliche Größe / 100 %',page.widthMm/2,(page.heightMm-100)/2-8);}
 else{
  const images=await Promise.all(page.placements.map(async p=>{
   const source=await renderEntry(p.entry,p.config);
   return p.bleedMm?preparePrintImage(source,p):{canvas:source,padXMm:0,padYMm:0,widthMm:p.originalWidthMm,heightMm:p.originalHeightMm};
  }));
  page.placements.forEach((p,i)=>{const image=images[i];ctx.save();if(p.rotated){ctx.translate(p.xMm-image.padYMm,p.yMm+p.heightMm+image.padXMm);ctx.rotate(-Math.PI/2);ctx.drawImage(image.canvas,0,0,image.widthMm,image.heightMm);}else ctx.drawImage(image.canvas,p.xMm-image.padXMm,p.yMm-image.padYMm,image.widthMm,image.heightMm);ctx.restore();
   if(layout.settings.cropMarks){ctx.strokeStyle='#333';ctx.lineWidth=.12;for(const[x1,y1,x2,y2]of cropMarkSegments(p)){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}}
  });
 }
 if($('#manual-mode').checked&&selectedPlacementId){const selected=page.placements.find(p=>p.placementId===selectedPlacementId);if(selected){ctx.strokeStyle='#235fa2';ctx.lineWidth=.65;ctx.setLineDash([2,1]);ctx.strokeRect(selected.xMm,selected.yMm,selected.widthMm,selected.heightMm);ctx.setLineDash([]);}}
 if(request!==sheetRequest||drawRequest!==sheetDrawRequest||currentLayout!==layout||drag)return;canvas.width=buffer.width;canvas.height=buffer.height;canvas.getContext('2d').drawImage(buffer,0,0);
 canvas.setAttribute('aria-label',`Druckvorschau Seite ${index+1}, ${page.widthMm} × ${page.heightMm} mm, ${page.placements.length} Etiketten`);
}
$('#label-form').addEventListener('submit',event=>event.preventDefault());
$('#label-form').addEventListener('input',event=>{if(event.target.id==='pack'||event.target.id==='layout')editingVersion=null;updatePreview();});
$('#export').addEventListener('click',async()=>{if(!current||busy)return;const state=current;$('#export').disabled=true;try{download(await canvasToPng(preview),`${safeName(state.data.name)}_${state.data.year}.png`);}catch(error){report('#form-error',error.message);}finally{if(current)setEditorEnabled(true);}});
$('#add-cart').addEventListener('click',()=>{if(!current||busy)return;try{const entry={data:current.data,packId:current.packId,packVersion:current.packVersion,layoutId:current.layoutId,quantity:current.quantity,widthMm:current.widthMm};if(editingId)cart.update(editingId,entry);else cart.add(entry);notice(editingId?'Änderungen gespeichert.':'Etikett zum Druckwarenkorb hinzugefügt.');endEditing();report('#cart-error','');updateCart();}catch(error){report('#cart-error',error.message);}});
$('#edit-cancel').addEventListener('click',()=>{endEditing();updatePreview();});
$('#clear-cart').addEventListener('click',()=>{try{cart.clear();endEditing();updateCart();}catch(error){report('#cart-error',error.message);}});
$('#print-form').addEventListener('submit',event=>event.preventDefault());$('#print-form').addEventListener('input',event=>{if(event.target.id==='manual-mode'){cancelDrag();syncManualControls();if(currentLayout)drawSheet(currentLayout,Number($('#sheet-page').value));}else scheduleSheets();});
$('#sheet-page').addEventListener('change',()=>{cancelDrag();if(currentLayout){syncManualControls();drawSheet(currentLayout,Number($('#sheet-page').value)).catch(error=>report('#print-error',error.message));}});
$('#export-pdf').addEventListener('click',async()=>{
 if(!currentLayout||pdfBusy)return;const layout=currentLayout;pdfBusy=true;$('#export-pdf').disabled=true;$('#pdf-status').textContent='PDF wird erstellt …';
 try{const bytes=await generatePdf(layout,renderEntry);download(new Blob([bytes],{type:'application/pdf'}),'etiketten-din-a4.pdf');$('#pdf-status').textContent=`PDF mit ${layout.pages.length} Seiten bereit. Beim Drucken 100 % / Tatsächliche Größe wählen.`;}
 catch(error){report('#print-error',error.message);$('#pdf-status').textContent='PDF konnte nicht erstellt werden.';}
 finally{pdfBusy=false;$('#export-pdf').disabled=!currentLayout;}
});
function drawPackGallery(){
 $('#pack-gallery').replaceChildren(...packs.map(pack=>{
  const card=document.createElement('article');card.className='pack-card';card.dataset.packKey=packKey(pack);
  const image=pack.preview?document.createElement('img'):document.createElement('div');
  if(pack.preview){image.src=pack.preview;image.alt=pack.name+' – Pack-Vorschau';image.loading='lazy';}else{image.className='preview-placeholder';image.textContent='Eigenes Pack';}
  const body=document.createElement('div'),title=document.createElement('h3'),copy=document.createElement('p'),source=document.createElement('small'),actions=document.createElement('div');actions.className='pack-actions';
  title.textContent=pack.name;copy.textContent=pack.description;source.className='pack-source';source.textContent='Version '+pack.version+' · '+(pack.source==='imported'?'Lokal importiert':'Mitgeliefert');
  const select=document.createElement('button');select.type='button';select.className='secondary-button';select.textContent='Pack auswählen';select.addEventListener('click',()=>{$('#pack').value=packKey(pack);editingVersion=null;updatePreview();$('#editor-title').scrollIntoView({behavior:'smooth'});});
  const exportButton=document.createElement('button');exportButton.type='button';exportButton.className='text-button';exportButton.textContent='Als ZIP exportieren';exportButton.disabled=packBusy;
  exportButton.addEventListener('click',async()=>{exportButton.disabled=true;report('#pack-error','');$('#pack-import-status').textContent='ZIP wird erstellt …';try{download(await manager.exportPack(pack.id,pack.version),pack.id+'-'+pack.version+'.zip');$('#pack-import-status').textContent='Texturepack als ZIP exportiert.';}catch(error){report('#pack-error',error.message);$('#pack-import-status').textContent='Export fehlgeschlagen.';}finally{exportButton.disabled=false;}});
  actions.append(select,exportButton);
  if(pack.source==='imported'){
   const remove=document.createElement('button');remove.type='button';remove.className='text-button';remove.textContent='Lokales Pack entfernen';
   const used=cart.list().some(entry=>entry.packId===pack.id&&entry.packVersion===pack.version);remove.disabled=used||packBusy;remove.title=used?'Dieses Pack wird im Druckwarenkorb verwendet. Entferne zuerst die zugehörigen Einträge.':'';
   remove.addEventListener('click',async()=>{
    if(packBusy)return;packBusy=true;remove.disabled=true;report('#pack-error','');
    try{if(cart.list().some(entry=>entry.packId===pack.id&&entry.packVersion===pack.version))throw Error('Dieses Pack wird noch im Druckwarenkorb verwendet.');await manager.removePack(pack.id,pack.version);renderCache.clear();await refreshPacks();await updatePreview();updateCart();$('#pack-import-status').textContent='Lokales Texturepack entfernt.';}
    catch(error){report('#pack-error',error.message);}finally{packBusy=false;drawPackGallery();}
   });actions.append(remove);
  }
  body.append(title,copy,source,actions);card.append(image,body);return card;
 }));
}
async function refreshPacks(preferred=$('#pack').value){
 packs=await manager.listPacks();$('#pack').replaceChildren(...packs.map(pack=>{const option=document.createElement('option');option.value=packKey(pack);option.textContent=pack.name+' · '+pack.version+(pack.source==='imported'?' (lokal)':'');return option;}));
 if(packs.some(pack=>packKey(pack)===preferred))$('#pack').value=preferred;
 $('#pack').disabled=false;drawPackGallery();
 const locals=packs.filter(pack=>pack.source==='imported'),bytes=locals.reduce((sum,pack)=>sum+(pack.totalBytes||0),0);
 $('#pack-storage').textContent=locals.length+' lokale Pack-Versionen · '+(bytes/1024/1024).toLocaleString('de-DE',{maximumFractionDigits:1})+' MiB. Browserdaten löschen entfernt diese Packs. Sichere eigene Packs bei Bedarf als ZIP.';
 if(manager.warning)notice(manager.warning);
}
$('#pack-file').addEventListener('change',async()=>{
 const file=$('#pack-file').files[0];if(!file||packBusy)return;packBusy=true;$('#pack-file').disabled=true;report('#pack-error','');$('#pack-import-status').textContent='ZIP, Manifest und Grafiken werden geprüft …';drawPackGallery();
 try{const result=await manager.importPack(file);await refreshPacks(packKey(result));editingVersion=null;await updatePreview();updateCart();$('#pack-import-status').textContent=result.duplicate?'Diese Pack-Version ist bereits unverändert installiert.':result.name+' · '+result.version+' wurde lokal installiert.';}
 catch(error){report('#pack-error',error.message);$('#pack-import-status').textContent='Import fehlgeschlagen. Bereits installierte Packs bleiben erhalten.';}
 finally{packBusy=false;$('#pack-file').disabled=false;$('#pack-file').value='';drawPackGallery();}
});
window.addEventListener('pagehide',event=>{if(!event.persisted)manager.dispose();});
function syncSheetPages(preferred=Number($('#sheet-page').value)||0){
 if(!currentLayout)return;
 const selector=$('#sheet-page');selector.replaceChildren(...currentLayout.pages.map((page,index)=>{const option=document.createElement('option');option.value=index;option.textContent=(index+1)+(page.calibration?' · Test':'');return option;}));
 selector.value=String(Math.max(0,Math.min(preferred,currentLayout.pages.length-1)));
 const counts=currentLayout.pages.filter(page=>!page.calibration).map(page=>page.placements.length);
 $('#sheet-summary').textContent=`${currentLayout.totalLabels} Etiketten · ${currentLayout.pages.length} A4-Seite${currentLayout.pages.length===1?'':'n'} · Belegung: ${counts.slice(0,6).join(' / ')}${counts.length>6?' / …':''}${currentLayout.settings.calibration?' + Kalibrierung':''}`;
}
function selection(){if(!currentLayout||!selectedPlacementId)return null;try{return findPlacement(currentLayout,selectedPlacementId);}catch{return null;}}
function syncManualControls(){
 const enabled=$('#manual-mode').checked;$('#manual-controls').hidden=!enabled;$('#sheet-preview').classList.toggle('manual-editing',enabled&&Boolean(currentLayout));
 const selected=selection();
 $('#sheet-undo').disabled=!sheetEditor?.canUndo;$('#sheet-redo').disabled=!sheetEditor?.canRedo;
 $('#sheet-add-page').disabled=!sheetEditor||!currentLayout?.totalLabels;$('#sheet-reset').disabled=!sheetEditor;
 const target=$('#placement-page');target.replaceChildren(...(currentLayout?.pages||[]).map((page,index)=>{const option=document.createElement('option');option.value=index;option.textContent='Seite '+(index+1)+(page.calibration?' · Kalibrierung':'');option.disabled=Boolean(page.calibration);return option;}));
 for(const id of ['placement-page','placement-x','placement-y','apply-placement'])$('#'+id).disabled=!selected;
 $('#rotate-placement').disabled=!selected||selected.placement.config.shape!=='rectangle';
 if(selected){const p=selected.placement;$('#manual-selected').textContent=`${p.entry.data.name} · ${p.widthMm.toLocaleString('de-DE')} × ${p.heightMm.toLocaleString('de-DE')} mm · Seite ${selected.pageIndex+1} · ${p.rotated?'90°':'0°'}`;target.value=String(selected.pageIndex);$('#placement-x').value=Number(p.xMm.toFixed(2));$('#placement-y').value=Number(p.yMm.toFixed(2));}
 else{$('#manual-selected').textContent='Wähle ein Etikett in der Vorschau.';$('#placement-x').value='';$('#placement-y').value='';}
}
function redrawSheet(){if(currentLayout)drawSheet(currentLayout,Number($('#sheet-page').value)).catch(error=>report('#manual-error',error.message));}
function adoptManual(layout,pageIndex=Number($('#sheet-page').value)){
 currentLayout=layout;report('#manual-error','');syncSheetPages(pageIndex);syncManualControls();$('#export-pdf').disabled=pdfBusy||Boolean(drag);redrawSheet();
}
function applyManual(args){
 if(!sheetEditor)return;
 try{const next=sheetEditor.move(args);adoptManual(next,args.pageIndex??Number($('#sheet-page').value));}
 catch(error){report('#manual-error',error.message);syncManualControls();redrawSheet();}
}
function sheetPoint(event){const bounds=$('#sheet-preview').getBoundingClientRect(),page=currentLayout?.pages[Number($('#sheet-page').value)];if(!page)return null;return {x:(event.clientX-bounds.left)/bounds.width*page.widthMm,y:(event.clientY-bounds.top)/bounds.height*page.heightMm};}
function cancelDrag(){
 if(!drag)return;const previous=drag;drag=null;const target=$('#sheet-preview');target.classList.remove('manual-dragging');
 try{if(target.hasPointerCapture(previous.pointerId))target.releasePointerCapture(previous.pointerId);}catch{}
 if(currentLayout){target.getContext('2d').drawImage(previous.base,0,0);$('#export-pdf').disabled=pdfBusy;}
}
$('#sheet-preview').addEventListener('pointerdown',event=>{
 if(!$('#manual-mode').checked||!currentLayout||event.button!==0)return;
 const pageIndex=Number($('#sheet-page').value),page=currentLayout.pages[pageIndex],point=sheetPoint(event);if(!point||page.calibration)return;
 cancelDrag();const hit=[...page.placements].reverse().find(p=>point.x>=p.xMm&&point.x<=p.xMm+p.widthMm&&point.y>=p.yMm&&point.y<=p.yMm+p.heightMm);
 selectedPlacementId=hit?.placementId||null;report('#manual-error','');syncManualControls();
 if(!hit){redrawSheet();return;}
 event.preventDefault();const target=$('#sheet-preview'),base=document.createElement('canvas');base.width=target.width;base.height=target.height;base.getContext('2d').drawImage(target,0,0);
 const scaleX=target.width/page.widthMm,scaleY=target.height/page.heightMm,sprite=document.createElement('canvas');sprite.width=Math.max(1,Math.round(hit.widthMm*scaleX));sprite.height=Math.max(1,Math.round(hit.heightMm*scaleY));sprite.getContext('2d').drawImage(target,hit.xMm*scaleX,hit.yMm*scaleY,hit.widthMm*scaleX,hit.heightMm*scaleY,0,0,sprite.width,sprite.height);
 drag={pointerId:event.pointerId,placement:hit,pageIndex,offsetX:point.x-hit.xMm,offsetY:point.y-hit.yMm,xMm:hit.xMm,yMm:hit.yMm,base,sprite,scaleX,scaleY,error:null,moved:false};
 try{target.setPointerCapture(event.pointerId);}catch{}target.classList.add('manual-dragging');target.focus({preventScroll:true});$('#export-pdf').disabled=true;
});
$('#sheet-preview').addEventListener('pointermove',event=>{
 if(!drag||event.pointerId!==drag.pointerId)return;event.preventDefault();const point=sheetPoint(event);if(!point)return;
 const state=drag;state.xMm=Math.round(point.x-state.offsetX);state.yMm=Math.round(point.y-state.offsetY);state.moved=true;
 const args={placementId:state.placement.placementId,pageIndex:state.pageIndex,xMm:state.xMm,yMm:state.yMm};
 try{movePlacement(currentLayout,args);state.error=null;}catch(error){state.error=error.message;}
 const ctx=$('#sheet-preview').getContext('2d');ctx.drawImage(state.base,0,0);ctx.fillStyle='white';ctx.fillRect(state.placement.xMm*state.scaleX-1,state.placement.yMm*state.scaleY-1,state.sprite.width+2,state.sprite.height+2);
 ctx.globalAlpha=.85;ctx.drawImage(state.sprite,state.xMm*state.scaleX,state.yMm*state.scaleY);ctx.globalAlpha=1;ctx.strokeStyle=state.error?'#ad352a':'#235fa2';ctx.lineWidth=2;ctx.strokeRect(state.xMm*state.scaleX,state.yMm*state.scaleY,state.sprite.width,state.sprite.height);
 $('#placement-x').value=state.xMm;$('#placement-y').value=state.yMm;
});
$('#sheet-preview').addEventListener('pointerup',event=>{
 if(!drag||event.pointerId!==drag.pointerId)return;const state=drag;cancelDrag();
 if(state.moved&&state.error){report('#manual-error',state.error);syncManualControls();redrawSheet();}
 else if(state.moved)applyManual({placementId:state.placement.placementId,pageIndex:state.pageIndex,xMm:state.xMm,yMm:state.yMm});else redrawSheet();
});
for(const name of ['pointercancel','lostpointercapture'])$('#sheet-preview').addEventListener(name,()=>{if(drag){cancelDrag();syncManualControls();redrawSheet();}});
$('#apply-placement').addEventListener('click',()=>{
 cancelDrag();const selected=selection();if(!selected)return;
 for(const id of ['placement-x','placement-y'])if($('#'+id).value===''||!$('#'+id).checkValidity()){report('#manual-error','Bitte gültige Millimeterwerte eingeben.');return;}
 applyManual({placementId:selectedPlacementId,pageIndex:Number($('#placement-page').value),xMm:Number($('#placement-x').value),yMm:Number($('#placement-y').value)});
});
function rotateSelected(){cancelDrag();const selected=selection();if(selected&&selected.placement.config.shape==='rectangle')applyManual({placementId:selectedPlacementId,pageIndex:selected.pageIndex,rotated:!selected.placement.rotated});}
$('#rotate-placement').addEventListener('click',rotateSelected);
$('#sheet-preview').addEventListener('keydown',event=>{
 if(!$('#manual-mode').checked||!currentLayout)return;
 if(event.key==='Escape'){cancelDrag();selectedPlacementId=null;syncManualControls();redrawSheet();return;}
 const selected=selection();if(!selected)return;
 if(event.key.toLowerCase()==='r'){event.preventDefault();rotateSelected();return;}
 const directions={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]},delta=directions[event.key];if(!delta)return;
 event.preventDefault();cancelDrag();const step=event.altKey ? 0.1 : (event.shiftKey ? 5 : 1);
 applyManual({placementId:selectedPlacementId,pageIndex:selected.pageIndex,xMm:Number((selected.placement.xMm+delta[0]*step).toFixed(2)),yMm:Number((selected.placement.yMm+delta[1]*step).toFixed(2))});
});
$('#sheet-undo').addEventListener('click',()=>{cancelDrag();if(sheetEditor)adoptManual(sheetEditor.undo());});
$('#sheet-redo').addEventListener('click',()=>{cancelDrag();if(sheetEditor)adoptManual(sheetEditor.redo());});
$('#sheet-add-page').addEventListener('click',()=>{cancelDrag();if(!sheetEditor)return;try{const next=sheetEditor.addPage(),index=next.pages.findLastIndex(page=>!page.calibration);adoptManual(next,index);$('#placement-page').value=String(index);}catch(error){report('#manual-error',error.message);}});
$('#sheet-reset').addEventListener('click',()=>{cancelDrag();if(sheetEditor&&automaticLayout){selectedPlacementId=null;adoptManual(sheetEditor.reset(automaticLayout),0);}});

async function initialize(){
 try{await refreshPacks('watercolor-forest@1.0.0');if(cart.error)notice(cart.error);await updatePreview();updateCart();}
 catch(error){report('#form-error',error.message);$('#loading').hidden=true;notice('Texturepacks konnten nicht geladen werden. Bitte statischen Webserver und Pack-Dateien prüfen.');}
}
initialize();
