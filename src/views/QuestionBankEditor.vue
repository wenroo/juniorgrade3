<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-6xl mx-auto px-4">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 class="text-2xl font-bold text-gray-800">题库管理</h1>
        <p class="text-gray-600 mt-2">添加和编辑填空题库数据</p>
      </div>

      <!-- Form -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <form @submit.prevent="handleSubmit">
          <!-- Question Type -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              题目类型 <span class="text-red-500">*</span>
            </label>
            <select
              v-model="formData.question_type"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">请选择题目类型</option>
              <option
                v-for="type in questionTypes"
                :key="type.value"
                :value="type.value"
              >
                {{ type.label }}
              </option>
            </select>
          </div>

          <!-- Library From -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              题库来源 <span class="text-red-500">*</span>
            </label>
            <div class="space-y-2">
              <select
                v-model="selectedLibraryFrom"
                @change="handleLibraryFromChange"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">选择现有来源或输入新来源</option>
                <option value="__custom__">+ 添加新来源</option>
                <option
                  v-for="source in existingLibrarySources"
                  :key="source"
                  :value="source"
                >
                  {{ source }}
                </option>
              </select>
              <input
                v-if="showCustomInput"
                v-model="formData.library_from"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="例如：2023年上海市嘉定区中考一模"
                required
                @input="updateLibraryId"
              />
            </div>
            <p class="text-sm text-gray-500 mt-1">
              自动生成ID: <span class="font-mono text-blue-600">{{ formData.library_id || '待生成' }}</span>
            </p>
          </div>

          <!-- Content Editor -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              题目内容 <span class="text-red-500">*</span>
            </label>
            <div class="border border-gray-300 rounded-lg overflow-hidden">
              <div class="bg-gray-100 border-b border-gray-300 p-2 flex gap-2">
                <button
                  type="button"
                  @click="insertTag('content', '&lt;br&gt;')"
                  class="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm"
                >
                  换行
                </button>
                <button
                  type="button"
                  @click="insertTag('content', '&lt;img src=&quot;&quot;&gt;')"
                  class="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm"
                >
                  插入图片
                </button>
              </div>
              <textarea
                v-model="formData.content"
                rows="10"
                class="w-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入题目内容，支持HTML标签"
                required
              ></textarea>
            </div>
            <p class="text-sm text-gray-500 mt-1">支持HTML标签，如 &lt;br&gt;、&lt;img&gt; 等</p>
          </div>

          <!-- Blanks Section -->
          <div class="mb-6">
            <div class="flex justify-between items-center mb-4">
              <label class="block text-sm font-medium text-gray-700">
                填空项 <span class="text-red-500">*</span>
              </label>
              <button
                type="button"
                @click="addBlank"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + 添加填空项
              </button>
            </div>

            <div
              v-for="(blank, index) in formData.blanks"
              :key="index"
              class="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50"
            >
              <div class="flex justify-between items-center mb-3">
                <h3 class="font-medium text-gray-700">填空项 #{{ index + 1 }}</h3>
                <button
                  type="button"
                  @click="removeBlank(index)"
                  class="text-red-600 hover:text-red-800 text-sm"
                  v-if="formData.blanks.length > 1"
                >
                  删除
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- Blank ID -->
                <div>
                  <label class="block text-sm font-medium text-gray-600 mb-1">
                    题号 <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="blank.blank_id"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="例如：16"
                    required
                    @input="updateLibraryId"
                  />
                </div>

                <!-- Correct Word -->
                <div>
                  <label class="block text-sm font-medium text-gray-600 mb-1">
                    正确答案 <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="blank.correct_word_input"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="多个答案用逗号分隔"
                    required
                  />
                  <p class="text-xs text-gray-500 mt-1">用逗号分隔多个答案</p>
                </div>

                <!-- Alternatives -->
                <div>
                  <label class="block text-sm font-medium text-gray-600 mb-1">
                    选项（可选）
                  </label>
                  <input
                    v-model="blank.alternatives_input"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="多个选项用逗号分隔"
                  />
                  <p class="text-xs text-gray-500 mt-1">用逗号分隔多个选项</p>
                </div>
              </div>
            </div>

            <p class="text-sm text-gray-500 mt-2">
              至少需要一个填空项。vocabulary_focus 将自动从正确答案中生成。
            </p>
          </div>

          <!-- Info Editor -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              题目解析
            </label>
            <div class="border border-gray-300 rounded-lg overflow-hidden">
              <div class="bg-gray-100 border-b border-gray-300 p-2 flex gap-2">
                <button
                  type="button"
                  @click="insertTag('info', '&lt;br&gt;')"
                  class="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm"
                >
                  换行
                </button>
                <button
                  type="button"
                  @click="insertTag('info', '&lt;img src=&quot;&quot;&gt;')"
                  class="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm"
                >
                  插入图片
                </button>
              </div>
              <textarea
                v-model="formData.info"
                rows="8"
                class="w-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入题目解析，支持HTML标签"
              ></textarea>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-4 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              @click="resetForm"
              class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              重置
            </button>
            <button
              type="submit"
              class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              保存题目
            </button>
          </div>
        </form>
      </div>

      <!-- Preview Section -->
      <div class="bg-white rounded-lg shadow-sm p-6 mt-6" v-if="showPreview">
        <h2 class="text-xl font-bold text-gray-800 mb-4">预览</h2>
        <pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">{{ previewData }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Question types configuration - extensible
const questionTypes = ref([
  { label: '完形填空', value: 'complete' },
  { label: '阅读五选四', value: 'choice' },
  { label: '首字母填空', value: 'fill' },
  { label: '单词改写', value: 'word_derivation' },
  { label: '句型转换', value: 'sentence_transformation' },

])

// Form data
const formData = ref({
  library_id: '',
  question_type: '',
  content: '',
  blanks: [
    {
      blank_id: '',
      correct_word_input: '',
      alternatives_input: ''
    }
  ],
  info: '',
  vocabulary_focus: [],
  library_from: ''
})

const showPreview = ref(false)
const existingLibrarySources = ref([])
const selectedLibraryFrom = ref('')
const showCustomInput = ref(false)

// Pinyin conversion utility
const pinyinMap = {
  '年': 'n', '上': 's', '海': 'h', '市': 's', '嘉': 'j', '定': 'd', '区': 'q',
  '中': 'z', '考': 'k', '一': 'y', '模': 'm', '宝': 'b', '山': 's', '崇': 'c',
  '明': 'm', '徐': 'x', '汇': 'h', '普': 'p', '陀': 't', '松': 's', '江': 'j',
  '金': 'j', '闵': 'm', '行': 'x', '浦': 'p', '东': 'd', '新': 'x', '杨': 'y',
  '虹': 'h', '口': 'k', '静': 'j', '安': 'a', '长': 'c', '宁': 'n', '黄': 'h',
  '卢': 'l', '湾': 'w', '奉': 'f', '贤': 'x', '青': 'q', '二': 'e', '三': 's',
  '四': 's', '五': 'w', '六': 'l', '七': 'q', '八': 'b', '九': 'j', '十': 's',
  '零': 'l', '〇': 'l', '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
  '5': '5', '6': '6', '7': '7', '8': '8', '9': '9'
}

// Convert Chinese to pinyin initials
const convertToPinyin = (text) => {
  if (!text) return ''
  return text.split('').map(char => pinyinMap[char] || '').join('').toLowerCase()
}

// Fetch existing library sources
const fetchLibrarySources = async () => {
  try {
    const response = await fetch('http://localhost:3123/api/filling-library')
    const questions = await response.json()

    // Extract unique library_from values
    const sources = [...new Set(questions.map(q => q.library_from).filter(Boolean))]
    existingLibrarySources.value = sources.sort()
  } catch (error) {
    console.error('Error fetching library sources:', error)
  }
}

// Handle library from selection change
const handleLibraryFromChange = () => {
  if (selectedLibraryFrom.value === '__custom__') {
    showCustomInput.value = true
    formData.value.library_from = ''
  } else if (selectedLibraryFrom.value) {
    showCustomInput.value = false
    formData.value.library_from = selectedLibraryFrom.value
    updateLibraryId()
  } else {
    showCustomInput.value = false
    formData.value.library_from = ''
  }
}

// Update library_id automatically
const updateLibraryId = () => {
  const libraryFrom = formData.value.library_from
  const firstBlankId = formData.value.blanks[0]?.blank_id || ''

  if (libraryFrom && firstBlankId) {
    const pinyinPart = convertToPinyin(libraryFrom)
    formData.value.library_id = `${pinyinPart}${firstBlankId}`
  }
}

// Add new blank
const addBlank = () => {
  formData.value.blanks.push({
    blank_id: '',
    correct_word_input: '',
    alternatives_input: ''
  })
}

// Remove blank
const removeBlank = (index) => {
  if (formData.value.blanks.length > 1) {
    formData.value.blanks.splice(index, 1)
    updateLibraryId()
  }
}

// Insert HTML tag into textarea
const insertTag = (field, tag) => {
  formData.value[field] += tag
}

// Process form data before submission
const processFormData = () => {
  const processedBlanks = formData.value.blanks.map(blank => ({
    blank_id: blank.blank_id,
    correct_word: blank.correct_word_input
      .split(',')
      .map(w => w.trim())
      .filter(w => w),
    alternatives: blank.alternatives_input
      ? blank.alternatives_input.split(',').map(w => w.trim()).filter(w => w)
      : []
  }))

  // Auto-generate vocabulary_focus from correct_word
  const vocabularyFocus = processedBlanks.map(blank => blank.correct_word)

  return {
    library_id: formData.value.library_id,
    question_type: formData.value.question_type,
    content: formData.value.content,
    blanks: processedBlanks,
    info: formData.value.info,
    vocabulary_focus: vocabularyFocus,
    library_from: formData.value.library_from
  }
}

// Preview data
const previewData = computed(() => {
  return JSON.stringify(processFormData(), null, 2)
})

// Handle form submission
const handleSubmit = async () => {
  try {
    const data = processFormData()

    // Validate data
    if (!data.library_id || !data.question_type || !data.content || data.blanks.length === 0) {
      alert('请填写所有必填项')
      return
    }

    // Show preview before saving
    showPreview.value = true

    // Confirm before saving
    if (!confirm('确认保存此题目？')) {
      return
    }

    // Send to backend API
    const response = await fetch('http://localhost:3123/api/filling-library', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    const result = await response.json()

    if (response.ok && result.success) {
      alert('题目保存成功！')
      resetForm()
    } else {
      alert(result.message || '保存失败，请重试')
    }
  } catch (error) {
    console.error('Error saving question:', error)
    alert('保存失败，请检查后端服务是否启动')
  }
}

// Reset form
const resetForm = () => {
  formData.value = {
    library_id: '',
    question_type: '',
    content: '',
    blanks: [
      {
        blank_id: '',
        correct_word_input: '',
        alternatives_input: ''
      }
    ],
    info: '',
    vocabulary_focus: [],
    library_from: ''
  }
  selectedLibraryFrom.value = ''
  showCustomInput.value = false
  showPreview.value = false
}

// Load existing library sources on component mount
onMounted(() => {
  fetchLibrarySources()
})
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
