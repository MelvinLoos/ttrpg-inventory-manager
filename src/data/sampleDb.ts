import { calculateCost } from '../utils'
import type { Item } from '../types'

export const sampleDb: Item[] = [
  { id: 'rope-50', name: 'Rope (50ft)', weight: 10, slotCost: calculateCost(10), icon: '🪢', category: 'gear' },
  { id: 'torch', name: 'Torch', weight: 1, slotCost: calculateCost(1), icon: '🔥', category: 'gear' },
  { id: 'shortsword', name: 'Shortsword', weight: 3, slotCost: calculateCost(3), icon: '⚔️', category: 'weapon' },
  { id: 'chainmail', name: 'Chain Mail', weight: 40, slotCost: calculateCost(40), icon: '🛡️', category: 'armor' },
  { id: 'healing-potion', name: 'Healing Potion', weight: 0.5, slotCost: calculateCost(0.5), icon: '🧪', category: 'consumable' },
  { id: 'backpack', name: 'Backpack', weight: 2, slotCost: calculateCost(2), icon: '🎒', category: 'gear' }
]

export default sampleDb
