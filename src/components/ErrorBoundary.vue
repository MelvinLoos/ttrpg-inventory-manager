<template>
  <div>
    <slot v-if="!hasError"></slot>
    <div v-else class="p-6 bg-red-50 text-red-900 h-full flex flex-col items-center justify-center">
      <h2 class="text-xl font-bold mb-2">Something went wrong</h2>
      <p class="mb-4">An unexpected error occurred in this part of the app.</p>
      <pre class="text-xs bg-white p-3 rounded max-w-full overflow-auto" v-if="errorMsg">{{ errorMsg }}</pre>
      <button @click="reset" class="mt-4 px-4 py-2 bg-[#3e2723] text-[#c5a059] rounded">Reload UI</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const hasError = ref(false)
const errorMsg = ref<string | null>(null)

function reset() {
  hasError.value = false
  errorMsg.value = null
  // reload to attempt a clean mount
  if (typeof window !== 'undefined') window.location.reload()
}

// capture errors from descendants
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function errorCaptured(err: any) {
  hasError.value = true
  try { errorMsg.value = String(err?.message || err) } catch { errorMsg.value = 'Error' }
  // returning false prevents further propagation
  return false
}

defineExpose({ errorCaptured })
</script>

<style scoped>
.error-boundary { min-height: 100%; }
</style>
