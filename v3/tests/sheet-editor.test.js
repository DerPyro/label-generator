import test from 'node:test';
import assert from 'node:assert/strict';
import { layoutSheets, configKey, validateLayout } from '../src/print.js';
import { SheetEditor, findPlacement, movePlacement, addBlankPage } from '../src/sheet-editor.js';

const config = { width: 1200, height: 1800, shape: 'rectangle' };
const entry = { id: 'manual-label', data: { name: 'Silver Haze' }, packId: 'woodland', packVersion: '1.0.0', layoutId: 'rectangular', quantity: 2, widthMm: 40 };
function fixture({ entries = [entry], settings = {} } = {}) {
  const configs = new Map(entries.map(item => [configKey(item), item.layoutId === 'circular' ? { width: 1200, height: 1200, shape: 'circle' } : config]));
  return layoutSheets(entries, configs, { cropMarks: false, ...settings });
}
const firstId = layout => layout.pages[0].placements[0].placementId;

test('Legal move copies geometry and keeps render records, counts and native proportions', () => {
  const original = fixture(); const before = structuredClone(original);
  const id = firstId(original); const source = findPlacement(original, id).placement;
  const moved = movePlacement(original, { placementId: id, xMm: 5, yMm: 80 });
  assert.deepEqual(original, before);
  assert.notEqual(moved, original); assert.notEqual(moved.pages[0], original.pages[0]);
  const placement = findPlacement(moved, id).placement;
  assert.equal(placement.yMm, 80); assert.equal(placement.entry, source.entry); assert.equal(placement.config, source.config);
  assert.equal(placement.originalWidthMm, source.originalWidthMm); assert.equal(placement.originalHeightMm, source.originalHeightMm);
  assert.equal(moved.totalLabels, original.totalLabels); assert.equal(placement.entry.quantity, 2);
  validateLayout(moved);
});

test('Out-of-page, overlap, invalid page and malformed positions are rejected without mutation', () => {
  const original = fixture(); const before = structuredClone(original); const id = firstId(original);
  const other = original.pages[0].placements[1];
  for (const change of [{ xMm: -1 }, { yMm: 280 }, { xMm: other.xMm, yMm: other.yMm }, { pageIndex: 999 }, { pageIndex: 0.5 }, { xMm: NaN }, { xMm: '5' }, { rotated: 90 }]) {
    assert.throws(() => movePlacement(original, { placementId: id, ...change }));
    assert.deepEqual(original, before);
  }
  assert.throws(() => findPlacement(original, 'missing'), /nicht mehr/);
});

test('Bleed, crop-mark reservation, page margins and configured gaps are respected', () => {
  const original = fixture({ entries: [{ ...entry, widthMm: 20 }], settings: { marginMm: 7, gapMm: 3, bleedMm: 2, cropMarks: true } });
  const id = firstId(original); const placement = findPlacement(original, id).placement;
  assert.throws(() => movePlacement(original, { placementId: id, xMm: placement.xMm - 1 }));
  // Trim boxes remain disjoint, but the reserved crop/bleed/gap footprint collides.
  assert.throws(() => movePlacement(original, { placementId: id, xMm: placement.xMm + 1 }));
});

test('Rectangular 90-degree rotation preserves original size and does not edit artwork', () => {
  const original = fixture(); const id = firstId(original); const source = findPlacement(original, id).placement;
  const moved = movePlacement(original, { placementId: id, xMm: 5, yMm: 80, rotated: !source.rotated });
  const turned = findPlacement(moved, id).placement;
  assert.equal(turned.widthMm, source.heightMm); assert.equal(turned.heightMm, source.widthMm);
  assert.equal(turned.config, source.config); assert.equal(turned.entry, source.entry);
  const restored = movePlacement(moved, { placementId: id, rotated: source.rotated });
  assert.equal(findPlacement(restored, id).placement.widthMm, source.widthMm);
  const round = fixture({ entries: [{ ...entry, quantity: 1, layoutId: 'circular' }] });
  assert.throws(() => movePlacement(round, { placementId: firstId(round), rotated: true }), /Runde Etiketten/);
});

test('Copies move between existing pages; blank pages precede protected calibration page', () => {
  const original = fixture({ settings: { calibration: true } }); const id = firstId(original);
  assert.throws(() => movePlacement(original, { placementId: id, pageIndex: 1, xMm: 5, yMm: 5 }), /Kalibrierungsseite/);
  const expanded = addBlankPage(original);
  assert.equal(expanded.pages.length, 3); assert.equal(expanded.pages[1].placements.length, 0); assert.equal(expanded.pages[2].calibration, true);
  const moved = movePlacement(expanded, { placementId: id, pageIndex: 1, xMm: 20, yMm: 20 });
  assert.equal(findPlacement(moved, id).pageIndex, 1); assert.equal(moved.pages[0].placements.length, 1);
  assert.equal(moved.totalLabels, original.totalLabels); validateLayout(moved);
});

test('Undo/redo covers moves and added pages, rejects invalid history and clears branches', () => {
  const layout = fixture(); const id = firstId(layout); const editor = new SheetEditor(layout);
  assert.equal(editor.canUndo, false); assert.equal(editor.canRedo, false);
  editor.move({ placementId: id, yMm: 80 });
  assert.equal(editor.canUndo, true); assert.equal(findPlacement(editor.undo(), id).placement.yMm, 5);
  assert.equal(editor.canRedo, true); assert.equal(findPlacement(editor.redo(), id).placement.yMm, 80);
  const current = editor.current;
  assert.throws(() => editor.move({ placementId: id, yMm: -1 })); assert.deepEqual(editor.current, current);
  editor.undo(); editor.move({ placementId: id, yMm: 90 }); assert.equal(editor.canRedo, false);
  const count = editor.current.pages.length; editor.addPage(); assert.equal(editor.current.pages.length, count + 1);
  editor.undo(); assert.equal(editor.current.pages.length, count); editor.redo(); assert.equal(editor.current.pages.length, count + 1);
  editor.reset(layout); assert.equal(editor.canUndo, false); assert.equal(editor.canRedo, false); assert.deepEqual(editor.current, layout);
});

test('Snapshots isolate editable arrays and history retains at most 30 edits', () => {
  const layout = fixture(); const id = firstId(layout); const editor = new SheetEditor(layout);
  layout.pages[0].placements[0].xMm = 999;
  const snapshot = editor.current; snapshot.pages[0].placements.splice(0, 1); snapshot.settings.marginMm = 999;
  assert.equal(editor.current.pages[0].placements.length, 2); assert.equal(editor.current.settings.marginMm, 5);
  for (let i = 0; i < 35; i++) editor.move({ placementId: id, yMm: 80 + i });
  let count = 0; while (editor.canUndo) { editor.undo(); count++; }
  assert.equal(count, 30); assert.equal(findPlacement(editor.current, id).placement.yMm, 84);
});
