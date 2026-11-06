import { LIMITS } from './config.js';

export const layerAssetPath = entry => typeof entry === 'string' ? entry : entry.asset;

/** Numeric bounds are inclusive; rule objects use exclusive below bounds and a final catch-all. */
export function validateThresholds(boundaries, layer) {
 const max = ['genetics','foreground'].includes(layer) ? 100 : LIMITS[layer];
 const fail = () => { throw new Error(`Ungültige Grenzwerte für ${layer}: aufsteigend, vollständig und innerhalb 0–${max} erforderlich.`); };
 if (!max || !Array.isArray(boundaries) || !boundaries.length || boundaries.length > 64) fail();
 const rules = typeof boundaries[0] === 'object';
 let previous = 0;
 for (const [index, entry] of boundaries.entries()) {
  if (rules) {
   if (!entry || typeof entry !== 'object' || Array.isArray(entry)) fail();
   if (index === boundaries.length - 1) { if (Object.hasOwn(entry, 'below')) fail(); continue; }
  }
  const bound = rules ? entry.below : entry;
  if (typeof bound !== 'number' || !Number.isFinite(bound) || bound <= previous || bound > max) fail();
  previous = bound;
 }
 if (!rules && previous !== max) fail();
 return rules;
}
