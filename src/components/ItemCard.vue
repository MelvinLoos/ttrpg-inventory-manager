<template>
  <div
    :key="item.id"
    draggable="true"
    @dragstart="$emit('dragstart', $event, item)"
    @dragend="$emit('dragend')"
    @click="$emit('click', item)"
    class="bg-[#3e2723] p-3 rounded-sm hover:bg-[#4a332a] cursor-grab active:cursor-grabbing border border-[#5c4033] group transition-all shadow-md hover:border-[#c5a059]"
  >
    <div class="flex justify-between items-start pointer-events-none">
      <div>
        <div class="font-bold text-[#e0d0b0]">{{ item.name }}</div>
        <div class="text-xs text-[#a89f91] italic">{{ item.weight }} lbs</div>
      </div>
      <div class="flex flex-col items-end">
        <span :class="badgeClass" class="text-xs px-2 py-0.5 rounded-sm font-fantasy border text-shadow-sm">{{ label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ item: any; getSlotBadgeColor: (n:number)=>string; getSlotLabel: (n:number)=>string }>()

const badgeClass = computed(() => props.getSlotBadgeColor(props.item.slotCost))
const label = computed(() => props.getSlotLabel(props.item.slotCost))
</script>
