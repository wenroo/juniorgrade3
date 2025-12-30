<template>
  <div class="multiple-choice-quiz">
    
    <div class="quiz-screen">
      <!-- Progress -->
      <div class="progress-info">
        <span>已答题数: {{ totalAnswered }} / {{ questionsPerSession }}</span>
        <span>得分: {{ score }}</span>
      </div>

      <!-- Question -->
      <div v-if="currentQuestion" class="question-card">
        <h3 class="question-title">请选择正确答案：</h3>
        <div class="question-text" v-html="currentQuestion.questionText"></div>

        <!-- Options -->
        <div class="options-grid">
          <button
            v-for="(option, index) in currentQuestion.options"
            :key="index"
            :class="['option-button', getOptionClass(option)]"
            @click="selectAnswer(option)"
            :disabled="answered"
          >
            {{ String.fromCharCode(65 + index) }}. {{ option }}
          </button>
        </div>
        <!-- Feedback -->
        <div v-if="answered" class="feedback">
          <div :class="['feedback-message', isCorrect ? 'correct' : 'incorrect']">
            {{ isCorrect ? '✓ 回答正确！' : '✗ 回答错误' }}
          </div>
          <div v-if="!isCorrect">
            <!-- <div class="">
              正确答案: {{ currentQuestion.correctAnswer }}
            </div> -->
            <div v-if="currentQuestion.info" class="info-section" v-html="currentQuestion.info"></div>
          </div>
        </div>
      </div>
    </div>

    <div  v-if="shouldShowResults" class="result-screen">
      <!-- <h2>答题完成！</h2>
      <div class="score-display">
        <div class="score-circle">
          <span class="score-number">{{ score }}</span>
          <span class="score-total">/ {{ totalAnswered }}</span>
        </div>
        <p class="score-percentage">正确率: {{ totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0 }}%</p>
      </div> -->
      <div class="result-actions">
        <button class="retry-button" @click="restartQuiz">重新开始</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWordService } from '@/services/wordService'

const { loadQuestionChoices } = useWordService()

const allQuestions = ref([])
const currentQuestion = ref(null)
const totalAnswered = ref(0)
const score = ref(0)
const answered = ref(false)
const selectedAnswer = ref(null)
const isCorrect = ref(false)
const questionsPerSession = ref(1)

onMounted(async () => {
  await loadQuestions()
  await loadSettings()
  loadRandomQuestion()
})

async function loadSettings() {
  try {
    const response = await fetch('http://localhost:3123/api/settings')
    const data = await response.json()
    if (data.multipleChoice?.questionsPerSession) {
      questionsPerSession.value = data.multipleChoice.questionsPerSession
    }
  } catch (error) {
    console.error('Failed to load settings:', error)
  }
}

async function loadQuestions() {
  try {
    const data = await loadQuestionChoices()
    allQuestions.value = data.map(q => ({
      questionText: q.question_text,
      options: q.options.map(opt => opt.option_text.trim()),
      correctAnswer: q.options.find(opt => opt.is_correct)?.option_text.trim() || '',
      info: q.info
    }))
  } catch (error) {
    console.error('Failed to load questions:', error)
  }
}

function loadRandomQuestion() {
  if (allQuestions.value.length === 0) return

  const randomIndex = Math.floor(Math.random() * allQuestions.value.length)
  currentQuestion.value = allQuestions.value[randomIndex]
  answered.value = false
  selectedAnswer.value = null
  isCorrect.value = false
}

function selectAnswer(option) {
  if (answered.value) return

  selectedAnswer.value = option
  answered.value = true

  isCorrect.value = option === currentQuestion.value.correctAnswer

  if (isCorrect.value) {
    score.value++
  }
  totalAnswered.value++
}

function nextQuestion() {
  loadRandomQuestion()
}

function restartQuiz() {
  totalAnswered.value = 0
  score.value = 0
  loadRandomQuestion()
}

function getOptionClass(option) {
  if (!answered.value) return ''
  if (option === currentQuestion.value.correctAnswer) return 'correct'
  if (option === selectedAnswer.value && !isCorrect.value) return 'incorrect'
  return 'disabled'
}

const shouldShowResults = computed(() => {
  return totalAnswered.value >= questionsPerSession.value
})
</script>

<style scoped>
.multiple-choice-quiz {
  min-height: 400px;
}

.start-screen,
.result-screen {
  text-align: center;
  padding: 3rem 1rem;
}

.start-screen h2,
.result-screen h2 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 1rem;
}

.description {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 2rem;
}

.start-button,
.retry-button {
  padding: 1rem 3rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s;
}

.start-button:hover,
.retry-button:hover {
  transform: scale(1.05);
}

.quiz-screen {
  padding: 1rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #667eea;
}

.question-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 2rem;
}

.question-title {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 1rem;
}

.question-text {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 2rem;
  text-align: center;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.option-button {
  padding: 1.5rem;
  font-size: 1.1rem;
  text-align: left;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.option-button:hover:not(:disabled) {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.option-button.correct {
  background: #d4edda;
  border-color: #28a745;
  color: #155724;
}

.option-button.incorrect {
  background: #f8d7da;
  border-color: #dc3545;
  color: #721c24;
}

.option-button.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}






.info-section {
  font-size: 0.95rem;
  color: #555;
  background: #fff3cd;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #ffc107;
  margin-top: 0.5rem;
  text-align: left;
  line-height: 1.6;
  border: 2px solid #ffc107;
}

.next-button {
  padding: 0.75rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  background: #667eea;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.next-button:hover {
  background: #5568d3;
}

.score-display {
  margin: 2rem 0;
}


.score-number {
  font-size: 4rem;
  font-weight: bold;
}

.score-total {
  font-size: 1.5rem;
}

.score-percentage {
  font-size: 1.5rem;
  color: #667eea;
  font-weight: 600;
}

@media (max-width: 768px) {
  .options-grid {
    grid-template-columns: 1fr;
  }

  .question-text {
    font-size: 1.5rem;
  }
}
</style>
