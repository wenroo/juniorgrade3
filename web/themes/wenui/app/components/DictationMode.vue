<script setup>
import { computed } from 'vue'
import { useWordService } from '@/services'
import { validateAnswer, calculateStatusUpdate } from '@/utils/dictationValidator'

const { updateWordStatus } = useWordService()

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
  isTimeout: {
    type: Boolean,
    default: false
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
  const userAnswer = props.userAnswers[id] || ''
  const selectedTransIndex = props.selectedTranslations[id]

  return validateAnswer({
    item,
    userAnswer,
    selectedTransIndex,
    mode: props.mode
  })
}

// 更新单词学习状态
const updateWordLearningStatus = async (id, isCorrect) => {
  const item = props.currentBatchList.find(w => w.id === id)
  if (!item || !item.status) return

  const statusUpdates = calculateStatusUpdate(item.status, isCorrect)

  if (statusUpdates) {
    await updateWordStatus(id, statusUpdates)
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


      <div class="flex flex-1 gap-1 text-lg text-slate-600 font-medium items-center">
        <div class="w-10 h-10 mr-1 flex-shrink-0 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full text-xs font-bold">
          {{ item.id }}
        </div>
        <span class="font-bold text-neutral-400"> {{ getDisplayTranslation(item, 'type') }} </span>
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

        <div v-if="isSubmitted" class="absolute right-3 top-2.5">
          <span v-if="checkAnswer(item.id)" class="text-emerald-600 text-lg font-bold">✓</span>
          <span v-else class="text-rose-600 text-lg font-bold">✕</span>
        </div>

        <div v-if="isSubmitted && !isTimeout" class="text-sm mt-1 pl-1 font-medium"
          :class="checkAnswer(item.id) ? 'text-emerald-500' : 'text-rose-500'">
          <span class="opacity-50">标准答案: </span><span class="text-lg">{{ mode === 'chinese' ? getDisplayTranslation(item, 'translation') : item.word  }}</span>
        </div>

        <div v-if="isTimeout" class="text-sm mt-1 pl-1 font-medium text-amber-600">
          <span class="opacity-50">标准答案: </span><span class="text-lg">{{ mode === 'chinese' ? getDisplayTranslation(item, 'translation') : item.word  }}</span>
        </div>
      </div>
    </div>

    <div class="mt-8 text-center">
      <!-- 超时提示 -->
      <div v-if="isTimeout" class="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <p class="text-amber-800 font-semibold text-lg">⏰ 时间到！本次听写未保存</p>
        <p class="text-amber-600 text-sm mt-1">请查看标准答案后重新开始</p>
      </div>

      <button
        v-if="!isSubmitted"
        @click="$emit('submit')"
        class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-1 active:scale-95">
        提交并检查答案
      </button>

      <button
        v-else-if="isTimeout"
        @click="$emit('retry')"
        class="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all">
        重新开始听写
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
