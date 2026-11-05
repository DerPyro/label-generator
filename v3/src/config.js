/** @typedef {import('./types.d.ts').LayerLevel} LayerLevel */
export const LIMITS = Object.freeze({ thc: 40, cbd: 20 });
// Inclusive ascending upper bounds: decimal values are assigned without gaps.
/** @type {Readonly<Record<import('./types.d.ts').DynamicLayer, import('./types.d.ts').ThresholdTuple>>} */
export const THRESHOLDS = Object.freeze({ genetics: Object.freeze([14,29,44,59,74,89,100]), thc: Object.freeze([5,11,17,23,29,35,40]), cbd: Object.freeze([2,5,8,11,14,17,20]) });
export const LAYER_ORDER = Object.freeze(['base','genetics','thc','cbd','text']);
export const LAYER_LABELS = {
  "genetics": [
    "Tiefe Nacht",
    "Späte Abenddämmerung",
    "Sonnenuntergang",
    "Goldener Nachmittag",
    "Heller Nachmittag",
    "Sonniger Vormittag",
    "Klarer Morgen"
  ],
  "thc": [
    "Klarer Himmel",
    "Leicht bewölkt",
    "Wolkig",
    "Stark bewölkt",
    "Regenwolken mit Regen",
    "Gewitter mit Blitzen",
    "Heftiges Gewitter"
  ],
  "cbd": [
    "Kleine Blätter",
    "Zarte Ranken",
    "Kleine Blüten",
    "Florale Verzierungen",
    "Große Blüten und Ranken",
    "Üppige Ornamentik",
    "Dichter Blütenrahmen"
  ]
};
const root = new URL('../texturepacks/woodland/', import.meta.url);
const layer = id => Array.from({length:7},(_,index)=>({level:index+1,label:LAYER_LABELS[id][index],path:new URL(`rectangular/${id}/${index+1}.png`,root).href}));
export const CONFIG = {
 id:'woodland', packId:'woodland',packVersion:'1.0.0',assetVersion:'woodland@1.0.0',assetStatus:'placeholder',layoutId:'rectangular',layoutName:'Klassisches Hochformat',format:'rectangular',shape:'rectangle',width:1200,height:1800,limits:LIMITS,thresholds:THRESHOLDS,layerOrder:LAYER_ORDER,
 base:{id:'base',label:'Papier & Grundform',path:new URL('rectangular/base.png',root).href},genetics:layer('genetics'),thc:layer('thc'),cbd:layer('cbd'),
 typography:{...{"family":"LabelSerif","ink":"#21382d","panel":"rgba(249, 241, 218, 0.94)","panels":[{"x":140,"y":625,"width":920,"height":420,"radius":48},{"x":120,"y":1385,"width":960,"height":190,"radius":32}],"name":{"centerX":600,"centerY":760,"maxWidth":840,"maxLines":3,"maxSize":76,"minSize":30,"lineHeight":1.14},"producer":{"x":600,"y":925,"maxWidth":800,"maxSize":34,"minSize":16},"year":{"x":600,"y":990,"size":46},"footer":{"x":600,"y":1460,"gap":58,"size":38,"maxWidth":880}},fontPath:new URL('fonts/label-serif.ttf',root).href}
};
