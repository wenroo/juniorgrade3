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
          Complete the following passage with the words or phrases in the box. Each one can only be used once.<br>
          <span class="text-lg text-neutral-400">单词或词组填入空格。每空格限填一词，每词只能填一次</span>
        </h3>

        <!-- Question Content -->
        <div class="bg-black/5 px-6 py-4 text-lg rounded-2xl  mb-6 shadow-sm" v-html="currentQuestion.content"></div>

        <!-- Options Groups -->
        <div class="space-y-6 mb-6">
          <div
            v-for="(group, groupIndex) in currentQuestion.optionGroups"
            :key="groupIndex"
            class="bg-white border-2 border-slate-200 rounded-xl px-5 py-2"
          >
            <h4 class="text-base font-semibold text-slate-700 mb-2">
              选项组 {{ groupIndex + 1 }}
              <span class="text-sm text-slate-500 ml-2">
                (空格: {{ group.blanks.map(b => b.blankId).join(', ') }})
              </span>
            </h4>

            <!-- Blanks in this group -->
            <div class="rounded-lg">
              <div
                v-for="blank in group.blanks"
                :key="blank.blankId"
                class="bg-slate-50 p-3 flex items-center gap-2"
              >
                <div class="text-lg  font-medium text-slate-600 mb-2">
                  {{ blank.blankId }}:
                </div>
                <div class="grid grid-cols-2 md:grid-cols-5 w-full gap-2">
                  <button
                    v-for="(option, optionIndex) in group.options"
                    :key="optionIndex"
                    :class="[
                      'py-2 px-3 text-sm font-medium rounded-lg transition-all border-2',
                      getOptionClass(groupIndex, blank.blankId, option)
                    ]"
                    @click="toggleAnswer(groupIndex, blank.blankId, option)"
                    :disabled="answered || isOptionDisabledInGroup(groupIndex, blank.blankId, option)"
                  >
                    <span class="font-bold mr-1">{{ String.fromCharCode(65 + optionIndex) }}.</span>
                    {{ option }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div v-if="!answered" class="flex justify-center mb-6">
          <button
            @click="submitAnswer"
            :disabled="!canSubmit"
            :class="[
              'py-3 px-8 text-lg font-semibold rounded-xl transition-all shadow-lg',
              canSubmit
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transform hover:scale-105'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            ]"
          >
            提交答案
          </button>
        </div>

        <!-- Feedback -->
        <div v-if="answered" class="space-y-4">
          <div :class="['text-xl font-bold text-center py-3 rounded-xl', isCorrect ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50']">
            {{ isCorrect ? '✓ 回答正确！' : '✗ 回答错误' }}
          </div>

          <div v-if="currentQuestion.info" class="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
            <div class="text-sm text-amber-900 leading-relaxed" v-html="currentQuestion.info"></div>
          </div>

          <!-- Next/Restart Button -->
          <div v-if="shouldShowResults" class="flex justify-center mt-6">
            <button
              class="py-3 px-8 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl shadow-lg transition-all transform hover:scale-105"
              @click="restartQuiz"
            >
              重新开始
            </button>
          </div>
        </div>
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
const selectedAnswers = ref({}) // Changed to object to track answers per group
const isCorrect = ref(false)
const questionsPerSession = ref(1)

const shouldShowResults = computed(() => {
  return totalAnswered.value >= questionsPerSession.value
})

const canSubmit = computed(() => {
  if (!currentQuestion.value) return false

  // Check if all blanks have been answered
  const allBlanks = currentQuestion.value.optionGroups.flatMap(g => g.blanks)
  return allBlanks.every(blank => selectedAnswers.value[blank.blankId])
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
    // Filter choice type questions
    allQuestions.value = data
      .filter(q => q.question_type === 'choice')
      .map(q => processChoiceQuestion(q))
  } catch (error) {
    console.error('Failed to load questions:', error)
  }
}

function processChoiceQuestion(question) {
  // Group blanks by their alternatives array (same alternatives = same group)
  const groupMap = new Map()

  question.blanks.forEach(blank => {
    const key = JSON.stringify(blank.alternatives)
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        options: blank.alternatives,
        blanks: []
      })
    }
    groupMap.get(key).blanks.push({
      blankId: blank.blank_id,
      correctAnswer: blank.correct_word[0]
    })
  })

  // Convert map to array of option groups
  const optionGroups = Array.from(groupMap.values())

  // Replace all blanks with placeholders in content
  let displayContent = question.content.replace(/<br>/g, ' ')
  question.blanks.forEach(blank => {
    const blankPattern = new RegExp(`___${blank.blank_id}___`, 'g')
    displayContent = displayContent.replace(blankPattern, `<span class="font-bold text-indigo-600">___${blank.blank_id}___</span>`)
  })

  return {
    content: displayContent,
    optionGroups: optionGroups,
    info: question.info || '',
    from: question.from || ''
  }
}

function loadRandomQuestion() {
  if (allQuestions.value.length === 0) return

  const randomIndex = Math.floor(Math.random() * allQuestions.value.length)
  currentQuestion.value = allQuestions.value[randomIndex]
  answered.value = false
  selectedAnswers.value = {}
  isCorrect.value = false
}

function toggleAnswer(groupIndex, blankId, option) {
  if (answered.value) return

  // If already selected, toggle off
  if (selectedAnswers.value[blankId] === option) {
    const newAnswers = { ...selectedAnswers.value }
    delete newAnswers[blankId]
    selectedAnswers.value = newAnswers
  } else {
    // Select this option
    selectedAnswers.value = {
      ...selectedAnswers.value,
      [blankId]: option
    }
  }
}

function isOptionDisabledInGroup(groupIndex, currentBlankId, option) {
  if (!currentQuestion.value?.optionGroups?.[groupIndex]) return false

  // Check if this option is already used by another blank in the same group
  const group = currentQuestion.value.optionGroups[groupIndex]
  return group.blanks.some(blank =>
    blank.blankId !== currentBlankId && selectedAnswers.value[blank.blankId] === option
  )
}

function submitAnswer() {
  if (!canSubmit.value || answered.value) return

  answered.value = true

  // Check if all answers are correct
  const allBlanks = currentQuestion.value.optionGroups.flatMap(g => g.blanks)
  isCorrect.value = allBlanks.every(blank =>
    selectedAnswers.value[blank.blankId] === blank.correctAnswer
  )

  if (isCorrect.value) {
    score.value++
  }
  totalAnswered.value++
}

function restartQuiz() {
  totalAnswered.value = 0
  score.value = 0
  loadRandomQuestion()
}

function getOptionClass(groupIndex, blankId, option) {
  if (!currentQuestion.value?.optionGroups?.[groupIndex]) return ''

  const group = currentQuestion.value.optionGroups[groupIndex]
  const blank = group.blanks.find(b => b.blankId === blankId)
  if (!blank) return ''

  const isSelected = selectedAnswers.value[blankId] === option
  const isCorrectAnswer = option === blank.correctAnswer
  const isDisabled = isOptionDisabledInGroup(groupIndex, blankId, option)

  if (!answered.value) {
    if (isSelected) {
      return 'border-indigo-500 bg-indigo-100 text-indigo-700'
    }
    if (isDisabled) {
      return 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
    }
    return 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer'
  }

  // After answering
  if (isCorrectAnswer) {
    return 'border-green-500 bg-green-50 text-green-700'
  }
  if (isSelected && !isCorrectAnswer) {
    return 'border-red-500 bg-red-50 text-red-700'
  }
  return 'border-slate-200 bg-slate-50 text-slate-400 opacity-60'
}
</script>
