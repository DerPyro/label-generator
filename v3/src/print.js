import { PDFDocument, degrees, rgb, StandardFonts, PrintScaling } from '../vendor/pdf-lib.esm.min.js';

export const MM_TO_PT = 72 / 25.4;
const roundKey = value => Number(value).toFixed(6);
// Read compatibility for callers holding an old, not-yet-restored cart entry.
const layoutIdFor = entry => entry?.layoutId ?? (['rectangular', 'circular'].includes(entry?.format) ? entry.format : undefined);
const validLayoutId = entry => typeof layoutIdFor(entry) === 'string' && /^[a-z][a-z0-9-]{0,63}$/.test(layoutIdFor(entry));
export const configKey = entry => `${entry.packId}@${entry.packVersion}:${layoutIdFor(entry)}`;

function numeric(value, label, min, max) {
  if (value === '' || value === null || typeof value === 'boolean') throw new Error(`${label} fehlt.`);
  const result = Number(value);
  if (!Number.isFinite(result) || result < min || result > max) throw new Error(`${label} muss zwischen ${min} und ${max} liegen.`);
  return result;
}
export function getPhysicalSize(config, widthMm) {
  const width = numeric(widthMm, 'Etikettenbreite / Durchmesser', 1, 300);
  if (!config || !Number.isFinite(config.width) || !Number.isFinite(config.height) || config.width <= 0 || config.height <= 0) throw new Error('Ungültige native Etikettenauflösung.');
  if (!['rectangle', 'circle'].includes(config.shape)) throw new Error('Nicht unterstützte Layoutkontur.');
  if (config.shape === 'circle' && config.width !== config.height) throw new Error('Runde Etiketten benötigen eine quadratische Zeichenfläche.');
  const height = width * config.height / config.width;
  return { widthMm: width, heightMm: height, dpi: Math.min(config.width / width, config.height / height) * 25.4 };
}
export function normalizePrintSettings(settings = {}) {
  const orientation = settings.orientation ?? 'portrait';
  if (!['portrait', 'landscape'].includes(orientation)) throw new Error('Ungültige Seitenausrichtung.');
  const adjacent = settings.adjacent ?? false;
  if (typeof adjacent !== 'boolean') throw new Error('Ungültige Druckoption.');
  const cropMarks = adjacent ? false : (settings.cropMarks ?? true);
  const calibration = settings.calibration ?? false;
  const mixSizes = settings.mixSizes ?? false;
  if (typeof cropMarks !== 'boolean' || typeof calibration !== 'boolean' || typeof mixSizes !== 'boolean') throw new Error('Ungültige Druckoption.');
  return {
    orientation,
    marginMm: numeric(settings.marginMm ?? 5, 'Seitenrand', 0, 100),
    gapMm: adjacent ? 0 : numeric(settings.gapMm ?? 2, 'Etikettenabstand', 0, 100),
    bleedMm: adjacent ? 0 : numeric(settings.bleedMm ?? 0, 'Beschnittzugabe', 0, 10),
    widthMm: settings.widthMm === undefined ? undefined : numeric(settings.widthMm, 'Etikettengröße', 1, 300),
    cropMarks, calibration, mixSizes, adjacent,
  };
}

export function layoutSheets(entries, configsByKey, settings = {}) {
  const options = normalizePrintSettings(settings);
  if (!Array.isArray(entries) || entries.length > 200) throw new Error('Ungültiger Druckwarenkorb.');
  const pageWidth = options.orientation === 'landscape' ? 297 : 210;
  const pageHeight = options.orientation === 'landscape' ? 210 : 297;
  const groups = new Map();
  const allItems = [], entryIds = new Set();
  const warnings = new Set();
  let totalLabels = 0;
  for (const entry of entries) {
    if (!entry || typeof entry.id !== 'string' || !entry.id || entryIds.has(entry.id)) throw new Error('Doppelte oder fehlende Warenkorb-ID.');
    entryIds.add(entry.id);
    if (!validLayoutId(entry) || !Number.isInteger(entry.quantity) || entry.quantity < 1 || entry.quantity > 999) throw new Error('Ungültige Stückzahl oder Layout-ID.');
    const key = configKey(entry);
    const config = configsByKey instanceof Map ? configsByKey.get(key) : configsByKey?.[key];
    if (!config) throw new Error(`Texturepack ${entry.packId} (${entry.packVersion}) für Layout ${layoutIdFor(entry)} ist nicht verfügbar.`);
    const size = getPhysicalSize(config, options.widthMm ?? entry.widthMm);
    if (size.dpi < 300) warnings.add(`${entry.data?.name || 'Etikett'}: ${Math.round(size.dpi)} dpi bei ${size.widthMm} mm; empfohlen sind mindestens 300 dpi.`);
    // Equal physical bounding boxes share pages even when their layouts and
    // geometric shapes differ. Circles remain conservatively square-bounded.
    const groupKey = `${roundKey(size.widthMm)}:${roundKey(size.heightMm)}`;
    if (!groups.has(groupKey)) groups.set(groupKey, { ...size, items: [] });
    groups.get(groupKey).items.push({ entry, config });
    allItems.push({ entry, config, size });
    totalLabels += entry.quantity;
    if (totalLabels > 9999) throw new Error('Ein Druckauftrag kann höchstens 9999 Etiketten enthalten.');
  }
  if (options.bleedMm > 0) warnings.add('Beschnitt setzt die äußeren Randpixel fort. Transparente Ränder bleiben transparent; echte bedruckte Beschnittzugabe benötigt bis zur Schnittkante reichende Pack-Grafiken.');
  const pages = [];
  const groupSummaries = [];
  // Mark length 3 mm plus 1 mm from bleed, with 1 mm safety around neighbouring cells.
  const reserve = options.bleedMm + (options.cropMarks ? 5 : 0);
  if (options.mixSizes) {
    // Disjoint free rectangles conservatively bound circles as squares. Their
    // dimensions include a trailing gap; the initial free box adds this gap back
    // at the sheet edge so no unnecessary outside gap reduces usable space.
    const freeByPage = [];
    const newPage = () => {
      const page = { widthMm: pageWidth, heightMm: pageHeight, groupKey: 'mixed', capacity: 0, placements: [] };
      pages.push(page);
      freeByPage.push([{ x: options.marginMm, y: options.marginMm, width: pageWidth - 2 * options.marginMm + options.gapMm, height: pageHeight - 2 * options.marginMm + options.gapMm }]);
      return pages.length - 1;
    };
    const candidateForPage = (pageIndex, item) => {
      const candidates = [];
      const variants = item.config.shape === 'rectangle' && item.size.widthMm !== item.size.heightMm ? [false, true] : [false];
      freeByPage[pageIndex].forEach((space, freeIndex) => {
        for (const rotated of variants) {
          const width = rotated ? item.size.heightMm : item.size.widthMm;
          const height = rotated ? item.size.widthMm : item.size.heightMm;
          const cellW = width + 2 * reserve + options.gapMm, cellH = height + 2 * reserve + options.gapMm;
          if (cellW <= space.width + 1e-8 && cellH <= space.height + 1e-8) candidates.push({ pageIndex, freeIndex, space, rotated, width, height, cellW, cellH, shortWaste: Math.min(space.width - cellW, space.height - cellH) });
        }
      });
      candidates.sort((a, b) => a.space.y - b.space.y || a.space.x - b.space.x || a.shortWaste - b.shortWaste || a.cellH - b.cellH || Number(a.rotated) - Number(b.rotated));
      return candidates[0];
    };
    for (const item of allItems) {
      for (let copy = 0; copy < item.entry.quantity; copy++) {
        let choice;
        for (let pageIndex = 0; pageIndex < pages.length && !choice; pageIndex++) choice = candidateForPage(pageIndex, item);
        if (!choice) choice = candidateForPage(newPage(), item);
        if (!choice) throw new Error(`Ein ${item.size.widthMm} × ${item.size.heightMm} mm großes Etikett passt mit diesen Rändern, Schnittmarken und Abständen nicht auf DIN A4.`);
        const { pageIndex, freeIndex, space, rotated, width, height, cellW, cellH } = choice;
        freeByPage[pageIndex].splice(freeIndex, 1);
        if (space.width - cellW > 1e-7) freeByPage[pageIndex].push({ x: space.x + cellW, y: space.y, width: space.width - cellW, height: cellH });
        if (space.height - cellH > 1e-7) freeByPage[pageIndex].push({ x: space.x, y: space.y + cellH, width: space.width, height: space.height - cellH });
        pages[pageIndex].placements.push({
          placementId: `${item.entry.id}:${copy}`, entryId: item.entry.id, entry: item.entry, config: item.config,
          xMm: space.x + reserve, yMm: space.y + reserve,
          widthMm: width, heightMm: height,
          originalWidthMm: item.size.widthMm, originalHeightMm: item.size.heightMm,
          rotated, bleedMm: options.bleedMm,
        });
      }
    }
    for (const page of pages) page.capacity = page.placements.length;
    if (pages.length) groupSummaries.push({ groupKey: 'mixed', capacity: null, mixed: true, pages: pages.length, totalLabels });
  } else for (const [groupKey, group] of groups) {
    const fit = rotated => {
      const width = rotated ? group.heightMm : group.widthMm;
      const height = rotated ? group.widthMm : group.heightMm;
      const cellW = width + 2 * reserve;
      const cellH = height + 2 * reserve;
      const cols = Math.max(0, Math.floor((pageWidth - 2 * options.marginMm + options.gapMm + 1e-8) / (cellW + options.gapMm)));
      const rows = Math.max(0, Math.floor((pageHeight - 2 * options.marginMm + options.gapMm + 1e-8) / (cellH + options.gapMm)));
      return { rotated, width, height, cellW, cellH, cols, rows, capacity: cols * rows };
    };
    let grid = fit(false);
    const turned = group.widthMm !== group.heightMm ? fit(true) : grid;
    if (turned.capacity > grid.capacity) grid = turned;
    if (!grid.capacity) throw new Error(`Ein ${group.widthMm} × ${group.heightMm} mm großes Etikett passt mit diesen Rändern, Schnittmarken und Abständen nicht auf DIN A4.`);
    let page = null;
    let pageIndex = 0;
    const startPage = pages.length;
    for (const item of group.items) {
      for (let copy = 0; copy < item.entry.quantity; copy++) {
        if (!page || pageIndex === grid.capacity) {
          page = { widthMm: pageWidth, heightMm: pageHeight, groupKey, capacity: grid.capacity, placements: [] };
          pages.push(page); pageIndex = 0;
        }
        const col = pageIndex % grid.cols;
        const row = Math.floor(pageIndex / grid.cols);
        page.placements.push({
          placementId: `${item.entry.id}:${copy}`, entryId: item.entry.id, entry: item.entry, config: item.config,
          xMm: options.marginMm + reserve + col * (grid.cellW + options.gapMm),
          yMm: options.marginMm + reserve + row * (grid.cellH + options.gapMm),
          widthMm: grid.width, heightMm: grid.height,
          originalWidthMm: group.widthMm, originalHeightMm: group.heightMm,
          rotated: grid.rotated, bleedMm: options.bleedMm,
        });
        pageIndex++;
      }
    }
    groupSummaries.push({ groupKey, capacity: grid.capacity, pages: pages.length - startPage, rotated: grid.rotated, widthMm: group.widthMm, heightMm: group.heightMm });
  }
  if (options.calibration) pages.push({ widthMm: pageWidth, heightMm: pageHeight, calibration: true, placements: [] });
  if (!pages.length) throw new Error('Bitte zuerst Etiketten zum Druckwarenkorb hinzufügen.');
  return validateLayout({ settings: options, pages, groups: groupSummaries, totalLabels, warnings: [...warnings] });
}

/** Validate geometry after automatic packing OR manual placement edits. */
export function validateLayout(layout) {
  const fail = message => { throw new Error(`Druckbogen: ${message}`); };
  if (!layout || !Array.isArray(layout.pages) || !layout.pages.length || layout.pages.length > 1000 || !Number.isInteger(layout.totalLabels) || layout.totalLabels < 0 || layout.totalLabels > 9999) fail('Ungültiger Druckauftrag.');
  const options = normalizePrintSettings(layout.settings);
  const pageWidth = options.orientation === 'landscape' ? 297 : 210;
  const pageHeight = options.orientation === 'landscape' ? 210 : 297;
  const reserve = options.bleedMm + (options.cropMarks ? 5 : 0);
  const tolerance = 1e-7, ids = new Set(), quantities = new Map();
  let total = 0, calibrations = 0;
  const finite = value => typeof value === 'number' && Number.isFinite(value);
  for (const page of layout.pages) {
    if (!page || !finite(page.widthMm) || !finite(page.heightMm) || Math.abs(page.widthMm - pageWidth) > tolerance || Math.abs(page.heightMm - pageHeight) > tolerance || !Array.isArray(page.placements)) fail('Seiten müssen das gewählte DIN-A4-Format besitzen.');
    if (page.calibration) {
      calibrations++;
      if (!options.calibration || page.placements.length) fail('Die Kalibrierungsseite darf keine Etiketten enthalten.');
      continue;
    }
    for (const placement of page.placements) {
      if (!placement || typeof placement.placementId !== 'string' || !placement.placementId || ids.has(placement.placementId)) fail('Fehlende oder doppelte Platzierungs-ID.');
      ids.add(placement.placementId);
      if (!['xMm', 'yMm', 'widthMm', 'heightMm', 'originalWidthMm', 'originalHeightMm', 'bleedMm'].every(key => finite(placement[key])) || typeof placement.rotated !== 'boolean') fail('Etikettenkoordinaten und Maße müssen endliche Zahlen sein.');
      const { entry, config } = placement;
      if (!entry || typeof entry.id !== 'string' || entry.id !== placement.entryId || !validLayoutId(entry) || !Number.isInteger(entry.quantity) || entry.quantity < 1 || entry.quantity > 999) fail('Ungültige Etikettenreferenz oder Stückzahl.');
      if ((config?.packId !== undefined && config.packId !== entry.packId) || (config?.packVersion !== undefined && config.packVersion !== entry.packVersion) || (config?.layoutId !== undefined && config.layoutId !== layoutIdFor(entry))) fail('Texturepack und Etikettenreferenz stimmen nicht überein.');
      const size = getPhysicalSize(config, options.widthMm ?? entry.widthMm);
      if (config.shape === 'circle' && placement.rotated) fail('Runde Etiketten benötigen keine 90°-Drehung.');
      const expectedWidth = placement.rotated ? size.heightMm : size.widthMm;
      const expectedHeight = placement.rotated ? size.widthMm : size.heightMm;
      if (Math.abs(placement.originalWidthMm - size.widthMm) > tolerance || Math.abs(placement.originalHeightMm - size.heightMm) > tolerance || Math.abs(placement.widthMm - expectedWidth) > tolerance || Math.abs(placement.heightMm - expectedHeight) > tolerance || Math.abs(placement.bleedMm - options.bleedMm) > tolerance) fail('Ein Etikett wurde verzerrt oder seine Druckgröße wurde verändert.');
      if (placement.xMm - reserve < options.marginMm - tolerance || placement.yMm - reserve < options.marginMm - tolerance || placement.xMm + placement.widthMm + reserve > page.widthMm - options.marginMm + tolerance || placement.yMm + placement.heightMm + reserve > page.heightMm - options.marginMm + tolerance) fail('Ein Etikett oder seine Schnittmarken liegen außerhalb des bedruckbaren Bereichs.');
      const previous = quantities.get(entry.id);
      if (previous && previous.expected !== entry.quantity) fail('Widersprüchliche Stückzahlen für ein Etikett.');
      quantities.set(entry.id, { expected: entry.quantity, actual: (previous?.actual || 0) + 1 });
      total++;
    }
    for (let i = 0; i < page.placements.length; i++) {
      const a = page.placements[i];
      for (const b of page.placements.slice(i + 1)) {
        const spacing = 2 * reserve + options.gapMm;
        if (!(a.xMm + a.widthMm + spacing <= b.xMm + tolerance || b.xMm + b.widthMm + spacing <= a.xMm + tolerance || a.yMm + a.heightMm + spacing <= b.yMm + tolerance || b.yMm + b.heightMm + spacing <= a.yMm + tolerance)) fail('Etiketten, Beschnitt oder Schnittmarken überlappen sich oder unterschreiten den Abstand.');
      }
    }
  }
  if (calibrations !== (options.calibration ? 1 : 0)) fail('Die Kalibrierungsseite fehlt oder ist mehrfach vorhanden.');
  if (total !== layout.totalLabels || [...quantities.values()].some(value => value.actual !== value.expected)) fail('Die Anzahl der platzierten Etiketten stimmt nicht mit den Stückzahlen überein.');
  if (!total && !calibrations) fail('Der Druckbogen enthält keine Etiketten.');
  return layout;
}

function dataUrlBytes(url) {
  if (!url.startsWith('data:image/png;base64,')) throw new Error('Für den Druck wird eine PNG-Datei benötigt.');
  return Uint8Array.from(atob(url.slice(url.indexOf(',') + 1)), c => c.charCodeAt(0));
}
async function pngBytes(value) {
  if (typeof value === 'string') return dataUrlBytes(value);
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (typeof Blob !== 'undefined' && value instanceof Blob) return new Uint8Array(await value.arrayBuffer());
  if (value?.toDataURL) return dataUrlBytes(value.toDataURL('image/png'));
  throw new Error('Der Etikettenrenderer hat kein PNG geliefert.');
}

export async function preparePrintImage(value, placement) {
  const bleed = placement.bleedMm;
  if (!bleed) return { bytes: await pngBytes(value), canvas: value?.getContext ? value : null, widthMm: placement.originalWidthMm, heightMm: placement.originalHeightMm, padXMm: 0, padYMm: 0 };
  if (typeof document === 'undefined') throw new Error('Beschnitt-PNGs benötigen Canvas im Browser.');
  let source = value;
  let objectUrl;
  if (!source?.getContext) {
    const bytes = await pngBytes(value);
    objectUrl = URL.createObjectURL(new Blob([bytes], { type: 'image/png' }));
    source = new Image();
    await new Promise((resolve, reject) => { source.onload = resolve; source.onerror = () => reject(new Error('Beschnitt-Bild konnte nicht geladen werden.')); source.src = objectUrl; });
  }
  try {
    const w = source.width;
    const h = source.height;
    // Rounding down keeps the optional extension within the reserved bleed area.
    // Physical image size uses these exact pixel proportions, so the original
    // trim artwork remains exactly the requested number of millimetres.
    const padX = Math.floor(bleed / placement.originalWidthMm * w);
    const padY = Math.floor(bleed / placement.originalHeightMm * h);
    if ((w + 2 * padX) * (h + 2 * padY) > 40000000) throw new Error('Beschnitt ist für diese Etikettengröße zu groß.');
    const canvas = document.createElement('canvas');
    canvas.width = w + 2 * padX; canvas.height = h + 2 * padY;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(source, padX, padY);
    if (padX) {
      ctx.drawImage(source, 0, 0, 1, h, 0, padY, padX, h);
      ctx.drawImage(source, w - 1, 0, 1, h, padX + w, padY, padX, h);
    }
    if (padY) {
      ctx.drawImage(source, 0, 0, w, 1, padX, 0, w, padY);
      ctx.drawImage(source, 0, h - 1, w, 1, padX, padY + h, w, padY);
    }
    if (padX && padY) for (const [sx, sy, dx, dy] of [[0, 0, 0, 0], [w - 1, 0, padX + w, 0], [0, h - 1, 0, padY + h], [w - 1, h - 1, padX + w, padY + h]]) ctx.drawImage(source, sx, sy, 1, 1, dx, dy, padX, padY);
    const padXMm = padX / w * placement.originalWidthMm;
    const padYMm = padY / h * placement.originalHeightMm;
    return { bytes: await pngBytes(canvas), canvas, padXMm, padYMm, widthMm: placement.originalWidthMm + padXMm * 2, heightMm: placement.originalHeightMm + padYMm * 2 };
  } finally { if (objectUrl) URL.revokeObjectURL(objectUrl); }
}

export function cropMarkSegments(placement) {
  const x = placement.xMm, y = placement.yMm, w = placement.widthMm, h = placement.heightMm;
  const offset = placement.bleedMm + 1, length = 3;
  const segments = [];
  for (const yy of [y, y + h]) {
    segments.push([x - offset - length, yy, x - offset, yy], [x + w + offset, yy, x + w + offset + length, yy]);
  }
  for (const xx of [x, x + w]) {
    segments.push([xx, y - offset - length, xx, y - offset], [xx, y + h + offset, xx, y + h + offset + length]);
  }
  return segments;
}

export async function generatePdf(layout, renderEntry) {
  validateLayout(layout);
  if (!layout?.pages?.length || layout.pages.length > 1000 || typeof renderEntry !== 'function') throw new Error('Ungültiger PDF-Druckauftrag.');
  const pdf = await PDFDocument.create();
  pdf.setTitle('Etiketten-Druckbogen');
  pdf.setCreator('Label Generator v3');
  pdf.setCreationDate(new Date('2000-01-01T00:00:00Z'));
  pdf.setModificationDate(new Date('2000-01-01T00:00:00Z'));
  pdf.catalog.getOrCreateViewerPreferences().setPrintScaling(PrintScaling.None);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const cache = new Map();
  for (const sheet of layout.pages) {
    const page = pdf.addPage([sheet.widthMm * MM_TO_PT, sheet.heightMm * MM_TO_PT]);
    if (sheet.calibration) {
      const x = (sheet.widthMm - 100) / 2, y = (sheet.heightMm - 100) / 2;
      page.drawRectangle({ x: x * MM_TO_PT, y: y * MM_TO_PT, width: 100 * MM_TO_PT, height: 100 * MM_TO_PT, borderColor: rgb(0, 0, 0), borderWidth: 0.5 });
      page.drawText('100 x 100 mm - bei 100 % / Tatsaechliche Groesse drucken', { x: 15 * MM_TO_PT, y: (y - 12) * MM_TO_PT, size: 10, font });
      continue;
    }
    for (const placement of sheet.placements) {
      const cacheKey = `${placement.entryId}:${placement.bleedMm}:${placement.originalWidthMm}`;
      if (!cache.has(cacheKey)) {
        const rendered = await renderEntry(placement.entry, placement.config);
        const padded = await preparePrintImage(rendered, placement);
        cache.set(cacheKey, { ...padded, image: await pdf.embedPng(padded.bytes) });
      }
      const { image, padXMm, padYMm, widthMm: w, heightMm: h } = cache.get(cacheKey);
      page.drawImage(image, {
        x: (placement.xMm + (placement.rotated ? placement.originalHeightMm + padYMm : -padXMm)) * MM_TO_PT,
        y: (sheet.heightMm - placement.yMm - placement.heightMm - (placement.rotated ? padXMm : padYMm)) * MM_TO_PT,
        width: w * MM_TO_PT, height: h * MM_TO_PT,
        rotate: degrees(placement.rotated ? 90 : 0),
      });
      if (layout.settings.cropMarks) {
        for (const [x1, y1, x2, y2] of cropMarkSegments(placement)) page.drawLine({ start: { x: x1 * MM_TO_PT, y: (sheet.heightMm - y1) * MM_TO_PT }, end: { x: x2 * MM_TO_PT, y: (sheet.heightMm - y2) * MM_TO_PT }, thickness: 0.35, color: rgb(0, 0, 0) });
      }
    }
  }
  return pdf.save({ useObjectStreams: false });
}

export class PrintSheetGenerator {
  static layout(entries, configs, settings) { return layoutSheets(entries, configs, settings); }
  static pdf(layout, renderEntry) { return generatePdf(layout, renderEntry); }
}
