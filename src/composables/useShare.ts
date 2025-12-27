// Use native base64 in browser; fallback to Buffer for non-browser environments

import { useInventoryStore } from '../stores/inventoryStore'
import type { Item, InventoryItem } from '../types'

type SharePayload = { s?: number; c?: Array<[string, number]> }

export function useShare() {
  const store = useInventoryStore()

  const encode = (payload: string) => {
    if (typeof window !== 'undefined' && typeof window.btoa === 'function') return window.btoa(payload)
    // Buffer may not exist in some environments; guard it
    // Buffer typing for Node environments
    const Buf: (typeof Buffer) | null = (typeof Buffer !== 'undefined') ? (Buffer as unknown as typeof Buffer) : null
    return Buf ? Buf.from(payload).toString('base64') : ''
  }

  const decode = (input: string) => {
    if (typeof window !== 'undefined' && typeof window.atob === 'function') return window.atob(input)
    const Buf: (typeof Buffer) | null = (typeof Buffer !== 'undefined') ? (Buffer as unknown as typeof Buffer) : null
    return Buf ? Buf.from(input, 'base64').toString() : ''
  }

  const copyShareLink = async (): Promise<boolean> => {
    const compressed = store.inventory.map((item: InventoryItem) => [item.id, item.position] as [string, number])
    const data: SharePayload = { s: store.strength as number, c: compressed }
    const payload = JSON.stringify(data)
    const str = encode(payload)
    const url = new URL(window.location.toString())
    url.searchParams.set('loadout', str)
    try {
      await navigator.clipboard.writeText(url.toString())
      return true
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('copy failed', e)
      return false
    }
  }

  const loadFromUrl = (): void => {
    const params = new URLSearchParams(window.location.search)
    const loadout = params.get('loadout')
    if (!loadout) return
    try {
      const decoded = decode(loadout)
      const data = JSON.parse(decoded) as SharePayload
      store.strength = data.s ?? (store.strength as number)
      if (data.c && Array.isArray(data.c)) {
        data.c.forEach(([id, pos]) => {
          const def = (store.dbItems as Item[]).find((x) => x.id === id)
          if (def) {
            const instance: InventoryItem = { ...def, instanceId: Date.now() + Math.random() + '', position: Number(pos) }
            store.inventory.push(instance)
          }
        })
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Invalid loadout', e)
    }
  }

  return { copyShareLink, loadFromUrl }
}
