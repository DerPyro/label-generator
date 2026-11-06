/** @typedef {import('./types.d.ts').LayerLevel} LayerLevel */
export const LIMITS = Object.freeze({ thc: 40, cbd: 20 });
// Inclusive ascending upper bounds: decimal values are assigned without gaps.
/** @type {Readonly<Record<import('./types.d.ts').DynamicLayer, import('./types.d.ts').ThresholdTuple>>} */
export const THRESHOLDS = Object.freeze({ genetics: Object.freeze([14,29,44,59,74,89,100]), thc: Object.freeze([5,11,17,23,29,35,40]), cbd: Object.freeze([2,5,8,11,14,17,20]) });
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
// Generated default from woodland/pack.json; check-static verifies parity.
export const DEFAULT_TYPOGRAPHY = {
  "fields": [
    {
      "id": "strain-name",
      "source": "name",
      "font": "LabelSerif",
      "x": 600,
      "y": 760,
      "fontSize": 76,
      "minFontSize": 30,
      "maxWidth": 840,
      "align": "center",
      "verticalAlign": "middle",
      "color": "#21382d",
      "zIndex": 401,
      "maxLines": 3,
      "lineHeight": 1.14,
      "fontWeight": 600
    },
    {
      "id": "producer",
      "source": "producer",
      "font": "LabelSerif",
      "x": 600,
      "y": 925,
      "fontSize": 34,
      "minFontSize": 16,
      "maxWidth": 800,
      "align": "center",
      "verticalAlign": "middle",
      "color": "#21382d",
      "zIndex": 401
    },
    {
      "id": "year",
      "source": "year",
      "font": "LabelSerif",
      "x": 600,
      "y": 990,
      "fontSize": 46,
      "minFontSize": 46,
      "maxWidth": 1200,
      "align": "center",
      "verticalAlign": "middle",
      "color": "#21382d",
      "zIndex": 401,
      "format": "year-short",
      "prefix": "’"
    },
    {
      "id": "thc-value",
      "source": "thc",
      "font": "LabelSerif",
      "x": 600,
      "y": 1460,
      "fontSize": 38,
      "minFontSize": 16,
      "maxWidth": 440,
      "align": "right",
      "verticalAlign": "middle",
      "color": "#21382d",
      "zIndex": 401,
      "format": "percent",
      "prefix": "THC: ",
      "suffix": "  |  "
    },
    {
      "id": "cbd-value",
      "source": "cbd",
      "font": "LabelSerif",
      "x": 600,
      "y": 1460,
      "fontSize": 38,
      "minFontSize": 16,
      "maxWidth": 440,
      "align": "left",
      "verticalAlign": "middle",
      "color": "#21382d",
      "zIndex": 401,
      "format": "percent",
      "prefix": "CBD: "
    },
    {
      "id": "indica",
      "source": "indica",
      "font": "LabelSerif",
      "x": 600,
      "y": 1518,
      "fontSize": 38,
      "minFontSize": 16,
      "maxWidth": 440,
      "align": "right",
      "verticalAlign": "middle",
      "color": "#21382d",
      "zIndex": 401,
      "format": "percent",
      "prefix": "Indica: ",
      "suffix": "  |  "
    },
    {
      "id": "sativa",
      "source": "sativa",
      "font": "LabelSerif",
      "x": 600,
      "y": 1518,
      "fontSize": 38,
      "minFontSize": 16,
      "maxWidth": 440,
      "align": "left",
      "verticalAlign": "middle",
      "color": "#21382d",
      "zIndex": 401,
      "format": "percent",
      "prefix": "Sativa: "
    }
  ],
  "decorations": [
    {
      "id": "panel-0",
      "type": "rect",
      "x": 140,
      "y": 625,
      "width": 920,
      "height": 420,
      "radius": 48,
      "color": "rgba(249, 241, 218, 0.94)",
      "anchorX": 0,
      "anchorY": 0,
      "zIndex": 400
    },
    {
      "id": "panel-1",
      "type": "rect",
      "x": 120,
      "y": 1385,
      "width": 960,
      "height": 190,
      "radius": 32,
      "color": "rgba(249, 241, 218, 0.94)",
      "anchorX": 0,
      "anchorY": 0,
      "zIndex": 400
    }
  ]
};
export const CONFIG = {
 id:'woodland',packId:'woodland',packVersion:'1.0.0',assetVersion:'woodland@1.0.0',assetStatus:'placeholder',layoutId:'rectangular',layoutName:'Klassisches Hochformat',format:'rectangular',shape:'rectangle',width:1200,height:1800,limits:LIMITS,thresholds:THRESHOLDS,
 zIndex:{"base":0,"genetics":100,"thc":200,"cbd":300},
 base:{id:'base',label:'Papier & Grundform',path:new URL('rectangular/base.png',root).href},genetics:layer('genetics'),thc:layer('thc'),cbd:layer('cbd'),
 fonts:[{"family":"LabelSerif","path":"fonts/label-serif.ttf","weight":"400 700"}].map(font=>({...font,path:new URL(font.path,root).href})),
 typography:DEFAULT_TYPOGRAPHY
};
