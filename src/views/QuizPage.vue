<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
    <div class="container mx-auto px-4 py-8">

      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Sidebar -->
        <div class="lg:w-64 flex-shrink-0">
          <FilterSidebarQuiz
            :questions="allQuestions"
            :multipleChoiceQuestions="multipleChoiceQuestions"
            :activeTab="activeTab"
            @filter-change="handleFilterChange"
            @tab-change="handleTabChange"
          />
        </div>

        <!-- Main Content -->
        <div class="flex-1">
          <div class="bg-white rounded-2xl shadow-lg p-6 min-h-[500px]">
            <MultipleChoiceQuiz v-if="activeTab === 'multiple-choice'" :filters="currentFilters" />
            <ChoiceQuiz v-if="activeTab === 'choice'" :filters="currentFilters" />
            <ClozeTestQuiz v-if="activeTab === 'complete'" :filters="currentFilters" />
            <InitialLetterQuiz v-if="activeTab === 'fill'" :filters="currentFilters" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useWordService } from '@/services/wordService'
import MultipleChoiceQuiz from '@/components/MultipleChoiceQuiz.vue'
import ChoiceQuiz from '@/components/ChoiceQuiz.vue'
import ClozeTestQuiz from '@/components/ClozeTestQuiz.vue'
import InitialLetterQuiz from '@/components/InitialLetterQuiz.vue'
import FilterSidebarQuiz from '@/components/FilterSidebarQuiz.vue'

const { loadFillingLibrary, loadQuestionChoices } = useWordService()

const activeTab = ref('multiple-choice')
const allQuestions = ref([])
const multipleChoiceQuestions = ref([])
const currentFilters = ref({
  questionType: 'all',
  from: 'all'
})

onMounted(async () => {
  await loadQuestions()
})

async function loadQuestions() {
  try {
    // Load both data sources
    const [fillingData, choiceData] = await Promise.all([
      loadFillingLibrary(),
      loadQuestionChoices()
    ])

    allQuestions.value = fillingData
    multipleChoiceQuestions.value = choiceData
  } catch (error) {
    console.error('Failed to load questions:', error)
  }
}

function handleFilterChange(filters) {
  currentFilters.value = filters
}

function handleTabChange(tabId) {
  activeTab.value = tabId
}
</script>

