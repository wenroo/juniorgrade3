<script setup>
import { ref, computed, onMounted } from 'vue'
import ReciteMode from '../components/ReciteMode.vue'
import ProgressBar from '../components/ProgressBar.vue'
import NavigationButtons from '../components/NavigationButtons.vue'
import FilterSidebar from '../components/FilterSidebar.vue'
import { useWordService } from '@/services/wordServiceSupabase'

// Use unified word service
const { words, isLoading, loadWords } = useWordService()

// 响应式状态
const currentIndex = ref(0)
const batchSize = 10
const searchQuery = ref('')
const activeFilters = ref({
  letter: 'all',
  partOfSpeech: ['all']
})

// Load words on mount
onMounted(async () => {
  await loadWords()
})

// 处理过滤器变化
const handleFilterChange = (filters) => {
  activeFilters.value = filters
  currentIndex.value = 0 // 重置到第一页
}

// 计算属性
// 过滤后的单词列表
const filteredWords = computed(() => {
  let result = words.value

  // 搜索过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(word => {
      const wordMatch = word.word.toLowerCase().includes(query)
      // 检查 translations 数组中的翻译
      const translationMatch = word.translations?.some(trans =>
        trans.translation.toLowerCase().includes(query)
      )
      return wordMatch || translationMatch
    })
  }

  // 首字母过滤
  if (activeFilters.value.letter !== 'all') {
    result = result.filter(word =>
      word.word.charAt(0).toUpperCase() === activeFilters.value.letter
    )
  }

  // 词性过滤
  if (!activeFilters.value.partOfSpeech.includes('all')) {
    result = result.filter(word =>
      word.translations?.some(trans =>
        activeFilters.value.partOfSpeech.includes(trans.type)
      )
    )
  }

  // Recite 过滤
  if (activeFilters.value.recite === true) {
    result = result.filter(word => word.status?.recite === true)
  }

  // Important 过滤
  if (activeFilters.value.important === true) {
    result = result.filter(word => word.status?.important === true)
  }

  return result
})

const totalBatches = computed(() => {
  // 搜索或过滤时不分页
  if (searchQuery.value.trim() ||
      activeFilters.value.letter !== 'all' ||
      !activeFilters.value.partOfSpeech.includes('all') ||
      activeFilters.value.recite === true ||
      activeFilters.value.important === true) {
    return 1
  }
  return Math.ceil(filteredWords.value.length / batchSize)
})

const currentBatchNum = computed(() => Math.floor(currentIndex.value / batchSize) + 1)
const hasNextBatch = computed(() => currentIndex.value + batchSize < filteredWords.value.length)

const currentBatchList = computed(() => {
  // 搜索或过滤时显示所有匹配结果
  if (searchQuery.value.trim() ||
      activeFilters.value.letter !== 'all' ||
      !activeFilters.value.partOfSpeech.includes('all') ||
      activeFilters.value.recite === true ||
      activeFilters.value.important === true) {
    return filteredWords.value
  }
  // 正常分页
  return filteredWords.value.slice(currentIndex.value, currentIndex.value + batchSize)
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
  <div class="container mx-auto px-4 py-8">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
      <p class="text-slate-600">加载单词数据中...</p>
    </div>

    <!-- Content with Sidebar -->
    <div v-else class="flex gap-6">
      <!-- Left Sidebar - Filter -->
      <aside class="hidden lg:block w-64 flex-shrink-0">
        <div class="sticky top-24">
          <FilterSidebar
            :active-filters="activeFilters"
            :words="words"
            @filter-change="handleFilterChange"
          />
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 min-w-0">
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
          </div>
        </div>
        <div v-if="searchQuery.trim()" class="mt-2 text-sm text-slate-600">
          <div class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div class="text-sm text-slate-500"> 匹配结果: <span class="font-semibold text-slate-800">{{ filteredWords.length }} 个</span></div>
          </div>
        </div>

        <!-- Navigation (hidden when searching or filtering) -->
        <div v-if="!searchQuery.trim() && activeFilters.letter === 'all' && activeFilters.partOfSpeech.includes('all') && !activeFilters.recite && !activeFilters.important" class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <ProgressBar :current-batch-num="currentBatchNum" :total-batches="totalBatches" />

          <NavigationButtons
            :current-index="currentIndex"
            :has-next-batch="hasNextBatch"
            @prev="prevBatch"
            @next="nextBatch"
          />
        </div>

        <!-- Filter Results Info -->
        <div v-if="activeFilters.letter !== 'all' || !activeFilters.partOfSpeech.includes('all') || activeFilters.recite || activeFilters.important" class="mb-4 text-sm text-slate-600">
          <span class="font-semibold text-slate-800">{{ filteredWords.length }}</span> 个单词符合筛选条件
        </div>

        <ReciteMode :current-batch-list="currentBatchList" />
      </main>
    </div>
  </div>
</template>
