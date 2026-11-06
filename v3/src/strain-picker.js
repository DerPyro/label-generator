import { t, locale } from './i18n.js';
import { parseStrainsCsv, searchStrains, getStrainValues } from './strains.js';

/** Local, keyboard-accessible combobox; selection is explicit, never while typing. */
export function mountStrainPicker(root, onSelect) {
 const input=root.querySelector('#strain-search'),list=root.querySelector('#strain-results'),toggle=root.querySelector('#strain-toggle'),status=root.querySelector('#strain-status');
 let catalog=[],alphabetical=[],matches=[],active=-1,opened=false,selectedName=null,failed=false;
 const close=()=>{opened=false;list.hidden=true;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');active=-1;};
 function highlight(index){
  active=index;
  for(const [i,option]of [...list.children].entries())option.setAttribute('aria-selected',String(i===active));
  if(active>=0){const option=list.children[active];input.setAttribute('aria-activedescendant',option.id);option.scrollIntoView({block:'nearest'});}
  else input.removeAttribute('aria-activedescendant');
 }
 function show(){
  if(input.disabled)return;
  const query=input.value.trim(),found=query?searchStrains(catalog,query,{limit:catalog.length}):alphabetical;
  matches=found.slice(0,50);active=-1;input.removeAttribute('aria-activedescendant');
  list.replaceChildren(...matches.map(row=>{
   const option=document.createElement('li');option.id='option-'+row.id;option.dataset.strainId=row.id;option.setAttribute('role','option');option.setAttribute('aria-selected','false');
   const name=document.createElement('strong'),meta=document.createElement('span');name.textContent=row.name;
   meta.textContent=t(`${row.brand}${row.thc!==''?' · THC '+row.thc+' %':''}${row.cbd!==''?' · CBD '+row.cbd+' %':''}`);
   option.append(name,meta);return option;
  }));
  if(!matches.length){const empty=document.createElement('li');empty.className='strain-empty';empty.setAttribute('role','presentation');empty.textContent=t('Keine passende Sorte gefunden.');list.append(empty);}
  status.textContent=query?(found.length>50?t(`50 von ${found.length} Treffern – Suche weiter eingrenzen.`):t(`${found.length} Treffer.`)):t(`${catalog.length.toLocaleString(locale())} Sorten verfügbar. Nach Name oder Seed-Produzent suchen.`);
  opened=true;list.hidden=false;input.setAttribute('aria-expanded','true');
 }
 function choose(row){
  if(!row)return;
  selectedName=row.name;input.value=row.name;close();status.textContent=t(`${row.name} übernommen. Alle Angaben bleiben bearbeitbar.`);
  onSelect(getStrainValues(row),row);
 }
 input.addEventListener('input',()=>{selectedName=null;show();});
 input.addEventListener('focus',show);
 input.addEventListener('keydown',event=>{
  if(event.key==='ArrowDown'||event.key==='ArrowUp'){
   event.preventDefault();if(!opened)show();if(!matches.length)return;
   highlight(active<0?(event.key==='ArrowDown'?0:matches.length-1):(active+(event.key==='ArrowDown'?1:-1)+matches.length)%matches.length);
  }else if(event.key==='Enter'){
   event.preventDefault();
   const exact=catalog.find(row=>row.name.toLocaleLowerCase()===input.value.trim().toLocaleLowerCase());
   if(opened&&active>=0)choose(matches[active]);else if(exact)choose(exact);else if(opened&&matches.length===1)choose(matches[0]);
  }else if(event.key==='Escape'){event.preventDefault();close();}
  else if(event.key==='Tab')close();
 });
 toggle.addEventListener('click',()=>{if(opened)close();else{input.focus();show();}});
 // Keep DOM focus on the combobox until the click has selected its option.
 list.addEventListener('pointerdown',event=>event.preventDefault());
 list.addEventListener('click',event=>{const option=event.target.closest('[data-strain-id]');if(option)choose(matches.find(row=>row.id===option.dataset.strainId));});
 root.addEventListener('focusout',event=>{if(!root.contains(event.relatedTarget))close();});
 document.addEventListener('pointerdown',event=>{if(!root.contains(event.target))close();});
 const ready=(async()=>{
  try{
   const response=await fetch(new URL('../data/strains.csv',import.meta.url));if(!response.ok)throw Error('CSV nicht erreichbar.');
   catalog=parseStrainsCsv(await response.text());if(!catalog.length)throw Error('CSV enthält keine Sorten.');
   alphabetical=[...catalog].sort((a,b)=>a.name.localeCompare(b.name,'de'));
   input.disabled=false;toggle.disabled=false;input.placeholder=t('Sortenname oder Seed-Produzent …');
   status.textContent=t(`${catalog.length.toLocaleString(locale())} Sorten verfügbar. Auswahl übernimmt die hinterlegten Werte.`);
   if(document.activeElement===input)show();
  }catch{failed=true;status.textContent=t('Die Sortenliste konnte nicht geladen werden. Du kannst alle Etikettenangaben weiterhin manuell eingeben.');}
 })();
 return {ready,refreshLanguage(){
 input.placeholder=t(catalog.length?'Sortenname oder Seed-Produzent …':'Lade Sorten …');
 if(opened){show();return;}
 if(failed)status.textContent=t('Die Sortenliste konnte nicht geladen werden. Du kannst alle Etikettenangaben weiterhin manuell eingeben.');
 else if(selectedName)status.textContent=t(`${selectedName} übernommen. Alle Angaben bleiben bearbeitbar.`);
 else if(catalog.length)status.textContent=t(`${catalog.length.toLocaleString(locale())} Sorten verfügbar. Auswahl übernimmt die hinterlegten Werte.`);
 else status.textContent=t('Sortenliste wird geladen …');
 },clear(){selectedName=null;input.value='';close();if(catalog.length)status.textContent=t(`${catalog.length.toLocaleString(locale())} Sorten verfügbar. Auswahl übernimmt die hinterlegten Werte.`);}};
}

