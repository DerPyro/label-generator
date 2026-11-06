import { LAYER_ORDER } from './config.js';
const IDS = ['base', 'genetics', 'thc', 'cbd'];
export function validateSpriteOrder(order) {
 if (!Array.isArray(order) || order.length !== IDS.length || new Set(order).size !== IDS.length || order.some(id => !IDS.includes(id))) throw Error('Die Sprite-Reihenfolge muss jede der vier Bildebenen genau einmal enthalten.');
 return [...order];
}
export function getSpriteOrder(config) {
 return (config.layerOrder || LAYER_ORDER).filter(id => id !== 'text');
}
export function withSpriteOrder(config, order) {
 if (order === undefined) return config;
 const ids=validateSpriteOrder(order);let index=0;
 const layerOrder=(config.layerOrder || LAYER_ORDER).map(id => id === 'text' ? id : ids[index++]);
 return {...config,layerOrder,spriteOrder:ids};
}
