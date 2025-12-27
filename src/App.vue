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
    <Sidebar
      :filteredLibrary="filteredLibrary"
      :searchQuery="searchQuery"
      :filterCategory="filterCategory"
      :filterSize="filterSize"
      :getSlotBadgeColor="getSlotBadgeColor"
      :getSlotLabel="getSlotLabel"
      @autoAdd="autoAddItem"
      @import="import5eData"
      @dragend="endDrag"
      @dragstart="startDragNew"
      @update:searchQuery="val => searchQuery.value = val"
      @update:filterCategory="val => filterCategory.value = val"
      @update:filterSize="val => filterSize.value = val"
    />

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
<script setup lang="ts">
import { ref, computed, onMounted, onUpdated, nextTick } from 'vue'
import Sidebar from './components/Sidebar.vue'
import HeaderBar from './components/HeaderBar.vue'
import GridArea from './components/GridArea.vue'
import FooterBar from './components/FooterBar.vue'
import { calculateCost, getSlotsNeeded, determineCategory, getIconForType, canPlaceItem, findFirstFreeSlot } from './utils'
import { useToast } from './composables/useToast'
import { useShare } from './composables/useShare'
import { useImport } from './composables/useImport'
import { useDrag } from './composables/useDrag'
import { sampleDb } from './data/sampleDb'

/* --- STATE --- */
const gridSize = 20
const dbItems = ref([])
const inventory = ref([])
const strength = ref(10)
const searchQuery = ref('')
const filterCategory = ref('all')
const filterSize = ref('all')
const copied = ref(false)

// composables
const { toastMessage, showToast } = useToast()
const { copyShareLink: _copyShareLink, loadFromUrl: _loadFromUrl } = useShare({ inventory, strength })
const { import5eData } = useImport({ dbItems, showToast })
const { draggingItem, dragOverIndex, isDragValid, startDragNew, startDragExisting, endDrag, onDragOver, onDrop, getDragStateClass } = useDrag({ inventory, dbItems, gridSize, showToast })

const copyShareLink = async () => {
  const ok = await _copyShareLink()
  if (ok) { copied.value = true; setTimeout(() => copied.value = false, 2000) }
  else showToast('Copy failed')
}

/* --- HELPERS (extracted to src/utils.ts) --- */

/* --- SAMPLE LIBRARY --- */
dbItems.value = sampleDb

/* --- GRID / DISPLAY --- */
const gridDisplay = computed(() => {
  const cells = Array.from({ length: gridSize }, () => ({ type: 'empty' }))
  // place items
  inventory.value.forEach(item => {
    if (item.slotCost === 1) {
      const pos = item.position
      if (!cells[pos] || cells[pos].type === 'empty') cells[pos] = { type: 'container', items: [item] }
      else if (cells[pos].type === 'container') cells[pos].items.push(item)
    } else {
      const slots = getSlotsNeeded(item.slotCost)
      for (let i = 0; i < slots; i++) {
        const idx = item.position + i
        if (idx < gridSize) cells[idx] = { type: 'item', item, part: i + 1 }
      }
    }
  })
  return cells
})

/* --- PLACEMENT LOGIC --- */
// canPlaceItem and findFirstFreeSlot are provided by ./utils and expect inventory.value and gridSize

/* --- DRAG / DROP provided by composable (useDrag) --- */

/* --- LIBRARY / MUTATIONS --- */
const autoAddItem = (itemDef) => { const pos = findFirstFreeSlot(itemDef, inventory.value, gridSize); if (pos !== -1) inventory.value.push({ ...itemDef, instanceId: Date.now() + Math.random(), position: pos }); else showToast('Backpack full!') }
const removeItem = (instanceId) => { inventory.value = inventory.value.filter(i => i.instanceId !== instanceId) }
const clearInventory = () => inventory.value = []

/* showToast and getDragStateClass provided by composables */

/* --- IMPORT/EXPORT & SHARE provided by composable (useShare) --- */

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

onMounted(() => { nextTick(() => window.lucide && window.lucide.createIcons()); _loadFromUrl({ dbItems, inventoryRef: inventory }) })
onUpdated(() => nextTick(() => window.lucide && window.lucide.createIcons()))
</script>

<style>
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
