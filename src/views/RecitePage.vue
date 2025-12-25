<script setup>
import { ref, computed, onMounted } from 'vue'
import ReciteMode from '../components/ReciteMode.vue'
import ProgressBar from '../components/ProgressBar.vue'
import NavigationButtons from '../components/NavigationButtons.vue'
import { useWordService } from '@/services/wordService'

// Use unified word service
const { words, isLoading, loadWords } = useWordService()

// 响应式状态
const currentIndex = ref(0)
const batchSize = 10
const searchQuery = ref('')

// Load words on mount
onMounted(async () => {
  await loadWords()
})

// 计算属性
// 过滤后的单词列表
const filteredWords = computed(() => {
  if (!searchQuery.value.trim()) {
    return words.value
  }

  const query = searchQuery.value.toLowerCase()
  return words.value.filter(word => {
    const wordMatch = word.word.toLowerCase().includes(query)
    const translationMatch = word.translation.toLowerCase().includes(query)
    return wordMatch || translationMatch
  })
})

const totalBatches = computed(() => {
  // 搜索时不分页
  if (searchQuery.value.trim()) {
    return 1
  }
  return Math.ceil(words.value.length / batchSize)
})

const currentBatchNum = computed(() => Math.floor(currentIndex.value / batchSize) + 1)
const hasNextBatch = computed(() => currentIndex.value + batchSize < words.value.length)

const currentBatchList = computed(() => {
  // 搜索时显示所有匹配结果
  if (searchQuery.value.trim()) {
    return filteredWords.value
  }
  // 正常分页
  return words.value.slice(currentIndex.value, currentIndex.value + batchSize)
})

// 方法
const nextBatch = () => {
  if (hasNextBatch.value) {
    currentIndex.value += batchSize
  }
}

const prevBatch = () => {
  if (currentIndex.value - batchSize >= 0) {
    currentIndex.value -= batchSize
  }
}
</script>

<template>
  <div class="container max-w-4xl mx-auto px-4 py-8">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
      <p class="text-slate-600">加载单词数据中...</p>
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Search Box -->
      <div class="mb-6">
        <div class="relative block-search">
          <div class="inner">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索单词或翻译..."
              class="w-full px-4 py-3 pl-10 text-lg border border-slate-300 rounded-t-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            >
            <svg class="absolute left-3 top-4.5 h-5 w-" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
      </div></div>
        <div v-if="searchQuery.trim()" class="mt-2 text-sm text-slate-600">
          <div class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div class="text-sm text-slate-500"> 匹配结果: <span class="font-semibold text-slate-800">{{ filteredWords.length }} 个</span></div>
          </div>
        </div>
      <!-- Navigation (hidden when searching) -->
      <div v-if="!searchQuery.trim()" class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <ProgressBar :current-batch-num="currentBatchNum" :total-batches="totalBatches" />

        <NavigationButtons
          :current-index="currentIndex"
          :has-next-batch="hasNextBatch"
          @prev="prevBatch"
          @next="nextBatch"
        />
      </div>

      <ReciteMode :current-batch-list="currentBatchList" />
    </template>
  </div>
</template>
