import { describe, it, expect } from 'vitest'
import { calculateCost, getSlotsNeeded, occupiesIndex, canPlaceItem } from './utils'

describe('utils.calculateCost', () => {
  it('returns 1 for 0 or small weights', () => {
    expect(calculateCost(0)).toBe(1)
    expect(calculateCost(0.5)).toBe(1)
    expect(calculateCost(1)).toBe(1)
  })
  it('returns 3 for <=3 lbs', () => {
    expect(calculateCost(2)).toBe(3)
    expect(calculateCost(3)).toBe(3)
  })
  it('rounds up to nearest 3-slot multiple', () => {
    expect(calculateCost(4)).toBe(6)
    expect(calculateCost(7)).toBe(9)
  })
})

describe('utils.getSlotsNeeded', () => {
  it('returns 1 for small items and cost/3 otherwise', () => {
    expect(getSlotsNeeded(1)).toBe(1)
    expect(getSlotsNeeded(3)).toBe(1)
    expect(getSlotsNeeded(6)).toBe(2)
  })
})

describe('occupiesIndex & canPlaceItem', () => {
  it('properly detects occupied indices for multi-slot items', () => {
    const item = { slotCost: 6, position: 4, instanceId: 'a' }
    expect(occupiesIndex(item, 4)).toBe(true)
    expect(occupiesIndex(item, 5)).toBe(true)
    expect(occupiesIndex(item, 6)).toBe(false)
  })

  it('allows placement in empty grid and rejects overlap', () => {
    const gridSize = 10
    const inventory = [{ slotCost: 3, position: 2, instanceId: 'x' }]
    const newItem = { slotCost: 6 }
    // placing at 0 should be allowed
    expect(canPlaceItem(0, newItem, inventory, gridSize)).toBe(true)
    // placing overlapping existing at position 2 should be rejected
    expect(canPlaceItem(2, newItem, inventory, gridSize)).toBe(false)
  })
})
