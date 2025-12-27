<template>
  <aside class="w-full md:w-80 bg-[#2a1d15] text-[#dcdcdc] border-r-4 border-[#1a120b] flex flex-col h-1/3 md:h-full z-10 shadow-2xl relative">
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
      <ItemCard v-for="item in filteredLibrary" :key="item.id" :item="item" :getSlotBadgeColor="getSlotBadgeColor" :getSlotLabel="getSlotLabel" @item-dragstart="onDragStart" @item-dragend="onDragEnd" @click="handleAdd" />
      <div v-if="filteredLibrary.length === 0" class="text-center text-[#5c4033] text-sm italic mt-10">No items match your query.</div>
    </div>

    <div class="p-4 bg-[#23170f] border-t border-[#3e2723] flex flex-col gap-2">
      <label class="cursor-pointer bg-[#3e2723] hover:bg-[#4a332a] text-[#c5a059] border border-[#5c4033] py-2 px-3 rounded-sm text-xs font-fantasy tracking-wider text-center transition-colors flex items-center justify-center gap-2">
        <i data-lucide="upload" class="w-3 h-3"></i> Import 5e.tools JSON
        <input type="file" @change="import5eData" class="hidden" accept=".json" />
      </label>
      <div class="text-xs text-[#8a6a4b] text-center italic font-serif">"A heavy pack makes for a short journey."</div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Item } from '../types'
import ItemCard from './ItemCard.vue'
import { useInventoryStore } from '../stores/inventoryStore'
import { useImport } from '../composables/useImport'
import { useToast } from '../composables/useToast'

const store = useInventoryStore()
const { import5eData } = useImport()
const { showToast } = useToast()

const searchQuery = ref('')
const filterCategory = ref('all')
const filterSize = ref('all')

const filteredLibrary = computed(() => {
  let items = store.dbItems
  if (searchQuery.value) items = items.filter(i => i.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
  if (filterCategory.value !== 'all') items = items.filter(i => i.category === filterCategory.value)
  if (filterSize.value !== 'all') {
    if (filterSize.value === 'small') items = items.filter(i => i.slotCost === 1)
    if (filterSize.value === 'standard') items = items.filter(i => i.slotCost === 3)
    if (filterSize.value === 'heavy') items = items.filter(i => i.slotCost > 3)
  }
  return items.slice(0, 50)
})

const onDragStart = (e: DragEvent, item: Item) => {
  if (e.dataTransfer) e.dataTransfer.setData('payload', JSON.stringify({ source: 'library', itemId: item.id }))
  store.setDraggingItem(item)
}

const onDragEnd = () => store.setDraggingItem(null)

const handleAdd = (item: Item) => { if (!store.autoAddItem(item)) showToast('Backpack full!') }

const getSlotLabel = (cost: number) => cost === 1 ? 'Small' : cost === 3 ? '1 Slot' : `${cost/3} Slots`
const getSlotBadgeColor = (cost: number) => cost === 1 ? 'border-[#4a6fa5] text-[#4a6fa5]' : cost === 3 ? 'border-[#556b2f] text-[#556b2f]' : 'border-[#8a1c1c] text-[#8a1c1c]'
</script>
