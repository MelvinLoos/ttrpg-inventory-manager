import { ref, Ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useInventoryStore } from '../stores/inventoryStore'
import type { Item, InventoryItem } from '../types'
import { canPlaceItem } from '../utils'
import { useToast } from './useToast'

type DragPayload = { source: 'library'; itemId: string } | { source: 'grid'; instanceId: string }

export function useDrag() {
  const store = useInventoryStore()
  const { showToast } = useToast()

  const { draggingItem } = storeToRefs(store) as { draggingItem: Ref<Item | InventoryItem | null> }
  const dragOverIndex = ref<number>(-1)
  const isDragValid = ref(true)

  const startDragNew = (e: DragEvent, item: Item) => {
    try {
      if (e.dataTransfer) e.dataTransfer.setData('payload', JSON.stringify({ source: 'library', itemId: item.id } as DragPayload))
      store.setDraggingItem(item)
    } catch (err) {
      console.error('startDragNew', err)
      showToast('Failed to start drag.')
    }
  }

  const startDragExisting = (e: DragEvent, item: InventoryItem) => {
    try {
      if (e.dataTransfer) e.dataTransfer.setData('payload', JSON.stringify({ source: 'grid', instanceId: item.instanceId } as DragPayload))
      store.setDraggingItem(item)
    } catch (err) {
      console.error('startDragExisting', err)
      showToast('Failed to start drag.')
    }
  }

  const endDrag = () => { store.setDraggingItem(null); dragOverIndex.value = -1; isDragValid.value = true }

  const onDragOver = (index: number) => {
    dragOverIndex.value = index
    const current = draggingItem.value
    if (!current) { isDragValid.value = false; return }
    const exclude = ('instanceId' in (current as InventoryItem)) ? (current as InventoryItem).instanceId : null
    isDragValid.value = canPlaceItem(index, current as Item | InventoryItem, store.inventory, store.gridSize, exclude)
  }

  const dropAt = (targetIndex: number, payload?: DragPayload) => {
    try {
      const data = payload
      if (!data) {
        // if no explicit payload, try to use store.draggingItem
        const current = draggingItem.value
        if (!current) return
        if ('id' in current && !('instanceId' in current)) {
          // item definition dropped
          const itemDef = current as Item
          if (canPlaceItem(targetIndex, itemDef, store.inventory, store.gridSize)) {
            store.inventory.push({ ...itemDef, instanceId: Date.now() + Math.random() + '', position: targetIndex })
          } else showToast('Cannot place item here! Slot blocked.')
        } else if ('instanceId' in current) {
          const idx = store.inventory.findIndex(i => i.instanceId === (current as InventoryItem).instanceId)
          if (idx === -1) return
          const item = store.inventory[idx]
          if (canPlaceItem(targetIndex, item, store.inventory, store.gridSize, item.instanceId)) item.position = targetIndex
          else showToast('Move rejected! No space.')
        }
      } else {
        if (data.source === 'library') {
          const itemDef = store.dbItems.find(i => i.id === data.itemId)
          if (!itemDef) return
          if (canPlaceItem(targetIndex, itemDef, store.inventory, store.gridSize)) {
            store.inventory.push({ ...itemDef, instanceId: Date.now() + Math.random() + '', position: targetIndex })
          } else showToast('Cannot place item here! Slot blocked.')
        } else if (data.source === 'grid') {
          const idx = store.inventory.findIndex(i => i.instanceId === data.instanceId)
          if (idx === -1) return
          const item = store.inventory[idx]
          if (canPlaceItem(targetIndex, item, store.inventory, store.gridSize, item.instanceId)) item.position = targetIndex
          else showToast('Move rejected! No space.')
        }
      }
    } catch (err) {
      console.error('dropAt error', err)
      showToast('Drop failed.')
    } finally {
      endDrag()
    }
  }

  const onDrop = (event: DragEvent, targetIndex: number) => {
    const raw = event.dataTransfer && event.dataTransfer.getData('payload')
    if (!raw) return
    try {
      const data = JSON.parse(raw) as DragPayload
      dropAt(targetIndex, data)
    } catch (err) {
      console.error('onDrop parse error', err)
    }
  }

  const getDragStateClass = (index: number) => {
    const current = draggingItem.value
    const over = dragOverIndex.value
    if (!current || over === -1) return ''
    const slotsNeeded = current.slotCost === 1 ? 1 : current.slotCost / 3
    if (index >= over && index < over + slotsNeeded) return isDragValid.value ? 'drag-valid' : 'drag-invalid'
    return ''
  }

  return { draggingItem, dragOverIndex, isDragValid, startDragNew, startDragExisting, endDrag, onDragOver, onDrop, dropAt, getDragStateClass }
}
