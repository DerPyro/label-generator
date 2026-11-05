const STORE = 'packs';
const DB_VERSION = 1;
const TIMEOUT_MS = 10000;

function packKey(id, version) {
  if (typeof id !== 'string' || !/^[a-z][a-z0-9-]{0,63}$/.test(id) ||
      typeof version !== 'string' || !/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/.test(version)) {
    throw new Error('Texturspeicher: Ungültige Paket-ID oder Version.');
  }
  return `${id}@${version}`;
}

function clone(value) {
  return value === undefined ? undefined : structuredClone(value);
}

function snapshot(record) {
  if (!record || typeof record !== 'object' || !record.manifest || !record.files ||
      typeof record.files !== 'object' || Array.isArray(record.files)) {
    throw new Error('Texturspeicher: Paketdaten oder Dateien fehlen.');
  }
  const key = packKey(record.manifest.id, record.manifest.version);
  for (const file of Object.values(record.files)) {
    if (!(file instanceof Uint8Array)) throw new Error('Texturspeicher: Dateien müssen als Uint8Array vorliegen.');
  }
  if (!Number.isSafeInteger(record.totalBytes) || record.totalBytes < 0 ||
      typeof record.contentHash !== 'string' || !record.contentHash ||
      !['string', 'number'].includes(typeof record.importedAt)) {
    throw new Error('Texturspeicher: Unvollständige Paket-Metadaten.');
  }
  // Take ownership before the first await, so later caller edits cannot alter a write.
  return { key, ...clone({ manifest: record.manifest, files: record.files,
    totalBytes: record.totalBytes, importedAt: record.importedAt, contentHash: record.contentHash }) };
}

function publicRecord(record) {
  if (!record) return null;
  const { key, ...data } = record;
  return clone(data);
}

function storeError(error, action) {
  if (error?.name === 'PackStoreError') return error;
  const detail = error?.name === 'QuotaExceededError'
    ? 'Der lokale Speicher ist voll. Bitte lösche ein anderes Texturepack oder gib Browserspeicher frei.'
    : error?.name === 'SecurityError' || error?.name === 'NotAllowedError'
      ? 'Der Browser erlaubt keinen lokalen Texturspeicher. Bitte prüfe die Website- und Datenschutzeinstellungen.'
      : `${action} ist fehlgeschlagen. Bitte lade die Seite neu und versuche es erneut.`;
  const result = new Error(`Texturspeicher: ${detail}`, { cause: error });
  result.name = 'PackStoreError';
  return result;
}

function messageError(message) {
  const error = new Error(`Texturspeicher: ${message}`);
  error.name = 'PackStoreError';
  return error;
}

/** Durable local packs. Opening is lazy; each mutation uses one atomic transaction. */
export class IndexedDBPackStore {
  constructor({ dbName = 'label-generator-v3-texturepacks', indexedDB = globalThis.indexedDB } = {}) {
    this.dbName = dbName;
    this.indexedDB = indexedDB;
    this.database = null;
    this.opening = null;
  }

  async open() {
    if (this.database) return this.database;
    if (this.opening) return this.opening;
    if (!this.indexedDB || typeof this.indexedDB.open !== 'function') {
      throw messageError('IndexedDB ist hier nicht verfügbar. Bitte öffne die Anwendung in einem Browser mit lokalem Speicher.');
    }
    const opening = new Promise((resolve, reject) => {
      let settled = false;
      let request;
      const fail = error => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(error);
      };
      const timer = setTimeout(() => fail(messageError('Das Öffnen dauert zu lange. Bitte schließe andere Tabs dieser Anwendung und versuche es erneut.')), TIMEOUT_MS);
      try {
        request = this.indexedDB.open(this.dbName, DB_VERSION);
        request.onupgradeneeded = () => {
          try {
            if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE, { keyPath: 'key' });
          } catch (error) {
            try { request.transaction?.abort(); } catch { /* Already aborted. */ }
            fail(storeError(error, 'Das Einrichten des Speichers'));
          }
        };
        request.onblocked = () => fail(messageError('Ein anderer Tab blockiert den Speicher. Bitte schließe andere Tabs dieser Anwendung und versuche es erneut.'));
        request.onerror = () => fail(storeError(request.error, 'Das Öffnen des Speichers'));
        request.onsuccess = () => {
          const database = request.result;
          if (settled) { database.close(); return; }
          settled = true;
          clearTimeout(timer);
          database.onversionchange = () => {
            database.close();
            if (this.database === database) this.database = null;
          };
          database.onclose = () => { if (this.database === database) this.database = null; };
          this.database = database;
          resolve(database);
        };
      } catch (error) { fail(storeError(error, 'Das Öffnen des Speichers')); }
    });
    this.opening = opening;
    try { return await opening; }
    finally { if (this.opening === opening) this.opening = null; }
  }

  async transact(mode, operation) {
    const database = await this.open();
    return new Promise((resolve, reject) => {
      let transaction;
      let result;
      let failure;
      let settled = false;
      const finish = error => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (error) reject(storeError(error, mode === 'readwrite' ? 'Das Speichern der Änderung' : 'Das Lesen der Pakete'));
        else resolve(result);
      };
      const timer = setTimeout(() => {
        try { transaction?.abort(); } catch { /* Transaction may already be closed. */ }
        finish(messageError('Der Speicher antwortet nicht rechtzeitig. Bitte lade die Seite neu und versuche es erneut.'));
      }, TIMEOUT_MS);
      try {
        transaction = database.transaction(STORE, mode);
        transaction.oncomplete = () => finish(failure);
        transaction.onerror = () => { failure ||= transaction.error; };
        transaction.onabort = () => finish(failure || transaction.error || new Error('Transaktion abgebrochen'));
        const controls = { success: value => { result = value; }, error: error => {
          failure = error || new Error('Datei konnte nicht gespeichert werden');
          // Prevent partial writes even if an injected request does not auto-abort.
          try { transaction.abort(); } catch { finish(failure); }
        } };
        const request = operation(transaction.objectStore(STORE), controls);
        if (request) {
          request.onsuccess = () => controls.success(request.result);
          request.onerror = () => controls.error(request.error);
        }
      } catch (error) {
        try { transaction?.abort(); } catch { /* Abort is best effort after synchronous errors. */ }
        finish(error);
      }
    });
  }

  async list() {
    const records = await this.transact('readonly', store => store.getAll());
    return records.sort((a, b) => a.key.localeCompare(b.key)).map(publicRecord);
  }

  async get(id, version) {
    const key = packKey(id, version);
    return publicRecord(await this.transact('readonly', store => store.get(key)));
  }

  async put(record) {
    const owned = snapshot(record);
    const saved = await this.transact('readwrite', (store, controls) => {
      // A single readwrite transaction serializes this check across browser tabs.
      const read = store.get(owned.key);
      read.onerror = () => controls.error(read.error);
      read.onsuccess = () => {
        try {
          const existing = read.result;
          if (existing) {
            if (existing.contentHash !== owned.contentHash) controls.error(messageError('Diese Paket-ID und Version sind bereits mit anderem Inhalt gespeichert. Bitte erhöhe die Paketversion.'));
            else controls.success(existing);
            return;
          }
          const write = store.put(owned);
          write.onerror = () => controls.error(write.error);
          write.onsuccess = () => controls.success(owned);
        } catch (error) { controls.error(error); }
      };
    });
    return publicRecord(saved);
  }

  async remove(id, version) {
    const key = packKey(id, version);
    await this.transact('readwrite', store => store.delete(key));
  }

  close() {
    this.database?.close();
    this.database = null;
  }
}

/** Explicit test injection only; production uses IndexedDBPackStore. */
export class MemoryPackStore {
  constructor() { this.records = new Map(); }
  async list() {
    return [...this.records.values()].sort((a, b) => a.key.localeCompare(b.key)).map(publicRecord);
  }
  async get(id, version) { return publicRecord(this.records.get(packKey(id, version))); }
  async put(record) {
    const owned = snapshot(record);
    const existing = this.records.get(owned.key);
    if (existing) {
      if (existing.contentHash !== owned.contentHash) throw messageError('Diese Paket-ID und Version sind bereits mit anderem Inhalt gespeichert. Bitte erhöhe die Paketversion.');
      return publicRecord(existing);
    }
    this.records.set(owned.key, owned);
    return publicRecord(owned);
  }
  async remove(id, version) { this.records.delete(packKey(id, version)); }
}
