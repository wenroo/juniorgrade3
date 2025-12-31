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
    from: 'all',
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

// Get unique from values from questions
const fromValues = computed(() => {
  const froms = new Set()
  props.questions.forEach(q => {
    if (q.from) {
      froms.add(q.from)
    }
  })
  return Array.from(froms)
})

// Count questions by tab type
const getTabQuestionCount = (tabId) => {
  if (tabId === 'multiple-choice') {
    // For multiple-choice, use separate data source
    return props.multipleChoiceQuestions.length
  }

  const tab = tabs.find(t => t.id === tabId)
  if (!tab || !tab.questionType) return 0

  return props.questions.filter(q => q.question_type === tab.questionType).length
}

// Count questions by from
const getFromCount = (from) => {
  if (from === 'all') {
    return props.questions.length
  }
  return props.questions.filter(q => q.from === from).length
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
    questionType: 'all',
    from: 'all'
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
  { label: '单词改写', id: 'word_derivation', type: 'word_derivation'  },
  { label: '句型转换', id: 'sentence_transformation', type: 'sentence_transformation' },
  { label: '阅读理解', id: 'reading_comprehension', type: 'reading_comprehension' }
]

// Handle tab change
const handleTabChange = (tabId) => {
  emit('tab-change', tabId)

  // Save active tab to localStorage
  selectedFilters.value.activeTab = tabId

  // Auto-filter by question type when tab changes
  const tab = tabs.find(t => t.id === tabId)
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

    <!-- From Filter (Select) -->
    <div class="mb-6">
      <h3 class="text-sm font-semibold text-slate-700 mb-3">题目来源</h3>
      <select
        v-model="selectedFilters.from"
        @change="handleFilterChange('from', selectedFilters.from)"
        class="w-full py-2 px-4 text-sm font-medium rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:outline-none transition-colors bg-white"
      >
        <option value="all">全部来源 ({{ getFromCount('all') }})</option>
        <option
          v-for="from in fromValues"
          :key="from"
          :value="from"
        >
          {{ from }} ({{ getFromCount(from) }})
        </option>
      </select>
    </div>
  </div>
</template>
