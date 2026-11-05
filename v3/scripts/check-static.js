import { readFile, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { validateManifest, resolvePackConfig } from '../src/texturepacks.js';
const root=new URL('../',import.meta.url);
const catalog=JSON.parse(await readFile(new URL('texturepacks/catalog.json',root),'utf8'));
let pngs=0;
for(const item of catalog.packs){
 const manifestUrl=new URL('texturepacks/'+item.manifest,root);
 const manifest=validateManifest(JSON.parse(await readFile(manifestUrl,'utf8')));
 for(const layout of manifest.layouts){
  const config=resolvePackConfig(manifest,layout.id,new URL('./',manifestUrl));
  const paths=[config.base.path,...['genetics','thc','cbd'].flatMap(id=>config[id].map(x=>x.path))];
  for(const path of paths){const png=await readFile(new URL(path));if(png.subarray(1,4).toString()!=='PNG'||png.readUInt32BE(16)!==config.width||png.readUInt32BE(20)!==config.height||png[25]!==6)throw Error('Falsches PNG-Format: '+path);pngs++;}
  await readFile(new URL(config.typography.fontPath));
  if(layout.preview)await readFile(new URL(layout.preview,new URL('./',manifestUrl)));
 }
 await readFile(new URL(manifest.preview,new URL('./',manifestUrl)));
}
for(const file of await readdir(new URL('src/',root))){if(!file.endsWith('.js'))continue;const result=spawnSync(process.execPath,['--check',new URL('src/'+file,root).pathname.replace(/^\/([A-Za-z]:)/,'$1')],{encoding:'utf8'});if(result.status!==0)throw Error(result.stderr);}
console.log(`${catalog.packs.length} validierte Packs, ${pngs} RGBA-Sprites, lokale Fonts und Modulsyntax geprüft. Kein Build erforderlich.`);
