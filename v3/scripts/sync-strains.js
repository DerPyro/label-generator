import { copyFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '../..');
const targetDir = resolve(scriptDir, '../data');
await mkdir(targetDir, { recursive: true });
await copyFile(resolve(repoRoot, 'strains.csv'), resolve(targetDir, 'strains.csv'));
console.log('Synchronized strains.csv into v3/data.');
