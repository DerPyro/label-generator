import test from 'node:test';
import assert from 'node:assert/strict';
import { PrintCartService } from '../src/cart.js';

const storage = () => { const values = new Map(); return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }; };
const entry = { id: 'label-1', data: { name: 'Super Silver Haze', year: 2026, sativa: 75, thc: 20, cbd: 3 }, packId: 'woodland', packVersion: '1.0.0', layoutId: 'rectangular', quantity: 3, widthMm: 60 };
test('Warenkorb speichert Konfiguration, lädt Stückzahlen und erlaubt Bearbeitung', () => {
  const local = storage();
  const cart = new PrintCartService({ storage: local });
  cart.add(entry);
  const restored = new PrintCartService({ storage: local });
  assert.equal(restored.list()[0].quantity, 3);
  assert.equal(restored.list()[0].data.indica, 25);
  assert.equal(restored.list()[0].packVersion, '1.0.0');
  restored.update('label-1', { quantity: 5, data: { ...entry.data, name: 'Euphoria' } });
  assert.equal(restored.list()[0].quantity, 5);
  assert.equal(restored.list()[0].data.name, 'Euphoria');
  const snapshot = restored.list(); snapshot[0].data.name = 'changed';
  assert.equal(restored.list()[0].data.name, 'Euphoria');
  restored.remove('label-1'); assert.equal(restored.list().length, 0);
  restored.add(entry); restored.clear(); assert.equal(new PrintCartService({ storage: local }).list().length, 0);
});
test('Ungültige Mengen, Größen, Daten und doppelte IDs werden abgefangen', () => {
  const cart = new PrintCartService({ storage: storage() });
  for (const patch of [{ quantity: 0 }, { quantity: 1.5 }, { quantity: 1000 }, { quantity: true }, { widthMm: true }, { widthMm: NaN }, { layoutId: '../ellipse' }, { data: { ...entry.data, cbd: 21 } }]) assert.throws(() => cart.add({ ...entry, ...patch }));
  cart.add(entry); assert.throws(() => cart.add(entry), /bereits/);
  assert.throws(() => cart.update('missing', {}), /nicht gefunden/);
});
test('Defekter Speicher wird gemeldet; fehlgeschlagene Mutationen verändern Zustand nicht', () => {
  const bad = new PrintCartService({ storage: { getItem: () => '{invalid', setItem() {} } });
  assert.match(bad.error, /nicht geladen/); assert.deepEqual(bad.list(), []);
  let fail = false; const local = storage();
  const cart = new PrintCartService({ storage: { ...local, setItem: (...args) => { if (fail) throw new Error('quota'); local.setItem(...args); } } });
  cart.add(entry); fail = true;
  assert.throws(() => cart.update('label-1', { quantity: 10 }), /nicht lokal gespeichert/);
  assert.equal(cart.list()[0].quantity, 3);
  assert.throws(() => cart.clear(), /nicht lokal gespeichert/); assert.equal(cart.list().length, 1);
});

test('Alte Format-Warenkörbe migrieren verlustfrei zu dynamischen Layoutreferenzen', () => {
  const local = storage();
  const { layoutId, ...legacy } = entry;
  local.setItem('label-generator-v3-print-cart', JSON.stringify({ schemaVersion: 1, entries: [{ ...legacy, format: 'circular' }] }));
  const cart = new PrintCartService({ storage: local });
  assert.equal(cart.error, null);
  assert.equal(cart.list()[0].layoutId, 'circular');
  assert.equal('format' in cart.list()[0], false);
  assert.equal(cart.list()[0].quantity, entry.quantity);
  cart.update(entry.id, { layoutId: 'panorama-vista', widthMm: 95 });
  const saved = JSON.parse(local.getItem('label-generator-v3-print-cart'));
  assert.equal(saved.schemaVersion, 2);
  assert.equal(saved.entries[0].layoutId, 'panorama-vista');
  assert.equal('shape' in saved.entries[0], false);
  assert.deepEqual(new PrintCartService({ storage: local }).list(), cart.list());
  cart.add({ ...entry, id: 'band', layoutId: 'slim-band' });
  assert.deepEqual(cart.list().map(item => item.layoutId), ['panorama-vista', 'slim-band']);
});
