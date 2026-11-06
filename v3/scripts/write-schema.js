import { writeFile, mkdir } from 'node:fs/promises';
import { manifestSchema } from '../src/manifest-schema.js';
await mkdir(new URL('../schemas/',import.meta.url),{recursive:true});
await writeFile(new URL('../schemas/texturepack.schema.json',import.meta.url),JSON.stringify(manifestSchema,null,2)+'\n');
