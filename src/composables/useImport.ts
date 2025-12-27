import { calculateCost, getIconForType, determineCategory } from '../utils'
import { useInventoryStore } from '../stores/inventoryStore'
import { useToast } from './useToast'
import type { Item } from '../types'

type ExternalItemData = {
  name?: string
  weight?: number | string
  type?: string
  _copy?: boolean
  [key: string]: unknown
}

export function useImport() {
  const store = useInventoryStore()
  const { showToast } = useToast()

  const import5eData = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target?.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = JSON.parse(String(e.target?.result))
        const sourceArray: ExternalItemData[] = Array.isArray(json) ? json : (json.item || json.items || [])
        const newItems: Item[] = sourceArray
          .filter((i) => !!i && !i._copy && typeof i.name === 'string')
          .map((i) => {
            const name = String(i.name)
            const weight = Number(i.weight) || 0
            const id = name.toLowerCase().replace(/\s+/g, '-')
            const item: Item = {
              id,
              name,
              weight,
              slotCost: calculateCost(weight),
              icon: getIconForType(i.type || '', name),
              category: determineCategory(i.type || '', name)
            }
            return item
          })

        const existingIds = new Set(store.dbItems.map((i: Item) => i.id))
        const unique = newItems.filter((i) => !existingIds.has(i.id))
        // merge into store
        store.dbItems = [...store.dbItems, ...unique]
        if (unique.length > 0) showToast(`Added ${unique.length} items!`)
        else showToast('No new items found.')
      } catch (err) {
        // preserve debugging info and notify user
        // eslint-disable-next-line no-console
        console.error('Import error', err)
        showToast('Failed to parse JSON.')
      }
    }
    reader.readAsText(file)
  }

  return { import5eData }
}
