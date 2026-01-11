<template>
  <div>
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

            <!-- 为每个正确答案创建一个输入框 -->
            <div class="flex w-full gap-4">
              <div v-for="(correctAnswer, wordIndex) in blank.correct_word" :key="wordIndex" class="flex gap-3 items-start">
                <div class="flex-1">
                  <input
                    type="text"
                    v-model="userAnswers[getAnswerKey(question.library_id, blank.blank_id, wordIndex)]"
                    @keyup.enter="handleEnterKey(question)"
                    :disabled="isQuestionAnswered(question)"
                    class="w-full p-3 border-2 rounded-lg focus:outline-none focus:border-purple-500 disabled:bg-slate-100"
                    placeholder="请输入答案..."
                  />

                  <!-- 显示每个输入框的对错状态 -->
                  <div v-if="answerStatus[getAnswerKey(question.library_id, blank.blank_id, wordIndex)] !== undefined" class="mt-2">
                    <div v-if="answerStatus[getAnswerKey(question.library_id, blank.blank_id, wordIndex)]" class="text-green-600 font-semibold text-sm">
                      ✓ 正确！
                    </div>
                    <div v-else class="text-red-600 text-sm">
                      <p class="font-semibold">✗ 错误 （ 正确答案: {{ correctAnswer }} ）</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 统一提交按钮 -->
        <div v-if="!isQuestionAnswered(question)" class="mt-4">
          <button
            @click="submitAllAnswers(question)"
            :disabled="!canSubmitQuestion(question)"
            class="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            提交答案
          </button>
        </div>

        <!-- 自动显示解析 -->
        <div v-if="isQuestionAnswered(question)" class="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 class="font-semibold text-blue-800 mb-2">解析:</h4>
          <div class="text-sm text-slate-700" v-html="question.info"></div>
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { graphqlQuery } from '@/services/drupal'

const questions = ref([])
const isLoading = ref(true)
const userAnswers = ref({})
const answerStatus = ref({})
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

// 生成答案的唯一key
const getAnswerKey = (questionId, blankId, wordIndex) => {
  return `${questionId}_${blankId}_${wordIndex}`
}

// 检查是否所有填空都已填写
const canSubmitQuestion = (question) => {
  return question.blanks.every(blank => {
    return blank.correct_word.every((_, wordIndex) => {
      const key = getAnswerKey(question.library_id, blank.blank_id, wordIndex)
      const answer = userAnswers.value[key]?.trim()
      return answer && answer.length > 0
    })
  })
}

// 提交所有答案
const submitAllAnswers = (question) => {
  question.blanks.forEach(blank => {
    blank.correct_word.forEach((correctAnswer, wordIndex) => {
      const key = getAnswerKey(question.library_id, blank.blank_id, wordIndex)
      const userAnswer = userAnswers.value[key]?.trim().toLowerCase()

      // 检查答案是否正确（支持 ## 分隔的多个可接受答案）
      const variants = correctAnswer.toLowerCase().split('##')
      const isCorrect = variants.some(variant => variant === userAnswer)

      answerStatus.value[key] = isCorrect
    })
  })
}

// 处理回车键
const handleEnterKey = (question) => {
  if (canSubmitQuestion(question)) {
    submitAllAnswers(question)
  }
}

const isQuestionAnswered = (question) => {
  return question.blanks.every(blank => {
    return blank.correct_word.every((_, wordIndex) => {
      const key = getAnswerKey(question.library_id, blank.blank_id, wordIndex)
      return answerStatus.value[key] !== undefined
    })
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