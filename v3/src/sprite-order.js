const IDS = ['base', 'genetics', 'thc', 'cbd'];

export function validateSpriteOrder(order, expectedIds = undefined) {
  const ids=expectedIds||[...IDS,...(Array.isArray(order)&&order.includes('foreground')?['foreground']:[])];
  if (!Array.isArray(order) || order.length !== ids.length || new Set(order).size !== ids.length || order.some(id => !ids.includes(id))) {
    throw Error('Die Sprite-Reihenfolge muss jede vorhandene Bildebene genau einmal enthalten.');
  }
  return [...order];
}

export function getSpriteOrder(config) {
  return [...IDS,...(config.foreground?['foreground']:[])].sort((a, b) => config.zIndex[a] - config.zIndex[b]);
}

/** Reassign image slots; text and decorations keep their zIndex. */
export function withSpriteOrder(config, order) {
  if (order === undefined) return config;
  const expectedIds=getSpriteOrder(config);
  const ids = validateSpriteOrder(order,expectedIds);
  const slots = expectedIds.map(id => config.zIndex[id]).sort((a, b) => a - b);
  // Keep pack slots intact; the render plan uses this order to resolve ties.
  const zIndex = {...config.zIndex};
  ids.forEach((id, index) => { zIndex[id] = slots[index]; });
  return {...config, zIndex, spriteOrder: ids};
}
