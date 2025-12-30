<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DictationMode from '../components/DictationMode.vue'
import ProgressBar from '../components/ProgressBar.vue'
import TimerDisplay from '../components/TimerDisplay.vue'
import RefreshButton from '../components/RefreshButton.vue'
import FilterSidebar from '../components/FilterSidebar.vue'
import { useWordService } from '@/services'
import { validateAnswer } from '@/utils/dictationValidator'

// Get route to determine mode
const route = useRoute()
const router = useRouter()
const mode = computed(() => route.meta.mode || 'english')

// 保存当前模式到localStorage
const saveDictationMode = (newMode) => {
  try {
    localStorage.setItem('dictationMode', newMode)
  } catch (e) {
    console.error('Failed to save dictation mode:', e)
  }
}

// 从localStorage加载模式
const loadDictationMode = () => {
  try {
    return localStorage.getItem('dictationMode') || 'english'
  } catch (e) {
    console.error('Failed to load dictation mode:', e)
    return 'english'
  }
}

// Use unified word service
const { words, unlearnedWords, loadWords, updateReviewData, batchUpdateWordsAndStatus, checkAndResetLearned, isLoading } = useWordService()

// 响应式状态
const currentIndex = ref(0)
const batchSize = ref(10) // 改为响应式
const userAnswers = ref({})
const isSubmitted = ref(false)
const isTimeout = ref(false) // 超时标记
const timeLeft = ref(600)
const initialTimeLeft = ref(600) // 保存初始时间配置
const currentBatchList = ref([])
const selectedTranslations = ref({}) // 存储每个单词选中的翻译索引
let timerInterval = null

// 加载设置配置
const loadSettings = async () => {
  try {
    const response = await fetch('http://localhost:3123/api/settings')
    const settings = await response.json()
    batchSize.value = settings.dictation.batchSize
    initialTimeLeft.value = settings.dictation.timeLeft
    timeLeft.value = settings.dictation.timeLeft
  } catch (error) {
    console.error('加载设置失败，使用默认值:', error)
  }
}

// 过滤器状态 - 用于选择默写单词的来源
const activeFilters = ref({
  letter: 'all',
  partOfSpeech: ['all'],
  recite: false,
  important: false,
  irregular: false
})

// 处理过滤器变化
const handleFilterChange = (filters) => {
  activeFilters.value = filters
  currentIndex.value = 0
  generateRandomBatch()
  resetDictation()
  startTimer()
}

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

// 根据过滤器获取可用单词池
const getFilteredWordPool = () => {
  let pool = unlearnedWords.value.length > 0 ? unlearnedWords.value : words.value

  // 错题本过滤
  if (activeFilters.value.recite === true) {
    pool = pool.filter(word => word.status?.recite === true)
  }

  // 重要单词过滤
  if (activeFilters.value.important === true) {
    pool = pool.filter(word => word.status?.important === true)
  }

  // 不规则动词过滤
  if (activeFilters.value.irregular === true) {
    const { isIrregularWord } = useWordService()
    pool = pool.filter(word => isIrregularWord(word.id))
  }

  // 首字母过滤
  if (activeFilters.value.letter !== 'all') {
    pool = pool.filter(word =>
      word.word.charAt(0).toUpperCase() === activeFilters.value.letter
    )
  }

  // 词性过滤
  if (!activeFilters.value.partOfSpeech.includes('all')) {
    pool = pool.filter(word =>
      word.translations?.some(trans =>
        activeFilters.value.partOfSpeech.includes(trans.type)
      )
    )
  }

  return pool
}

// 生成随机批次
const generateRandomBatch = () => {
  const available = getFilteredWordPool()

  // 如果过滤后没有单词，使用所有单词
  const finalPool = available.length > 0 ? available : words.value
  const shuffled = shuffleArray(finalPool)
  currentBatchList.value = shuffled.slice(0, Math.min(batchSize.value, shuffled.length))

  // 为每个单词选择一个随机翻译
  selectedTranslations.value = {}
  currentBatchList.value.forEach(word => {
    selectedTranslations.value[word.id] = selectRandomTranslation(word)
  })
}

// Load words on mount
onMounted(async () => {
  // 如果当前路径是 /dictation（没有指定模式），则从localStorage恢复上次的模式
  if (route.path === '/dictation' && route.meta.mode === undefined) {
    const savedMode = loadDictationMode()
    const targetPath = savedMode === 'chinese' ? '/dictation-chinese' : '/dictation'
    if (route.path !== targetPath) {
      await router.replace(targetPath)
    }
  } else {
    // 保存当前模式
    saveDictationMode(mode.value)
  }

  await loadSettings()
  await loadWords()
  generateRandomBatch()
  startTimer()
})

// 计算属性 - 使用未学习的单词作为题库
const activeWords = computed(() => {
  // 如果没有未学习的单词，说明全部学完了，使用所有单词
  return unlearnedWords.value.length > 0 ? unlearnedWords.value : words.value
})

const totalBatches = computed(() => Math.ceil(activeWords.value.length / batchSize.value))
const currentBatchNum = computed(() => currentIndex.value + 1)
const hasNextBatch = computed(() => activeWords.value.length >= batchSize.value)

// 方法
// 刷新当前批次
const refreshBatch = () => {
  generateRandomBatch()
  resetDictation()
  startTimer()
}

const resetDictation = () => {
  clearInterval(timerInterval)
  userAnswers.value = {}
  isSubmitted.value = false
  isTimeout.value = false
  timeLeft.value = initialTimeLeft.value
}

const startTimer = () => {
  clearInterval(timerInterval)
  timeLeft.value = initialTimeLeft.value
  timerInterval = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      handleTimeout()
    }
  }, 1000)
}

// 处理超时
const handleTimeout = () => {
  clearInterval(timerInterval)
  isTimeout.value = true
  isSubmitted.value = true
}

const submitDictation = async () => {
  clearInterval(timerInterval)
  isSubmitted.value = true

  // 如果是超时，不保存数据
  if (isTimeout.value) {
    return
  }

  // 收集所有更新数据
  const wordUpdates = []
  const statusUpdates = []

  // Update review data for each word in current batch
  currentBatchList.value.forEach(item => {
    const userAnswer = userAnswers.value[item.id]?.trim()
    const selectedTransIndex = selectedTranslations.value[item.id]

    // 使用共享的验证函数
    const isCorrect = validateAnswer({
      item,
      userAnswer,
      selectedTransIndex,
      mode: mode.value
    })

    // 收集更新数据（updateReviewData 已经包含了完整的状态更新逻辑）
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
  generateRandomBatch()
  resetDictation()
  startTimer()
}

// 监听路由变化（切换英文/中文默写模式时更换题目）
watch(() => route.path, (newPath) => {
  // 保存当前模式到localStorage
  if (newPath === '/dictation-chinese') {
    saveDictationMode('chinese')
  } else if (newPath === '/dictation') {
    saveDictationMode('english')
  }

  generateRandomBatch()
  resetDictation()
  startTimer()
})

// 清理定时器
onUnmounted(() => {
  clearInterval(timerInterval)
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
      <p class="text-slate-600">加载单词数据中...</p>
    </div>

    <!-- Content with Sidebar -->
    <div v-else class="flex gap-6">

      <!-- Left Sidebar - Filter -->
      <aside class="hidden lg:block w-64 flex-shrink-0">
        <div class="sticky top-24">
          <FilterSidebar
            :active-filters="activeFilters"
            :words="activeWords"
            @filter-change="handleFilterChange"
          />
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 min-w-0">
        
        <div class="text-sm font-medium text-center border-b border-gray-200 mb-4">
          <div class="flex flex-wrap -mb-px">
          <router-link
            to="/dictation"
            class="inline-block p-4 border-b-2 border-transparent rounded-t-base hover:text-indigo-500 hover:border-indigo-300"
            active-class="text-indigo-500 !border-indigo-700">
            英文默写
          </router-link>
          <router-link
            to="/dictation-chinese"
            class="inline-block p-4 border-b-2 border-transparent rounded-t-base hover:text-indigo-500 hover:border-indigo-300"
            active-class="text-indigo-500 !border-indigo-700">
            中文默写
          </router-link>
          </div>
        </div>


        <div class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <ProgressBar :current-batch-num="currentBatchNum" :total-batches="totalBatches" />

          <TimerDisplay :time-left="timeLeft" :is-submitted="isSubmitted" />

          <RefreshButton
            :disabled="isSubmitted"
            @refresh="refreshBatch"
          />
        </div>

        <DictationMode
          :current-batch-list="currentBatchList"
          :current-index="currentIndex"
          :user-answers="userAnswers"
          :is-submitted="isSubmitted"
          :is-timeout="isTimeout"
          :batch-size="batchSize"
          :mode="mode"
          :selected-translations="selectedTranslations"
          @update:user-answers="userAnswers = $event"
          @submit="submitDictation"
          @retry="retryBatch"
        />
      </main>
    </div>
  </div>
</template>
