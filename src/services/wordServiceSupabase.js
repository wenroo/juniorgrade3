/**
 * Supabase-based Word Data Service
 * Replaces the old Express API backend with direct Supabase connection
 */

import { ref, computed } from 'vue'
import { supabase, getCurrentUserId, DEFAULT_USER_ID } from './supabaseClient'

// Reactive state
const words = ref([])
const isLoading = ref(false)
const error = ref(null)
const isSaving = ref(false)
const lastSyncTime = ref(null)

// Current user ID (will be set after auth)
const currentUserId = ref(DEFAULT_USER_ID)

/**
 * Initialize user session
 */
const initializeUser = async () => {
  const userId = await getCurrentUserId()
  if (userId) {
    currentUserId.value = userId
  }
  console.log('📱 User initialized:', currentUserId.value)
}

// Initialize on module load
initializeUser()

/**
 * Load words from Supabase with all related data
 */
const loadWords = async () => {
  if (isLoading.value) {
    console.log('⏳ Already loading...')
    return
  }

  isLoading.value = true
  error.value = null

  try {
    console.log('🔄 Loading words from Supabase...')

    // First, get the total count
    const { count: totalCount, error: countError } = await supabase
      .from('words_2026')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('❌ Error getting count:', countError)
    } else {
      console.log('📊 Total words in database:', totalCount)
    }

    // Fetch ALL words in batches (Supabase has a 1000 row limit per request)
    const BATCH_SIZE = 1000
    const totalBatches = Math.ceil((totalCount || 2000) / BATCH_SIZE)
    let allWordsData = []

    console.log(`📦 Fetching ${totalBatches} batches...`)

    for (let i = 0; i < totalBatches; i++) {
      const from = i * BATCH_SIZE
      const to = from + BATCH_SIZE - 1

      console.log(`📦 Fetching batch ${i + 1}/${totalBatches} (rows ${from}-${to})`)

      const { data: batchData, error: batchError } = await supabase
        .from('words_2026')
        .select(`
          id,
          word,
          translations_2026 (
            type,
            translation,
            used
          ),
          examples_2026 (
            example
          ),
          phonetics_2026 (
            phonetic
          )
        `)
        .order('id', { ascending: true })
        .range(from, to)

      if (batchError) {
        console.error(`❌ Error fetching batch ${i + 1}:`, batchError)
        throw batchError
      }

      allWordsData = allWordsData.concat(batchData || [])
      console.log(`✅ Batch ${i + 1} fetched: ${batchData?.length || 0} words`)
    }

    const wordsData = allWordsData
    console.log('📊 Total fetched words count:', wordsData.length)

    console.log('📊 Raw words data count:', wordsData?.length || 0)
    if (wordsData && wordsData.length > 0) {
      console.log('📝 First word sample:', JSON.stringify(wordsData[0], null, 2))
      console.log('🔍 Checking data structure:')
      console.log('  - translations_2026:', wordsData[0].translations_2026)
      console.log('  - examples_2026:', wordsData[0].examples_2026)
      console.log('  - phonetics_2026:', wordsData[0].phonetics_2026)
      console.log('  - expand_2026:', wordsData[0].expand_2026)
      console.log('  - phrases_2026:', wordsData[0].phrases_2026)
      console.log('  - antonym:', wordsData[0].antonym)
      console.log('  - info_title:', wordsData[0].info_title)
      console.log('  - info_body:', wordsData[0].info_body)
    }

    // Fetch user status for current user
    const { data: statusData, error: statusError } = await supabase
      .from('user_word_status_2026')
      .select('*')
      .eq('user_id', currentUserId.value)

    if (statusError) throw statusError

    console.log('📊 User status data count:', statusData?.length || 0)
    console.log('👤 Current user ID:', currentUserId.value)

    // Merge data into the format expected by the app
    const mergedWords = wordsData.map(word => {
      const userStatus = statusData?.find(s => s.word_id === word.id)

      // Handle phonetics - it's an array, take the first one
      let phonetic = ''
      if (word.phonetics_2026 && Array.isArray(word.phonetics_2026) && word.phonetics_2026.length > 0) {
        phonetic = word.phonetics_2026[0]?.phonetic || ''
      }

      return {
        id: word.id,
        word: word.word,
        translations: word.translations_2026 || [],
        examples: word.examples_2026?.map(e => e.example) || [],
        phonetic: phonetic,
        expand: [],  // TODO: 待添加 expand_2026 表后恢复
        phrase: [],  // TODO: 待添加 phrases_2026 表后恢复
        antonym: '',  // TODO: 待添加字段后恢复
        info: {
          title: '',
          body: '',
          items: []
        },
        status: userStatus ? {
          learned: userStatus.learned,
          recite: userStatus.recite,
          important: userStatus.important,
          error_count: userStatus.error_count,
          true_count: userStatus.true_count,
          last_review: userStatus.last_review,
          next_review_ts: userStatus.next_review_ts
        } : {
          learned: false,
          recite: false,
          important: false,
          error_count: 0,
          true_count: 0,
          last_review: '',
          next_review_ts: 0
        }
      }
    })

    words.value = mergedWords
    lastSyncTime.value = new Date()
    console.log('✅ Loaded', mergedWords.length, 'words from Supabase')

  } catch (e) {
    console.error('❌ Failed to load words:', e)
    error.value = e.message
    throw e
  } finally {
    isLoading.value = false
  }
}

/**
 * Update user word status
 */
const updateWordStatus = async (wordId, statusUpdates) => {
  try {
    const { data, error } = await supabase
      .from('user_word_status_2026')
      .upsert({
        user_id: currentUserId.value,
        word_id: wordId,
        ...statusUpdates,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,word_id'
      })
      .select()

    if (error) throw error

    // Update local state
    const wordIndex = words.value.findIndex(w => w.id === wordId)
    if (wordIndex !== -1) {
      words.value[wordIndex].status = {
        ...words.value[wordIndex].status,
        ...statusUpdates
      }
    }

    console.log('✅ Updated status for word', wordId)
    return data

  } catch (e) {
    console.error('❌ Failed to update word status:', e)
    throw e
  }
}

/**
 * Batch update words and user status
 */
const batchUpdateWordsAndStatus = async (wordUpdates, statusUpdates) => {
  try {
    console.log('🔄 Batch updating...', { wordUpdates, statusUpdates })

    // Update translation 'used' status
    if (wordUpdates && wordUpdates.length > 0) {
      for (const update of wordUpdates) {
        const { error } = await supabase
          .from('translations_2026')
          .update({ used: true })
          .eq('id', update.translationId)

        if (error) throw error
      }
    }

    // Update user status
    if (statusUpdates && statusUpdates.length > 0) {
      const upsertData = statusUpdates.map(update => ({
        user_id: currentUserId.value,
        word_id: update.id,
        ...update.status,
        updated_at: new Date().toISOString()
      }))

      const { error } = await supabase
        .from('user_word_status_2026')
        .upsert(upsertData, {
          onConflict: 'user_id,word_id'
        })

      if (error) throw error

      // Update local state
      statusUpdates.forEach(update => {
        const wordIndex = words.value.findIndex(w => w.id === update.id)
        if (wordIndex !== -1) {
          words.value[wordIndex].status = {
            ...words.value[wordIndex].status,
            ...update.status
          }
        }
      })
    }

    console.log('✅ Batch update completed')
    return { success: true }

  } catch (e) {
    console.error('❌ Batch update failed:', e)
    throw e
  }
}

/**
 * Update phonetic for a word
 */
const updatePhonetic = async (wordId, phoneticText) => {
  try {
    const { error } = await supabase
      .from('phonetics_2026')
      .upsert({
        word_id: wordId,
        phonetic: phoneticText,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'word_id'
      })

    if (error) throw error

    // Update local state
    const wordIndex = words.value.findIndex(w => w.id === wordId)
    if (wordIndex !== -1) {
      words.value[wordIndex].phonetic = phoneticText
    }

    console.log('✅ Updated phonetic for word', wordId)
    return { success: true }

  } catch (e) {
    console.error('❌ Failed to update phonetic:', e)
    throw e
  }
}

/**
 * Composable function to use word service
 */
export const useWordService = () => {
  return {
    // State
    words,
    isLoading,
    error,
    isSaving,
    lastSyncTime,
    currentUserId,

    // Computed
    unlearnedWords,
    learnedWords,
    wrongWords,
    totalWords,
    learnedCount,
    wrongCount,
    progress,

    // Methods
    loadWords,
    updateWordStatus,
    batchUpdateWordsAndStatus,
    updateReviewData,
    checkAndResetLearned,
    initializeUser,
    updatePhonetic
  }
}

// Export for direct use
export {
  words,
  isLoading,
  error,
  loadWords,
  updateWordStatus,
  batchUpdateWordsAndStatus
}

/**
 * Computed properties for word statistics
 */
const unlearnedWords = computed(() => {
  return words.value.filter(word => word.status?.learned !== true)
})

const learnedWords = computed(() => {
  return words.value.filter(word => word.status?.learned === true)
})

const wrongWords = computed(() => {
  return words.value.filter(word => word.status?.recite === true)
})

const totalWords = computed(() => words.value.length)

const learnedCount = computed(() => learnedWords.value.length)

const wrongCount = computed(() => wrongWords.value.length)

const progress = computed(() => {
  if (totalWords.value === 0) return 0
  return Math.round((learnedCount.value / totalWords.value) * 100)
})

/**
 * Update review data for a word
 */
const updateReviewData = async (wordId, reviewData) => {
  return await updateWordStatus(wordId, reviewData)
}

/**
 * Check if all words are learned and reset if needed
 */
const checkAndResetLearned = async () => {
  const allLearned = words.value.every(word => word.status?.learned === true)
  if (allLearned && words.value.length > 0) {
    console.log('🎉 All words learned! Resetting...')
    // Reset all learned status
    for (const word of words.value) {
      await updateWordStatus(word.id, { learned: false })
    }
    return true
  }
  return false
}
