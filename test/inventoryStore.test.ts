import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useInventoryStore } from '../src/stores/inventoryStore'
import type { Item, InventoryItem } from '../src/types'

describe('inventoryStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('autoAddItem adds an item when space exists', () => {
    const store = useInventoryStore()
    const added = store.autoAddItem({ id: 'test', name: 'Test', weight: 1, slotCost: 1 } as Item)
    expect(added).toBe(true)
    expect(store.inventory.length).toBeGreaterThan(0)
  })

  it('removeItem removes by instanceId', () => {
    const store = useInventoryStore()
    store.inventory = [{ id: 'x', name: 'X', weight: 1, slotCost: 1, instanceId: 'abc', position: 0 } as InventoryItem]
    store.removeItem('abc')
    expect(store.inventory.length).toBe(0)
  })

  it('updatePosition moves item when valid and rejects when blocked', () => {
    const store = useInventoryStore()
    store.inventory = [{ id: 'big', name: 'Big', weight: 6, slotCost: 6, instanceId: 'big1', position: 0 } as InventoryItem]
    const ok = store.updatePosition('big1', 1)
    expect(ok).toBe(true)
    store.inventory.push({ id: 'block', name: 'Block', weight: 3, slotCost: 3, instanceId: 'b1', position: 3 } as InventoryItem)
    const ok2 = store.updatePosition('big1', 3)
    expect(ok2).toBe(false)
  })

  it('setDraggingItem sets and clears draggingItem', () => {
    const store = useInventoryStore()
    store.setDraggingItem({ id: 'foo', name: 'Foo', weight: 1, slotCost: 1 } as Item)
    expect(store.draggingItem).toBeTruthy()
    store.setDraggingItem(null)
    expect(store.draggingItem).toBeNull()
  })
})
