<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  word: {
    type: String,
    required: true
  }
})

const phonetic = ref('')
const isLoading = ref(false)
const error = ref(false)

// 获取音标的函数
async function getPhonetic(word) {
  if (!word) return ''

  isLoading.value = true
  error.value = false

  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    const data = await response.json()

    // API通常会返回多个发音（英音/美音），这里取第一个
    if (data[0] && data[0].phonetic) {
      return data[0].phonetic // 返回如 "/əˈbɪləti/"
    } else if (data[0] && data[0].phonetics && data[0].phonetics.length > 0) {
      // 备用查找路径
      return data[0].phonetics.find(p => p.text)?.text || ""
    }
    return ""
  } catch (err) {
    console.error("获取音标失败:", err)
    error.value = true
    return ""
  } finally {
    isLoading.value = false
  }
}

// 监听单词变化，自动获取音标
watch(() => props.word, async (newWord) => {
  if (newWord) {
    phonetic.value = await getPhonetic(newWord)
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
