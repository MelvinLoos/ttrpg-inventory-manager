import { ref } from 'vue'
import { useInventoryStore } from '../stores/inventoryStore'
import type { Item, InventoryItem } from '../types'
import { canPlaceItem } from '../utils'
import { useToast } from './useToast'

type DragPayload = { source: 'library'; itemId: string } | { source: 'grid'; instanceId: string }

export function useDrag() {
  const store = useInventoryStore()
  const { showToast } = useToast()

  const draggingItem = store.draggingItem
  const dragOverIndex = ref<number>(-1)
  const isDragValid = ref(true)

  const startDragNew = (e: DragEvent, item: Item) => {
    if (e.dataTransfer) e.dataTransfer.setData('payload', JSON.stringify({ source: 'library', itemId: item.id } as DragPayload))
    store.setDraggingItem(item)
  }

  const startDragExisting = (e: DragEvent, item: InventoryItem) => {
    if (e.dataTransfer) e.dataTransfer.setData('payload', JSON.stringify({ source: 'grid', instanceId: item.instanceId } as DragPayload))
    store.setDraggingItem(item)
  }

  const endDrag = () => { store.setDraggingItem(null); dragOverIndex.value = -1; isDragValid.value = true }

  const onDragOver = (index: number) => {
    dragOverIndex.value = index
    const current = store.draggingItem
    if (!current) { isDragValid.value = false; return }
    const exclude = ('instanceId' in current) ? (current.instanceId as string) : null
    isDragValid.value = canPlaceItem(index, current as any, store.inventory, store.gridSize, exclude)
  }

  const onDrop = (event: DragEvent, targetIndex: number) => {
    const raw = event.dataTransfer && event.dataTransfer.getData('payload')
    if (!raw) return
    const data = JSON.parse(raw) as DragPayload
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
    endDrag()
  }

  const getDragStateClass = (index: number) => {
    const current = store.draggingItem
    if (!current || dragOverIndex.value === -1) return ''
    const slotsNeeded = current.slotCost === 1 ? 1 : current.slotCost / 3
    if (index >= dragOverIndex.value && index < dragOverIndex.value + slotsNeeded) return isDragValid.value ? 'drag-valid' : 'drag-invalid'
    return ''
  }

  return { draggingItem, dragOverIndex, isDragValid, startDragNew, startDragExisting, endDrag, onDragOver, onDrop, getDragStateClass }
}
