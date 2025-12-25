<script setup>
import { onMounted } from 'vue'
import { useWordService } from '@/services/wordService'

// Use unified word service
const { wrongWords, loadWords, isLoading } = useWordService()

// Load words on mount
onMounted(async () => {
  await loadWords()
})

// TTS 发音功能
const speak = (text) => {
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  window.speechSynthesis.speak(utterance)
}
</script>

<template>
  <div class="container max-w-6xl mx-auto px-4 py-8">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
      <p class="text-slate-600">加载单词数据中...</p>
    </div>

    <!-- Content -->
    <template v-else>
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-slate-800">错词本</h1>
        <p class="text-sm text-slate-500 mt-2">共 {{ wrongWords.length }} 个单词</p>
      </div>

      <div v-if="wrongWords.length === 0" class="text-center py-12 text-slate-400">
        <p class="text-lg">暂无错词，继续加油！</p>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div v-for="item in wrongWords" :key="item.id"
             class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative overflow-hidden">
          <div class="absolute top-0 rounded-bl-full py-1 pl-2 pr-4 bg-blue-200 text-black/75 text-xs right-0">上次学习时间 {{ item.error_count }}</div>
          <div class="flex justify-between items-start mb-2">
            <h3 class="text-2xl font-bold text-slate-800">{{ item.word }}</h3>
            <button @click="speak(item.word)" class="text-slate-300 hover:text-indigo-500 transition-colors" title="朗读">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>
              </svg>
            </button>
          </div>
          <div class="text-slate-500 mt-2 pt-2 border-t border-slate-50 text-lg">
            {{ item.translation }}
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
