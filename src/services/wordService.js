/**
 * Unified Word Data Service
 * Handles all word data operations with backend API and local fallback
 */

import { ref, computed } from 'vue'

// Configuration #$ hostname -I
const API_BASE_URL = 'http://172.28.66.187:3123/api'
const CACHE_KEY = 'juniorgrade3_words_cache'
const CACHE_TIMESTAMP_KEY = 'juniorgrade3_words_cache_timestamp'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Reactive state
const words = ref([])
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

    if (cached && timestamp) {
      const age = Date.now() - parseInt(timestamp)
      if (age < CACHE_DURATION) {
        words.value = JSON.parse(cached)
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
const saveToCache = (data) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())
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
      isLoading.value = false
      return
    }

    console.log('🚀 Starting API request...')

    // Try API
    try {
      const data = await loadFromAPI()
      words.value = data
      saveToCache(data)
      console.log('✓ Loaded from API:', data.length, 'words')
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
    saveToCache(words.value)
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
 * Update word review data (for spaced repetition)
 */
const updateReviewData = (id, isCorrect) => {
  const now = new Date().toISOString().split('T')[0]
  const nowTs = Math.floor(Date.now() / 1000)
  const word = words.value.find(w => w.id === id)

  if (!word) return

  const updates = {
    last_review: now
  }

  if (isCorrect) {
    // 回答正确
    const currentTrueCount = word.true_count || 0
    updates.true_count = currentTrueCount + 1

    // 只有当是错题(recite=false)时，回答正确才标记为learned
    if (word.recite === false) {
      updates.learned = true
    }

    updates.next_review_ts = nowTs + 86400 // 1 day later

    // 如果连续答对3次且是错题，则从错题本移除
    if (updates.true_count >= 3 && word.recite === true) {
      updates.recite = false
      updates.error_count = 0
    }
  } else {
    // 回答错误
    updates.error_count = (word.error_count || 0) + 1
    updates.true_count = 0
    updates.learned = false
    updates.recite = true
    updates.next_review_ts = nowTs + 300 // 5 minutes later
  }

  updateWord(id, updates)
}

// Computed properties
const wrongWords = computed(() => {
  return words.value.filter(word => word.recite === true)
})

const learnedWords = computed(() => {
  return words.value.filter(word => word.learned === true)
})

const unlearnedWords = computed(() => {
  return words.value.filter(word => word.learned !== true)
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
const resetLearnedStatus = () => {
  words.value.forEach(word => {
    if (word.learned === true) {
      word.learned = false
      word.learned_count = (word.learned_count || 0) + 1
    }
  })
  console.log('✓ All words learned! Reset learned status and incremented learned_count')
}

/**
 * Check if all words are learned and reset if needed
 */
const checkAndResetLearned = () => {
  const allLearned = words.value.length > 0 && words.value.every(word => word.learned === true)
  if (allLearned) {
    resetLearnedStatus()
    return true
  }
  return false
}

/**
 * Clear cache
 */
const clearCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY)
    localStorage.removeItem(CACHE_TIMESTAMP_KEY)
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
    markAsLearned,
    markForRecite,
    updateReviewData,
    checkAndResetLearned,
    clearCache
  }
}
