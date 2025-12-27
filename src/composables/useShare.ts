// Use native base64 in browser; fallback to Buffer for non-browser environments

export function useShare(params: { inventory: any; strength: any }) {
  const { inventory, strength } = params

  const copyShareLink = async () => {
    const compressed = inventory.value.map((item: any) => [item.id, item.position])
    const data = { s: strength.value, c: compressed }
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

  const loadFromUrl = (opts: { dbItems: any; inventoryRef: any }) => {
    const { dbItems, inventoryRef } = opts
    const params = new URLSearchParams(window.location.search)
    const loadout = params.get('loadout')
    if (loadout) {
      try {
        const decoded = (typeof window !== 'undefined' && typeof window.atob === 'function') ? window.atob(loadout) : Buffer.from(loadout, 'base64').toString()
        const data = JSON.parse(decoded)
        strength.value = data.s || 10
        if (data.c) data.c.forEach(([id, pos]: any) => {
          const def = dbItems.value.find((x: any) => x.id === id)
          if (def) inventoryRef.value.push({ ...def, instanceId: Date.now() + Math.random(), position: pos })
        })
      } catch (e) { console.error('Invalid loadout') }
    }
  }

  return { copyShareLink, loadFromUrl }
}
