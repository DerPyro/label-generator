// Rebuild manifest geometry only. Authored illustrations are never overwritten.
import { mkdir, writeFile } from 'node:fs/promises';
const root = new URL('../texturepacks/natural-boho/', import.meta.url);
const bounds = { genetics: [14, 29, 44, 59, 74, 89], thc: [5, 11, 17, 23, 29, 35], cbd: [2, 5, 8, 11, 14, 17] };
const sprite = (id, asset, x, y, width, height, zIndex = 450) => ({ id, type: 'sprite', asset, x, y, width, height, zIndex });
function layout(id, width, height, round) {
  const x = width / 2, titleY = round ? 535 : 650;
  const field = (id, source, y, size, extra = {}) => ({ id, source, font: 'Lora', x, y, fontSize: size, minFontSize: 24, maxWidth: round ? 660 : 640, maxLines: 1, color: '#425D43', zIndex: 500, ...extra });
  const valueY = round ? 835 : 1020, geneY = round ? 915 : 1135, offset = round ? 155 : 166;
  const plaque = (id, source, dx) => field(id, source, valueY, round ? 44 : 40, {
    x: x + dx, format: 'percent', prefix: source.toUpperCase() + '  ', maxWidth: 264,
    background: { ...sprite(id + '-plaque', 'decorations/value-plaque.png', 0, 0, 292, 100, 440), relativeTo: id },
  });
  return {
    id, name: round ? 'Round Lid' : 'Classic Portrait', width, height,
    shape: round ? 'circle' : 'rectangle', bleedMm: 0,
    preview: id + '-preview.png',
    layers: {
      base: `layouts/${id}/base.png`,
      ...Object.fromEntries(['genetics', 'thc', 'cbd'].map(category => [category, Array.from({ length: 7 }, (_, i) => ({ ...(i < 6 ? { below: bounds[category][i] } : {}), asset: `layouts/${id}/${category}/${i + 1}.png` }))])),
      foreground: `layouts/${id}/foreground.png`,
    },
    zIndex: { base: 0, genetics: 100, thc: 200, foreground: 250, cbd: 300 },
    typography: {
      fields: [
        field('strain-name', 'name', titleY, round ? 92 : 100, {
          font: 'Shrikhand', minFontSize: 32, maxWidth: round ? 650 : 620, maxHeight: 230, maxLines: 3, lineHeight: 1.04,
          background: { ...sprite('name-plaque', `decorations/${round ? 'round-medallion' : 'portrait-plaque'}.png`, 0, round ? 125 : 0, round ? 850 : 780, round ? 760 : 310, round ? 425 : 450), relativeTo: 'strain-name' },
        }),
        field('harvest-year', 'year', round ? 698 : 850, round ? 38 : 36, { format: 'year-full', prefix: 'Ernte ' }),
        field('producer-name', 'producer', round ? 757 : 915, round ? 32 : 30, { minFontSize: 18, maxLines: 2, maxHeight: 65, lineHeight: 1.1, maxWidth: round ? 570 : 600 }),
        plaque('thc-value', 'thc', -offset), plaque('cbd-value', 'cbd', offset),
        field('indica-value', 'indica', geneY, round ? 34 : 32, { x: x - offset, format: 'percent', prefix: 'Indica  ', maxWidth: 280 }),
        field('sativa-value', 'sativa', geneY, round ? 34 : 32, { x: x + offset, format: 'percent', prefix: 'Sativa  ', maxWidth: 280 }),
      ],
      decorations: [
        sprite('information-paper', 'decorations/value-plaque.png', x, round ? 908 : 1134, round ? 660 : 690, 105, round ? 435 : 420),
        { ...sprite('foreground-sprig', 'decorations/foreground-sprig.png', round ? -358 : -358, round ? 30 : 95, 105, 155, 600), relativeTo: 'strain-name', rotation: -12 },
      ],
    },
  };
}
await mkdir(root, { recursive: true });
await writeFile(new URL('pack.json', root), JSON.stringify({
  id: 'natural-boho', name: 'Natural Boho', version: '1.1.0', compatibilityVersion: 2,
  description: 'Märchenhafte Naturillustration und groovige 70er-Jahre-Farben: Tageszyklus, Rauchspiralen und eine wachsende Pilzwelt.',
  author: 'label-generator contributors', status: 'illustrated', preview: 'preview.png',
  fonts: [{ family: 'Shrikhand', path: 'fonts/shrikhand/Shrikhand-Regular.ttf', weight: '400' }, { family: 'Lora', path: 'fonts/lora/label-serif.ttf', weight: '400 700' }],
  layouts: [layout('classic-portrait', 1024, 1536, false), layout('round-lid', 1254, 1254, true)],
}, null, 2) + '\n');
console.log('Natural Boho: Manifest geschrieben; Illustrationen unverändert.');
