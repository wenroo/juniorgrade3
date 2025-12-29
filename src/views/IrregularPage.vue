<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWordService } from '@/services'

// Use word service to get irregular words
const { irregularWords, isLoading, loadWords } = useWordService()

// 响应式状态
const searchQuery = ref('')

// Load words on mount
onMounted(async () => {
  await loadWords()
})

// 过滤后的不规则动词列表（显示所有结果，无分页）
const filteredWords = computed(() => {
  let result = irregularWords.value
  // 搜索过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(item => {
      const wordMatch = item.word.toLowerCase().includes(query)
      const pastTenseMatch = item.pasttense.word.toLowerCase().includes(query)
      const pastParticipleMatch = item.pastparticiple?.word.toLowerCase().includes(query)
      return wordMatch || pastTenseMatch || pastParticipleMatch
    })
  }
  return result
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
      <p class="text-slate-600">加载不规则动词数据中...</p>
    </div>

    <!-- Main Content -->
    <main v-else class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-slate-800 mb-2">不规则动词</h1>
        <p class="text-slate-600">共 {{ filteredWords.length }} 个不规则动词</p>
      </div>

      <!-- Search Box -->
      <div class="mb-6">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索不规则动词..."
            class="w-full px-4 py-3 pl-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <svg class="absolute left-3 top-3.5 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <!-- Irregular Verbs Grid -->
      <div class="cards cards-normal">
        <div
          v-for="item in filteredWords"
          :key="item.id"
          class="card-item"
        >
          <!-- Infinitive -->
          <div class="card-item-col">
            <span class="card-item-title text-slate-100">不定式</span>
            <div class="card-item-content">
              <h3 class="text-lg md:text-2xl font-medium text-white">{{ item.word }}</h3>
              <p class="text-sm text-gray-100">{{ item.phonetic }}</p>
            </div>
          </div>

          <!-- Past Tense -->
          <div class="card-item-col">
            <span class="card-item-title  text-amber-900 ">过去式</span>
            <div class="card-item-content">
              <p class="text-base md:text-xl font-medium">{{ item.pasttense.word }}</p>
              <p class="max-md:text-xs text-slate-400">{{ item.pasttense.phonetic }}</p>
            </div>
          </div>

          <!-- Past Participle -->
          <div class="card-item-col">
            <span class="card-item-title   text-amber-900 ">过去分词</span>
            <div class="card-item-content">
              <p class="text-base md:text-xl font-medium">{{ item.pastparticiple?.word }}</p>
              <p class="max-md:text-xs text-slate-400">{{ item.pastparticiple?.phonetic }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
