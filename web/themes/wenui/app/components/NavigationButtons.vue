<script setup>
defineProps({
  currentIndex: {
    type: Number,
    required: true
  },
  hasNextBatch: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['prev', 'next'])
</script>

<template>
  <div class="flex space-x-2">
    <button
      @click="$emit('prev')"
      :disabled="currentIndex === 0"
      class="p-2 rounded-full bg-white border border-slate-200 shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
      <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
      </svg>
    </button>
    <button
      @click="$emit('next')"
      :disabled="!hasNextBatch"
      class="p-2 rounded-full bg-white border border-slate-200 shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
      <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
      </svg>
    </button>
  </div>
</template>
