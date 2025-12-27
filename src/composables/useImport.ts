import { calculateCost, getIconForType, determineCategory } from '../utils'

export function useImport(params: { dbItems: any; showToast: (msg: string) => void }) {
  const { dbItems, showToast } = params

  const import5eData = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target?.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = JSON.parse(String(e.target?.result))
        let sourceArray = Array.isArray(json) ? json : (json.item || [])
        const newItems = sourceArray.filter((i: any) => !i._copy).map((i: any) => {
          const weight = i.weight || 0
          return { id: i.name.toLowerCase().replace(/\s+/g, '-'), name: i.name, weight, slotCost: calculateCost(weight), icon: getIconForType(i.type, i.name), category: determineCategory(i.type, i.name) }
        })
        const existingIds = new Set(dbItems.value.map((i: any) => i.id))
        const unique = newItems.filter((i: any) => !existingIds.has(i.id))
        dbItems.value = [...dbItems.value, ...unique]
        if (unique.length > 0) showToast(`Added ${unique.length} items!`)
        else showToast('No new items found.')
      } catch (err) { showToast('Failed to parse JSON.') }
    }
    reader.readAsText(file)
  }

  return { import5eData }
}
