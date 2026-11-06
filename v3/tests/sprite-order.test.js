import test from 'node:test';
import assert from 'node:assert/strict';
import {CONFIG} from '../src/config.js';
import {getRenderPlan} from '../src/model.js';
import {getSpriteOrder,withSpriteOrder,validateSpriteOrder} from '../src/sprite-order.js';
import {PrintCartService} from '../src/cart.js';
const sample={name:'Test',year:2026,sativa:75,thc:20,cbd:3};
const order=['cbd','thc','genetics','base'];
test('Image order changes rendering order without changing text slots or source configuration',()=>{
 const before=getRenderPlan(sample,CONFIG),config=withSpriteOrder(CONFIG,order),after=getRenderPlan(sample,config);
 assert.deepEqual(after.layers.filter(layer=>layer.id!=='text').map(layer=>layer.id),order);
 assert.equal(after.layers.findIndex(layer=>layer.id==='text'),before.layers.findIndex(layer=>layer.id==='text'));
 assert.deepEqual(after.levels,before.levels);assert.deepEqual(getSpriteOrder(CONFIG),before.layers.filter(layer=>layer.id!=='text').map(layer=>layer.id));
 assert.equal(withSpriteOrder(CONFIG,undefined),CONFIG);
 assert.notEqual(config,CONFIG);assert.deepEqual(config.spriteOrder,order);
});
test('Reject duplicate, missing and unknown sprite IDs',()=>{
 for(const invalid of [null,{},[],['base'],['base','base','thc','cbd'],['base','genetics','thc','text']])assert.throws(()=>validateSpriteOrder(invalid));
 const input=[...order],copy=validateSpriteOrder(input);input.reverse();assert.deepEqual(copy,order);
});
test('Cart preserves custom orders across reloads and quantity edits; older entries use pack defaults',()=>{
 let saved=null;const storage={getItem:()=>saved,setItem:(_,value)=>saved=value};const cart=new PrintCartService({storage});
 const entry={data:sample,packId:'woodland',packVersion:'1.0.0',layoutId:'rectangular',widthMm:60,quantity:1};
 cart.add({...entry,id:'default'});cart.add({...entry,id:'custom',spriteOrder:order});
 const restored=new PrintCartService({storage});assert.equal(restored.list()[0].spriteOrder,undefined);assert.deepEqual(restored.list()[1].spriteOrder,order);
 restored.update('custom',{quantity:2});assert.deepEqual(restored.list()[1].spriteOrder,order);
 restored.update('custom',{spriteOrder:undefined});assert.equal(new PrintCartService({storage}).list()[1].spriteOrder,undefined);
 assert.throws(()=>restored.update('custom',{spriteOrder:['base']}));assert.equal(restored.list()[1].spriteOrder,undefined);
});

