import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseStrainsCsv, searchStrains, getStrainValues } from '../src/strains.js';

test('parses the complete mirrored catalog with stable row ids', async () => {
  const csv = await readFile(new URL('../data/strains.csv', import.meta.url), 'utf8');
  const rows = parseStrainsCsv(csv);
  assert.equal(rows.length, 2464);
  assert.equal(rows[0].id, 'strain-1');
  assert.equal(rows[0].shortName, 'Original Auto OG Kush');
  assert.equal(rows[0].brand, 'FastBuds');
  assert.equal(new Set(rows.map(row => row.name)).size, rows.length);
});

test('handles BOM, CRLF, escaped quotes, commas and multiline fields', () => {
  const rows = parseStrainsCsv('\uFEFFName,ShortName,Brand,Typ,THC,CBD,Sativa,Indica,URL\r\n"Foo, ""Bar""\nBaz",Foo,Brand,F,5,2,60,40,url\r\n');
  assert.equal(rows[0].name, 'Foo, "Bar"\nBaz');
  assert.equal(rows[0].brand, 'Brand');
});

test('search matches accent-insensitive name and brand tokens and keeps stable ties', () => {
  const rows = parseStrainsCsv('Name,ShortName,Brand,Typ,THC,CBD,Sativa,Indica,URL\nCafé Kush,Cafe Kush,Élite Seeds,F,5,2,60,40,\nKush Two,Kush Two,Elite Seeds,F,5,2,50,50,\n');
  assert.equal(searchStrains(rows, 'elite cafe').length, 1);
  assert.equal(searchStrains(rows, 'cafe')[0].name, 'Café Kush');
  assert.deepEqual(searchStrains(rows, 'kush', { limit: 1 }).length, 1);
});

test('maps nonblank autofill values and warns when a catalog value exceeds editor limits', () => {
  const { data, warnings } = getStrainValues({ name: 'Full Name', shortName: 'Short Name', brand: 'Brand', thc: '41', cbd: '23', sativa: '60', indica: '40' });
  assert.deepEqual(data, { name: 'Short Name', producer: 'Brand', thc: 40, cbd: 20, sativa: 60 });
  assert.equal(warnings.length, 2);
  assert.equal(getStrainValues({ name: 'Only Name', thc: '', cbd: '' }).data.thc, undefined);
});

test('unknown and inconsistent ratios are left untouched with a German warning', () => {
  const unknown = getStrainValues({ name: 'Unknown', sativa: '0', indica: '0' });
  assert.equal(unknown.data.sativa, undefined);
  assert.match(unknown.warnings[0], /Genetik.*nicht eindeutig.*manuell prüfen/u);
  const inconsistent = getStrainValues({ name: 'Off', sativa: '45', indica: '40' });
  assert.equal(inconsistent.data.sativa, undefined);
  assert.match(inconsistent.warnings[0], /nicht eindeutig/u);
});

test('accepts pure sativa and derives the complement when one ratio side is missing', () => {
  assert.equal(getStrainValues({ name: 'Pure', sativa: '100', indica: '0' }).data.sativa, 100);
  assert.equal(getStrainValues({ name: 'One side', sativa: '', indica: '30' }).data.sativa, 70);
  assert.equal(getStrainValues({ name: 'Other side', sativa: '25', indica: '' }).data.sativa, 25);
});

test('rejects missing Name headers and unclosed quoted fields in German', () => {
  assert.throws(() => parseStrainsCsv('ShortName,Brand\nFoo,Bar'), /keine Spalte „Name“/u);
  assert.throws(() => parseStrainsCsv('Name,Brand\n"Foo,Bar'), /nicht geschlossenes Anführungszeichen/u);
});
