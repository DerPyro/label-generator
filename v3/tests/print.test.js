import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PDFDocument, PDFArray, decodePDFRawStream } from '../vendor/pdf-lib.esm.min.js';
import { getPhysicalSize, normalizePrintSettings, layoutSheets, configKey, generatePdf, cropMarkSegments, validateLayout, MM_TO_PT } from '../src/print.js';
import { SheetEditor, findPlacement } from '../src/sheet-editor.js';

const rectangular = { width: 1200, height: 1800, shape: 'rectangle' };
const circular = { width: 1200, height: 1200, shape: 'circle' };
const base = { id: 'label-1', data: { name: 'Super Silver Haze' }, packId: 'woodland', packVersion: '1.0.0', layoutId: 'rectangular', quantity: 1, widthMm: 70 };
const configs = entries => new Map(entries.map(entry => [configKey(entry), entry.layoutId === 'circular' ? circular : rectangular]));
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-7, `${a} != ${b}`);
const png = () => readFile(new URL('../assets/base/label_base.png', import.meta.url));

function contents(doc, page) {
  const value = page.node.Contents();
  const refs = value instanceof PDFArray ? value.asArray() : [value];
  return refs.filter(Boolean).map(ref => Buffer.from(decodePDFRawStream(doc.context.lookup(ref)).decode()).toString('latin1')).join('\n');
}
function multiply(a, b) {
  return [a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];
}
function imageMatrices(content) {
  let matrix = [1,0,0,1,0,0]; const stack = [], images = [];
  for (const raw of content.split('\n')) {
    const line = raw.trim();
    if (line === 'q') stack.push([...matrix]);
    else if (line === 'Q') matrix = stack.pop();
    else if (line.endsWith(' cm')) matrix = multiply(matrix, line.slice(0,-3).trim().split(/\s+/).map(Number));
    else if (/\/\S+ Do$/.test(line)) images.push([...matrix]);
  }
  return images;
}

test('Physische Maße halten Seitenverhältnis und berechnen echte DPI', () => {
  assert.deepEqual(getPhysicalSize(rectangular, 70), { widthMm: 70, heightMm: 105, dpi: 1200/70*25.4 });
  close(getPhysicalSize(circular, 50).heightMm, 50);
  assert.ok(getPhysicalSize(rectangular, 120).dpi < 300);
  for (const width of [0, -1, NaN, 301, '']) assert.throws(() => getPhysicalSize(rectangular, width));
  assert.throws(() => normalizePrintSettings({ marginMm: -1 }));
});
test('Direkte Anordnung teilt Schnittkanten in Raster und gemischtem Layout, auch im PDF', async () => {
  const entries = [{ ...base, quantity: 12, widthMm: 40 }];
  assert.throws(() => normalizePrintSettings({ adjacent: 'true' }));
  for (const mixSizes of [false, true]) {
    const layout = layoutSheets(entries, configs(entries), { adjacent: true, mixSizes, gapMm: 3, bleedMm: 2, cropMarks: true });
    assert.equal(layout.settings.gapMm, 0);
    assert.equal(layout.settings.bleedMm, 0);
    assert.equal(layout.settings.cropMarks, false);
    const placements = layout.pages[0].placements;
    const [a, b] = placements;
    close(a.xMm + a.widthMm, b.xMm);
    close(a.yMm, b.yMm);
    const below = placements.find(p => p !== a && Math.abs(p.xMm - a.xMm) < 1e-7 && Math.abs(p.yMm - a.yMm - a.heightMm) < 1e-7);
    assert.ok(below, 'Auch die nächste Zeile liegt ohne Zwischenraum an.');
    const pdf = await PDFDocument.load(await generatePdf(layout, png));
    const matrices = imageMatrices(contents(pdf, pdf.getPage(0)));
    const xBounds = m => {
      const xs = [m[4], m[4] + m[0], m[4] + m[2], m[4] + m[0] + m[2]];
      return [Math.min(...xs), Math.max(...xs)];
    };
    close(xBounds(matrices[0])[1], xBounds(matrices[1])[0]);
    assert.equal(matrices.length, 12);
    const overlapping = structuredClone(layout);
    overlapping.pages[0].placements[1].xMm -= 0.1;
    assert.throws(() => validateLayout(overlapping), /überlappen/);
  }
});

test('Mehrere Sorten und Packs teilen Bögen, Mengen und Pagination stimmen', () => {
  const entries = [
    { ...base, quantity: 3, widthMm: 60 },
    { ...base, id: 'label-2', data: { name: 'Euphoria' }, packId: 'ink', quantity: 2, widthMm: 60 },
    { ...base, id: 'label-3', data: { name: 'Blueberry Kush' }, quantity: 1, widthMm: 60 },
  ];
  const layout = layoutSheets(entries, configs(entries), { cropMarks: false });
  assert.equal(layout.pages.length, 1); assert.equal(layout.totalLabels, 6);
  assert.deepEqual(layout.pages[0].placements.map(x => x.entryId), ['label-1','label-1','label-1','label-2','label-2','label-3']);
  const many = [{ ...base, quantity: 9 }];
  const pages = layoutSheets(many, configs(many), { cropMarks: false });
  assert.equal(pages.pages.length, 3); assert.deepEqual(pages.pages.map(x => x.placements.length), [4,4,1]);
});
test('Rotation optimiert Kapazität ohne Verzerrung; Formen und Größen trennen sich', () => {
  const entries = [{ ...base, widthMm: 65 }];
  const layout = layoutSheets(entries, configs(entries), { cropMarks: false });
  const placement = layout.pages[0].placements[0];
  assert.equal(placement.rotated, true); assert.equal(layout.pages[0].capacity, 8);
  close(placement.widthMm, 97.5); close(placement.heightMm, 65);
  const mixed = [base, { ...base, id: 'round', layoutId: 'circular' }, { ...base, id: 'small', widthMm: 50 }];
  assert.equal(layoutSheets(mixed, configs(mixed), { cropMarks: false }).pages.length, 3);
  assert.throws(() => layoutSheets([{ ...base, widthMm: 300 }], configs([base])), /passt/);
});
test('Gemischte Größen, Formen und Packs nutzen deterministisch denselben Bogen', () => {
  assert.equal(normalizePrintSettings().mixSizes, false);
  assert.throws(() => normalizePrintSettings({ mixSizes: 'yes' }), /Druckoption/);
  const entries = [
    { ...base, id: 'large', quantity: 2 },
    { ...base, id: 'round', packId: 'ink', layoutId: 'circular', quantity: 3, widthMm: 35 },
    { ...base, id: 'small', packId: 'ink', quantity: 1, widthMm: 45 },
  ];
  const layout = layoutSheets(entries, configs(entries), { cropMarks: false, mixSizes: true });
  assert.equal(layout.pages.length, 1);
  assert.equal(layout.totalLabels, 6);
  assert.equal(layout.groups[0].mixed, true);
  assert.deepEqual(layout, layoutSheets(entries, configs(entries), { cropMarks: false, mixSizes: true }));
  assert.equal(validateLayout(layout), layout);
  const placements = layout.pages.flatMap(page => page.placements);
  assert.equal(new Set(placements.map(p => p.placementId)).size, 6);
  assert.deepEqual(placements.filter(p => p.entryId === 'round').map(p => p.placementId), ['round:0', 'round:1', 'round:2']);
  assert.ok(placements.some(p => p.rotated));
  const grouped = layoutSheets(entries, configs(entries), { cropMarks: false });
  assert.equal(grouped.pages.length, 3);
  assert.deepEqual(new Set(grouped.pages.flatMap(p => p.placements.map(x => x.placementId))), new Set(placements.map(x => x.placementId)));
});
test('Gemischte Anordnung respektiert Beschnitt, Schnittmarken, Abstände und Mengen auf allen Seiten', () => {
  const entries = [
    { ...base, quantity: 16, widthMm: 65 },
    { ...base, id: 'round', layoutId: 'circular', quantity: 11, widthMm: 30 },
    { ...base, id: 'small', packId: 'ink', quantity: 7, widthMm: 24 },
  ];
  const layout = layoutSheets(entries, configs(entries), { mixSizes: true, marginMm: 8, gapMm: 4, bleedMm: 2, cropMarks: true, calibration: true });
  assert.ok(layout.pages.length > 1);
  assert.equal(layout.pages.at(-1).calibration, true);
  assert.equal(layout.pages.flatMap(p => p.placements).length, 34);
  assert.equal(validateLayout(layout), layout);
  for (const page of layout.pages) for (const p of page.placements) for (const [x1,y1,x2,y2] of cropMarkSegments(p)) assert.ok(Math.min(x1,x2)>=8 && Math.max(x1,x2)<=page.widthMm-8 && Math.min(y1,y2)>=8 && Math.max(y1,y2)<=page.heightMm-8);
});
test('Layoutprüfung verhindert ungültige manuelle Positionen und veränderte Druckmaße', async () => {
  const entries = [{ ...base, quantity: 2 }];
  const original = layoutSheets(entries, configs(entries), { cropMarks: false });
  const mutate = fn => { const value = structuredClone(original); fn(value); return value; };
  for (const invalid of [
    mutate(l => { l.pages[0].placements[0].xMm = -1; }),
    mutate(l => { l.pages[0].placements[0].yMm = NaN; }),
    mutate(l => { l.pages[0].placements[0].widthMm += 1; }),
    mutate(l => { l.pages[0].placements[0].rotated = true; }),
    mutate(l => { l.pages[0].placements[1].placementId = l.pages[0].placements[0].placementId; }),
    mutate(l => { l.pages[0].placements[1].xMm = l.pages[0].placements[0].xMm; l.pages[0].placements[1].yMm = l.pages[0].placements[0].yMm; }),
    mutate(l => { l.pages[0].widthMm = 211; }),
    mutate(l => { l.pages[0].calibration = true; }),
    mutate(l => { l.pages[0].placements.pop(); }),
    mutate(l => { l.totalLabels++; }),
  ]) {
    assert.throws(() => validateLayout(invalid), /Druckbogen/);
    await assert.rejects(() => generatePdf(invalid, () => { throw new Error('Renderer darf nicht laufen'); }), /Druckbogen/);
  }
  const moved = structuredClone(original), placement = moved.pages[0].placements.pop();
  moved.pages.push({ widthMm: 210, heightMm: 297, placements: [placement] });
  assert.equal(validateLayout(moved), moved);
  moved.pages.push({ widthMm: 210, heightMm: 297, placements: [] });
  assert.equal(validateLayout(moved), moved);
});
test('Ränder, Beschnitt, Schnittmarken und Abstände bleiben innerhalb A4', () => {
  const entries = [{ ...base, widthMm: 45, quantity: 20 }];
  const layout = layoutSheets(entries, configs(entries), { marginMm: 7, gapMm: 3, bleedMm: 2, cropMarks: true, orientation: 'landscape' });
  for (const page of layout.pages) for (let i = 0; i < page.placements.length; i++) {
    const p = page.placements[i];
    assert.ok(p.xMm >= 14 && p.yMm >= 14);
    for (const [x1,y1,x2,y2] of cropMarkSegments(p)) assert.ok(Math.min(x1,x2)>=7 && Math.max(x1,x2)<=page.widthMm-7 && Math.min(y1,y2)>=7 && Math.max(y1,y2)<=page.heightMm-7);
    for (const other of page.placements.slice(i+1)) assert.ok(p.xMm+p.widthMm+4 <= other.xMm || other.xMm+other.widthMm+4 <= p.xMm || p.yMm+p.heightMm+4 <= other.yMm || other.yMm+other.heightMm+4 <= p.yMm);
  }
  assert.ok(layout.warnings.some(x => /Beschnitt/.test(x)));
});
test('PDF enthält echte A4-Maße und exakt 70 × 105 mm große PNGs', async () => {
  const entries = [{ ...base, quantity: 9 }];
  const layout = layoutSheets(entries, configs(entries), { cropMarks: false });
  let renderCalls = 0;
  const bytes = await generatePdf(layout, async () => { renderCalls++; return png(); });
  const pdf = await PDFDocument.load(bytes);
  assert.equal(pdf.getPageCount(), 3); assert.equal(renderCalls, 1);
  for (const [index, page] of pdf.getPages().entries()) {
    close(page.getWidth(), 210*MM_TO_PT); close(page.getHeight(), 297*MM_TO_PT);
    const matrices = imageMatrices(contents(pdf, page));
    assert.equal(matrices.length, index < 2 ? 4 : 1);
    for (const m of matrices) { close(Math.hypot(m[0],m[1]), 70*MM_TO_PT); close(Math.hypot(m[2],m[3]), 105*MM_TO_PT); }
  }
});
test('PDF-Drehmatrix erhält Maße und Platzierungskoordinaten', async () => {
  const entries = [{ ...base, widthMm: 65 }];
  const layout = layoutSheets(entries, configs(entries), { cropMarks: false });
  const bytes = await generatePdf(layout, png);
  const pdf = await PDFDocument.load(bytes), page = pdf.getPage(0);
  const [m] = imageMatrices(contents(pdf, page));
  close(Math.hypot(m[0],m[1]), 65*MM_TO_PT); close(Math.hypot(m[2],m[3]), 97.5*MM_TO_PT);
  const xs = [m[4],m[4]+m[0],m[4]+m[2],m[4]+m[0]+m[2]];
  const ys = [m[5],m[5]+m[1],m[5]+m[3],m[5]+m[1]+m[3]];
  close(Math.min(...xs), 5*MM_TO_PT); close(Math.max(...ys), (297-5)*MM_TO_PT);
});
test('Gemischte PDF-Formate behalten individuelle physische Größen und sichere Drehungen', async () => {
  const entries = [base, { ...base, id: 'round', layoutId: 'circular', widthMm: 35, packId: 'ink' }, { ...base, id: 'small', widthMm: 40 }];
  const layout = layoutSheets(entries, configs(entries), { mixSizes: true, cropMarks: false });
  const pdf = await PDFDocument.load(await generatePdf(layout, png));
  assert.equal(pdf.getPageCount(), 1);
  const matrices = imageMatrices(contents(pdf, pdf.getPage(0)));
  assert.equal(matrices.length, 3);
  layout.pages[0].placements.forEach((p, index) => {
    const m = matrices[index];
    close(Math.hypot(m[0],m[1]), p.originalWidthMm*MM_TO_PT);
    close(Math.hypot(m[2],m[3]), p.originalHeightMm*MM_TO_PT);
    const xs = [m[4],m[4]+m[0],m[4]+m[2],m[4]+m[0]+m[2]], ys = [m[5],m[5]+m[1],m[5]+m[3],m[5]+m[1]+m[3]];
    close(Math.min(...xs), p.xMm*MM_TO_PT); close(Math.max(...ys), (297-p.yMm)*MM_TO_PT);
  });
});
test('Kalibrierungsseite hat exakt 100 × 100 mm Referenzquadrat und Druckskalierung None', async () => {
  const layout = layoutSheets([], {}, { calibration: true, orientation: 'landscape' });
  const pdf = await PDFDocument.load(await generatePdf(layout, png));
  assert.equal(pdf.getPageCount(), 1);
  close(pdf.getPage(0).getWidth(), 297*MM_TO_PT); close(pdf.getPage(0).getHeight(), 210*MM_TO_PT);
  const content = contents(pdf, pdf.getPage(0));
  const edges = content.split('\n').filter(line => / l$/.test(line)).map(line => line.trim().split(/\s+/).slice(0,2).map(Number));
  assert.ok(edges.some(([x]) => Math.abs(x-100*MM_TO_PT)<1e-7));
  assert.ok(edges.some(([,y]) => Math.abs(y-100*MM_TO_PT)<1e-7));
  assert.match(pdf.catalog.getOrCreateViewerPreferences().dict.toString(), /\/PrintScaling \/None/);
});

test('Beliebige Layout-IDs und Seitenverhältnisse behalten im gemeinsamen PDF ihre echten Maße', async () => {
  const entries = ['portrait-garden', 'wide-view', 'panorama', 'round-lid', 'slim-band'].map((layoutId, i) => ({ ...base, id: `dynamic-${i}`, layoutId, widthMm: 40 }));
  const designs = [
    { width: 1200, height: 1800, shape: 'rectangle' },
    { width: 1800, height: 1200, shape: 'rectangle' },
    { width: 1600, height: 900, shape: 'rectangle' },
    { width: 1200, height: 1200, shape: 'circle' },
    { width: 2000, height: 500, shape: 'rectangle' },
  ];
  const map = new Map(entries.map((entry, i) => [configKey(entry), { ...designs[i], packId: entry.packId, packVersion: entry.packVersion, layoutId: entry.layoutId }]));
  const layout = layoutSheets(entries, map, { mixSizes: true, cropMarks: false });
  assert.equal(layout.pages.length, 1);
  const doc = await PDFDocument.load(await generatePdf(layout, png));
  const matrices = imageMatrices(contents(doc, doc.getPage(0)));
  layout.pages[0].placements.forEach((placement, i) => {
    const [a,b,c,d] = matrices[i];
    close(Math.hypot(a,b), 40 * MM_TO_PT);
    close(Math.hypot(c,d), getPhysicalSize(placement.config, 40).heightMm * MM_TO_PT);
  });
  const mismatched = new Map(map);
  mismatched.set(configKey(entries[0]), { ...map.get(configKey(entries[0])), layoutId: 'wrong-layout' });
  assert.throws(() => layoutSheets(entries, mismatched, { mixSizes: true, cropMarks: false }), /stimmen nicht überein/);
  assert.throws(() => getPhysicalSize({ width: 1200, height: 1000, shape: 'circle' }, 40), /quadratische/);
});

test('Gleiche physische Layoutgrößen teilen ohne Mischmodus die Seite unabhängig von Pack und Form', () => {
  const entries = [{ ...base, id: 'square', layoutId: 'square-sticker', widthMm: 50 }, { ...base, id: 'round', packId: 'ink', layoutId: 'round-lid', widthMm: 50 }];
  const map = new Map([
    [configKey(entries[0]), { width: 1500, height: 1500, shape: 'rectangle', layoutId: 'square-sticker' }],
    [configKey(entries[1]), { width: 1200, height: 1200, shape: 'circle', layoutId: 'round-lid' }],
  ]);
  const layout = layoutSheets(entries, map, { mixSizes: false, cropMarks: false });
  assert.equal(layout.pages.length, 1);
  assert.deepEqual(layout.pages[0].placements.map(p => p.entryId), ['square', 'round']);
});

test('Manuell verschobenes und gedrehtes Etikett behält im PDF Zielseite, Millimeterposition und Größe', async () => {
  const entries = [{ ...base, quantity: 2 }];
  const automatic = layoutSheets(entries, configs(entries), { cropMarks: false, calibration: true });
  const editor = new SheetEditor(automatic);
  const movedId = automatic.pages[0].placements[0].placementId;
  editor.addPage();
  const edited = editor.move({ placementId: movedId, pageIndex: 1, xMm: 23.25, yMm: 31.5, rotated: true });
  assert.equal(findPlacement(edited, movedId).pageIndex, 1);
  const doc = await PDFDocument.load(await generatePdf(edited, png));
  assert.equal(doc.getPageCount(), 3);
  assert.deepEqual(doc.getPages().map(page => imageMatrices(contents(doc, page)).length), [1, 1, 0]);
  const [matrix] = imageMatrices(contents(doc, doc.getPage(1)));
  close(Math.hypot(matrix[0], matrix[1]), 70 * MM_TO_PT);
  close(Math.hypot(matrix[2], matrix[3]), 105 * MM_TO_PT);
  close(matrix[0], 0);
  close(matrix[3], 0);
  assert.ok(matrix[1] > 0 && matrix[2] < 0, 'The moved image is rotated by 90 degrees.');
  const xs = [matrix[4], matrix[4]+matrix[0], matrix[4]+matrix[2], matrix[4]+matrix[0]+matrix[2]];
  const ys = [matrix[5], matrix[5]+matrix[1], matrix[5]+matrix[3], matrix[5]+matrix[1]+matrix[3]];
  close(Math.min(...xs), 23.25 * MM_TO_PT);
  close(Math.max(...xs), (23.25 + 105) * MM_TO_PT);
  close(Math.max(...ys), (297 - 31.5) * MM_TO_PT);
  close(Math.min(...ys), (297 - 31.5 - 70) * MM_TO_PT);
  assert.equal(edited.pages[2].calibration, true);
  assert.deepEqual(automatic.pages.map(page => page.placements.length), [2, 0]);
});
