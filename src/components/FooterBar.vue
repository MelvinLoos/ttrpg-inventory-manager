<template>
  <div class="border-t-2 border-[#d1c4a9] p-4 flex justify-between items-center text-sm bg-parchment/80">
    <div class="flex items-center gap-4">
      <div class="text-[#2c1810]">Current Load: <span :class="loadColor" class="font-bold text-lg font-fantasy">{{ currentLoadPoints }} / {{ strength * 3 }}</span></div>
      <div v-if="isOverencumbered" class="text-[#8a1c1c] font-bold flex items-center animate-pulse font-fantasy tracking-wide"><i data-lucide="skull" class="w-4 h-4 mr-1"></i> Overburdened!</div>
    </div>
    <div class="text-[#5c4033] text-xs hidden md:block italic font-serif opacity-70">Based on SRD 5.1 Ruleset</div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ currentLoadPoints:number, strength:number, isOverencumbered:boolean, loadColor:string }>()
</script>
