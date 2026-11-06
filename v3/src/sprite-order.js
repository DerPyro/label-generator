const IDS = ['base', 'genetics', 'thc', 'cbd'];

export function validateSpriteOrder(order) {
  if (!Array.isArray(order) || order.length !== IDS.length || new Set(order).size !== IDS.length || order.some(id => !IDS.includes(id))) {
    throw Error('Die Sprite-Reihenfolge muss jede der vier Bildebenen genau einmal enthalten.');
  }
  return [...order];
}

export function getSpriteOrder(config) {
  return [...IDS].sort((a, b) => config.zIndex[a] - config.zIndex[b]);
}

/** Reassign only the four image slots; text and decorations keep their zIndex. */
export function withSpriteOrder(config, order) {
  if (order === undefined) return config;
  const ids = validateSpriteOrder(order);
  const slots = IDS.map(id => config.zIndex[id]).sort((a, b) => a - b);
  // Keep pack slots intact; the render plan uses this order to resolve ties.
  const zIndex = {...config.zIndex};
  ids.forEach((id, index) => { zIndex[id] = slots[index]; });
  return {...config, zIndex, spriteOrder: ids};
}
