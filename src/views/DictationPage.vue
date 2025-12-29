<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import DictationMode from '../components/DictationMode.vue'
import ProgressBar from '../components/ProgressBar.vue'
import TimerDisplay from '../components/TimerDisplay.vue'
import NavigationButtons from '../components/NavigationButtons.vue'
import { useWordService } from '@/services'

// Get route to determine mode
const route = useRoute()
const mode = computed(() => route.meta.mode || 'english')

// Use unified word service
const { words, unlearnedWords, loadWords, updateReviewData, batchUpdateWordsAndStatus, checkAndResetLearned, isLoading } = useWordService()

// 响应式状态
const currentIndex = ref(0)
const batchSize = 10
const userAnswers = ref({})
const isSubmitted = ref(false)
const timeLeft = ref(600)
const currentBatchList = ref([])
const selectedTranslations = ref({}) // 存储每个单词选中的翻译索引
let timerInterval = null

// 随机打乱数组的函数
const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// 为单词选择一个未使用的翻译
const selectRandomTranslation = (word) => {
  if (!word.translations || word.translations.length === 0) {
    return null
  }

  // 找出所有未使用的翻译
  const unusedTranslations = word.translations
    .map((trans, index) => ({ trans, index }))
    .filter(({ trans }) => !trans.used)

  // 如果所有翻译都已使用，重置所有翻译的 used 状态
  if (unusedTranslations.length === 0) {
    word.translations.forEach(trans => trans.used = false)
    return Math.floor(Math.random() * word.translations.length)
  }

  // 随机选择一个未使用的翻译
  const randomIndex = Math.floor(Math.random() * unusedTranslations.length)
  return unusedTranslations[randomIndex].index
}

// 生成随机批次
const generateRandomBatch = () => {
  const available = unlearnedWords.value.length > 0 ? unlearnedWords.value : words.value
  const shuffled = shuffleArray(available)
  currentBatchList.value = shuffled.slice(0, Math.min(batchSize, shuffled.length))

  // 为每个单词选择一个随机翻译
  selectedTranslations.value = {}
  currentBatchList.value.forEach(word => {
    selectedTranslations.value[word.id] = selectRandomTranslation(word)
  })
}

// Load words on mount
onMounted(async () => {
  await loadWords()
  generateRandomBatch()
  startTimer()
})

// 计算属性 - 使用未学习的单词作为题库
const activeWords = computed(() => {
  // 如果没有未学习的单词，说明全部学完了，使用所有单词
  return unlearnedWords.value.length > 0 ? unlearnedWords.value : words.value
})

const totalBatches = computed(() => Math.ceil(activeWords.value.length / batchSize))
const currentBatchNum = computed(() => currentIndex.value + 1)
const hasNextBatch = computed(() => activeWords.value.length >= batchSize)

// 方法
const nextBatch = () => {
  if (hasNextBatch.value) {
    currentIndex.value++
    generateRandomBatch()
    resetDictation()
    startTimer()
  }
}

const prevBatch = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    generateRandomBatch()
    resetDictation()
    startTimer()
  }
}

const resetDictation = () => {
  clearInterval(timerInterval)
  userAnswers.value = {}
  isSubmitted.value = false
  timeLeft.value = 600
}

const startTimer = () => {
  clearInterval(timerInterval)
  timeLeft.value = 600
  timerInterval = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      submitDictation()
    }
  }, 1000)
}

const submitDictation = async () => {
  clearInterval(timerInterval)
  isSubmitted.value = true

  // 收集所有更新数据
  const wordUpdates = []
  const statusUpdates = []

  // Update review data for each word in current batch
  currentBatchList.value.forEach(item => {
    const userAnswer = userAnswers.value[item.id]?.trim()
    const selectedTransIndex = selectedTranslations.value[item.id]
    let isCorrect = false

    if (mode.value === 'chinese') {
      // 中文默写：检查选中的翻译是否匹配
      if (userAnswer && userAnswer.length >= 2 && selectedTransIndex !== null) {
        const selectedTrans = item.translations[selectedTransIndex]
        isCorrect = selectedTrans.translation.indexOf(userAnswer) !== -1
      }
    } else {
      // 英文默写：完全匹配（不区分大小写）
      // 处理多形式单词，如 "a (an)" -> ["a", "an"]
      const userAnswerLower = userAnswer?.toLowerCase()
      const correctAnswerLower = item.word.toLowerCase()

      // 1. 完全匹配原始格式 "a (an)"
      if (userAnswerLower === correctAnswerLower) {
        isCorrect = true
      } else {
        // 2. 匹配无括号格式 "a an"
        const noBrackets = correctAnswerLower.replace(/[()]/g, '')
        if (userAnswerLower === noBrackets) {
          isCorrect = true
        } else {
          // 3. 匹配单个形式 "a" 或 "an"
          const wordForms = item.word.split(/[\s()]+/).filter(w => w.length > 0)
          isCorrect = wordForms.some(form => form.toLowerCase() === userAnswerLower)
        }
      }
    }

    // 收集更新数据
    const updateData = updateReviewData(item.id, isCorrect, selectedTransIndex)
    if (updateData) {
      if (updateData.wordUpdate) {
        wordUpdates.push(updateData.wordUpdate)
      }
      statusUpdates.push(updateData.statusUpdate)
    }
  })

  // 批量保存到后端
  try {
    await batchUpdateWordsAndStatus(wordUpdates, statusUpdates)
  } catch (error) {
    console.error('Failed to save updates:', error)
  }

  // Check if all words are learned and reset if needed
  const wasReset = await checkAndResetLearned()

  if (wasReset) {
    console.log('🎉 恭喜！所有单词已学完一轮，开始新一轮学习')
  }
}

const retryBatch = () => {
  resetDictation()
  startTimer()
}

// 清理定时器
onUnmounted(() => {
  clearInterval(timerInterval)
})
</script>

<template>
  <div class="container max-w-4xl mx-auto px-4 py-8">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
      <p class="text-slate-600">加载单词数据中...</p>
    </div>

    <!-- Content -->
    <template v-else>
      <div class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <ProgressBar :current-batch-num="currentBatchNum" :total-batches="totalBatches" />

        <TimerDisplay :time-left="timeLeft" :is-submitted="isSubmitted" />

        <NavigationButtons
          :current-index="currentIndex"
          :has-next-batch="hasNextBatch"
          @prev="prevBatch"
          @next="nextBatch"
        />
      </div>

      <DictationMode
        :current-batch-list="currentBatchList"
        :current-index="currentIndex"
        :user-answers="userAnswers"
        :is-submitted="isSubmitted"
        :batch-size="batchSize"
        :mode="mode"
        :selected-translations="selectedTranslations"
        @update:user-answers="userAnswers = $event"
        @submit="submitDictation"
        @retry="retryBatch"
      />
    </template>
  </div>
</template>
