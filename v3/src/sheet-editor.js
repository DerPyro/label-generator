import { validateLayout } from './print.js';

const HISTORY_LIMIT = 30;
const fail = message => { throw new Error(`Druckbogen: ${message}`); };

// Copy editable geometry, but retain the pinned entries/configs used by the
// existing renderer. No artwork bytes or pack configuration are rewritten.
function copyLayout(layout) {
  if (!layout || !Array.isArray(layout.pages)) fail('Ein gültiges Bogenlayout ist erforderlich.');
  return {
    ...layout,
    settings: { ...layout.settings },
    pages: layout.pages.map(page => ({ ...page, placements: page.placements.map(placement => ({ ...placement })) })),
    ...(Array.isArray(layout.groups) ? { groups: layout.groups.map(group => ({ ...group })) } : {}),
    ...(Array.isArray(layout.warnings) ? { warnings: [...layout.warnings] } : {}),
  };
}

/** Find an ID regardless of its current page. Returned geometry is a copy. */
export function findPlacement(layout, placementId) {
  if (typeof placementId !== 'string' || !placementId) fail('Bitte ein Etikett auswählen.');
  if (!layout || !Array.isArray(layout.pages)) fail('Ein gültiges Bogenlayout ist erforderlich.');
  let found = null;
  layout.pages.forEach((page, pageIndex) => {
    if (!Array.isArray(page.placements)) fail('Die Platzierungsliste ist ungültig.');
    page.placements.forEach((placement, index) => {
      if (placement.placementId !== placementId) return;
      if (found) fail('Eine Platzierungs-ID ist mehrfach vorhanden. Bitte den Bogen neu anordnen.');
      found = { pageIndex, index, placement: { ...placement } };
    });
  });
  if (!found) fail('Das ausgewählte Etikett ist nicht mehr auf dem Bogen vorhanden.');
  return found;
}

/** Move trim coordinates in millimetres; the print validator checks reserved
 * bleed/crop areas, spacing, margins, quantity and aspect ratio together. */
export function movePlacement(layout, { placementId, pageIndex, xMm, yMm, rotated } = {}) {
  validateLayout(layout);
  const source = findPlacement(layout, placementId);
  const targetPage = pageIndex === undefined ? source.pageIndex : pageIndex;
  if (!Number.isInteger(targetPage) || targetPage < 0 || targetPage >= layout.pages.length) fail('Die gewählte Zielseite existiert nicht.');
  if (layout.pages[targetPage].calibration) fail('Auf der Kalibrierungsseite dürfen keine Etiketten liegen.');
  const x = xMm === undefined ? source.placement.xMm : xMm;
  const y = yMm === undefined ? source.placement.yMm : yMm;
  if (typeof x !== 'number' || typeof y !== 'number' || !Number.isFinite(x) || !Number.isFinite(y)) fail('Positionen müssen gültige Millimeterwerte sein.');
  const turn = rotated === undefined ? source.placement.rotated : rotated;
  if (typeof turn !== 'boolean') fail('Eine Drehung muss als 0° oder 90° gewählt werden.');
  if (source.placement.config.shape === 'circle' && turn) fail('Runde Etiketten benötigen keine 90°-Drehung.');
  const next = copyLayout(layout);
  const placement = {
    ...source.placement, xMm: x, yMm: y, rotated: turn,
    widthMm: turn ? source.placement.originalHeightMm : source.placement.originalWidthMm,
    heightMm: turn ? source.placement.originalWidthMm : source.placement.originalHeightMm,
  };
  if (source.pageIndex === targetPage) next.pages[targetPage].placements[source.index] = placement;
  else {
    next.pages[source.pageIndex].placements.splice(source.index, 1);
    next.pages[targetPage].placements.push(placement);
  }
  validateLayout(next);
  return next;
}

/** Insert a label page before the calibration reference, keeping all copies. */
export function addBlankPage(layout) {
  validateLayout(layout);
  const next = copyLayout(layout);
  const sample = next.pages.find(page => !page.calibration) || next.pages[0];
  const page = { widthMm: sample.widthMm, heightMm: sample.heightMm, groupKey: 'manual', capacity: 0, placements: [] };
  const calibrationIndex = next.pages.findIndex(item => item.calibration);
  next.pages.splice(calibrationIndex < 0 ? next.pages.length : calibrationIndex, 0, page);
  validateLayout(next);
  return next;
}

function sameGeometry(a, b) {
  return a.pages.length === b.pages.length && a.pages.every((page, pageIndex) => {
    const other = b.pages[pageIndex];
    return page.placements.length === other.placements.length && page.placements.every((placement, index) => {
      const target = other.placements[index];
      return ['placementId', 'xMm', 'yMm', 'widthMm', 'heightMm', 'rotated'].every(key => placement[key] === target[key]);
    });
  });
}

/** Bounded geometry history; invalid moves never enter the undo stack. */
export class SheetEditor {
  #layout;
  #past = [];
  #future = [];

  constructor(layout) { this.reset(layout); }
  get current() { return copyLayout(this.#layout); }
  get canUndo() { return this.#past.length > 0; }
  get canRedo() { return this.#future.length > 0; }

  #remember(next) {
    if (sameGeometry(this.#layout, next)) return this.current;
    this.#past.push(this.#layout);
    if (this.#past.length > HISTORY_LIMIT) this.#past.shift();
    this.#layout = next;
    this.#future = [];
    return this.current;
  }

  move(args) { return this.#remember(movePlacement(this.#layout, args)); }
  addPage() { return this.#remember(addBlankPage(this.#layout)); }

  undo() {
    if (this.canUndo) {
      this.#future.push(this.#layout);
      this.#layout = this.#past.pop();
    }
    return this.current;
  }

  redo() {
    if (this.canRedo) {
      this.#past.push(this.#layout);
      if (this.#past.length > HISTORY_LIMIT) this.#past.shift();
      this.#layout = this.#future.pop();
    }
    return this.current;
  }

  reset(layout) {
    validateLayout(layout);
    this.#layout = copyLayout(layout);
    this.#past = [];
    this.#future = [];
    return this.current;
  }
}
