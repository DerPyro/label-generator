import { LIMITS } from './config.js';

/** Parse RFC 4180 CSV text, including quoted delimiters and embedded line breaks. */
export function parseStrainsCsv(text) {
  if (typeof text !== 'string') throw new TypeError('CSV text must be a string.');
  const source = text.replace(/^\uFEFF/u, '');
  const records = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    if (quoted) {
      if (ch === '"') {
        if (source[i + 1] === '"') { field += '"'; i++; }
        else quoted = false;
      } else field += ch;
    } else if (ch === '"' && field.length === 0) quoted = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && source[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some(value => value.trim())) records.push(row);
      row = [];
    } else field += ch;
  }
  if (quoted) throw new Error('Die CSV-Datei enthält ein nicht geschlossenes Anführungszeichen.');
  if (field.length || row.length) { row.push(field); if (row.some(value => value.trim())) records.push(row); }
  if (!records.length) return [];
  const headers = records.shift().map(value => value.trim());
  const index = Object.fromEntries(headers.map((name, i) => [name, i]));
  if (index.Name === undefined) throw new Error('Die CSV-Datei enthält keine Spalte „Name“.');
  const value = (cells, key) => String(cells[index[key]] ?? '').trim();
  return records.filter(cells => value(cells, 'Name')).map((cells, rowIndex) => ({
    id: `strain-${rowIndex + 1}`,
    name: value(cells, 'Name'),
    shortName: value(cells, 'ShortName'),
    brand: value(cells, 'Brand'),
    type: value(cells, 'Typ'),
    thc: value(cells, 'THC'),
    cbd: value(cells, 'CBD'),
    sativa: value(cells, 'Sativa'),
    indica: value(cells, 'Indica'),
    url: value(cells, 'URL')
  }));
}

function fold(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/gu, '').toLocaleLowerCase();
}

/** Find rows whose name or brand matches every query token, in stable relevance order. */
export function searchStrains(rows, query, { limit = 50 } = {}) {
  const tokens = fold(query).trim().split(/\s+/u).filter(Boolean);
  if (!tokens.length) return [];
  const matches = [];
  for (const row of rows) {
    const name = fold(`${row.shortName || ''} ${row.name || ''}`);
    const brand = fold(row.brand);
    if (!tokens.every(token => name.includes(token) || brand.includes(token))) continue;
    const score = tokens.reduce((total, token) => total + (name.startsWith(token) ? 4 : name.includes(token) ? 2 : 0) + (brand.includes(token) ? 1 : 0), 0);
    matches.push({ row, score });
  }
  matches.sort((a, b) => b.score - a.score || a.row.name.localeCompare(b.row.name) || a.row.id.localeCompare(b.row.id));
  return matches.slice(0, Math.max(0, Number.isFinite(limit) ? Math.floor(limit) : 50)).map(match => match.row);
}

/** Map catalog fields to the editor's partial input; blank values never overwrite user input. */
export function getStrainValues(row) {
  const data = {};
  const warnings = [];
  const name = row.shortName || row.name;
  if (name) data.name = name;
  if (row.brand) data.producer = row.brand;
  for (const [source, target, maximum] of [['thc', 'thc', LIMITS.thc], ['cbd', 'cbd', LIMITS.cbd]]) {
    const raw = String(row[source] ?? '').trim();
    if (!raw) continue;
    const value = Number(raw.replace(',', '.'));
    if (!Number.isFinite(value) || value < 0) { warnings.push(`${target.toUpperCase()}-Wert „${raw}“ konnte nicht übernommen werden.`); continue; }
    data[target] = Math.min(value, maximum);
    if (value > maximum) warnings.push(`${target.toUpperCase()} wurde von ${value} % auf ${maximum} % begrenzt.`);
  }
  const parsePercent = value => {
    const raw = String(value ?? '').trim();
    if (!raw) return undefined;
    const parsed = Number(raw.replace(',', '.'));
    return Number.isFinite(parsed) && parsed >= 0 && parsed <= 100 ? parsed : undefined;
  };
  const sativa = parsePercent(row.sativa);
  const indica = parsePercent(row.indica);
  if (sativa !== undefined && indica !== undefined) {
    if (sativa + indica === 100) data.sativa = sativa;
    else warnings.push(`Genetik (${sativa} % Sativa, ${indica} % Indica) ist nicht eindeutig; bitte manuell prüfen.`);
  } else if (sativa !== undefined) data.sativa = sativa;
  else if (indica !== undefined) data.sativa = 100 - indica;
  return { data, warnings };
}
