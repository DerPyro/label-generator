import test from 'node:test';
import assert from 'node:assert/strict';
import { IndexedDBPackStore, MemoryPackStore } from '../src/pack-store.js';

const record = (version = '1.0.0') => ({
  manifest: { id: 'test-pack', version, name: 'Test' },
  files: { 'layer.png': new Uint8Array([1, 2, 3]) }, totalBytes: 3,
  importedAt: '2026-11-05T00:00:00Z', contentHash: 'abc123',
});

test('Memory store isolates versions, immutable reimports and deletion', async () => {
  const store = new MemoryPackStore();
  assert.equal(await store.get('test-pack', '1.0.0'), null);
  await store.put(record()); await store.put(record('2.0.0'));
  assert.equal((await store.list()).length, 2);
  await assert.rejects(store.put({ ...record(), contentHash: 'new' }), /anderem Inhalt/);
  assert.equal((await store.get('test-pack', '1.0.0')).contentHash, 'abc123');
  await store.put({ ...record(), importedAt: 'different-import-time' });
  assert.equal((await store.get('test-pack', '1.0.0')).importedAt, record().importedAt);
  assert.equal((await store.get('test-pack', '2.0.0')).contentHash, 'abc123');
  await store.remove('test-pack', '1.0.0'); await store.remove('test-pack', '1.0.0');
  assert.equal(await store.get('test-pack', '1.0.0'), null);
  assert.equal((await store.list()).length, 1);
});

test('Caller edits cannot mutate stored manifests, files or returned results', async () => {
  const store = new MemoryPackStore(); const source = record();
  const result = await store.put(source);
  source.files['layer.png'][0] = 99; source.manifest.name = 'Edited';
  result.files['layer.png'][1] = 99;
  const fetched = await store.get('test-pack', '1.0.0');
  assert.deepEqual(fetched.files['layer.png'], new Uint8Array([1, 2, 3]));
  assert.equal(fetched.manifest.name, 'Test');
  fetched.manifest.name = 'Other'; const listed = await store.list();
  listed[0].files['layer.png'][2] = 99;
  assert.deepEqual((await store.get('test-pack', '1.0.0')).files['layer.png'], new Uint8Array([1, 2, 3]));
  assert.equal((await store.get('test-pack', '1.0.0')).manifest.name, 'Test');
});

test('Invalid IDs, versions and records are rejected without replacing prior data', async () => {
  const store = new MemoryPackStore(); await store.put(record());
  for (const invalid of [null, { ...record(), files: { 'bad.png': 'data' } }, { ...record(), totalBytes: -1 }, { ...record(), manifest: { id: 'test@pack', version: '1.0.0' } }]) {
    await assert.rejects(store.put(invalid), /Texturspeicher/);
  }
  await assert.rejects(store.get('test-pack', '../1.0.0'), /Ungültige/);
  await assert.rejects(store.remove('test@pack', '1.0.0'), /Ungültige/);
  assert.equal((await store.list()).length, 1);
});

test('IndexedDB opening is lazy and unavailable environments have a useful error', async () => {
  const store = new IndexedDBPackStore({ indexedDB: null });
  await assert.rejects(store.list(), /IndexedDB ist hier nicht verfügbar/);
  let calls = 0;
  const failed = new IndexedDBPackStore({ indexedDB: { open() { calls++; throw Object.assign(new Error(), { name: 'SecurityError' }); } } });
  assert.equal(calls, 0);
  await assert.rejects(failed.list(), /erlaubt keinen lokalen Texturspeicher/);
  await assert.rejects(failed.list(), /erlaubt keinen lokalen Texturspeicher/);
  assert.equal(calls, 2, 'Failed opens can be retried');
});

test('Blocked IndexedDB opens reject and close a late successful connection', async () => {
  let request; let closed = false;
  const store = new IndexedDBPackStore({ indexedDB: { open() { request = {}; queueMicrotask(() => request.onblocked()); return request; } } });
  await assert.rejects(store.list(), /anderer Tab blockiert/);
  request.result = { close() { closed = true; } }; request.onsuccess();
  assert.equal(closed, true);
});

// This controllable adapter exercises request-success vs transaction-complete,
// and abort/QuotaExceededError paths. Real persistence is checked in the browser.
function controlledDatabase() {
  const transactions = [];
  const database = {
    transaction(store, mode) {
      assert.equal(store, 'packs');
      const requests = [];
      const request = () => { const item = {}; requests.push(item); return item; };
      const transaction = { mode, requests, objectStore() { return {
        put(value) { transaction.value = value; return request(); },
        get() { return request(); }, getAll() { return request(); }, delete() { return request(); },
      }; }, abort() { transaction.onabort(); } };
      transactions.push(transaction); return transaction;
    }, close() {},
  };
  const indexedDB = { open(name, version) {
    assert.equal(version, 1);
    const request = { result: database };
    queueMicrotask(() => request.onsuccess()); return request;
  } };
  return { transactions, indexedDB };
}

async function transactionReady(transactions) {
  for (let i = 0; i < 10 && !transactions.length; i++) await Promise.resolve();
  assert.equal(transactions.length, 1); return transactions[0];
}

test('IndexedDB put resolves only after commit and snapshots caller bytes before opening', async () => {
  const { indexedDB, transactions } = controlledDatabase();
  const store = new IndexedDBPackStore({ indexedDB }); const source = record();
  let resolved = false;
  const pending = store.put(source).then(value => { resolved = true; return value; });
  source.files['layer.png'][0] = 88;
  const tx = await transactionReady(transactions);
  tx.requests[0].result = undefined; tx.requests[0].onsuccess();
  assert.equal(tx.mode, 'readwrite'); assert.equal(tx.value.key, 'test-pack@1.0.0');
  assert.equal(tx.value.files['layer.png'][0], 1);
  tx.requests[1].result = tx.value.key; tx.requests[1].onsuccess(); await Promise.resolve();
  assert.equal(resolved, false, 'Request success does not yet guarantee persistence');
  tx.oncomplete(); assert.equal((await pending).manifest.id, 'test-pack');
});

test('Quota failures abort and report storage capacity rather than success', async () => {
  const { indexedDB, transactions } = controlledDatabase();
  const store = new IndexedDBPackStore({ indexedDB });
  const pending = store.put(record()); const rejected = assert.rejects(pending, /lokale Speicher ist voll/);
  const tx = await transactionReady(transactions);
  tx.requests[0].result = undefined; tx.requests[0].onsuccess();
  tx.requests[1].error = Object.assign(new Error('quota'), { name: 'QuotaExceededError' });
  tx.requests[1].onerror(); await rejected;
});

test('IndexedDB rejects changed contents atomically and preserves the existing record', async () => {
  const { indexedDB, transactions } = controlledDatabase();
  const store = new IndexedDBPackStore({ indexedDB });
  const original = record(); const pending = store.put({ ...record(), contentHash: 'different' });
  const rejected = assert.rejects(pending, /anderem Inhalt/);
  const tx = await transactionReady(transactions);
  tx.requests[0].result = { key: 'test-pack@1.0.0', ...original }; tx.requests[0].onsuccess();
  await rejected;
  assert.equal(tx.requests.length, 1, 'No write request was issued');
  assert.equal(tx.value, undefined);
  assert.equal(tx.requests[0].result.contentHash, 'abc123');
});

test('IndexedDB identical reimports return the old record and do not overwrite metadata', async () => {
  const { indexedDB, transactions } = controlledDatabase();
  const store = new IndexedDBPackStore({ indexedDB });
  const pending = store.put({ ...record(), importedAt: 'new-time' });
  const tx = await transactionReady(transactions);
  tx.requests[0].result = { key: 'test-pack@1.0.0', ...record() }; tx.requests[0].onsuccess();
  assert.equal(tx.requests.length, 1); tx.oncomplete();
  assert.equal((await pending).importedAt, record().importedAt);
});
