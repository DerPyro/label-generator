// Normalize PNG encoding only. Preserve every RGB/alpha sample and color profile.
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { decodePng, encodeRgba } from './normalize-watercolor.js';
const root = new URL('../texturepacks/natural-boho/', import.meta.url);
let count = 0, before = 0, after = 0;
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const url = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory);
    if (entry.isDirectory()) await walk(url);
    else if (entry.name.endsWith('.png')) {
      const bytes = await readFile(url), image = decodePng(bytes), output = encodeRgba(image);
      if (!decodePng(output).pixels.equals(image.pixels)) throw Error('Pixeländerung: ' + url);
      await writeFile(url, output); count++; before += bytes.length; after += output.length;
      console.log(url.pathname.split('/natural-boho/')[1] + ': ' + image.width + ' × ' + image.height + ' RGBA');
    }
  }
}
await walk(root);
console.log(`${count} PNGs normalisiert; ${before} → ${after} Bytes, Bildinhalte unverändert.`);
