<template>
  <div class="h-screen flex flex-col md:flex-row shadow-[0_0_50px_rgba(0,0,0,0.8)] max-w-[1600px] mx-auto border-x-4 border-[#1a120b] bg-parchment text-[#2c1810] overflow-hidden">

    <!-- TOAST NOTIFICATION -->
    <transition name="toast">
        <div v-if="toastMessage" class="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50 bg-[#3e2723] text-[#c5a059] px-6 py-3 rounded border-2 border-[#c5a059] shadow-2xl font-fantasy tracking-wide flex items-center gap-3">
            <i data-lucide="alert-circle" class="w-5 h-5 text-red-400"></i>
            {{ toastMessage }}
        </div>
    </transition>

    <!-- SIDEBAR -->
    <div class="w-full md:w-80 bg-[#2a1d15] text-[#dcdcdc] border-r-4 border-[#1a120b] flex flex-col h-1/3 md:h-full z-10 shadow-2xl relative">
      <div class="p-5 border-b border-[#3e2723] bg-[#2a1d15]">
        <h2 class="text-xl font-bold text-[#c5a059] flex items-center gap-2 font-fantasy tracking-wider">
          <i data-lucide="book" class="w-5 h-5 text-[#c5a059]"></i> Compendium
        </h2>
        <div class="mt-4 space-y-2 relative">
          <div class="relative">
            <input v-model="searchQuery" type="text" placeholder="Search the tome..." class="w-full bg-[#1a120b] text-[#dcdcdc] rounded-sm px-3 py-2 pl-9 focus:ring-1 focus:ring-[#c5a059] outline-none border border-[#5c4033] font-serif italic placeholder-[#5c4033]" />
            <i data-lucide="search" class="w-4 h-4 text-[#8a6a4b] absolute left-3 top-3"></i>
          </div>
          <div class="flex gap-2">
            <select v-model="filterCategory" class="w-1/2 bg-[#1a120b] text-[#c5a059] rounded-sm px-2 py-1 text-xs border border-[#5c4033] outline-none focus:border-[#c5a059] cursor-pointer">
              <option value="all">All Types</option>
              <option value="weapon">Weapons</option>
              <option value="armor">Armor</option>
              <option value="gear">Gear</option>
              <option value="consumable">Consumables</option>
            </select>
            <select v-model="filterSize" class="w-1/2 bg-[#1a120b] text-[#c5a059] rounded-sm px-2 py-1 text-xs border border-[#5c4033] outline-none focus:border-[#c5a059] cursor-pointer">
              <option value="all">All Sizes</option>
              <option value="small">Small</option>
              <option value="standard">Standard</option>
              <option value="heavy">Heavy</option>
            </select>
          </div>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        <div v-for="item in filteredLibrary" :key="item.id" draggable="true" @dragstart="startDragNew($event, item)" @dragend="endDrag" @click="autoAddItem(item)" class="bg-[#3e2723] p-3 rounded-sm hover:bg-[#4a332a] cursor-grab active:cursor-grabbing border border-[#5c4033] group transition-all shadow-md hover:border-[#c5a059]">
          <div class="flex justify-between items-start pointer-events-none">
            <div>
              <div class="font-bold text-[#e0d0b0]">{{ item.name }}</div>
              <div class="text-xs text-[#a89f91] italic">{{ item.weight }} lbs</div>
            </div>
            <div class="flex flex-col items-end">
              <span :class="getSlotBadgeColor(item.slotCost)" class="text-xs px-2 py-0.5 rounded-sm font-fantasy border text-shadow-sm">{{ getSlotLabel(item.slotCost) }}</span>
            </div>
          </div>
        </div>
        <div v-if="filteredLibrary.length === 0" class="text-center text-[#5c4033] text-sm italic mt-10">No items match your query.</div>
      </div>

      <div class="p-4 bg-[#23170f] border-t border-[#3e2723] flex flex-col gap-2">
        <label class="cursor-pointer bg-[#3e2723] hover:bg-[#4a332a] text-[#c5a059] border border-[#5c4033] py-2 px-3 rounded-sm text-xs font-fantasy tracking-wider text-center transition-colors flex items-center justify-center gap-2">
          <i data-lucide="upload" class="w-3 h-3"></i> Import 5e.tools JSON
          <input type="file" @change="import5eData" class="hidden" accept=".json" />
        </label>
        <div class="text-xs text-[#8a6a4b] text-center italic font-serif">"A heavy pack makes for a short journey."</div>
      </div>
    </div>

    <!-- MAIN -->
    <div class="flex-1 flex flex-col h-2/3 md:h-full relative">
      <div class="p-6 border-b-2 border-[#d1c4a9] flex flex-col md:flex-row justify-between items-center gap-4 bg-parchment/50 backdrop-blur-sm">
        <div>
          <h1 class="text-3xl font-fantasy font-bold tracking-wide text-[#2c1810]">THE SLOT BUCKET</h1>
          <p class="text-[#5c4033] text-sm italic font-serif">A Universal Inventory Ledger</p>
        </div>
        <div class="flex items-center gap-3">
          <button @click="copyShareLink" class="flex items-center gap-2 bg-[#f4e4bc] hover:bg-[#eaddcf] border-2 border-[#2c1810] px-4 py-1.5 rounded-sm text-sm transition-colors shadow-sm font-bold text-[#2c1810]">
            <i data-lucide="feather" class="w-4 h-4"></i>
            <span v-if="copied">Inscribed!</span>
            <span v-else>Share Scroll</span>
          </button>
          <button @click="clearInventory" class="text-[#8a1c1c] hover:text-[#601010] text-sm font-bold border-b border-transparent hover:border-[#8a1c1c] transition-all px-2 font-fantasy">Clear Page</button>
        </div>
      </div>

      <div class="px-8 py-5">
        <div class="flex justify-between items-end mb-2">
          <label class="font-bold text-[#2c1810] font-fantasy tracking-widest text-sm border-b border-[#2c1810] pb-0.5">Strength Score</label>
          <span class="text-3xl font-fantasy font-bold text-[#2c1810]">{{ strength }}</span>
        </div>
        <input type="range" v-model.number="strength" min="1" max="20" class="w-full" />
        <div class="flex justify-between text-xs text-[#5c4033] mt-2 font-serif italic"><span>Commoner (1)</span><span>Demi-God (20)</span></div>
      </div>

      <div class="flex-1 overflow-y-auto p-6 flex justify-center items-start custom-scrollbar">
        <div class="grid grid-cols-4 gap-3 w-full max-w-lg p-4 border-2 border-[#d1c4a9] bg-[#f8f1e0] shadow-[inset_0_0_20px_rgba(0,0,0,0.05)] rounded-sm" @mouseleave="clearDragState">
          <div v-for="(cell, index) in gridDisplay" :key="index" class="aspect-square relative transition-all duration-200 rounded-sm select-none" :class="[getCellClasses(cell, index), getDragStateClass(index)]" @dragover.prevent="onDragOver(index)" @drop="onDrop($event, index)">
            <div v-if="index === 0" class="absolute inset-0 flex flex-col items-center justify-center z-0 pointer-events-none text-[#5c4033] ghost-icon"><i data-lucide="crown" class="w-8 h-8 opacity-60"></i><span class="text-[8px] uppercase tracking-widest font-bold mt-1 opacity-60">Head</span></div>
            <div v-if="index === 1 || index === 2" class="absolute inset-0 flex flex-col items-center justify-center z-0 pointer-events-none text-[#5c4033] ghost-icon"><i data-lucide="gem" class="w-6 h-6 opacity-60"></i><span class="text-[8px] uppercase tracking-widest font-bold mt-1 opacity-60">Neck</span></div>
            <div v-if="index >= 4 && index <= 7" class="absolute inset-0 flex items-center justify-center z-0 pointer-events-none text-[#5c4033] opacity-30"><i data-lucide="shirt" class="w-12 h-12 opacity-40"></i></div>
            <div v-if="index === 8" class="absolute inset-0 flex flex-col items-center justify-center z-0 pointer-events-none text-[#5c4033] ghost-icon"><i data-lucide="sword" class="w-8 h-8 opacity-60"></i><span class="text-[8px] uppercase tracking-widest font-bold mt-1 opacity-60">Hand</span></div>
            <div v-if="index === 9" class="absolute inset-0 flex flex-col items-center justify-center z-0 pointer-events-none text-[#5c4033] ghost-icon"><i data-lucide="shield" class="w-8 h-8 opacity-60"></i><span class="text-[8px] uppercase tracking-widest font-bold mt-1 opacity-60">Offhand</span></div>

            <div v-if="cell.type === 'item'" class="w-full h-full p-1 group relative z-10" draggable="true" @dragstart="startDragExisting($event, cell.item)" @dragend="endDrag">
              <div class="w-full h-full rounded-sm flex flex-col items-center justify-center text-center p-1 shadow-md relative overflow-hidden border-2 border-opacity-40 cursor-grab active:cursor-grabbing" :class="getItemColor(cell.item.slotCost)">
                <button @click.stop="removeItem(cell.item.instanceId)" class="absolute top-0 right-0 p-0.5 opacity-0 group-hover:opacity-100 bg-[#8a1c1c] text-[#f0e6d2] rounded-bl-sm transition-all z-20"><i data-lucide="x" class="w-3 h-3"></i></button>
                <div class="text-2xl mb-0.5 drop-shadow-sm filter sepia-[.3] pointer-events-none">{{ cell.item.icon || '📦' }}</div>
                <div class="text-[10px] leading-tight font-bold truncate w-full px-1 font-fantasy tracking-wide pointer-events-none">{{ cell.item.name }}</div>
                <div v-if="cell.item.slotCost > 3" class="absolute bottom-0 left-0 w-full text-[9px] bg-black/40 text-[#f0e6d2] py-0.5 font-serif italic pointer-events-none">Part {{ cell.part }}</div>
              </div>
            </div>

            <div v-else-if="cell.type === 'container'" class="w-full h-full p-1 grid grid-cols-2 grid-rows-2 gap-0.5 z-10">
              <div v-for="subItem in cell.items" :key="subItem.instanceId" draggable="true" @dragstart.stop="startDragExisting($event, subItem)" @dragend="endDrag" class="bg-[#4a6fa5] border border-[#2c3e50] rounded-sm flex items-center justify-center relative group hover:brightness-110 transition-all cursor-pointer shadow-sm cursor-grab active:cursor-grabbing" :title="subItem.name">
                <button @click.stop="removeItem(subItem.instanceId)" class="absolute inset-0 flex items-center justify-center bg-[#8a1c1c]/90 opacity-0 group-hover:opacity-100 rounded-sm text-white font-bold text-xs z-20"><i data-lucide="x" class="w-3 h-3"></i></button>
                <span class="text-sm select-none filter drop-shadow-md pointer-events-none">{{ subItem.icon }}</span>
              </div>
              <div v-for="n in (3 - cell.items.length)" :key="n" class="border border-dashed border-[#a89f91] rounded-sm bg-[#e3d5bc]/30 pointer-events-none"></div>
            </div>

            <div v-else class="w-full h-full flex items-center justify-center text-[#a89f91] font-fantasy text-xs select-none opacity-50 z-10 pointer-events-none">{{ index + 1 }}</div>

          </div>
        </div>
      </div>

      <div class="border-t-2 border-[#d1c4a9] p-4 flex justify-between items-center text-sm bg-parchment/80">
        <div class="flex items-center gap-4">
          <div class="text-[#2c1810]">Current Load: <span :class="loadColor" class="font-bold text-lg font-fantasy">{{ currentLoadPoints }} / {{ strength * 3 }}</span></div>
          <div v-if="isOverencumbered" class="text-[#8a1c1c] font-bold flex items-center animate-pulse font-fantasy tracking-wide"><i data-lucide="skull" class="w-4 h-4 mr-1"></i> Overburdened!</div>
        </div>
        <div class="text-[#5c4033] text-xs hidden md:block italic font-serif opacity-70">Based on SRD 5.1 Ruleset</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUpdated, nextTick } from 'vue'

/* --- LOGIC HELPERS --- */
const calculateCost = (lbs) => {
  const weight = typeof lbs === 'number' ? lbs : 0;
  if (weight <= 2) return 1;
  if (weight <= 10) return 3;
  if (weight <= 25) return 6;
  if (weight <= 50) return 9;
  return 12;
}

const determineCategory = (type, name) => {
  const t = type ? type.split('|')[0] : '';
  const n = name ? name.toLowerCase() : '';
  if (['M', 'R', 'A'].includes(t) || n.includes('sword') || n.includes('axe') || n.includes('bow')) return 'weapon';
  if (['LA', 'MA', 'HA', 'S'].includes(t) || n.includes('armor') || n.includes('shield')) return 'armor';
  if (['P', 'SC', 'FD'].includes(t) || n.includes('potion') || n.includes('scroll')) return 'consumable';
  return 'gear';
}

const getIconForType = (type, name) => {
  const n = (name || '').toLowerCase();
  if (n.includes('potion')) return '🧪';
  if (n.includes('scroll')) return '📜';
  if (n.includes('sword') || n.includes('axe') || n.includes('dagger')) return '⚔️';
  if (n.includes('shield')) return '🛡️';
  if (n.includes('armor') || n.includes('mail') || n.includes('plate')) return '🥋';
  return '📦';
}

/* --- INITIAL DATA --- */
const INITIAL_DB_ITEMS = [
  { id: 'dagger', name: 'Dagger', weight: 1 },
  { id: 'potion', name: 'Healing Potion', weight: 0.5 },
  { id: 'rope', name: 'Hempen Rope', weight: 10 },
  { id: 'longsword', name: 'Longsword', weight: 3 },
  { id: 'shield', name: 'Shield', weight: 6 },
  { id: 'plate', name: 'Plate Armor', weight: 65 },
  { id: 'ration', name: 'Ration', weight: 2 },
  { id: 'torch', name: 'Torch', weight: 1 },
  { id: 'bedroll', name: 'Bedroll', weight: 7 },
  { id: 'greataxe', name: 'Greataxe', weight: 7 }
].map(i => ({
  ...i,
  slotCost: calculateCost(i.weight),
  category: determineCategory(null, i.name),
  icon: getIconForType(null, i.name)
}))

/* --- STATE --- */
const strength = ref(10)
const inventory = ref([])
const dbItems = ref(INITIAL_DB_ITEMS)
const searchQuery = ref('')
const filterCategory = ref('all')
const filterSize = ref('all')
const copied = ref(false)
const toastMessage = ref('')

const draggingItem = ref(null)
const dragOverIndex = ref(-1)
const isDragValid = ref(true)

/* --- COMPUTED: GRID --- */
const gridDisplay = computed(() => {
  const cells = new Array(20).fill(null).map(() => ({ type: 'empty' }))
  inventory.value.forEach(item => {
    const pos = item.position
    if (pos < 0 || pos >= 20) return
    if (item.slotCost === 1) {
      if (cells[pos].type === 'empty') cells[pos] = { type: 'container', items: [item] }
      else if (cells[pos].type === 'container') {
        if (!cells[pos].items.find(i => i.instanceId === item.instanceId)) cells[pos].items.push(item)
      }
    } else {
      const slotsNeeded = item.slotCost / 3
      for (let k = 0; k < slotsNeeded; k++) if (pos + k < 20) cells[pos + k] = { type: 'item', item, instanceId: item.instanceId, part: k + 1 }
    }
  })
  return cells
})

const getSlotsNeeded = (cost) => Math.ceil(cost / 3)

const canPlaceItem = (startIndex, item, excludeInstanceId = null) => {
  const slotsNeeded = getSlotsNeeded(item.slotCost)
  const isSmall = item.slotCost === 1
  if (startIndex < 0 || startIndex + slotsNeeded > 20) return false
  for (let i = 0; i < slotsNeeded; i++) {
    const idx = startIndex + i
    const otherItems = inventory.value.filter(inv => inv.instanceId !== excludeInstanceId)
    const occupants = otherItems.filter(inv => {
      if (inv.slotCost === 1) return inv.position === idx
      const s = getSlotsNeeded(inv.slotCost)
      return idx >= inv.position && idx < inv.position + s
    })
    if (occupants.length > 0) {
      if (isSmall && occupants.every(o => o.slotCost === 1) && occupants.length < 3) {
        // allowed
      } else return false
    }
  }
  return true
}

const findFirstFreeSlot = (item) => { for (let i = 0; i < 20; i++) if (canPlaceItem(i, item)) return i; return -1 }

/* --- DRAG & DROP --- */
const startDragNew = (event, item) => {
  event.dataTransfer.dropEffect = 'copy'
  event.dataTransfer.effectAllowed = 'copy'
  const payload = { source: 'library', itemId: item.id }
  event.dataTransfer.setData('payload', JSON.stringify(payload))
  draggingItem.value = { ...item, slotCost: item.slotCost }
}

const startDragExisting = (event, item) => {
  event.dataTransfer.dropEffect = 'move'
  event.dataTransfer.effectAllowed = 'move'
  const payload = { source: 'grid', instanceId: item.instanceId }
  event.dataTransfer.setData('payload', JSON.stringify(payload))
  draggingItem.value = item
}

const onDragOver = (index) => {
  if (!draggingItem.value) return
  if (dragOverIndex.value !== index) {
    dragOverIndex.value = index
    const excludeId = draggingItem.value.instanceId || null
    isDragValid.value = canPlaceItem(index, draggingItem.value, excludeId)
  }
}

const endDrag = () => clearDragState()
const clearDragState = () => { draggingItem.value = null; dragOverIndex.value = -1; isDragValid.value = true }

const onDrop = (event, targetIndex) => {
  const raw = event.dataTransfer.getData('payload')
  clearDragState()
  if (!raw) return
  const data = JSON.parse(raw)
  if (data.source === 'library') {
    const itemDef = dbItems.value.find(i => i.id === data.itemId)
    if (!itemDef) return
    if (canPlaceItem(targetIndex, itemDef)) inventory.value.push({ ...itemDef, instanceId: Date.now() + Math.random(), position: targetIndex })
    else showToast('Cannot place item here! Slot blocked.')
  } else if (data.source === 'grid') {
    const itemIdx = inventory.value.findIndex(i => i.instanceId === data.instanceId)
    if (itemIdx === -1) return
    const item = inventory.value[itemIdx]
    if (canPlaceItem(targetIndex, item, item.instanceId)) item.position = targetIndex
    else showToast('Move rejected! No space.')
  }
}

const autoAddItem = (itemDef) => { const pos = findFirstFreeSlot(itemDef); if (pos !== -1) inventory.value.push({ ...itemDef, instanceId: Date.now() + Math.random(), position: pos }); else showToast('Backpack full!') }
const removeItem = (instanceId) => { inventory.value = inventory.value.filter(i => i.instanceId !== instanceId) }
const clearInventory = () => inventory.value = []

const showToast = (msg) => { toastMessage.value = msg; setTimeout(() => toastMessage.value = '', 2000) }

const getDragStateClass = (index) => {
  if (!draggingItem.value || dragOverIndex.value === -1) return ''
  const slotsNeeded = getSlotsNeeded(draggingItem.value.slotCost)
  if (index >= dragOverIndex.value && index < dragOverIndex.value + slotsNeeded) return isDragValid.value ? 'drag-valid' : 'drag-invalid'
  return ''
}

/* --- IMPORT/EXPORT & SHARE --- */
const copyShareLink = () => {
  const compressed = inventory.value.map(item => [item.id, item.position])
  const data = { s: strength.value, c: compressed }
  const str = btoa(JSON.stringify(data))
  const url = new URL(window.location)
  url.searchParams.set('loadout', str)
  navigator.clipboard.writeText(url.toString())
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}

const loadFromUrl = () => {
  const params = new URLSearchParams(window.location.search)
  const loadout = params.get('loadout')
  if (loadout) {
    try {
      const data = JSON.parse(atob(loadout))
      strength.value = data.s || 10
      if (data.i) data.i.forEach(id => { const def = dbItems.value.find(x => x.id === id); if (def) autoAddItem(def) })
      else if (data.c) data.c.forEach(([id, pos]) => { const def = dbItems.value.find(x => x.id === id); if (def) inventory.value.push({ ...def, instanceId: Date.now() + Math.random(), position: pos }) })
    } catch (e) { console.error('Invalid loadout') }
  }
}

const filteredLibrary = computed(() => {
  let items = dbItems.value
  if (searchQuery.value) items = items.filter(i => i.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
  if (filterCategory.value !== 'all') items = items.filter(i => i.category === filterCategory.value)
  if (filterSize.value !== 'all') {
    if (filterSize.value === 'small') items = items.filter(i => i.slotCost === 1)
    if (filterSize.value === 'standard') items = items.filter(i => i.slotCost === 3)
    if (filterSize.value === 'heavy') items = items.filter(i => i.slotCost > 3)
  }
  return items.slice(0, 50)
})

const currentLoadPoints = computed(() => inventory.value.reduce((sum, item) => sum + item.slotCost, 0))
const isOverencumbered = computed(() => currentLoadPoints.value > (strength.value * 3))
const loadColor = computed(() => { const ratio = currentLoadPoints.value / (strength.value * 3); if (ratio > 1) return 'text-[#8a1c1c]'; if (ratio > 0.8) return 'text-[#d35400]'; return 'text-[#27ae60]' })
const getSlotLabel = (cost) => cost === 1 ? 'Small' : cost === 3 ? '1 Slot' : `${cost/3} Slots`
const getSlotBadgeColor = (cost) => cost === 1 ? 'border-[#4a6fa5] text-[#4a6fa5]' : cost === 3 ? 'border-[#556b2f] text-[#556b2f]' : 'border-[#8a1c1c] text-[#8a1c1c]'
const getItemColor = (cost) => cost > 3 ? 'bg-[#8a1c1c] border-[#601010] text-[#f0e6d2]' : cost === 3 ? 'bg-[#556b2f] border-[#3e4f22] text-[#f0e6d2]' : 'bg-[#4a6fa5] border-[#2c3e50] text-[#f0e6d2]'
const getCellClasses = (cell, index) => { if (index >= strength.value) return 'locked-pattern'; if (cell.type === 'empty') return 'border-dashed border-[#a89f91] bg-[#e6dbc5]/60 hover:bg-[#dfd2ba]'; if (cell.type === 'container') return 'bg-[#eaddcf] border-solid border-[#a89f91]'; return '' }

const import5eData = (event) => {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const json = JSON.parse(e.target.result)
      let sourceArray = Array.isArray(json) ? json : (json.item || [])
      const newItems = sourceArray.filter(i => !i._copy).map(i => {
        const weight = i.weight || 0
        return { id: i.name.toLowerCase().replace(/\s+/g, '-'), name: i.name, weight, slotCost: calculateCost(weight), icon: getIconForType(i.type, i.name), category: determineCategory(i.type, i.name) }
      })
      const existingIds = new Set(dbItems.value.map(i => i.id))
      const unique = newItems.filter(i => !existingIds.has(i.id))
      dbItems.value = [...dbItems.value, ...unique]
      if (unique.length > 0) showToast(`Added ${unique.length} items!`)
      else showToast('No new items found.')
    } catch (err) { showToast('Failed to parse JSON.') }
  }
  reader.readAsText(file)
}

onMounted(() => { nextTick(() => window.lucide && window.lucide.createIcons()); loadFromUrl() })
onUpdated(() => nextTick(() => window.lucide && window.lucide.createIcons()))
</script>

<style>
/* Migrated inline styles (small subset) */
.font-fantasy { font-family: 'Cinzel', serif; }
body { font-family: 'Crimson Text', serif; }
::-webkit-scrollbar { width: 8px }
::-webkit-scrollbar-track { background: #2a1d15 }
::-webkit-scrollbar-thumb { background: #c5a059; border-radius: 4px }
.bg-parchment { background-color: #f0e6d2 }
.locked-pattern { background-color: #e3d5bc; background-image: repeating-linear-gradient(45deg,#c2b280,#c2b280 1px,transparent 1px,transparent 6px); border:1px solid #c2b280 }
.ghost-icon { animation: ghost-pulse 4s infinite ease-in-out }
@keyframes ghost-pulse { 0%,100%{opacity:.3}50%{opacity:.5} }
.drag-valid { background-color: rgba(34,197,94,0.2) !important; box-shadow: inset 0 0 0 2px rgba(34,197,94,0.6) }
.drag-invalid { background-color: rgba(239,68,68,0.2) !important; box-shadow: inset 0 0 0 2px rgba(239,68,68,0.6) }
.slot-enter-active,.slot-leave-active{transition:all .3s ease}
.slot-enter-from,.slot-leave-to{opacity:0;transform:scale(.9)}
</style>
