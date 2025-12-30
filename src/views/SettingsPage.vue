<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 设置状态
const settings = ref({
  dictation: {
    timeLeft: 600,
    batchSize: 10
  },
  multipleChoice: {
    questionsPerSession: 1
  },
  quiz: {
    questionsPerSession: 1
  }
})

const isLoading = ref(true)
const isSaving = ref(false)
const saveMessage = ref('')

// 加载设置
const loadSettings = async () => {
  try {
    const response = await fetch('http://localhost:3123/api/settings')
    const data = await response.json()
    settings.value = data
    isLoading.value = false
  } catch (error) {
    console.error('加载设置失败:', error)
    isLoading.value = false
  }
}

// 保存设置
const saveSettings = async () => {
  isSaving.value = true
  saveMessage.value = ''

  try {
    const response = await fetch('http://localhost:3123/api/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settings.value)
    })

    const result = await response.json()

    if (result.success) {
      saveMessage.value = '设置保存成功！'
      setTimeout(() => {
        saveMessage.value = ''
      }, 3000)
    }
  } catch (error) {
    console.error('保存设置失败:', error)
    saveMessage.value = '保存失败，请重试'
  } finally {
    isSaving.value = false
  }
}

// 重置为默认值
const resetToDefaults = () => {
  settings.value = {
    dictation: {
      timeLeft: 600,
      batchSize: 10
    },
    multipleChoice: {
      questionsPerSession: 1
    },
    quiz: {
      questionsPerSession: 1
    }
  }
}

// 格式化时间显示
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}分${secs}秒`
}

onMounted(() => {
  loadSettings()
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
      <p class="text-slate-600">加载设置中...</p>
    </div>

    <!-- Settings Content -->
    <div v-else class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-slate-800 mb-2">设置</h1>
        <p class="text-slate-600">配置应用的各项参数</p>
      </div>

      <!-- Save Message -->
      <div v-if="saveMessage" class="mb-6 p-4 rounded-xl"
           :class="saveMessage.includes('成功') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'">
        {{ saveMessage }}
      </div>

      <!-- Dictation Settings -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-bold text-slate-800">听写模式设置</h2>
            <p class="text-sm text-slate-500">配置听写练习的参数</p>
          </div>
        </div>

        <div class="space-y-6">
          <!-- Time Limit Setting -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-3">
              答题时间限制
            </label>
            <div class="flex items-center gap-4">
              <input
                v-model.number="settings.dictation.timeLeft"
                type="range"
                min="60"
                max="1800"
                step="30"
                class="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              >
              <div class="w-32 text-right">
                <span class="text-lg font-bold text-indigo-600">{{ formatTime(settings.dictation.timeLeft) }}</span>
              </div>
            </div>
            <div class="mt-2 flex justify-between text-xs text-slate-500">
              <span>1分钟</span>
              <span>30分钟</span>
            </div>
          </div>

          <!-- Batch Size Setting -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-3">
              每次答题数量
            </label>
            <div class="flex items-center gap-4">
              <input
                v-model.number="settings.dictation.batchSize"
                type="range"
                min="1"
                max="50"
                step="1"
                class="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              >
              <div class="w-32 text-right">
                <span class="text-lg font-bold text-indigo-600">{{ settings.dictation.batchSize }} 个单词</span>
              </div>
            </div>
            <div class="mt-2 flex justify-between text-xs text-slate-500">
              <span>1个</span>
              <span>50个</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Multiple Choice Settings -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-bold text-slate-800">选择题模式设置</h2>
            <p class="text-sm text-slate-500">配置选择题练习的参数</p>
          </div>
        </div>

        <div class="space-y-6">
          <!-- Questions Per Session Setting -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-3">
              每次答题数量
            </label>
            <div class="flex items-center gap-4">
              <input
                v-model.number="settings.multipleChoice.questionsPerSession"
                type="range"
                min="1"
                max="20"
                step="1"
                class="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              >
              <div class="w-32 text-right">
                <span class="text-lg font-bold text-purple-600">{{ settings.multipleChoice.questionsPerSession }} 题</span>
              </div>
            </div>
            <div class="mt-2 flex justify-between text-xs text-slate-500">
              <span>1题</span>
              <span>20题</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quiz Settings -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-bold text-slate-800">答题练习设置</h2>
            <p class="text-sm text-slate-500">配置答题练习的参数</p>
          </div>
        </div>

        <div class="space-y-6">
          <!-- Questions Per Session Setting -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-3">
              每次答题数量
            </label>
            <div class="flex items-center gap-4">
              <input
                v-model.number="settings.quiz.questionsPerSession"
                type="range"
                min="1"
                max="20"
                step="1"
                class="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              >
              <div class="w-32 text-right">
                <span class="text-lg font-bold text-emerald-600">{{ settings.quiz.questionsPerSession }} 题</span>
              </div>
            </div>
            <div class="mt-2 flex justify-between text-xs text-slate-500">
              <span>1题</span>
              <span>20题</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-4">
        <button
          @click="saveSettings"
          :disabled="isSaving"
          class="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all"
        >
          {{ isSaving ? '保存中...' : '保存设置' }}
        </button>

        <button
          @click="resetToDefaults"
          class="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 px-6 rounded-xl transition-all"
        >
          恢复默认
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom range slider styling */
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #4f46e5;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #4f46e5;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>
