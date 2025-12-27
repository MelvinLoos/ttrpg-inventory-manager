<template>
  <div
    :key="item.id"
    draggable="true"
    tabindex="0"
    @dragstart="$emit('item-dragstart', $event, item)"
    @dragend="$emit('item-dragend')"
    @click="$emit('click', item)"
    @keydown.enter.prevent="$emit('click', item)"
    @keydown.space.prevent="$emit('click', item)"
    role="button"
    class="bg-[#3e2723] p-2 rounded-sm hover:bg-[#4a332a] cursor-grab active:cursor-grabbing border border-[#5c4033] group transition-all shadow-md hover:border-[#c5a059]"
  >
    <div class="flex items-center justify-between pointer-events-none gap-3">
      <div class="flex items-center gap-2">
        <div class="text-2xl">{{ item.icon || '📦' }}</div>
        <div class="text-sm">
          <div class="font-bold text-[#e0d0b0] inline">{{ item.name }}</div>
          <span class="text-xs text-[#a89f91] italic ml-2">{{ item.weight }} lbs</span>
        </div>
      </div>
      <div>
        <span :class="badgeClass" class="text-xs px-2 py-0.5 rounded-sm font-fantasy border text-shadow-sm">{{ label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Item } from '../types'

const props = defineProps<{ item: Item; getSlotBadgeColor: (n:number)=>string; getSlotLabel: (n:number)=>string }>()

const badgeClass = computed(() => props.getSlotBadgeColor(props.item.slotCost))
const label = computed(() => props.getSlotLabel(props.item.slotCost))
</script>
