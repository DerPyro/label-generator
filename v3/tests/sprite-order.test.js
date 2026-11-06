import test from 'node:test';
import assert from 'node:assert/strict';
import {CONFIG} from '../src/config.js';
import {getRenderPlan} from '../src/model.js';
import {getSpriteOrder,withSpriteOrder,validateSpriteOrder} from '../src/sprite-order.js';
import {PrintCartService} from '../src/cart.js';
const sample={name:'Test',year:2026,sativa:75,thc:20,cbd:3};
const order=['cbd','thc','genetics','base'];
test('Reordering changes image composition while preserving pack, text, masks and selected levels',()=>{
 const before=getRenderPlan(sample,CONFIG),changed=withSpriteOrder(CONFIG,order),after=getRenderPlan(sample,changed);
 assert.deepEqual(after.elements.filter(e=>e.type==='layer').map(e=>e.id),order);
 assert.deepEqual(after.levels,before.levels);
 assert.deepEqual(after.elements.filter(e=>e.type!=='layer'),before.elements.filter(e=>e.type!=='layer'));
 assert.equal(changed.typography,CONFIG.typography);assert.equal(changed.masks,CONFIG.masks);
 assert.deepEqual(getSpriteOrder(CONFIG),['base','genetics','thc','cbd']);
 assert.equal(withSpriteOrder(CONFIG,undefined),CONFIG);
 const tied={...CONFIG,zIndex:{base:0,genetics:0,thc:0,cbd:0}};
 assert.deepEqual(getRenderPlan(sample,withSpriteOrder(tied,order)).elements.filter(e=>e.type==='layer').map(e=>e.id),order);
});
test('Invalid and duplicate orders are rejected; valid inputs are isolated',()=>{
 for(const invalid of [null,{},[],['base'],['base','base','thc','cbd'],['base','genetics','thc','text']])assert.throws(()=>validateSpriteOrder(invalid));
 const input=[...order],copy=validateSpriteOrder(input);input.reverse();assert.deepEqual(copy,order);
});
test('Cart persists independent sprite orders, restores old entries and resets to pack order',()=>{
 let saved=null;const storage={getItem:()=>saved,setItem:(_,value)=>saved=value};
 const cart=new PrintCartService({storage});
 const entry={data:sample,packId:'woodland',packVersion:'1.0.0',layoutId:'rectangular',widthMm:60,quantity:1};
 cart.add({...entry,id:'default'});cart.add({...entry,id:'custom',spriteOrder:order});
 const restored=new PrintCartService({storage});
 assert.equal(restored.list()[0].spriteOrder,undefined);assert.deepEqual(restored.list()[1].spriteOrder,order);
 restored.update('custom',{quantity:2});assert.deepEqual(restored.list()[1].spriteOrder,order);
 restored.update('custom',{spriteOrder:undefined});assert.equal(new PrintCartService({storage}).list()[1].spriteOrder,undefined);
 assert.throws(()=>restored.update('custom',{spriteOrder:['base']}));assert.equal(restored.list()[1].spriteOrder,undefined);
});
