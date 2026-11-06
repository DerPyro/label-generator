import { readFile, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { DEFAULT_TYPOGRAPHY } from '../src/config.js';
import { manifestSchema } from '../src/manifest-schema.js';
import { validateManifest, resolvePackConfig } from '../src/texturepacks.js';
const root=new URL('../',import.meta.url);
const catalog=JSON.parse(await readFile(new URL('texturepacks/catalog.json',root),'utf8'));
assert.equal(catalog.compatibilityVersion,2);
assert.deepEqual(JSON.parse(await readFile(new URL('schemas/texturepack.schema.json',root),'utf8')),manifestSchema);
let pngs=0;
for(const item of catalog.packs){
 const manifestUrl=new URL('texturepacks/'+item.manifest,root);
 const manifest=validateManifest(JSON.parse(await readFile(manifestUrl,'utf8')));
 if(manifest.id==='woodland')assert.deepEqual(DEFAULT_TYPOGRAPHY,manifest.layouts.find(layout=>layout.id==='rectangular').typography);
 for(const layout of manifest.layouts){
  const config=resolvePackConfig(manifest,layout.id,new URL('./',manifestUrl));
  const paths=[config.base.path,...['genetics','thc','cbd'].flatMap(id=>config[id].map(x=>x.path)),...(config.foreground?(Array.isArray(config.foreground)?config.foreground:[config.foreground]).map(x=>x.path):[])];
  for(const path of paths){const png=await readFile(new URL(path));if(png.subarray(1,4).toString()!=='PNG'||png.readUInt32BE(16)!==config.width||png.readUInt32BE(20)!==config.height||png[25]!==6)throw Error('Falsches PNG-Format: '+path);pngs++;}
  for(const font of config.fonts)await readFile(new URL(font.path));
  for(const element of [...config.typography.decorations,...config.typography.fields.flatMap(f=>f.background?[f.background]:[])])if(element.asset)await readFile(new URL(element.asset));
  if(layout.preview)await readFile(new URL(layout.preview,new URL('./',manifestUrl)));
 }
 await readFile(new URL(manifest.preview,new URL('./',manifestUrl)));
}
for(const file of await readdir(new URL('src/',root))){if(!file.endsWith('.js'))continue;const result=spawnSync(process.execPath,['--check',new URL('src/'+file,root).pathname.replace(/^\/([A-Za-z]:)/,'$1')],{encoding:'utf8'});if(result.status!==0)throw Error(result.stderr);}
console.log(`${catalog.packs.length} validierte Packs, ${pngs} RGBA-Sprites, lokale Fonts und Modulsyntax geprüft. Kein Build erforderlich.`);
