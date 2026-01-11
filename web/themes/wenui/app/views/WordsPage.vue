<script setup>
import { ref, computed, onMounted } from 'vue'
import WordsMode from '../components/WordsMode.vue'
import ProgressBar from '../components/ProgressBar.vue'
import NavigationButtons from '../components/NavigationButtons.vue'
import FilterSidebar from '../components/FilterSidebar.vue'
import { useWordService } from '@/services'

// Use unified word service
// Use unified word service
const { words, totalCount, isLoading, loadWords, isIrregularWord } = useWordService()

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
  await loadWords({ 
    offset: 0, 
    limit: batchSize,
    filters: activeFilters.value 
  })
})

// 处理过滤器变化
const handleFilterChange = async (filters) => {
  activeFilters.value = filters
  currentIndex.value = 0 // Reset to first page
  await loadWords({ 
    offset: 0, 
    limit: batchSize, 
    filters: activeFilters.value 
  })
}

// 搜索处理
const handleSearch = async () => {
   if (searchQuery.value.trim()) {
      await loadWords({ keyword: searchQuery.value })
   } else {
      await loadWords({ 
        offset: currentIndex.value, 
        limit: batchSize,
        filters: activeFilters.value 
      })
   }
}


// Display list is directly the words from service (backend filtered)
// Note: 'Recite' filter is client-side state. If selected, we might filter locally, 
// but ideal solution requires backend persistence. For now, we apply it locally on the fetched batch
// or we rely on the user understanding it only shows recite words in current view.
const currentBatchList = computed(() => {
  if (activeFilters.value.recite) {
     return words.value.filter(word => word.status?.recite === true)
  }
  return words.value
})

const totalBatches = computed(() => {
  // 搜索或过滤时不分页 (Logic preserved)
  if (searchQuery.value.trim()) {
    return 1
  }
  return Math.ceil(totalCount.value / batchSize)
})

const currentBatchNum = computed(() => Math.floor(currentIndex.value / batchSize) + 1)
const hasNextBatch = computed(() => currentIndex.value + batchSize < totalCount.value)

// 方法
const nextBatch = async () => {
  if (hasNextBatch.value) {
    currentIndex.value += batchSize
    await loadWords({ 
      offset: currentIndex.value, 
      limit: batchSize,
      filters: activeFilters.value 
    })
  }
}

const prevBatch = async () => {
  if (currentIndex.value - batchSize >= 0) {
    currentIndex.value -= batchSize
    await loadWords({ 
      offset: currentIndex.value, 
      limit: batchSize,
      filters: activeFilters.value 
    })
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex gap-6">
      <!-- Left Sidebar - Filter -->
      <aside class="slidebar">
        <div class="sticky top-24">
          <FilterSidebar
            :active-filters="activeFilters"
            :words="words"
            @filter-change="handleFilterChange"
          />
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 min-w-0 relative">
        <!-- Loading Overlay -->
        <div v-if="isLoading" class="absolute inset-0 z-10 bg-white/50 flex items-center justify-center min-h-[400px]">
          <div class="flex flex-col items-center sticky top-40">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p class="text-slate-600 font-medium">加载中...</p>
          </div>
        </div>

        <!-- Search Box -->
        <div class="mb-6">
          <div class="relative block-search">
            <div class="inner">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索单词或翻译..."
                class="w-full px-4 py-3 pl-10 text-lg border border-slate-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              >
              <svg class="absolute left-3 top-4.5 h-5 w-" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div v-if="searchQuery.trim()" class="mt-2 text-sm text-slate-600">
          <div class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div class="text-sm text-slate-500"> 匹配结果: <span class="font-semibold text-slate-800">{{ words.length }} 个</span></div>
          </div>
        </div>

        <!-- Navigation (hidden when searching or filtering) -->
        <div v-if="!searchQuery.trim()" class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <ProgressBar :current-batch-num="currentBatchNum" :total-batches="totalBatches" />

          <NavigationButtons
            :current-index="currentIndex"
            :has-next-batch="hasNextBatch"
            @prev="prevBatch"
            @next="nextBatch"
          />
        </div>

        <!-- Filter Results Info -->
        <div v-if="activeFilters.letter !== 'all' || activeFilters.type !== 'all' || activeFilters.recite || activeFilters.important || activeFilters.irregular" class="mb-4 text-sm text-slate-600">
          <span class="font-semibold text-slate-800">{{ totalCount }}</span> 个单词符合筛选条件
        </div>

        <div v-if="!isLoading || words.length > 0">
           <WordsMode :current-batch-list="currentBatchList" />
        </div>
      </main>
    </div>
  </div>
</template>
