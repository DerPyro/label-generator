import { readFile,readdir,writeFile } from 'node:fs/promises';
import path from 'node:path';
import { validateManifest } from '../src/texturepacks.js';
import { buildPackArchive,inspectPackArchive } from '../src/pack-archive.js';
const directory=process.argv[2];
if(!directory){console.error('Aufruf: node v3/scripts/validate-pack.js PACKVERZEICHNIS [--zip AUSGABE.zip]');process.exitCode=1;}
else try{
 const root=path.resolve(directory),manifest=validateManifest(JSON.parse(await readFile(path.join(root,'pack.json'),'utf8'))),files={};
 async function walk(dir,prefix=''){
  for(const entry of await readdir(dir,{withFileTypes:true})){
   if(entry.isSymbolicLink())throw Error('Symlinks sind nicht erlaubt.');
   const name=prefix+entry.name;
   if(entry.isDirectory())await walk(path.join(dir,entry.name),name+'/');
   else files[name]=new Uint8Array(await readFile(path.join(dir,entry.name)));
  }
 }
 await walk(root);const zip=buildPackArchive(manifest,files),result=await inspectPackArchive(zip);
 const index=process.argv.indexOf('--zip');if(index>=0){if(!process.argv[index+1])throw Error('ZIP-Ausgabepfad fehlt.');await writeFile(process.argv[index+1],zip);}
 console.log(`${manifest.name}: compatibilityVersion 2, ${manifest.layouts.length} Layouts, ${Object.keys(result.files).length} Dateien, ZIP-Roundtrip gültig. Browser-Dekodierung und visuelle Prüfung zusätzlich ausführen.`);
}catch(error){console.error(error.message);process.exitCode=1;}
