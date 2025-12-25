<script setup>
defineProps({
  currentBatchList: {
    type: Array,
    required: true
  }
})

// TTS 发音功能
const speak = (text) => {
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  window.speechSynthesis.speak(utterance)
}
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div v-for="item in currentBatchList" :key="item.id"
         class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative overflow-hidden">
      <div class="absolute top-0 rounded-br-full py-1 pl-2 pr-4 bg-blue-200 text-black/75 text-xs left-0">上次学习时间 {{ item.last_review }}</div>
      <div class="flex justify-between items-start py-2">
        <h3 class="text-2xl font-bold text-slate-800">{{ item.word }}</h3>
        <button @click="speak(item.word)" class="text-slate-300 hover:text-indigo-500 transition-colors" title="朗读">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>
          </svg>
        </button>
      </div>
      <div class="text-slate-500 py-2 border-t border-slate-50 text-lg">
        {{ item.translation }}
      </div>
    </div>
  </div>
</template>
