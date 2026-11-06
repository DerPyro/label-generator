// Canonical schema definition. scripts/write-schema.js publishes the JSON copy.
const num=(minimum,maximum)=>({type:'number',minimum,maximum});
const str=(maxLength=1000)=>({type:'string',maxLength});
const enumeration=(...values)=>({enum:values});
const obj=(properties,required=[])=>({type:'object',properties,required,additionalProperties:false});
const array=(items,minItems=0,maxItems=128)=>({type:'array',items,minItems,maxItems});
const id={type:'string',pattern:'^[a-z][a-z0-9-]{0,63}$'};
const path=ext=>({type:'string',description:'Safe pack-relative local file path, without URLs, empty or parent segments, query strings or percent encoding.',maxLength:240,pattern:`^(?!.*(?:^|/)\\.\\.?(?:/|$))[a-zA-Z0-9_.-]+(?:/[a-zA-Z0-9_.-]+)*\\.${ext}$`});
const numeric='[-+]?(?:\\d*\\.\\d+|\\d+)';
const triple=unit=>`\\s*${numeric}${unit}\\s*,\\s*${numeric}${unit}\\s*,\\s*${numeric}${unit}\\s*`;
const rgbValues=`(?:${triple('')}|${triple('%')})`;
const hslValues=`\\s*${numeric}\\s*,\\s*${numeric}%\\s*,\\s*${numeric}%\\s*`;
const alpha=`\\s*,\\s*${numeric}%?\\s*`;
const color={type:'string',pattern:`^(#[0-9a-fA-F]{3}(?:[0-9a-fA-F]|[0-9a-fA-F]{3}|[0-9a-fA-F]{5})?|rgb\\(${rgbValues}\\)|rgba\\(${rgbValues}${alpha}\\)|hsl\\(${hslValues}\\)|hsla\\(${hslValues}${alpha}\\)|black|white|transparent)$`};
const shadow=obj({color,blur:num(0,100),offsetX:num(-200,200),offsetY:num(-200,200)},['color']);
const transform={x:num(-8192,8192),y:num(-8192,8192),rotation:num(-360,360),opacity:num(0,1),zIndex:{type:'integer',minimum:-10000,maximum:10000}};
const decoration=obj({id,type:enumeration('sprite','rect'),...transform,relativeTo:id,width:num(1,8192),height:num(1,8192),anchorX:num(0,1),anchorY:num(0,1),scale:num(.01,8),asset:path('png'),color,radius:num(0,4096),padding:num(0,512),border:obj({color,width:num(0,100)},['color','width']),shadow},['id','type','x','y','width','height','zIndex']);
const field=obj({id,source:enumeration('name','producer','year','thc','cbd','indica','sativa','static'),text:str(),font:str(64),...transform,fontSize:num(8,512),minFontSize:num(8,512),maxFontSize:num(8,512),fontWeight:{type:'integer',minimum:100,maximum:900},color,align:enumeration('left','center','right'),verticalAlign:enumeration('top','middle','bottom'),maxWidth:num(1,8192),maxHeight:num(1,8192),maxLines:{type:'integer',minimum:1,maximum:16},wrap:{type:'boolean'},lineHeight:num(.5,3),letterSpacing:num(-20,100),shadow,format:enumeration('raw','percent','year-full','year-short'),prefix:str(200),suffix:str(200),background:decoration,path:obj({type:enumeration('arc'),centerX:num(-8192,8192),centerY:num(-8192,8192),radius:num(1,8192),startAngle:num(-360,360),endAngle:num(-360,360),direction:enumeration('clockwise','counterclockwise')},['type','centerX','centerY','radius','startAngle','endAngle','direction'])},['id','source','font','fontSize','color','zIndex']);
decoration.allOf=[
 {if:{properties:{type:{const:'sprite'}}},then:{required:['asset'],not:{anyOf:['color','radius','padding','border'].map(key=>({required:[key]}))}},else:{required:['color'],not:{required:['asset']}}}
];
decoration.description='Geometric rectangle or local PNG decoration, standalone or bound to a text field.';
decoration.properties.relativeTo={...id,description:'Text-field ID in this layout. Inherit position and rotation with local offsets. Decoration references and cycles are forbidden.'};
field.properties.background={...decoration,description:'Separate ordered decoration bound to this text field using relativeTo and its own unique ID.'};
field.allOf=[
 {if:{required:['path']},then:{not:{anyOf:['x','y','maxWidth'].map(key=>({required:[key]}))},properties:{maxLines:{const:1},wrap:{const:false},...Object.fromEntries(['text','prefix','suffix'].map(key=>[key,{pattern:'^(?![\\s\\S]*[\\r\\n])'}]))}},else:{required:['x','y']}},
 {if:{properties:{source:{const:'static'}}},then:{required:['text']}},
 {if:{required:['format'],properties:{format:{const:'percent'}}},then:{properties:{source:enumeration('thc','cbd','indica','sativa')}}},
 {if:{required:['format'],properties:{format:enumeration('year-full','year-short')}},then:{properties:{source:{const:'year'}}}}
];
const zIndex={...obj(Object.fromEntries(['base','genetics','thc','cbd'].map(key=>[key,transform.zIndex])),['base','genetics','thc','cbd']),description:'Explicit zIndex for each of the four logical image layers.'};
const layers=obj({base:path('png'),...Object.fromEntries(['genetics','thc','cbd'].map(key=>[key,{...array(path('png'),7,7),uniqueItems:true}]))},['base','genetics','thc','cbd']);
const layout=obj({id,name:{...str(120),minLength:1},width:{type:'integer',minimum:64,maximum:4096},height:{type:'integer',minimum:64,maximum:4096},shape:enumeration('circle','rectangle'),preview:path('png'),bleedMm:num(0,20),layers,zIndex,masks:obj(Object.fromEntries(['base','genetics','thc','cbd','text'].map(key=>[key,path('png')]))),typography:obj({fields:array(field),decorations:array(decoration)},['fields','decorations'])},['id','name','width','height','shape','layers','zIndex','typography']);
export const manifestSchema={
 $schema:'https://json-schema.org/draft/2020-12/schema',
 title:'Label Generator v3 Texturepack, compatibilityVersion 2',
 description:'Local PNG composition. Coordinates use native canvas pixels; zIndex ascending, stable category/declaration order. Cross references and geometry also require semantic validation.',
 ...obj({$schema:str(),id,name:{...str(),minLength:1},description:{...str(),minLength:1},author:{...str(),minLength:1},version:{type:'string',pattern:'^\\d+\\.\\d+\\.\\d+(?:-[a-zA-Z0-9.-]+)?$'},compatibilityVersion:{const:2},status:enumeration('placeholder','illustrated'),preview:path('png'),fonts:array(obj({family:{type:'string',pattern:'^[a-zA-Z][a-zA-Z0-9 -]{0,63}$'},path:path('(?:ttf|otf|woff|woff2)'),weight:{type:'string',pattern:'^[1-9]00(?: [1-9]00)?$'}},['family','path']),1,8),layouts:array(layout,1,16)},['id','name','description','author','version','compatibilityVersion','fonts','layouts'])
};
for(const key of ['name','description','author'])manifestSchema.properties[key].pattern='\\S';
layout.properties.name.pattern='\\S';

const descriptions={
 id:'Stable lowercase ID. Unique within the containing pack or layout; base/genetics/thc/cbd/text are reserved element IDs.',
 source:'Input data source; sources may be repeated. static requires text.',
 font:'Exact family registered in the pack fonts array.',family:'Pack-local font family name; isolated from other packs at load time.',
 x:'Native canvas pixel X, or local offset for relativeTo decorations.',y:'Native canvas pixel Y, or local offset for relativeTo decorations.',
 zIndex:'Explicit integer paint order, ascending. Equal values use documented category and declaration order.',
 fonts:'Local TTF, OTF, WOFF or WOFF2 files. Include redistribution licenses.',
 layouts:'Independent native-resolution compositions with unique IDs.',layers:'One full-canvas base and seven distinct sprites for each dynamic category.',
 typography:'Independent text fields and independently ordered decorations. At most 128 total elements including backgrounds.',
 fields:'Text fields in stable declaration order, including repeated data sources.',decorations:'Standalone geometric or PNG elements; optionally linked to a text field.',
 background:'Separate ordered decoration bound to this text field using relativeTo and its own unique ID.',
 relativeTo:'Text-field ID in this layout only. Inherit its position and rotation; references to decorations are forbidden, excluding chains and cycles.',
 asset:'Safe pack-relative PNG path. Decorations may have different source and destination dimensions.',
 fontSize:'Initial font size in native pixels.',minFontSize:'Minimum fitting size; omitted means no shrinking.',maxFontSize:'Upper bound, at least fontSize. Fitting never enlarges above fontSize.',
 maxWidth:'Maximum nominal line width, straight text only; default 8192 pixels.',maxHeight:'Maximum nominal line-block height; glyph ink can extend beyond nominal metrics.',maxLines:'Maximum wrapped lines, default 1; arcs always use one line.',
 wrap:'Default true for straight text, explicit newlines remain supported when false. Arc paths cannot wrap.',
 align:'Horizontal anchor for straight text; start/centre/end placement along arc paths.',verticalAlign:'Top/middle/bottom of nominal straight text block, or glyph baseline alignment on an arc.',
 rotation:'Degrees, positive clockwise. Rotate around text anchor, decoration anchor or arc centre.',
 path:'Single-line circular path replacing x/y. Angles: 0 right, 90 down; equal endpoints mean full circle.',
 radius:'Rounded rectangle corner radius or arc radius in pixels.',startAngle:'Degrees from +X, positive toward +Y.',endAngle:'Degrees from +X; direction selects the modular sweep.',direction:'Character order follows clockwise increasing angles or counterclockwise decreasing angles, with tangential glyph orientation.',
 letterSpacing:'Extra pixel advance between codepoints, default 0. Measurement accounts for overlapping or reversed advances.',
 format:'Only defined data formats, never executable expressions. Percent uses decimal comma and at most two decimal places.',prefix:'Literal text before a nonempty formatted value.',suffix:'Literal text after a nonempty formatted value.',
 opacity:'Additional alpha multiplier, default 1.',scale:'Additional uniform scale, default 1; actual padded dimensions must remain bounded.',
 anchorX:'Horizontal fraction of decoration width used as anchor, default 0.5.',anchorY:'Vertical fraction of decoration height used as anchor, default 0.5.',
 padding:'Fixed geometric padding on every side, not automatically calculated from text.',border:'Optional geometric rectangle stroke.',shadow:'Optional Canvas shadow; bounded blur and offsets.',
 color:'Validated hexadecimal 3/4/6/8 digits, numeric rgb(a)/hsl(a), black, white or transparent.',
 compatibilityVersion:'Exactly 2. Earlier manifests require an author update and are rejected.',version:'Pack content version; increment for published manifest or asset changes.',
 masks:'Full-canvas alpha masks applied per element in the selected logical category.',shape:'Rectangle, or circle with equal canvas width and height.',
 width:'Native canvas dimension or explicit decoration destination width in pixels.',height:'Native canvas dimension or explicit decoration destination height in pixels.'
};
// Shared nodes are visited once so the generated JSON and runtime remain identical.
const visited=new Set();
function describe(schema){
 if(!schema||typeof schema!=='object'||visited.has(schema))return;visited.add(schema);
 for(const [key,child]of Object.entries(schema.properties||{})){if(descriptions[key]&&!child.description)child.description=descriptions[key];describe(child);}
 for(const child of Object.values(schema))if(child&&typeof child==='object'){if(Array.isArray(child))child.forEach(describe);else describe(child);}
}
describe(manifestSchema);

/** The runtime uses exactly the published schema's supported vocabulary. */
export function validateSchema(value,schema=manifestSchema,location='manifest') {
 const fail=message=>{throw new Error(`Texturepack: ${location}: ${message}`);};
 const matches=subschema=>{try{validateSchema(value,subschema,location);return true;}catch{return false;}};
 for(const part of schema.allOf||[])validateSchema(value,part,location);
 if(schema.anyOf&&!schema.anyOf.some(matches))fail('Keine zulässige Alternative.');
 if(schema.not&&matches(schema.not))fail('Widersprüchliche Eigenschaften.');
 if(schema.if){const branch=matches(schema.if)?schema.then:schema.else;if(branch)validateSchema(value,branch,location);}
 if(schema.const!==undefined&&value!==schema.const)fail('Ungültiger konstanter Wert.');
 if(schema.enum&&!schema.enum.includes(value))fail('Nicht unterstützter Wert.');
 if(schema.type){
  const valid=schema.type==='array'?Array.isArray(value):schema.type==='object'?value!==null&&typeof value==='object'&&!Array.isArray(value):schema.type==='integer'?Number.isInteger(value):typeof value===schema.type;
  if(!valid)fail(`Erwartet ${schema.type}.`);
 }
 if(typeof value==='number'&&(!Number.isFinite(value)||value<schema.minimum||value>schema.maximum))fail('Zahl außerhalb des erlaubten Bereichs.');
 if(typeof value==='string'&&((schema.pattern&&!new RegExp(schema.pattern).test(value))||value.length<(schema.minLength||0)||value.length>(schema.maxLength??Infinity)))fail('Ungültige Zeichenfolge.');
 if(Array.isArray(value)){
  if(value.length<(schema.minItems||0)||value.length>(schema.maxItems??Infinity)||schema.uniqueItems&&new Set(value).size!==value.length)fail('Ungültige Anzahl oder doppelte Einträge.');
  value.forEach((item,i)=>validateSchema(item,schema.items,`${location}[${i}]`));
 }
 if(value!==null&&typeof value==='object'&&!Array.isArray(value)){
  for(const key of schema.required||[])if(!Object.hasOwn(value,key))fail(`${key} fehlt.`);
  for(const [key,item] of Object.entries(value)){
   if(schema.additionalProperties===false&&!Object.hasOwn(schema.properties||{},key))fail(`Unbekannte Eigenschaft ${key}.`);
   if(Object.hasOwn(schema.properties||{},key))validateSchema(item,schema.properties[key],`${location}.${key}`);
  }
 }
 return value;
}
