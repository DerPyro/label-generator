import { validateSpriteOrder } from './sprite-order.js';
import { normalizeInput } from './model.js';

const clone = value => JSON.parse(JSON.stringify(value));
const browserStorage = () => { try { return globalThis.localStorage; } catch { return undefined; } };
export function validateCartEntry(value) {
  if (!value || typeof value !== 'object') throw new Error('Ungültiger Warenkorbeintrag.');
  const { id, packId, packVersion } = value;
  // Older v3 carts used the two format names as identifiers. Preserve those
  // identifiers during migration; the pack remains the source of geometry.
  const layoutId = value.layoutId ?? (['rectangular', 'circular'].includes(value.format) ? value.format : undefined);
  if (typeof id !== 'string' || !id || id.length > 150) throw new Error('Ungültige Eintrags-ID.');
  if (typeof packId !== 'string' || !/^[a-z0-9][a-z0-9_-]{0,79}$/i.test(packId) || typeof packVersion !== 'string' || !packVersion || packVersion.length > 80) throw new Error('Texturepack und Version fehlen.');
  if (typeof layoutId !== 'string' || !/^[a-z][a-z0-9-]{0,63}$/.test(layoutId)) throw new Error('Ungültige Layout-ID.');
  if (typeof value.quantity === 'boolean' || typeof value.widthMm === 'boolean') throw new Error('Stückzahl und Größe müssen Zahlen sein.');
  const quantity = Number(value.quantity ?? 1);
  const widthMm = Number(value.widthMm ?? 60);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) throw new Error('Die Stückzahl muss zwischen 1 und 999 liegen.');
  if (!Number.isFinite(widthMm) || widthMm < 1 || widthMm > 300) throw new Error('Die Etikettengröße muss zwischen 1 und 300 mm liegen.');
  return { id, data: normalizeInput(value.data), packId, packVersion, layoutId, quantity, widthMm, ...(value.spriteOrder === undefined ? {} : {spriteOrder: validateSpriteOrder(value.spriteOrder)}) };
}

export class PrintCartService {
  constructor({ storage = browserStorage(), key = 'label-generator-v3-print-cart' } = {}) {
    this.storage = storage;
    this.key = key;
    this.error = null;
    this.entries = [];
    try {
      if (!storage) throw new Error('Lokaler Speicher ist nicht verfügbar.');
      const raw = storage.getItem(key);
      if (raw) {
        const saved = JSON.parse(raw);
        if (![1, 2].includes(saved.schemaVersion) || !Array.isArray(saved.entries) || saved.entries.length > 200) throw new Error('Unbekanntes Speicherformat.');
        this.entries = saved.entries.map(validateCartEntry);
        if (new Set(this.entries.map(x => x.id)).size !== this.entries.length) throw new Error('Doppelte Eintrags-ID.');
      }
    } catch (error) { this.error = `Der gespeicherte Druckwarenkorb konnte nicht geladen werden: ${error.message}`; this.entries = []; }
  }
  list() { return clone(this.entries); }
  save(next) {
    if (next.length > 200) throw new Error('Der Warenkorb kann höchstens 200 unterschiedliche Etiketten enthalten.');
    if (!this.storage) throw new Error('Lokaler Speicher ist nicht verfügbar.');
    try { this.storage.setItem(this.key, JSON.stringify({ schemaVersion: 2, entries: next })); }
    catch { throw new Error('Der Warenkorb konnte nicht lokal gespeichert werden. Bitte Browserspeicher prüfen.'); }
    this.entries = next;
    this.error = null;
    return this.list();
  }
  add(value) {
    const entry = validateCartEntry({ ...value, id: value.id ?? globalThis.crypto?.randomUUID?.() ?? `label-${Date.now()}-${Math.random().toString(36).slice(2)}` });
    if (this.entries.some(x => x.id === entry.id)) throw new Error('Diese Eintrags-ID ist bereits vorhanden.');
    this.save([...this.entries, entry]);
    return clone(entry);
  }
  update(id, patch) {
    const previous = this.entries.find(x => x.id === id);
    if (!previous) throw new Error('Warenkorbeintrag nicht gefunden.');
    const entry = validateCartEntry({ ...previous, ...patch, id });
    this.save(this.entries.map(x => x.id === id ? entry : x));
    return clone(entry);
  }
  remove(id) {
    if (!this.entries.some(x => x.id === id)) throw new Error('Warenkorbeintrag nicht gefunden.');
    return this.save(this.entries.filter(x => x.id !== id));
  }
  clear() { return this.save([]); }
}
