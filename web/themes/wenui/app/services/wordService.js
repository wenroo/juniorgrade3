import { ref, computed } from 'vue'
import { graphqlQuery } from './drupal'

const CACHE_KEY = 'juniorgrade3_words_cache'
const CACHE_TIMESTAMP_KEY = 'juniorgrade3_words_cache_timestamp'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Reactive state
const words = ref([])
const irregularWords = ref([])
const totalCount = ref(0)
const isLoading = ref(false)
const error = ref(null)
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
 * Load words using GraphQL
 */
const loadWords = async ({ offset = 0, limit = 10, keyword = '', filters = {} } = {}) => {
  if (isLoading.value) return

  isLoading.value = true
  error.value = null

  try {

    console.log('🚀 Starting GraphQL request...', { offset, limit, keyword })

    let result;
    if (keyword) {
      result = await graphqlQuery(`
        query SearchWords($keyword: String!, $limit: Int) {
          searchWords(keyword: $keyword, limit: $limit) {
            id
            word
            phonetic
            translations {
              type
              translation
            }
          }
        }
      `, { keyword, limit: 50 }); // Keep search limit higher or fixed for now as previously implemented
      words.value = result.searchWords || [];
      totalCount.value = words.value.length; // Approximate for search
    } else {
      result = await graphqlQuery(`
        query GetWords($limit: Int!, $offset: Int!, $letter: String, $type: String, $irregular: Boolean, $important: Boolean) {
          words(limit: $limit, offset: $offset, important: $important, letter: $letter, type: $type, irregular: $irregular, sortBy: "id", sortOrder: "ASC") {
            id
            expand
            infoBody
            infoItems {
              content
              word
            }
            phonetic
            phrases {
              cn
              en
            }
            antonym
            examples {
              cn
              en
            }
            important
            word
            translations {
              type
              translation
            }
          }
          wordsCount(important: $important, letter: $letter, type: $type, irregular: $irregular)
        }
      `, {
        limit,
        offset,
        letter: filters.letter !== 'all' ? filters.letter : null,
        type: filters.type !== 'all' ? filters.type : null,
        irregular: filters.irregular === true ? true : null,
        important: filters.important === true ? true : null
      });
      words.value = result.words || [];
      totalCount.value = result.wordsCount || 0;
    }

    // Initialize status for words if missing
    words.value = words.value.map(word => ({
      ...word,
      status: word.status || {
        learned: false,
        recite: false,
        last_review: '',
        important: false,
        error_count: 0,
        next_review_ts: 0,
        true_count: 0
      }
    }));

    // saveToCache(words.value) // Disable full list cache overwrite with partial data
    console.log('✓ Loaded from GraphQL:', words.value.length, 'words. Total:', totalCount.value)

  } catch (e) {
    error.value = `Failed to load words: ${e.message}`
    console.error('Load error:', e)

    // Fallback logic could be complex with pagination, skipping for now
  } finally {
    isLoading.value = false
  }
}

/**
 * Update a single word by ID (Local state only)
 */
const updateWord = (id, updates) => {
  const index = words.value.findIndex(w => w.id === id)
  if (index !== -1) {
    words.value[index] = { ...words.value[index], ...updates }
  }
}

/**
 * Update word status (Local state only, API removed)
 */
const updateWordStatus = async (id, statusUpdates) => {
  const word = words.value.find(w => w.id === id)
  if (!word) return

  // Ensure status object exists
  if (!word.status) {
    word.status = {}
  }

  // Update local state
  Object.assign(word.status, statusUpdates)

  console.log(`✓ Word status updated locally for ID ${id}:`, statusUpdates)
  // Backend sync removed as per cleanup request
}

/**
 * Mark word as learned (Local)
 */
const markAsLearned = (id, learned = true) => {
  updateWord(id, { learned })
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
 * Composable function to use word service
 */
export function useWordService() {
  return {
    // State
    words,
    totalCount,
    isLoading,
    error,
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
    updateWord,
    updateWordStatus,
    markAsLearned,
    getIrregularWord,
    isIrregularWord,
    clearCache
  }
}
