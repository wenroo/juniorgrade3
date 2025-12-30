/**
 * Unified Word Data Service
 * Handles all word data operations with backend API and local fallback
 */

import { ref, computed } from 'vue'

// Configuration #$ hostname -I
const API_BASE_URL = 'http://172.28.66.187:3123/api'
const CACHE_KEY = 'juniorgrade3_words_cache'
const CACHE_TIMESTAMP_KEY = 'juniorgrade3_words_cache_timestamp'
const PHONETIC_CACHE_KEY = 'juniorgrade3_phonetics_cache'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Reactive state
const words = ref([])
const phonetics = ref({})
const userStatus = ref({}) // 用户状态数据 { wordId: status }
const irregularWords = ref([]) // 不规则动词数据
const isLoading = ref(false)
const error = ref(null)
const isSaving = ref(false)
const lastSyncTime = ref(null)

/**
 * Load words from cache
 */
const loadFromCache = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY)
    const cachedPhonetics = localStorage.getItem(PHONETIC_CACHE_KEY)

    if (cached && timestamp) {
      const age = Date.now() - parseInt(timestamp)
      if (age < CACHE_DURATION) {
        words.value = JSON.parse(cached)
        if (cachedPhonetics) {
          console.log(phonetics)
          phonetics.value = JSON.parse(cachedPhonetics)
        }
        lastSyncTime.value = new Date(parseInt(timestamp))
        return true
      }
    }
  } catch (e) {
    console.warn('Failed to load from cache:', e)
  }
  return false
}

/**
 * Save words to cache
 */
const saveToCache = (data, phoneticData = null) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())

    // 直接保存传入的音标数据，不需要 merge
    // 因为 phoneticData 应该已经是完整的 phonetics.value 对象
    if (phoneticData) {
      localStorage.setItem(PHONETIC_CACHE_KEY, JSON.stringify(phoneticData))
    }

    lastSyncTime.value = new Date()
  } catch (e) {
    console.warn('Failed to save to cache:', e)
  }
}

/**
 * Load words from backend API
 */
const loadFromAPI = async () => {
  try {
    console.log('🔄 Attempting to fetch from:', `${API_BASE_URL}/words`)
    const response = await fetch(`${API_BASE_URL}/words`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    console.log('📡 Response status:', response.status, response.statusText)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ API data received:', data.length, 'words')
    return data
  } catch (e) {
    console.error('❌ API request failed:', e)
    throw new Error(`API request failed: ${e.message}`)
  }
}

/**
 * Load phonetics from backend API
 */
const loadPhoneticsFromAPI = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/phonetics`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ Phonetics data received:', Object.keys(data || {}).length, 'entries')
    return data || {}
  } catch (e) {
    console.warn('⚠️ Failed to load phonetics:', e.message)
    return {}
  }
}

/**
 * Load user status from backend API
 */
const loadUserStatusFromAPI = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/user-status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ User status data received:', data.words?.length || 0, 'entries')

    // 转换为 { wordId: status } 格式
    const statusMap = {}
    if (data.words && Array.isArray(data.words)) {
      data.words.forEach(item => {
        statusMap[item.id] = item.status
      })
    }
    return statusMap
  } catch (e) {
    console.warn('⚠️ Failed to load user status:', e.message)
    return {}
  }
}

/**
 * Load irregular words from backend API
 */
const loadIrregularWordsFromAPI = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/irregular-words`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ Irregular words data received:', data.length, 'entries')
    return data
  } catch (e) {
    console.warn('⚠️ Failed to load irregular words:', e.message)
    return []
  }
}

/**
 * Merge phonetics data into words
 */
const mergePhonetics = (wordsData, phoneticsData) => {
  return wordsData.map(word => ({
    ...word,
    phonetic: phoneticsData[word.id] || ''
  }))
}

/**
 * Merge user status data into words
 */
const mergeUserStatus = (wordsData, statusData) => {
  return wordsData.map(word => ({
    ...word,
    status: statusData[word.id] || {
      learned: false,
      recite: false,
      last_review: '',
      important: false,
      error_count: 0,
      next_review_ts: 0,
      true_count: 0
    }
  }))
}

/**
 * Load words with fallback strategy
 * 1. Try cache first (if fresh)
 * 2. Try API
 * 3. Fallback to static JSON import
 */
const loadWords = async (forceRefresh = true) => {
  if (isLoading.value) return

  isLoading.value = true
  error.value = null

  try {
    // Try cache first (unless force refresh)
    if (!forceRefresh && loadFromCache()) {
      console.log('✓ Loaded from cache')
      // Merge phonetics into words
      words.value = mergePhonetics(words.value, phonetics.value)
      isLoading.value = false
      return
    }

    console.log('🚀 Starting API request...')

    // Try API
    try {
      const [wordsData, phoneticsData, statusData, irregularWordsData] = await Promise.all([
        loadFromAPI(),
        loadPhoneticsFromAPI(),
        loadUserStatusFromAPI(),
        loadIrregularWordsFromAPI()
      ])

      phonetics.value = phoneticsData
      userStatus.value = statusData
      irregularWords.value = irregularWordsData

      // 先合并音标，再合并用户状态
      let mergedWords = mergePhonetics(wordsData, phoneticsData)
      mergedWords = mergeUserStatus(mergedWords, statusData)
      words.value = mergedWords

      saveToCache(wordsData, phoneticsData)
      console.log('✓ Loaded from API:', words.value.length, 'words')
    } catch (apiError) {
      console.warn('⚠️ API unavailable, trying fallback...', apiError.message)

      // Fallback to static import
      const fallbackData = await import('@/assets/word_list.json')
      words.value = fallbackData.default || fallbackData
      console.log('✓ Loaded from static file:', words.value.length, 'words')
    }
  } catch (e) {
    error.value = `Failed to load words: ${e.message}`
    console.error('Load error:', e)
  } finally {
    isLoading.value = false
  }
}

/**
 * Save words to backend API
 */
const saveWords = async () => {
  if (isSaving.value) return

  isSaving.value = true
  error.value = null

  try {
    const response = await fetch(`${API_BASE_URL}/words`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(words.value)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    saveToCache(words.value, phonetics.value)
    console.log('✓ Saved to API:', result.message)
    return result
  } catch (e) {
    error.value = `Failed to save words: ${e.message}`
    console.error('Save error:', e)
    throw e
  } finally {
    isSaving.value = false
  }
}

/**
 * Update a single word by ID
 */
const updateWord = (id, updates) => {
  const index = words.value.findIndex(w => w.id === id)
  if (index !== -1) {
    words.value[index] = { ...words.value[index], ...updates }
  }
}

/**
 * Update word status (recite, important, etc.) and save to backend
 */
const updateWordStatus = async (id, statusUpdates) => {
  const word = words.value.find(w => w.id === id)
  if (!word) return

  // 确保 status 对象存在
  if (!word.status) {
    word.status = {}
  }

  // 更新本地状态
  Object.assign(word.status, statusUpdates)

  // 更新 userStatus 缓存
  if (!userStatus.value[id]) {
    userStatus.value[id] = {}
  }
  Object.assign(userStatus.value[id], statusUpdates)

  // 立即保存到后端用户状态文件
  try {
    const response = await fetch(`${API_BASE_URL}/user-status/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(statusUpdates)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    console.log(`✓ Word status updated for ID ${id}:`, statusUpdates)
  } catch (error) {
    console.error(`Failed to save word status for ID ${id}:`, error)
  }
}

/**
 * Update multiple words
 */
const updateWords = (wordUpdates) => {
  wordUpdates.forEach(({ id, updates }) => {
    updateWord(id, updates)
  })
}

/**
 * Mark word as learned
 */
const markAsLearned = (id, learned = true) => {
  updateWord(id, { learned })
}

/**
 * Mark word for recitation (wrong word)
 */
const markForRecite = (id, recite = true) => {
  updateWord(id, { recite })
}

/**
 * Batch update words and status
 */
const batchUpdateWordsAndStatus = async (wordUpdates, statusUpdates) => {
  try {
    const response = await fetch(`${API_BASE_URL}/batch-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ wordUpdates, statusUpdates })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    console.log('✓ Batch update completed:', wordUpdates.length, 'words,', statusUpdates.length, 'statuses')
    return await response.json()
  } catch (error) {
    console.error('Failed to batch update:', error)
    throw error
  }
}

/**
 * Update word review data (for spaced repetition)
 * Returns update data instead of saving immediately
 */
const updateReviewData = (id, isCorrect, translationIndex = null) => {
  const now = new Date().toISOString()
  const nowTs = Math.floor(Date.now() / 1000)
  const word = words.value.find(w => w.id === id)

  if (!word) return null

  // 确保 status 对象存在
  if (!word.status) {
    word.status = {
      learned: false,
      recite: false,
      last_review: '',
      important: false,
      error_count: 0,
      next_review_ts: 0,
      true_count: 0
    }
  }

  // 本地更新翻译使用状态
  if (translationIndex !== null && word.translations && word.translations[translationIndex]) {
    word.translations[translationIndex].used = true
  }

  const updates = {
    last_review: now
  }

  if (isCorrect) {
    // 回答正确
    const currentTrueCount = word.status.true_count || 0
    updates.true_count = currentTrueCount + 1

    // 检查是否所有翻译都已使用
    const allTranslationsUsed = word.translations?.every(trans => trans.used === true) || false

    // 只有当所有翻译都已使用且不是错题时，才标记为learned
    if (allTranslationsUsed && word.status.recite !== true) {
      updates.learned = true
    }

    updates.next_review_ts = nowTs + 86400 // 1 day later

    // 如果连续答对3次且是错题，则从错题本移除
    if (updates.true_count >= 3 && word.status.recite === true) {
      updates.recite = false
      updates.error_count = 0
    }
  } else {
    // 回答错误
    updates.error_count = (word.status.error_count || 0) + 1
    updates.true_count = 0
    updates.learned = false
    updates.recite = true
    updates.next_review_ts = nowTs + 300 // 5 minutes later
  }

  // 本地更新状态
  Object.assign(word.status, updates)

  // 返回更新数据，供批量保存使用
  return {
    wordUpdate: translationIndex !== null ? { id, translationIndex } : null,
    statusUpdate: { id, status: updates }
  }
}

// Computed properties
const wrongWords = computed(() => {
  return words.value.filter(word => word.status?.recite === true)
})

const learnedWords = computed(() => {
  return words.value.filter(word => word.status?.learned === true)
})

const unlearnedWords = computed(() => {
  return words.value.filter(word => word.status?.learned !== true)
})

const totalWords = computed(() => words.value.length)

const learnedCount = computed(() => learnedWords.value.length)

const wrongCount = computed(() => wrongWords.value.length)

const progress = computed(() => {
  if (totalWords.value === 0) return 0
  return Math.round((learnedCount.value / totalWords.value) * 100)
})

/**
 * Reset all learned status and increment learned_count
 * Called when all words are learned
 */
const resetLearnedStatus = async () => {
  const resetPromises = []

  words.value.forEach(word => {
    if (word.status?.learned === true) {
      // 重置 learned 状态
      const updates = {
        learned: false,
        learned_count: (word.status.learned_count || 0) + 1
      }
      resetPromises.push(updateWordStatus(word.id, updates))
    }
  })

  await Promise.all(resetPromises)
  console.log('✓ All words learned! Reset learned status and incremented learned_count')
}

/**
 * Check if all words are learned and reset if needed
 */
const checkAndResetLearned = async () => {
  const allLearned = words.value.length > 0 && words.value.every(word => word.status?.learned === true)
  if (allLearned) {
    await resetLearnedStatus()
    return true
  }
  return false
}

/**
 * Update phonetic for a single word
 */
const updatePhonetic = (wordId, phoneticText) => {
  // 更新 phonetics 状态
  phonetics.value[wordId] = phoneticText

  // 更新 words 中对应单词的 phonetic 字段
  const wordIndex = words.value.findIndex(w => w.id === wordId)
  if (wordIndex !== -1) {
    words.value[wordIndex].phonetic = phoneticText
  }

  // 批量保存完整的音标数据到后端
  savePhoneticsToBackend()

  // 更新缓存
  saveToCache(words.value, phonetics.value)
  console.log(`✓ Phonetic updated for word ID ${wordId}: ${phoneticText}`)
}

/**
 * Save all phonetics to backend (批量保存)
 */
const savePhoneticsToBackend = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/phonetics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(phonetics.value)
    })

    if (response.ok) {
      const result = await response.json()
      console.log(`✓ Phonetics saved to backend: ${result.count} entries`)
    }
  } catch (err) {
    console.error('Failed to save phonetics to backend:', err)
  }
}

/**
 * Get irregular word info by word_id
 */
const getIrregularWord = (wordId) => {
  return irregularWords.value.find(iw => iw.word_id === wordId) || null
}

/**
 * Check if a word is irregular verb
 */
const isIrregularWord = (wordId) => {
  return irregularWords.value.some(iw => iw.word_id === wordId)
}

/**
 * Load question choices from backend API
 */
const loadQuestionChoices = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/question-choices`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ Question choices data received:', data.length, 'questions')
    return data
  } catch (e) {
    console.warn('⚠️ Failed to load question choices:', e.message)
    return []
  }
}

/**
 * Load filling library from backend API
 */
const loadFillingLibrary = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/filling-library`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ Filling library data received:', data.length, 'questions')
    return data
  } catch (e) {
    console.warn('⚠️ Failed to load filling library:', e.message)
    return []
  }
}

/**
 * Clear cache
 */
const clearCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY)
    localStorage.removeItem(CACHE_TIMESTAMP_KEY)
    localStorage.removeItem(PHONETIC_CACHE_KEY)
    lastSyncTime.value = null
    console.log('✓ Cache cleared')
  } catch (e) {
    console.warn('Failed to clear cache:', e)
  }
}

/**
 * Composable function to use word service
 */
export function useWordService() {
  return {
    // State
    words,
    isLoading,
    error,
    isSaving,
    lastSyncTime,
    irregularWords,

    // Computed
    wrongWords,
    learnedWords,
    unlearnedWords,
    totalWords,
    learnedCount,
    wrongCount,
    progress,

    // Methods
    loadWords,
    saveWords,
    updateWord,
    updateWords,
    updateWordStatus,
    updatePhonetic,
    markAsLearned,
    markForRecite,
    updateReviewData,
    batchUpdateWordsAndStatus,
    checkAndResetLearned,
    getIrregularWord,
    isIrregularWord,
    loadQuestionChoices,
    loadFillingLibrary,
    clearCache
  }
}
