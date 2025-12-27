<template>
  <div class="min-h-screen flex flex-col md:flex-row shadow-[0_0_50px_rgba(0,0,0,0.8)] max-w-[1600px] mx-auto border-x-4 border-[#1a120b] bg-parchment text-[#2c1810]">

    <!-- TOAST NOTIFICATION -->
    <transition name="toast">
        <div v-if="toastMessage" class="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50 bg-[#3e2723] text-[#c5a059] px-6 py-3 rounded border-2 border-[#c5a059] shadow-2xl font-fantasy tracking-wide flex items-center gap-3">
            <i data-lucide="alert-circle" class="w-5 h-5 text-red-400"></i>
            {{ toastMessage }}
        </div>
    </transition>

    <!-- SIDEBAR -->
    <Sidebar />

    <!-- MAIN -->
    <div class="flex-1 flex flex-col min-h-0 relative">
      <ErrorBoundary>
        <HeaderBar />
        <GridArea />
        <FooterBar />
      </ErrorBoundary>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from './components/Sidebar.vue'
import HeaderBar from './components/HeaderBar.vue'
import GridArea from './components/GridArea.vue'
import FooterBar from './components/FooterBar.vue'
import ErrorBoundary from './components/ErrorBoundary.vue'
import { useToast } from './composables/useToast'

const { toastMessage } = useToast()
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
.ghost-hover { opacity: 0.6; transform: scale(0.98); pointer-events: none }
</style>
