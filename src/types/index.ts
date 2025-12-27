export interface Item {
  id: string
  name: string
  weight: number
  slotCost: number
  icon?: string
  category?: string
}

export interface InventoryItem extends Item {
  instanceId: string
  position: number
}

export default {}
