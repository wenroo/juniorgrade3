<template>
  <div class="cloze-test-quiz">
    <div v-if="!quizFinished" class="quiz-screen">
      <!-- Progress -->
      <div class="progress-info">
        <span>题目 {{ currentQuestionIndex + 1 }} / {{ questions.length }}</span>
        <span>得分: {{ score }}</span>
      </div>

      <!-- Question -->
      <div class="question-card">
        <h3 class="question-title">请选择正确的单词填入空白处：</h3>

        <!-- Sentence with blank -->
        <div class="sentence-display">
          <span v-for="(part, index) in currentQuestion.sentenceParts" :key="index">
            <span v-if="part.type === 'text'">{{ part.content }}</span>
            <span v-else class="blank-space">______</span>
          </span>
        </div>

        <!-- Translation hint -->
        <div class="translation-hint">
          参考翻译: {{ currentQuestion.translation }}
        </div>

        <!-- Options -->
        <div class="options-grid">
          <button
            v-for="(option, index) in currentQuestion.options"
            :key="index"
            :class="['option-button', getOptionClass(option)]"
            @click="selectAnswer(option)"
            :disabled="answered"
          >
            {{ option }}
          </button>
        </div>

        <!-- Feedback -->
        <div v-if="answered" class="feedback">
          <div :class="['feedback-message', isCorrect ? 'correct' : 'incorrect']">
            {{ isCorrect ? '✓ 回答正确！' : '✗ 回答错误' }}
          </div>
          <div class="complete-sentence">
            完整句子: {{ currentQuestion.completeSentence }}
          </div>
          <button class="next-button" @click="nextQuestion">
            {{ currentQuestionIndex < questions.length - 1 ? '下一题' : '查看结果' }}
          </button>
        </div>
      </div>
    </div>

    <div v-else class="result-screen">
      <h2>答题完成！</h2>
      <div class="score-display">
        <div class="score-circle">
          <span class="score-number">{{ score }}</span>
          <span class="score-total">/ {{ questions.length }}</span>
        </div>
        <p class="score-percentage">正确率: {{ Math.round((score / questions.length) * 100) }}%</p>
      </div>
      <div class="result-actions">
        <button class="retry-button" @click="restartQuiz">重新开始</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWordService } from '@/services/wordService'

const { loadFillingLibrary } = useWordService()

const quizFinished = ref(false)
const questions = ref([])
const currentQuestionIndex = ref(0)
const score = ref(0)
const answered = ref(false)
const selectedAnswer = ref(null)
const isCorrect = ref(false)

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])

onMounted(async () => {
  await loadQuestions()
})

async function loadQuestions() {
  try {
    const data = await loadFillingLibrary()
    // Filter choice type questions and take 10
    const choiceQuestions = data.filter(q => q.question_type === 'choice')
    const shuffled = [...choiceQuestions].sort(() => Math.random() - 0.5)
    questions.value = shuffled.slice(0, Math.min(10, choiceQuestions.length)).map(q =>
      processFillingQuestion(q)
    )
  } catch (error) {
    console.error('Failed to load questions:', error)
  }
}

function processFillingQuestion(question) {
  // Pick a random blank from the question
  const randomBlank = question.blanks[Math.floor(Math.random() * question.blanks.length)]
  const correctAnswer = randomBlank.correct_word[0]

  // Extract sentence with blank
  const content = question.content.replace(/<br>/g, ' ')
  const blankPattern = new RegExp(`___${randomBlank.blank_id}___`, 'g')
  const parts = content.split(blankPattern)

  return {
    sentenceParts: [
      { type: 'text', content: parts[0] || '' },
      { type: 'blank' },
      { type: 'text', content: parts[1] || '' }
    ],
    correctAnswer,
    options: randomBlank.alternatives,
    completeSentence: content.replace(blankPattern, correctAnswer),
    translation: ''
  }
}

function selectAnswer(option) {
  if (answered.value) return

  selectedAnswer.value = option
  answered.value = true
  isCorrect.value = option === currentQuestion.value.correctAnswer

  if (isCorrect.value) {
    score.value++
  }
}

function nextQuestion() {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++
    answered.value = false
    selectedAnswer.value = null
    isCorrect.value = false
  } else {
    quizFinished.value = true
  }
}

function restartQuiz() {
  quizFinished.value = false
  currentQuestionIndex.value = 0
  score.value = 0
  answered.value = false
  selectedAnswer.value = null
  loadQuestions()
}

function getOptionClass(option) {
  if (!answered.value) return ''
  if (option === currentQuestion.value.correctAnswer) return 'correct'
  if (option === selectedAnswer.value && !isCorrect.value) return 'incorrect'
  return 'disabled'
}
</script>

<style scoped>
.cloze-test-quiz {
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
  margin-bottom: 1.5rem;
}

.sentence-display {
  font-size: 1.5rem;
  line-height: 2;
  color: #333;
  margin-bottom: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  text-align: center;
}

.blank-space {
  display: inline-block;
  min-width: 100px;
  border-bottom: 2px solid #667eea;
  margin: 0 0.5rem;
  font-weight: bold;
  color: #667eea;
}

.translation-hint {
  font-size: 1rem;
  color: #888;
  margin-bottom: 2rem;
  text-align: center;
  font-style: italic;
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
  text-align: center;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
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

.feedback {
  text-align: center;
  margin-top: 1.5rem;
}

.feedback-message {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.feedback-message.correct {
  color: #28a745;
}

.feedback-message.incorrect {
  color: #dc3545;
}

.complete-sentence {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border-left: 4px solid #667eea;
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

.score-circle {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin-bottom: 1rem;
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

  .sentence-display {
    font-size: 1.2rem;
  }
}
</style>
