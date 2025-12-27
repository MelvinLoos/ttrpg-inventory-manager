// Use native base64 in browser; fallback to Buffer for non-browser environments

import { useInventoryStore } from '../stores/inventoryStore'

export function useShare() {
  const store = useInventoryStore()

  const copyShareLink = async () => {
    const compressed = store.inventory.map((item) => [item.id, item.position])
    const data = { s: store.strength, c: compressed }
    const payload = JSON.stringify(data)
    const str = (typeof window !== 'undefined' && typeof window.btoa === 'function') ? window.btoa(payload) : Buffer.from(payload).toString('base64')
    const url = new URL(window.location.toString())
    url.searchParams.set('loadout', str)
    try {
      await navigator.clipboard.writeText(url.toString())
      return true
    } catch (e) {
      console.error('copy failed', e)
      return false
    }
  }

  const loadFromUrl = () => {
    const params = new URLSearchParams(window.location.search)
    const loadout = params.get('loadout')
    if (loadout) {
      try {
        const decoded = (typeof window !== 'undefined' && typeof window.atob === 'function') ? window.atob(loadout) : Buffer.from(loadout, 'base64').toString()
        const data = JSON.parse(decoded)
        store.strength = data.s || 10
        if (data.c) data.c.forEach(([id, pos]: any) => {
          const def = store.dbItems.find((x: any) => x.id === id)
          if (def) store.inventory.push({ ...def, instanceId: Date.now() + Math.random() + '', position: pos })
        })
      } catch (e) { console.error('Invalid loadout') }
    }
  }

  return { copyShareLink, loadFromUrl }
}
