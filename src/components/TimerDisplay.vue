<script setup>
defineProps({
  timeLeft: {
    type: Number,
    required: true
  },
  isSubmitted: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <transition name="list">
    <div v-if="!isSubmitted" class="flex items-center bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
      <svg class="w-4 h-4 mr-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      剩余时间: {{ timeLeft }}s
    </div>
  </transition>
</template>
