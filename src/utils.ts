export const calculateCost = (lbs: number) => {
  if (!lbs || lbs <= 1) return 1
  if (lbs <= 3) return 3
  const slots = Math.ceil(lbs / 3)
  return slots * 3
}

export const getSlotsNeeded = (cost: number) => cost === 1 ? 1 : cost / 3

export const determineCategory = (type: string | undefined, name: string) => {
  const t = (type || '').toLowerCase()
  if (t.includes('weapon') || /sword|dagger|bow|axe/i.test(name)) return 'weapon'
  if (t.includes('armor') || /armor|plate|helmet|shield/i.test(name)) return 'armor'
  if (t.includes('consumable') || /potion|elixir|food|scroll/i.test(name)) return 'consumable'
  return 'gear'
}

export const getIconForType = (type: string | undefined, name: string) => {
  if (/sword|dagger|axe|bow/i.test(name)) return '⚔️'
  if (/armor|shield/i.test(name)) return '🛡️'
  if (/potion|elixir|drink/i.test(name)) return '🧪'
  return '📦'
}

export const occupiesIndex = (invItem: any, index: number, getSlots = getSlotsNeeded) => {
  if (invItem.slotCost === 1) return invItem.position === index
  const slots = getSlots(invItem.slotCost)
  return index >= invItem.position && index < invItem.position + slots
}

export const canPlaceItem = (startIndex: number, itemDef: any, inventoryArr: any[], gridSize: number, excludeInstanceId: any = null) => {
  if (!itemDef) return false
  if (itemDef.slotCost === 1) {
    const count = inventoryArr.filter(i => i.position === startIndex && i.slotCost === 1 && i.instanceId !== excludeInstanceId).length
    return count < 3
  }
  const slotsNeeded = getSlotsNeeded(itemDef.slotCost)
  if (startIndex < 0 || startIndex + slotsNeeded > gridSize) return false
  for (let i = 0; i < slotsNeeded; i++) {
    const idx = startIndex + i
    const blocking = inventoryArr.find(it => it.instanceId !== excludeInstanceId && occupiesIndex(it, idx))
    if (blocking) return false
  }
  return true
}

export const findFirstFreeSlot = (itemDef: any, inventoryArr: any[], gridSize: number) => {
  for (let i = 0; i < gridSize; i++) if (canPlaceItem(i, itemDef, inventoryArr, gridSize)) return i
  return -1
}
