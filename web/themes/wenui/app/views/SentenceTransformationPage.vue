<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
    <div class="container mx-auto px-4 py-8">
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Sidebar -->
        <div class="lg:w-64 flex-shrink-0">
          <FilterSidebarQuiz
            :questions="[]"
            :multipleChoiceQuestions="[]"
            activeTab="sentence_transformation"
            @filter-change="handleFilterChange"
            @tab-change="handleTabChange"
          />
        </div>

        <!-- Main Content -->
        <div class="flex-1">
          <div class="bg-white rounded-xl shadow-lg p-8">
            <div class="mb-6">
              <h1 class="text-3xl font-bold text-slate-800 mb-2">句型转换练习</h1>
              <p class="text-slate-600">共 {{ questions.length }} 题 | 第 {{ currentPage + 1 }}/{{ totalPages }} 页</p>
            </div>

            <div v-if="isLoading" class="text-center py-12">
              <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              <p class="mt-4 text-slate-600">加载题目中...</p>
            </div>

            <div v-else-if="questions.length === 0" class="text-center py-12">
              <p class="text-slate-600 text-lg">暂无题目</p>
            </div>

            <div v-else>
              <div v-for="(question, index) in currentQuestions" :key="question.library_id" class="mb-8 border-b pb-6">
                <div class="mb-4">
                  <span class="text-sm font-semibold text-purple-600">题目 {{ currentPage * questionsPerPage + index + 1 }}</span>
                  <span v-if="question.library_from" class="ml-4 text-sm text-slate-500">
                    来源: {{ question.library_from }}
                  </span>
                </div>

                <div class="prose max-w-none mb-6" v-html="question.content"></div>

                <div class="space-y-4">
                  <div v-for="blank in question.blanks" :key="blank.blank_id" class="bg-slate-50 rounded-lg p-4">
                    <div class="mb-3">
                      <span class="font-semibold text-slate-700">填空 {{ blank.blank_id }}:</span>
                    </div>

                    <div class="flex gap-3 items-start">
                      <input
                        type="text"
                        v-model="userAnswers[question.library_id + '_' + blank.blank_id]"
                        @keyup.enter="checkAnswer(question.library_id, blank.blank_id, blank.correct_word)"
                        :disabled="answerStatus[question.library_id + '_' + blank.blank_id] !== undefined"
                        class="flex-1 p-3 border-2 rounded-lg focus:outline-none focus:border-purple-500"
                        placeholder="请输入答案（多个答案用空格分隔）..."
                      />
                      <button
                        v-if="answerStatus[question.library_id + '_' + blank.blank_id] === undefined"
                        @click="checkAnswer(question.library_id, blank.blank_id, blank.correct_word)"
                        class="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                      >
                        提交
                      </button>
                    </div>

                    <div v-if="answerStatus[question.library_id + '_' + blank.blank_id] !== undefined" class="mt-3">
                      <div v-if="answerStatus[question.library_id + '_' + blank.blank_id]" class="text-green-600 font-semibold">
                        ✓ 正确！
                      </div>
                      <div v-else class="text-red-600">
                        <p class="font-semibold">✗ 错误</p>
                        <p class="text-sm mt-1">正确答案: {{ formatCorrectAnswer(blank.correct_word) }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="isQuestionAnswered(question)" class="mt-4">
                  <div v-if="showExplanation[question.library_id]" class="p-4 bg-blue-50 rounded-lg">
                    <h4 class="font-semibold text-blue-800 mb-2">解析:</h4>
                    <div class="text-sm text-slate-700" v-html="question.info"></div>
                  </div>

                  <button
                    @click="toggleExplanation(question.library_id)"
                    class="mt-3 text-sm text-blue-600 hover:text-blue-800"
                  >
                    {{ showExplanation[question.library_id] ? '隐藏解析' : '查看解析' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- 分页导航 -->
            <div v-if="!isLoading && questions.length > 0" class="mt-6 flex justify-between items-center">
              <button
                @click="goToPrevPage"
                :disabled="currentPage === 0"
                class="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                ← 上一题
              </button>
              <span class="text-slate-600">第 {{ currentPage + 1 }} / {{ totalPages }} 页</span>
              <button
                @click="goToNextPage"
                :disabled="currentPage >= totalPages - 1"
                class="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                下一题 →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { graphqlQuery } from '@/services/drupal'
import FilterSidebarQuiz from '@/components/FilterSidebarQuiz.vue'

const questions = ref([])
const isLoading = ref(true)
const userAnswers = ref({})
const answerStatus = ref({})
const showExplanation = ref({})
const currentPage = ref(0)
const questionsPerPage = ref(1)

// 计算当前页显示的题目
const currentQuestions = computed(() => {
  const start = currentPage.value * questionsPerPage.value
  const end = start + questionsPerPage.value
  return questions.value.slice(start, end)
})

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(questions.value.length / questionsPerPage.value)
})

onMounted(async () => {
  try {
    // Default settings
    questionsPerPage.value = 1

    const QUERY = `query { transformation { ... } }`
    const response = await graphqlQuery(QUERY)
    questions.value = response.data || []
  } catch (error) {
    console.error('加载题目失败:', error)
  } finally {
    isLoading.value = false
  }
})

const checkAnswer = (questionId, blankId, correctAnswers) => {
  const key = questionId + '_' + blankId
  const userAnswer = userAnswers.value[key]?.trim().toLowerCase()

  const isCorrect = correctAnswers.some(answer => {
    const variants = answer.toLowerCase().split('##')
    return variants.some(variant => {
      const parts = variant.split(/\s+/)
      const userParts = userAnswer.split(/\s+/)
      return parts.length === userParts.length &&
             parts.every((part, i) => part === userParts[i])
    })
  })

  answerStatus.value[key] = isCorrect
}

const formatCorrectAnswer = (correctAnswers) => {
  return correctAnswers.map(answer =>
    answer.replace(/##/g, ' / ')
  ).join(' 或 ')
}

const isQuestionAnswered = (question) => {
  return question.blanks.every(blank =>
    answerStatus.value[question.library_id + '_' + blank.blank_id] !== undefined
  )
}

const toggleExplanation = (questionId) => {
  showExplanation.value[questionId] = !showExplanation.value[questionId]
}

const handleFilterChange = (filters) => {
  console.log('Filter changed:', filters)
}

const handleTabChange = (tabId) => {
  console.log('Tab changed:', tabId)
}

// 分页导航函数
const goToNextPage = () => {
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value++
  }
}

const goToPrevPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--
  }
}
</script>
