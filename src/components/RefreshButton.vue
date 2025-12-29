<script setup>
defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['refresh'])
</script>

<template>
  <button
    @click="$emit('refresh')"
    :disabled="disabled"
    class="p-2 rounded-full bg-white border border-slate-200 shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:rotate-180 duration-300"
    title="刷新题目"
  >
    <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
    </svg>
  </button>
</template>
