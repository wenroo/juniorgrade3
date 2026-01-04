<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  questions: {
    type: Array,
    default: () => []
  },
  multipleChoiceQuestions: {
    type: Array,
    default: () => []
  },
  wordDerivationQuestions: {
    type: Array,
    default: () => []
  },
  sentenceTransformationQuestions: {
    type: Array,
    default: () => []
  },
  readingComprehensionQuestions: {
    type: Array,
    default: () => []
  },
  activeTab: {
    type: String,
    default: 'multiple-choice'
  }
})

const emit = defineEmits(['filter-change', 'tab-change'])

// Load filters from localStorage
const loadFiltersFromStorage = () => {
  try {
    const saved = localStorage.getItem('quizFilters')
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.error('Failed to load filters from localStorage:', e)
  }
  return {
    questionType: 'all',
    activeTab: 'multiple-choice' // Add default active tab
  }
}

// Current selected filters
const selectedFilters = ref(loadFiltersFromStorage())

// Get unique question types from questions
const questionTypes = computed(() => {
  const types = new Set()
  props.questions.forEach(q => {
    if (q.question_type) {
      types.add(q.question_type)
    }
  })
  return Array.from(types)
})

// Count questions by tab type
const getTabQuestionCount = (tabId) => {
  if (tabId === 'multiple-choice') {
    return props.multipleChoiceQuestions.length
  }

  if (tabId === 'word_derivation') {
    return props.wordDerivationQuestions.length
  }

  if (tabId === 'sentence_transformation') {
    return props.sentenceTransformationQuestions.length
  }

  if (tabId === 'reading_comprehension') {
    return props.readingComprehensionQuestions.length
  }

  const tab = tabs.find(t => t.id === tabId)
  if (!tab || !tab.questionType) return 0

  return props.questions.filter(q => q.question_type === tab.questionType).length
}

// Handle filter change
const handleFilterChange = (groupId, value) => {
  selectedFilters.value[groupId] = value
  saveFiltersToStorage()
  emit('filter-change', selectedFilters.value)
}

// Save filters to localStorage
const saveFiltersToStorage = () => {
  try {
    localStorage.setItem('quizFilters', JSON.stringify(selectedFilters.value))
  } catch (e) {
    console.error('Failed to save filters to localStorage:', e)
  }
}

// Reset filters
const resetFilters = () => {
  selectedFilters.value = {
    questionType: 'all'
  }
  saveFiltersToStorage()
  emit('filter-change', selectedFilters.value)
}

// Get question type label
const getQuestionTypeLabel = (type) => {
  const labels = {
    'complete': '完形填空',
    'fill': '首字母填空',
    'choice': '阅读五选四'
  }
  return labels[type] || type
}

// Tab configuration
const tabs = [
  { id: 'multiple-choice', label: '选择题', questionType: null },
  { id: 'choice', label: '阅读五选四', questionType: 'choice' },
  { id: 'complete', label: '完形填空', questionType: 'complete' },
  { id: 'fill', label: '首字母填空', questionType: 'fill' },
  { id: 'word_derivation', label: '单词改写', questionType: 'word_derivation' },
  { id: 'sentence_transformation', label: '句型转换', questionType: 'sentence_transformation' },
  { id: 'reading_comprehension', label: '阅读理解', questionType: 'reading_comprehension' }
]

// Handle tab change
const handleTabChange = (tabId) => {
  const tab = tabs.find(t => t.id === tabId)

  emit('tab-change', tabId)

  // Save active tab to localStorage
  selectedFilters.value.activeTab = tabId

  // Auto-filter by question type when tab changes
  if (tab && tab.questionType) {
    selectedFilters.value.questionType = tab.questionType
    saveFiltersToStorage()
    emit('filter-change', selectedFilters.value)
  } else if (tabId === 'multiple-choice') {
    // Reset filter for multiple-choice tab
    selectedFilters.value.questionType = 'all'
    saveFiltersToStorage()
    emit('filter-change', selectedFilters.value)
  }
}

// Component mounted
onMounted(() => {
  // Restore saved active tab
  const savedTab = selectedFilters.value.activeTab || 'multiple-choice'
  if (savedTab !== props.activeTab) {
    emit('tab-change', savedTab)
  }

  emit('filter-change', selectedFilters.value)
})
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-4 h-full overflow-y-auto">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold text-slate-800">题库筛选</h2>
      <button
        @click="resetFilters"
        class="text-sm bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg transition-colors"
      >
        重置
      </button>
    </div>

    <!-- Tab Navigation -->
    <div class="mb-6">
      <h3 class="text-sm font-semibold text-slate-700 mb-3">题目类型</h3>
      <div class="flex flex-col gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="handleTabChange(tab.id)"
          :class="[
            'py-3 px-4 text-sm font-semibold rounded-lg transition-all flex justify-between items-center',
            activeTab === tab.id
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-50 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'
          ]"
        >
          <span>{{ tab.label }}</span>
          <span class="text-xs opacity-75">{{ getTabQuestionCount(tab.id) }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
