import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import type { Item, InventoryItem } from '../types'
import { findFirstFreeSlot, canPlaceItem } from '../utils'
import { sampleDb } from '../data/sampleDb'

export const useInventoryStore = defineStore('inventory', () => {
  const gridSize = 20
  const dbItems = ref<Item[]>([...sampleDb])
  const inventory = useLocalStorage<InventoryItem[]>('ttrpg-inventory-inventory', [])
  const strength = useLocalStorage<number>('ttrpg-inventory-strength', 10)
  const draggingItem = ref<Item | InventoryItem | null>(null)

  function autoAddItem(itemDef: Item) {
    const pos = findFirstFreeSlot(itemDef, inventory.value, gridSize)
    if (pos !== -1) {
      inventory.value.push({ ...itemDef, instanceId: Date.now() + Math.random() + '', position: pos })
      return true
    }
    return false
  }

  function removeItem(instanceId: string) {
    inventory.value = inventory.value.filter(i => i.instanceId !== instanceId)
  }

  function clearInventory() {
    inventory.value = []
  }

  function updatePosition(instanceId: string, newPosition: number) {
    const idx = inventory.value.findIndex(i => i.instanceId === instanceId)
    if (idx === -1) return false
    const item = inventory.value[idx]
    if (canPlaceItem(newPosition, item, inventory.value, gridSize, item.instanceId)) {
      item.position = newPosition
      return true
    }
    return false
  }

  function setDraggingItem(item: Item | InventoryItem | null) {
    draggingItem.value = item
  }

  return { gridSize, dbItems, inventory, strength, draggingItem, autoAddItem, removeItem, clearInventory, updatePosition, setDraggingItem }
})

export default useInventoryStore
