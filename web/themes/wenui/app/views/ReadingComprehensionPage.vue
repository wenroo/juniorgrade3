<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50">
    <div class="container mx-auto px-4 py-8">
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Sidebar -->
        <div class="lg:w-64 flex-shrink-0">
          <FilterSidebarQuiz
            :questions="[]"
            :multipleChoiceQuestions="[]"
            activeTab="reading_comprehension"
            @filter-change="handleFilterChange"
            @tab-change="handleTabChange"
          />
        </div>

        <!-- Main Content -->
        <div class="flex-1">
          <div class="bg-white rounded-xl shadow-lg p-8">
            <div class="mb-6">
              <h1 class="text-3xl font-bold text-slate-800 mb-2">阅读理解练习</h1>
              <p class="text-slate-600">共 {{ questions.length }} 篇 | 第 {{ currentPage + 1 }}/{{ totalPages }} 页</p>
            </div>

            <div v-if="isLoading" class="text-center py-12">
              <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p class="mt-4 text-slate-600">加载题目中...</p>
            </div>

            <div v-else-if="questions.length === 0" class="text-center py-12">
              <p class="text-slate-600 text-lg">暂无题目</p>
            </div>

            <div v-else>
              <div v-for="(question, qIndex) in currentQuestions" :key="question.library_id" class="mb-12 border-b pb-8">
                <div class="mb-4">
                  <span class="text-sm font-semibold text-blue-600">阅读材料 {{ currentPage * questionsPerPage + qIndex + 1 }}</span>
                  <span v-if="question.library_from" class="ml-4 text-sm text-slate-500">
                    来源: {{ question.library_from }}
                  </span>
                </div>

                <!-- 阅读材料 -->
                <div class="bg-slate-50 rounded-lg p-6 mb-6">
                  <h3 class="text-lg font-semibold text-slate-800 mb-4">阅读材料:</h3>
                  <div class="prose max-w-none reading-content" v-html="question.content"></div>
                </div>

                <!-- 问题列表 -->
                <div class="space-y-6">
                  <div v-for="(blank, bIndex) in question.blanks" :key="blank.blank_id"
                       class="bg-white border-2 border-slate-200 rounded-lg p-5">
                    <div class="mb-4">
                      <span class="font-semibold text-slate-800">
                        {{ qIndex + 1 }}.{{ bIndex + 1 }} {{ blank.question }}
                      </span>
                    </div>

                    <div class="space-y-2">
                      <button
                        v-for="(option, optIndex) in blank.alternatives"
                        :key="optIndex"
                        @click="selectAnswer(question.library_id, blank.blank_id, option, blank.correct_word)"
                        :class="getOptionClass(question.library_id, blank.blank_id, option, blank.correct_word)"
                        class="w-full p-3 rounded-lg border-2 transition-all text-left hover:border-blue-400"
                      >
                        <span class="font-semibold mr-2">{{ String.fromCharCode(65 + optIndex) }}.</span>
                        {{ option }}
                      </button>
                    </div>

                    <div v-if="answerStatus[question.library_id + '_' + blank.blank_id] !== undefined"
                         class="mt-3">
                      <div v-if="answerStatus[question.library_id + '_' + blank.blank_id]"
                           class="text-green-600 font-semibold">
                        ✓ 正确！
                      </div>
                      <div v-else class="text-red-600">
                        <p class="font-semibold">✗ 错误</p>
                        <p class="text-sm mt-1">正确答案: {{ blank.correct_word[0] }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 提交按钮 -->
                <div v-if="!isSubmitted[question.library_id]" class="mt-6 text-center">
                  <button
                    @click="submitAnswers(question)"
                    :disabled="!isAllAnswered(question)"
                    class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                  >
                    提交答案
                  </button>
                  <p v-if="!isAllAnswered(question)" class="text-sm text-slate-500 mt-2">
                    请完成所有题目后再提交
                  </p>
                </div>

                <!-- 解析部分 -->
                <div v-if="isQuestionAnswered(question)" class="mt-6">
                  <div v-if="showExplanation[question.library_id]"
                       class="p-5 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 class="font-semibold text-blue-800 mb-3 text-lg">详细解析:</h4>
                    <div class="text-sm text-slate-700 prose max-w-none" v-html="question.info"></div>
                  </div>

                  <button
                    @click="toggleExplanation(question.library_id)"
                    class="mt-4 px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
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
                ← 上一篇
              </button>
              <span class="text-slate-600">第 {{ currentPage + 1 }} / {{ totalPages }} 页</span>
              <button
                @click="goToNextPage"
                :disabled="currentPage >= totalPages - 1"
                class="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                下一篇 →
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
const isSubmitted = ref({})

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

    const QUERY = `query { readingComprehension { ... } }`
    const response = await graphqlQuery(QUERY)
    questions.value = response.data || []
  } catch (error) {
    console.error('加载题目失败:', error)
  } finally {
    isLoading.value = false
  }
})

const selectAnswer = (questionId, blankId, selectedOption, correctAnswers) => {
  const key = questionId + '_' + blankId

  // 如果已经提交过，不允许再次选择
  if (isSubmitted.value[questionId]) {
    return
  }

  userAnswers.value[key] = selectedOption
}

const getOptionClass = (questionId, blankId, option, correctAnswers) => {
  const key = questionId + '_' + blankId
  const userAnswer = userAnswers.value[key]
  const status = answerStatus.value[key]

  // 如果还没提交，只高亮选中的选项
  if (!isSubmitted.value[questionId]) {
    return userAnswer === option
      ? 'border-blue-500 bg-blue-50'
      : 'border-slate-300 bg-white hover:bg-slate-50'
  }

  // 已提交后，显示正确/错误状态
  const isCorrectAnswer = correctAnswers.some(answer =>
    answer.trim().toLowerCase() === option.trim().toLowerCase()
  )
  const isUserAnswer = userAnswer === option

  if (isUserAnswer && status) {
    return 'border-green-500 bg-green-50 text-green-700'
  }
  if (isUserAnswer && !status) {
    return 'border-red-500 bg-red-50 text-red-700'
  }
  if (isCorrectAnswer && !status) {
    return 'border-green-500 bg-green-50 text-green-700'
  }

  return 'border-slate-300 bg-slate-100 opacity-60'
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

// 提交当前阅读理解的所有答案
const submitAnswers = (question) => {
  question.blanks.forEach(blank => {
    const key = question.library_id + '_' + blank.blank_id
    const userAnswer = userAnswers.value[key]

    if (userAnswer) {
      const isCorrect = blank.correct_word.some(answer =>
        answer.trim().toLowerCase() === userAnswer.trim().toLowerCase()
      )
      answerStatus.value[key] = isCorrect
    }
  })

  isSubmitted.value[question.library_id] = true
}

// 检查是否所有题目都已选择
const isAllAnswered = (question) => {
  return question.blanks.every(blank => {
    const key = question.library_id + '_' + blank.blank_id
    return userAnswers.value[key] !== undefined
  })
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

<style scoped>
.reading-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.reading-content :deep(table td) {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
}

.reading-content :deep(img) {
  max-width: 100%;
  height: auto;
  margin: 1rem 0;
}

.prose :deep(br) {
  display: block;
  content: "";
  margin-top: 0.5rem;
}
</style>
