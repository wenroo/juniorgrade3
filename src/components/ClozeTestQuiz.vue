<template>
  <div class="min-h-[400px]">
    <!-- Quiz Screen -->
    <div v-if="currentQuestion" class="space-y-4">
      <!-- Progress -->
      <div class="flex justify-between items-center text-lg font-semibold text-indigo-600 mb-4">
        <span>已答题数: {{ totalAnswered }} / {{ questionsPerSession }}</span>
        <span>得分: {{ score }}</span>
      </div>

      <!-- Question Card -->
      <div class="">
        <h3 class="text-lg font-semibold text-slate-600 mb-4">
          Choose the words or expressions and complete the passage<br>
          <span class="text-lg text-neutral-400">选择最恰当的单词或词语完成短文</span>
        </h3>

        <!-- Question Content -->
        <div class="bg-black/5 px-6 py-4 text-lg rounded-2xl mb-6 shadow-sm" v-html="currentQuestion.content"></div>

        <!-- Blanks to fill (each with its own options) -->
        <div class="space-y-1 mb-6 border border-gray-100 rounded">
          <div
            v-for="blank in currentQuestion.blanks"
            :key="blank.blank_id"
            class="odd:bg-gray-50 flex items-center py-2 px-4 rounded gap-2">
            <div class="flex flex-wrap items-center gap-3">
              <label class="text-base font-semibold text-slate-700 block">
                空格 {{ blank.blank_id }}:
              </label>

                <!-- Result indicator -->
              <div v-if="answered" class="flex items-center gap-2">
                <span v-if="userAnswers[blank.blank_id] === blank.correctAnswer" class="text-green-600 font-semibold">
                  ✓ 正确
                </span>
                <span v-else class="text-red-600 font-semibold">
                  ✗ 错误
                </span>
              </div>
            </div>

            <!-- Options for this specific blank -->
            <div class="flex flex-wrap gap-2">
              <button
                v-for="(option, index) in blank.options"
                :key="index"
                @click="!answered && selectOption(blank.blank_id, option)"
                :disabled="answered"
                class="py-2 px-4 text-base font-medium rounded-lg border-2 transition-all"
                :class="{
                  'border-indigo-500 bg-indigo-50 text-indigo-700': !answered && userAnswers[blank.blank_id] === option,
                  'border-green-500 bg-green-50 text-green-700': answered && option === blank.correctAnswer,
                  'border-red-500 bg-red-50 text-red-700': answered && userAnswers[blank.blank_id] === option && option !== blank.correctAnswer,
                  'border-slate-300 bg-slate-50 hover:border-slate-400 cursor-pointer': !answered && userAnswers[blank.blank_id] !== option,
                  'border-slate-300 bg-slate-50': answered && userAnswers[blank.blank_id] !== option && option !== blank.correctAnswer,
                  'cursor-not-allowed opacity-60': answered
                }"
              >
                <span class="font-bold mr-1">{{ String.fromCharCode(65 + index) }}.</span>
                {{ option }}
              </button>
            </div>


          </div>
        </div>

        <!-- Submit Button -->
        <div v-if="!answered" class="flex justify-center">
          <button
            class="py-3 px-8 text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            @click="submitAnswer"
            :disabled="!allBlanksAnswered"
          >
            提交答案
          </button>
        </div>

        <!-- Feedback -->
        <div v-if="answered" class="mt-6 space-y-4">
          <div :class="['text-xl font-bold text-center py-3 rounded-xl', allCorrect ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50']">
            {{ allCorrect ? '✓ 全部正确！' : `✗ 答对 ${correctCount} / ${currentQuestion.blanks.length} 个空格` }}
          </div>

          <!-- Show question content and info when wrong -->
          <div class="space-y-4">
            <!-- Additional info/explanation -->
            <div v-if="currentQuestion.info" class="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
              <h4 class="text-sm font-semibold text-amber-900 mb-2">解析：</h4>
              <div class="text-base text-amber-900 leading-relaxed" v-html="currentQuestion.info"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Result Screen -->
    <div v-if="shouldShowResults" class="text-center py-12">
      <div class="mb-8">
        <button
          class="py-3 px-8 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl shadow-lg transition-all transform hover:scale-105"
          @click="restartQuiz"
        >
          重新开始
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWordService } from '@/services/wordService'

const { loadFillingLibrary } = useWordService()

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({})
  }
})

const allQuestions = ref([])
const currentQuestion = ref(null)
const totalAnswered = ref(0)
const score = ref(0)
const answered = ref(false)
const userAnswers = ref({})
const questionsPerSession = ref(1)

const shouldShowResults = computed(() => {
  return totalAnswered.value >= questionsPerSession.value
})

const allBlanksAnswered = computed(() => {
  if (!currentQuestion.value) return false
  return currentQuestion.value.blanks.every(blank => userAnswers.value[blank.blank_id])
})

const correctCount = computed(() => {
  if (!currentQuestion.value || !answered.value) return 0
  return currentQuestion.value.blanks.filter(blank =>
    userAnswers.value[blank.blank_id] === blank.correctAnswer
  ).length
})

const allCorrect = computed(() => {
  if (!currentQuestion.value) return false
  return correctCount.value === currentQuestion.value.blanks.length
})

onMounted(async () => {
  await loadQuestions()
  await loadSettings()
  loadRandomQuestion()
})

async function loadSettings() {
  try {
    const response = await fetch('http://localhost:3123/api/settings')
    const data = await response.json()
    if (data.quiz?.questionsPerSession) {
      questionsPerSession.value = data.quiz.questionsPerSession
    }
  } catch (error) {
    console.error('Failed to load settings:', error)
  }
}

async function loadQuestions() {
  try {
    const data = await loadFillingLibrary()
    // Filter complete type questions
    allQuestions.value = data
      .filter(q => q.question_type === 'complete')
      .map(q => processCompleteQuestion(q))
  } catch (error) {
    console.error('Failed to load questions:', error)
  }
}

function processCompleteQuestion(question) {
  // Process all blanks, not just one
  const content = question.content.replace(/<br>/g, ' ')

  // Replace all blanks with placeholders
  let displayContent = content
  question.blanks.forEach(blank => {
    const blankPattern = new RegExp(`___${blank.blank_id}___`, 'g')
    displayContent = displayContent.replace(blankPattern, `<strong>[${blank.blank_id}]</strong>`)
  })

  return {
    content: displayContent,
    blanks: question.blanks.map(blank => ({
      blank_id: blank.blank_id,
      correctAnswer: blank.correct_word[0],
      options: blank.alternatives || [] // Each blank has its own options
    })),
    info: question.info || '',
    from: question.from || ''
  }
}

function loadRandomQuestion() {
  if (allQuestions.value.length === 0) return

  const randomIndex = Math.floor(Math.random() * allQuestions.value.length)
  currentQuestion.value = allQuestions.value[randomIndex]
  answered.value = false
  userAnswers.value = {}
}

function selectOption(blankId, option) {
  if (answered.value) return
  userAnswers.value[blankId] = option
}

function submitAnswer() {
  if (!allBlanksAnswered.value || answered.value) return

  answered.value = true

  // Calculate score based on all correct answers
  if (allCorrect.value) {
    score.value++
  }
  totalAnswered.value++
}

function restartQuiz() {
  totalAnswered.value = 0
  score.value = 0
  loadRandomQuestion()
}
</script>

