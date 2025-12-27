<template>
  <div class="p-6 border-b-2 border-[#d1c4a9] flex flex-col md:flex-row justify-between items-center gap-4 bg-parchment/50 backdrop-blur-sm">
    <div>
      <h1 class="text-3xl font-fantasy font-bold tracking-wide text-[#2c1810]">THE SLOT BUCKET</h1>
      <p class="text-[#5c4033] text-sm italic font-serif">A Universal Inventory Ledger</p>
    </div>
    <div class="flex items-center gap-3">
      <button @click="$emit('share')" class="flex items-center gap-2 bg-[#f4e4bc] hover:bg-[#eaddcf] border-2 border-[#2c1810] px-4 py-1.5 rounded-sm text-sm transition-colors shadow-sm font-bold text-[#2c1810]">
        <i data-lucide="feather" class="w-4 h-4"></i>
        <span v-if="copied">Inscribed!</span>
        <span v-else>Share Scroll</span>
      </button>
      <button @click="$emit('clear')" class="text-[#8a1c1c] hover:text-[#601010] text-sm font-bold border-b border-transparent hover:border-[#8a1c1c] transition-all px-2 font-fantasy">Clear Page</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ copied: boolean }>()
const copied = props.copied
</script>
