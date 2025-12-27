import { ref } from 'vue'
import { canPlaceItem } from '../utils'

export function useDrag(params: { inventory: any; dbItems: any; gridSize: number; showToast: (msg: string) => void }) {
  const { inventory, dbItems, gridSize, showToast } = params
  const draggingItem = ref<any>(null)
  const dragOverIndex = ref(-1)
  const isDragValid = ref(true)

  const startDragNew = (e: DragEvent, item: any) => {
    if (e.dataTransfer) e.dataTransfer.setData('payload', JSON.stringify({ source: 'library', itemId: item.id }))
    draggingItem.value = item
  }

  const startDragExisting = (e: DragEvent, item: any) => {
    if (e.dataTransfer) e.dataTransfer.setData('payload', JSON.stringify({ source: 'grid', instanceId: item.instanceId }))
    draggingItem.value = item
  }

  const endDrag = () => { draggingItem.value = null; dragOverIndex.value = -1; isDragValid.value = true }

  const onDragOver = (index: number) => {
    dragOverIndex.value = index
    if (!draggingItem.value) { isDragValid.value = false; return }
    const exclude = draggingItem.value.instanceId || null
    isDragValid.value = canPlaceItem(index, draggingItem.value, inventory.value, gridSize, exclude)
  }

  const onDrop = (event: DragEvent, targetIndex: number) => {
    const raw = event.dataTransfer && event.dataTransfer.getData('payload')
    if (!raw) return
    const data = JSON.parse(raw)
    if (data.source === 'library') {
      const itemDef = dbItems.value.find((i: any) => i.id === data.itemId)
      if (!itemDef) return
      if (canPlaceItem(targetIndex, itemDef, inventory.value, gridSize)) inventory.value.push({ ...itemDef, instanceId: Date.now() + Math.random(), position: targetIndex })
      else showToast('Cannot place item here! Slot blocked.')
    } else if (data.source === 'grid') {
      const itemIdx = inventory.value.findIndex((i: any) => i.instanceId === data.instanceId)
      if (itemIdx === -1) return
      const item = inventory.value[itemIdx]
      if (canPlaceItem(targetIndex, item, inventory.value, gridSize, item.instanceId)) item.position = targetIndex
      else showToast('Move rejected! No space.')
    }
    endDrag()
  }

  const getDragStateClass = (index: number) => {
    if (!draggingItem.value || dragOverIndex.value === -1) return ''
    const slotsNeeded = draggingItem.value.slotCost === 1 ? 1 : draggingItem.value.slotCost / 3
    if (index >= dragOverIndex.value && index < dragOverIndex.value + slotsNeeded) return isDragValid.value ? 'drag-valid' : 'drag-invalid'
    return ''
  }

  return { draggingItem, dragOverIndex, isDragValid, startDragNew, startDragExisting, endDrag, onDragOver, onDrop, getDragStateClass }
}
