<template>
  <div class="flex-1 overflow-y-auto p-6 flex justify-center items-start custom-scrollbar">
    <div class="grid grid-cols-4 gap-3 w-full max-w-lg p-4 border-2 border-[#d1c4a9] bg-[#f8f1e0] shadow-[inset_0_0_20px_rgba(0,0,0,0.05)] rounded-sm" @mouseleave="$emit('clearDragState')">
      <div v-for="(cell, index) in gridDisplay" :key="index" class="aspect-square relative transition-all duration-200 rounded-sm select-none" :class="[getCellClasses(cell, index), getDragStateClass(index)]" @dragover.prevent="$emit('dragOver', index)" @drop.prevent="$emit('drop', $event, index)">
        <div v-if="index === 0" class="absolute inset-0 flex flex-col items-center justify-center z-0 pointer-events-none text-[#5c4033] ghost-icon"><i data-lucide="crown" class="w-8 h-8 opacity-60"></i><span class="text-[8px] uppercase tracking-widest font-bold mt-1 opacity-60">Head</span></div>
        <div v-if="index === 1 || index === 2" class="absolute inset-0 flex flex-col items-center justify-center z-0 pointer-events-none text-[#5c4033] ghost-icon"><i data-lucide="gem" class="w-6 h-6 opacity-60"></i><span class="text-[8px] uppercase tracking-widest font-bold mt-1 opacity-60">Neck</span></div>
        <div v-if="index >= 4 && index <= 7" class="absolute inset-0 flex items-center justify-center z-0 pointer-events-none text-[#5c4033] opacity-30"><i data-lucide="shirt" class="w-12 h-12 opacity-40"></i></div>
        <div v-if="index === 8" class="absolute inset-0 flex flex-col items-center justify-center z-0 pointer-events-none text-[#5c4033] ghost-icon"><i data-lucide="sword" class="w-8 h-8 opacity-60"></i><span class="text-[8px] uppercase tracking-widest font-bold mt-1 opacity-60">Hand</span></div>
        <div v-if="index === 9" class="absolute inset-0 flex flex-col items-center justify-center z-0 pointer-events-none text-[#5c4033] ghost-icon"><i data-lucide="shield" class="w-8 h-8 opacity-60"></i><span class="text-[8px] uppercase tracking-widest font-bold mt-1 opacity-60">Offhand</span></div>

        <div v-if="cell.type === 'item'" class="w-full h-full p-1 group relative z-10" draggable="true" @dragstart.stop="$emit('dragstartExisting', $event, cell.item)" @dragend="$emit('dragend')">
          <div class="w-full h-full rounded-sm flex flex-col items-center justify-center text-center p-1 shadow-md relative overflow-hidden border-2 border-opacity-40 cursor-grab active:cursor-grabbing" :class="getItemColor(cell.item.slotCost)">
            <button @click.stop="$emit('remove', cell.item.instanceId)" class="absolute top-0 right-0 p-0.5 opacity-0 group-hover:opacity-100 bg-[#8a1c1c] text-[#f0e6d2] rounded-bl-sm transition-all z-20"><i data-lucide="x" class="w-3 h-3"></i></button>
            <div class="text-2xl mb-0.5 drop-shadow-sm filter sepia-[.3] pointer-events-none">{{ cell.item.icon || '📦' }}</div>
            <div class="text-[10px] leading-tight font-bold truncate w-full px-1 font-fantasy tracking-wide pointer-events-none">{{ cell.item.name }}</div>
            <div v-if="cell.item.slotCost > 3" class="absolute bottom-0 left-0 w-full text-[9px] bg-black/40 text-[#f0e6d2] py-0.5 font-serif italic pointer-events-none">Part {{ cell.part }}</div>
          </div>
        </div>

        <div v-else-if="cell.type === 'container'" class="w-full h-full p-1 grid grid-cols-2 grid-rows-2 gap-0.5 z-10">
          <div v-for="subItem in cell.items" :key="subItem.instanceId" draggable="true" @dragstart.stop="$emit('dragstartExisting', $event, subItem)" @dragend="$emit('dragend')" class="bg-[#4a6fa5] border border-[#2c3e50] rounded-sm flex items-center justify-center relative group hover:brightness-110 transition-all cursor-pointer shadow-sm cursor-grab active:cursor-grabbing" :title="subItem.name">
            <button @click.stop="$emit('remove', subItem.instanceId)" class="absolute inset-0 flex items-center justify-center bg-[#8a1c1c]/90 opacity-0 group-hover:opacity-100 rounded-sm text-white font-bold text-xs z-20"><i data-lucide="x" class="w-3 h-3"></i></button>
            <span class="text-sm select-none filter drop-shadow-md pointer-events-none">{{ subItem.icon }}</span>
          </div>
          <div v-for="n in (3 - cell.items.length)" :key="n" class="border border-dashed border-[#a89f91] rounded-sm bg-[#e3d5bc]/30 pointer-events-none"></div>
        </div>

        <div v-else class="w-full h-full flex items-center justify-center text-[#a89f91] font-fantasy text-xs select-none opacity-50 z-10 pointer-events-none">{{ index + 1 }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ gridDisplay:any[], getCellClasses:Function, getItemColor:Function, getDragStateClass:Function }>()
const gridDisplay = props.gridDisplay
</script>
