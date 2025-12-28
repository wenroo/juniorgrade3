<script setup>
import { ref, watch } from 'vue'
import { useWordService } from '@/services/wordServiceSupabase'

const props = defineProps({
  word: {
    type: String,
    required: true
  },
  wordId: {
    type: Number,
    required: false
  },
  cachedPhonetic: {
    type: String,
    default: ''
  }
})

const { updatePhonetic } = useWordService()

const phonetic = ref('')
const isLoading = ref(false)
const error = ref(false)

// 清理单词格式，移除括号等特殊字符
function cleanWord(word) {
  // 移除括号及其内容，如 "manner(s)" -> "manner"
  return word.replace(/\([^)]*\)/g, '').trim()
}

// 保存音标到 Supabase
async function savePhoneticToBackend(wordId, phoneticText) {
  if (!wordId || !phoneticText) return

  try {
    // 使用 Supabase 更新音标
    await updatePhonetic(wordId, phoneticText)
    console.log(`音标已保存到数据库: ${phoneticText}`)
  } catch (err) {
    console.error('保存音标失败:', err)
  }
}

// 从在线API获取音标
async function fetchPhoneticFromAPI(word) {
  try {
    // 清理单词格式，移除括号等特殊字符
    const cleanedWord = cleanWord(word)
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${cleanedWord}`)
    const data = await response.json()

    // API通常会返回多个发音（英音/美音），这里取第一个
    if (data[0] && data[0].phonetic) {
      return data[0].phonetic
    } else if (data[0] && data[0].phonetics && data[0].phonetics.length > 0) {
      return data[0].phonetics.find(p => p.text)?.text || ""
    }
    return ""
  } catch (err) {
    console.error("获取音标失败:", err)
    throw err
  }
}

// 获取音标的主函数（带缓存逻辑）
async function getPhonetic(word, wordId, cached) {
  if (!word) return ''

  // 如果已有缓存的音标，直接使用
  if (cached) {
    return cached
  }

  // 没有缓存，从在线API获取
  isLoading.value = true
  error.value = false

  try {
    const fetchedPhonetic = await fetchPhoneticFromAPI(word)

    // 如果获取成功且有wordId，保存到后端
    if (fetchedPhonetic && wordId) {
      await savePhoneticToBackend(wordId, fetchedPhonetic)
    }

    return fetchedPhonetic
  } catch (err) {
    error.value = true
    return ""
  } finally {
    isLoading.value = false
  }
}

// 监听单词变化，自动获取音标
watch(() => [props.word, props.wordId, props.cachedPhonetic], async ([newWord, newWordId, cached]) => {
  if (newWord) {
    phonetic.value = await getPhonetic(newWord, newWordId, cached)
  }
}, { immediate: true })
</script>

<template>
  <div class="inline-flex items-center gap-1">
    <!-- Loading state -->
    <span v-if="isLoading" class="text-xs text-slate-400 italic">
      加载中...
    </span>

    <!-- Phonetic display -->
    <span v-else-if="phonetic && !error" class="text-base text-slate-400 font-sans">
      {{ phonetic }}
    </span>

    <!-- Error or no phonetic found -->
    <span v-else-if="error" class="text-xs text-slate-300 italic">
      -
    </span>
  </div>
</template>
