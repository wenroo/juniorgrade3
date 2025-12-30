<template>
  <div class="initial-letter-quiz">
    <div v-if="!quizFinished" class="quiz-screen">
      <!-- Progress -->
      <div class="progress-info">
        <span>题目 {{ currentQuestionIndex + 1 }} / {{ questions.length }}</span>
        <span>得分: {{ score }}</span>
      </div>

      <!-- Question -->
      <div class="question-card">
        <h3 class="question-title">根据中文意思和首字母提示，拼写出完整单词：</h3>

        <!-- Translation -->
        <div class="translation-display">
          {{ currentQuestion.translation }}
        </div>

        <!-- Initial letter hint -->
        <div class="hint-display">
          首字母提示: <span class="initial-letter">{{ currentQuestion.initialLetter }}</span>
        </div>

        <!-- Input -->
        <div class="input-container">
          <input
            v-model="userAnswer"
            type="text"
            class="answer-input"
            :class="{ 'correct': answered && isCorrect, 'incorrect': answered && !isCorrect }"
            placeholder="请输入完整单词"
            @keyup.enter="submitAnswer"
            :disabled="answered"
            ref="inputRef"
          />
          <button
            v-if="!answered"
            class="submit-button"
            @click="submitAnswer"
            :disabled="!userAnswer.trim()"
          >
            提交
          </button>
        </div>

        <!-- Feedback -->
        <div v-if="answered" class="feedback">
          <div :class="['feedback-message', isCorrect ? 'correct' : 'incorrect']">
            {{ isCorrect ? '✓ 回答正确！' : '✗ 回答错误' }}
          </div>
          <div class="correct-answer" v-if="!isCorrect">
            正确答案: {{ currentQuestion.correctAnswer }}
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
import { ref, computed, onMounted, nextTick } from 'vue'
import { useWordService } from '@/services/wordService'

const { loadFillingLibrary } = useWordService()

const quizFinished = ref(false)
const questions = ref([])
const currentQuestionIndex = ref(0)
const score = ref(0)
const answered = ref(false)
const userAnswer = ref('')
const isCorrect = ref(false)
const inputRef = ref(null)

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])

onMounted(async () => {
  await loadQuestions()
  await nextTick()
  inputRef.value?.focus()
})

async function loadQuestions() {
  try {
    const data = await loadFillingLibrary()
    // Filter choice type questions and take 10
    const choiceQuestions = data.filter(q => q.question_type === 'choice')
    const shuffled = [...choiceQuestions].sort(() => Math.random() - 0.5)
    questions.value = shuffled.slice(0, Math.min(10, choiceQuestions.length)).map(q =>
      processInitialLetterQuestion(q)
    )
  } catch (error) {
    console.error('Failed to load questions:', error)
  }
}

function processInitialLetterQuestion(question) {
  // Pick a random blank from the question
  const randomBlank = question.blanks[Math.floor(Math.random() * question.blanks.length)]
  const correctAnswer = randomBlank.correct_word[0].toLowerCase()
  const initialLetter = correctAnswer.charAt(0).toUpperCase()

  // Create a simple translation hint from the alternatives
  const translation = `填入正确的单词 (选项: ${randomBlank.alternatives.join(', ')})`

  return {
    translation,
    correctAnswer,
    initialLetter
  }
}

function submitAnswer() {
  if (!userAnswer.value.trim() || answered.value) return

  answered.value = true
  isCorrect.value = userAnswer.value.trim().toLowerCase() === currentQuestion.value.correctAnswer

  if (isCorrect.value) {
    score.value++
  }
}

async function nextQuestion() {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++
    answered.value = false
    userAnswer.value = ''
    isCorrect.value = false

    await nextTick()
    inputRef.value?.focus()
  } else {
    quizFinished.value = true
  }
}

async function restartQuiz() {
  quizFinished.value = false
  currentQuestionIndex.value = 0
  score.value = 0
  answered.value = false
  userAnswer.value = ''
  await loadQuestions()
  await nextTick()
  inputRef.value?.focus()
}
</script>

<style scoped>
.initial-letter-quiz {
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

.translation-display {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
}

.hint-display {
  font-size: 1.3rem;
  color: #666;
  text-align: center;
  margin-bottom: 2rem;
}

.initial-letter {
  display: inline-block;
  font-size: 2.5rem;
  font-weight: bold;
  color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-left: 0.5rem;
}

.input-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: stretch;
}

.answer-input {
  flex: 1;
  padding: 1rem 1.5rem;
  font-size: 1.3rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.2s;
  font-family: inherit;
}

.answer-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.answer-input.correct {
  border-color: #28a745;
  background: #d4edda;
}

.answer-input.incorrect {
  border-color: #dc3545;
  background: #f8d7da;
}

.submit-button {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  background: #667eea;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.submit-button:hover:not(:disabled) {
  background: #5568d3;
  transform: translateY(-2px);
}

.submit-button:disabled {
  opacity: 0.5;
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

.correct-answer {
  font-size: 1.2rem;
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
  .input-container {
    flex-direction: column;
  }

  .translation-display {
    font-size: 1.5rem;
  }

  .initial-letter {
    font-size: 2rem;
  }
}
</style>
