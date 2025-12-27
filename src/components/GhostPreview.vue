<template>
  <div class="ghost-preview pointer-events-none flex items-center justify-center">
    <div class="text-2xl opacity-80 select-none">{{ icon }}</div>
  </div>
</template>

<script setup lang="ts">
import type { Item } from '../types'
const props = defineProps<{ item: Item | null }>()
const icon = (props.item && props.item.icon) ? props.item.icon : '📦'
</script>

<style scoped>
.ghost-preview {
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.03);
  border-radius: 4px;
  color: inherit;
}
</style>
