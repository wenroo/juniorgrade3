<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentBatchList: {
    type: Array,
    required: true
  },
  currentIndex: {
    type: Number,
    required: true
  },
  userAnswers: {
    type: Object,
    required: true
  },
  isSubmitted: {
    type: Boolean,
    required: true
  },
  batchSize: {
    type: Number,
    required: true
  },
  mode: {
    type: String,
    default: 'english',
    validator: (value) => ['english', 'chinese'].includes(value)
  },
  selectedTranslations: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:userAnswers', 'submit', 'retry'])

// 验证答案
const checkAnswer = (id) => {
  const item = props.currentBatchList.find(w => w.id === id)
  const userVal = (props.userAnswers[id] || '').trim()
  const selectedTransIndex = props.selectedTranslations[id]

  if (props.mode === 'chinese') {
    // 中文默写：检查选中的翻译
    if (userVal.length < 2) return false
    if (selectedTransIndex === null || selectedTransIndex === undefined) return false

    const selectedTrans = item.translations?.[selectedTransIndex]
    if (!selectedTrans) return false

    return selectedTrans.translation.indexOf(userVal) !== -1
  } else {
    // 英文默写：完全匹配（不区分大小写）
    // 处理多形式单词，如 "a (an)" -> ["a", "an"]
    const userValLower = userVal.toLowerCase()
    const correctAnswerLower = item.word.toLowerCase()

    // 1. 完全匹配原始格式 "a (an)"
    if (userValLower === correctAnswerLower) {
      return true
    }

    // 2. 匹配无括号格式 "a an"
    const noBrackets = correctAnswerLower.replace(/[()]/g, '')
    if (userValLower === noBrackets) {
      return true
    }

    // 3. 匹配单个形式 "a" 或 "an"
    const wordForms = item.word.split(/[\s()]+/).filter(w => w.length > 0)
    return wordForms.some(form => form.toLowerCase() === userValLower)
  }
}

// 获取输入框样式
const getInputClass = (id) => {
  const baseClass = "bg-slate-50 border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"

  if (!props.isSubmitted) return baseClass

  if (checkAnswer(id)) {
    return "bg-emerald-50 border-emerald-500 text-emerald-700"
  } else {
    return "bg-rose-50 border-rose-500 text-rose-700"
  }
}

// 计算当前得分
const currentScore = computed(() => {
  if (!props.isSubmitted) return 0
  return props.currentBatchList.reduce((score, item) => {
    return score + (checkAnswer(item.id) ? 1 : 0)
  }, 0)
})

// 获取显示的翻译文本
const getDisplayTranslation = (item, cat) => {
  const selectedTransIndex = props.selectedTranslations[item.id]
  if (selectedTransIndex === null || selectedTransIndex === undefined) {
    return  item.translations?.[0][cat] || ''
  }
  return  item.translations?.[0][cat] || ''
}

// 更新用户答案
const updateAnswer = (id, value) => {
  emit('update:userAnswers', { ...props.userAnswers, [id]: value })
}
</script>

<template>
  <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
    <div v-for="(item, index) in currentBatchList" :key="item.id"
         class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pb-4 border-b border-slate-50 last:border-0">
      <div class="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full text-sm font-bold">
        {{ currentIndex + index + 1 }}
      </div>

      <div class="flex-1 text-slate-600 font-medium">
        <span class="font-bold pr-1 text-lg text-black"> {{ getDisplayTranslation(item, 'type') }} </span>
        {{ mode === 'chinese' ? item.word : getDisplayTranslation(item, 'translation') }}
      </div>

      <div class="flex-1 w-full relative">
        <input
          type="text"
          :value="userAnswers[item.id] || ''"
          @input="updateAnswer(item.id, $event.target.value)"
          :disabled="isSubmitted"
          :class="getInputClass(item.id)"
          class="w-full text-lg rounded-lg block p-2.5 outline-none transition-all placeholder-slate-300 border"
          :placeholder="mode === 'chinese' ? '输入中文翻译...' : '输入单词...'"
          autocomplete="off"
        >

        <div v-if="isSubmitted" class="absolute right-3 top-3">
          <span v-if="checkAnswer(item.id)" class="text-emerald-600 text-lg font-bold">✓</span>
          <span v-else class="text-rose-600 text-lg font-bold">✕</span>
        </div>

        <div v-if="isSubmitted" class="text-xs  mt-1 pl-1"
          :class="checkAnswer(item.id) ? 'text-emerald-500' : 'text-rose-500'">
          标准答案: <span class="font-bold">{{ mode === 'chinese' ? getDisplayTranslation(item) : item.word }}</span>
        </div>
      </div>
    </div>

    <div class="mt-8 text-center">
      <button
        v-if="!isSubmitted"
        @click="$emit('submit')"
        class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-1 active:scale-95">
        提交并检查答案
      </button>

      <button
        v-else
        @click="$emit('retry')"
        class="bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all">
        本组得分: {{ currentScore }} / {{ batchSize }} - 点击重置
      </button>
    </div>
  </div>
</template>
