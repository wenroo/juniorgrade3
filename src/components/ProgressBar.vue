<script setup>
defineProps({
  currentBatchNum: {
    type: Number,
    required: true
  },
  totalBatches: {
    type: Number,
    required: true
  }
})
</script>

<template>
  <div class="text-sm text-slate-500">
    当前进度: <span class="font-semibold text-slate-800">{{ currentBatchNum }} / {{ totalBatches }}</span>
  </div>
</template>
