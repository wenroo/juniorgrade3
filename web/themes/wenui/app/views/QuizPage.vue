<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
    <div class="container mx-auto px-4 py-8">

      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Sidebar -->
        <div class="lg:w-64 flex-shrink-0">
          <FilterSidebarQuiz
            :questions="allQuestions"
            :multipleChoiceQuestions="multipleChoiceQuestions"
            :wordDerivationQuestions="wordDerivationQuestions"
            :sentenceTransformationQuestions="sentenceTransformationQuestions"
            :readingComprehensionQuestions="readingComprehensionQuestions"
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
            <WordDerivationQuiz v-if="activeTab === 'word_derivation'" />
            <SentenceTransformationQuiz v-if="activeTab === 'sentence_transformation'" />
            <ReadingComprehensionQuiz v-if="activeTab === 'reading_comprehension'" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { graphqlQuery } from '@/services/drupal'
import { useWordService } from '@/services/wordService'
import MultipleChoiceQuiz from '@/components/MultipleChoiceQuiz.vue'
import ChoiceQuiz from '@/components/ChoiceQuiz.vue'
import ClozeTestQuiz from '@/components/ClozeTestQuiz.vue'
import InitialLetterQuiz from '@/components/InitialLetterQuiz.vue'
import WordDerivationQuiz from '@/components/WordDerivationQuiz.vue'
import SentenceTransformationQuiz from '@/components/SentenceTransformationQuiz.vue'
import ReadingComprehensionQuiz from '@/components/ReadingComprehensionQuiz.vue'
import FilterSidebarQuiz from '@/components/FilterSidebarQuiz.vue'

const { loadFillingLibrary, loadQuestionChoices } = useWordService()

const activeTab = ref('multiple-choice')
const allQuestions = ref([])
const multipleChoiceQuestions = ref([])
const wordDerivationQuestions = ref([])
const sentenceTransformationQuestions = ref([])
const readingComprehensionQuestions = ref([])
const currentFilters = ref({
  questionType: 'all',
  from: 'all'
})

onMounted(async () => {
  await loadQuestions()
})

async function loadQuestions() {
  try {
    // Define queries (placeholders for now)
    const WORD_DERIVATION_QUERY = `query { wordDerivation { ... } }`
    const TRANSFORMATION_QUERY = `query { transformation { ... } }`
    const READING_QUERY = `query { readingComprehension { ... } }`

    // Load all data sources in parallel
    const [fillingData, choiceData, wordDerivationData, transformationData, readingData] = await Promise.all([
      loadFillingLibrary(),
      loadQuestionChoices(),
      graphqlQuery(WORD_DERIVATION_QUERY).then(res => res.data),
      graphqlQuery(TRANSFORMATION_QUERY).then(res => res.data),
      graphqlQuery(READING_QUERY).then(res => res.data)
    ])

    allQuestions.value = fillingData
    multipleChoiceQuestions.value = choiceData
    wordDerivationQuestions.value = wordDerivationData
    sentenceTransformationQuestions.value = transformationData
    readingComprehensionQuestions.value = readingData
  } catch (error) {
    console.error('Failed to load questions:', error)
  }
}

function handleFilterChange(filters) {
  currentFilters.value = filters
}

function handleTabChange(tabId) {
  // All tabs now stay on /quiz route
  activeTab.value = tabId
}
</script>

