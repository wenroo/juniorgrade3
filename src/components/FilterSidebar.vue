<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { partOfSpeechColors, getTypeConfig } from '@/config/partOfSpeechColors'
import { useWordService } from '@/services'

const { isIrregularWord } = useWordService()

const props = defineProps({
  activeFilters: {
    type: Object,
    default: () => ({})
  },
  words: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['filter-change'])

// 从 localStorage 加载过滤器状态
const loadFiltersFromStorage = () => {
  try {
    const saved = localStorage.getItem('wordFilters')
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.error('Failed to load filters from localStorage:', e)
  }
  return {
    letter: 'all',
    partOfSpeech: ['all'],
    recite: false,
    important: false,
    irregular: false
  }
}

// 当前选中的过滤器
const selectedFilters = ref(loadFiltersFromStorage())

// 根据指定的过滤条件计算单词列表（可以排除某个过滤器组）
const getFilteredWords = (excludeGroupId = null) => {
  return props.words.filter(word => {
    // 首字母过滤（如果不排除）
    if (excludeGroupId !== 'letter' && selectedFilters.value.letter !== 'all') {
      const firstLetter = word.word.charAt(0).toUpperCase()
      if (firstLetter !== selectedFilters.value.letter) {
        return false
      }
    }

    // 词性过滤（如果不排除）
    if (excludeGroupId !== 'partOfSpeech') {
      const selectedPartOfSpeech = selectedFilters.value.partOfSpeech || []
      if (!selectedPartOfSpeech.includes('all')) {
        const hasMatchingType = word.translations?.some(trans =>
          selectedPartOfSpeech.includes(trans.type)
        )
        if (!hasMatchingType) {
          return false
        }
      }
    }

    // Recite 过滤（如果不排除）
    if (excludeGroupId !== 'recite') {
      if (selectedFilters.value.recite === true) {
        if (!word.status?.recite) {
          return false
        }
      }
    }

    // Important 过滤（如果不排除）
    if (excludeGroupId !== 'important') {
      if (selectedFilters.value.important === true) {
        if (!word.status?.important) {
          return false
        }
      }
    }

    // Irregular 过滤（如果不排除）
    if (excludeGroupId !== 'irregular') {
      if (selectedFilters.value.irregular === true) {
        if (!isIrregularWord(word.id)) {
          return false
        }
      }
    }

    return true
  })
}

// 计算每个字母下的单词数量（排除首字母过滤器本身，考虑其他过滤器）
const letterWordCount = computed(() => {
  const counts = {}
  const words = getFilteredWords('letter')
  words.forEach(word => {
    const firstLetter = word.word.charAt(0).toUpperCase()
    counts[firstLetter] = (counts[firstLetter] || 0) + 1
  })
  return counts
})

// 计算每个词性下的单词数量（排除词性过滤器本身，考虑其他过滤器）
const partOfSpeechWordCount = computed(() => {
  const counts = {}
  const words = getFilteredWords('partOfSpeech')
  words.forEach(word => {
    word.translations?.forEach(trans => {
      const type = trans.type
      counts[type] = (counts[type] || 0) + 1
    })
  })
  return counts
})

// 计算 recite 状态下的单词数量
const reciteWordCount = computed(() => {
  const words = getFilteredWords('recite')
  return words.filter(word => word.status?.recite).length
})

// 计算 important 状态下的单词数量
const importantWordCount = computed(() => {
  const words = getFilteredWords('important')
  return words.filter(word => word.status?.important).length
})

// 计算 irregular 状态下的单词数量
const irregularWordCount = computed(() => {
  const words = getFilteredWords('irregular')
  return words.filter(word => isIrregularWord(word.id)).length
})

// 通用函数：检查过滤器选项是否有对应的单词
const hasWordsForOption = (groupId, value) => {
  if (value === 'all') return true

  if (groupId === 'letter') {
    return (letterWordCount.value[value] || 0) > 0
  }

  if (groupId === 'partOfSpeech') {
    return (partOfSpeechWordCount.value[value] || 0) > 0
  }

  if (groupId === 'recite') {
    return reciteWordCount.value > 0
  }

  if (groupId === 'important') {
    return importantWordCount.value > 0
  }

  if (groupId === 'irregular') {
    return irregularWordCount.value > 0
  }

  return true
}

// 过滤器配置 - 可扩展
const filterGroups = ref([
  {
    id: 'letter',
    title: '首字母',
    type: 'single', // single: 单选, multiple: 多选
    options: [
      { value: 'all', label: '全部单词' },
      ...Array.from({ length: 26 }, (_, i) => ({
        value: String.fromCharCode(65 + i),
        label: String.fromCharCode(65 + i)
      }))
    ]
  },
  {
    id: 'important',
    title: '高频重要单词',
    type: 'toggle',
    options: [
      { value: 'true', label: '重要单词' }
    ]
  },
  {
    id: 'recite',
    title: '错题本',
    type: 'toggle',
    options: [
      { value: 'true', label: '错题' }
    ]
  },
  {
    id: 'irregular',
    title: '不规则动词',
    type: 'toggle',
    options: [
      { value: 'true', label: '不规则动词' }
    ]
  },
  {
    id: 'partOfSpeech',
    title: '词性',
    type: 'multiple',
    options: [
      { value: 'all', label: '全部' },
      ...Object.entries(partOfSpeechColors).map(([value, config]) => ({
        value,
        label: config.label
      }))
    ]
  }
])

// 处理过滤器变化
const handleFilterChange = (groupId, value, type) => {
  if (type === 'single') {
    selectedFilters.value[groupId] = value
  } else if (type === 'toggle') {
    // Toggle 逻辑：切换 true/false
    selectedFilters.value[groupId] = !selectedFilters.value[groupId]
  } else {
    // 多选逻辑
    const current = selectedFilters.value[groupId] || []

    if (value === 'all') {
      selectedFilters.value[groupId] = ['all']
    } else {
      // 移除 'all'
      const filtered = current.filter(v => v !== 'all')

      if (filtered.includes(value)) {
        // 取消选中
        const newValue = filtered.filter(v => v !== value)
        selectedFilters.value[groupId] = newValue.length > 0 ? newValue : ['all']
      } else {
        // 添加选中
        filtered.push(value)
        selectedFilters.value[groupId] = filtered
      }
    }
  }

  // 保存到 localStorage
  saveFiltersToStorage()
  emit('filter-change', selectedFilters.value)
}

// 检查是否选中
const isSelected = (groupId, value, type) => {
  if (type === 'single') {
    return selectedFilters.value[groupId] === value
  } else if (type === 'toggle') {
    return selectedFilters.value[groupId] === true
  } else {
    return (selectedFilters.value[groupId] || []).includes(value)
  }
}

// 保存过滤器到 localStorage
const saveFiltersToStorage = () => {
  try {
    localStorage.setItem('wordFilters', JSON.stringify(selectedFilters.value))
  } catch (e) {
    console.error('Failed to save filters to localStorage:', e)
  }
}

// 重置所有过滤器
const resetFilters = () => {
  selectedFilters.value = {
    letter: 'all',
    partOfSpeech: ['all'],
    recite: false,
    important: false,
    irregular: false
  }
  saveFiltersToStorage()
  emit('filter-change', selectedFilters.value)
}

// 获取词性按钮的样式类
const getPartOfSpeechClasses = (value, isSelected) => {
  if (value === 'all') {
    return isSelected
      ? 'bg-blue-800 text-white font-semibold'
      : 'text-slate-600 hover:bg-slate-100 border-transparent'
  }

  const config = getTypeConfig(value)
  return isSelected
    ? `${config.bgActive} ${config.textActive} font-medium`
    : `${config.bgHover} border-transparent`
}

// 获取通用过滤器按钮样式（用于 recite 和 important）
const getFilterButtonClasses = (groupId, value, isSelected) => {
  // 词性过滤器使用原有样式
  if (groupId === 'partOfSpeech') {
    return getPartOfSpeechClasses(value, isSelected)
  }

  // 'all' 选项的样式
  if (value === 'all') {
    return isSelected
      ? 'bg-blue-800 text-white'
      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
  }

  // Important 过滤器样式 - 使用琥珀色
  if (groupId === 'important') {
    if (value === 'true') {
      return isSelected
        ? 'bg-lime-600 text-white border-lime-700'
        : 'bg-lime-50 text-lime-700 hover:bg-lime-100 border-lime-300'
    } else {
      return isSelected
        ? 'bg-slate-600 text-white'
        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
    }
  }

  // Recite 过滤器样式 - 使用蓝色
  if (groupId === 'recite') {
    if (value === 'true') {
      return isSelected
        ? 'bg-red-600 text-white border-red-700'
        : 'bg-red-50 text-red-700 hover:bg-red-100 border-red-300'
    } else {
      return isSelected
        ? 'bg-slate-600 text-white'
        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
    }
  }

  // Recite 过滤器样式 - 使用蓝色
  if (groupId === 'irregular') {
    if (value === 'true') {
      return isSelected
        ? 'bg-amber-600 text-white border-amber-700'
        : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-300'
    } else {
      return isSelected
        ? 'bg-slate-600 text-white'
        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
    }
  }

  // 默认样式
  return isSelected
    ? 'bg-blue-600 text-white'
    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
}

// 获取词性圆点颜色类
const getDotColorClass = (value, isSelected) => {
  if (value === 'all') {
    return isSelected ? 'bg-slate-400' : 'bg-blue-800'
  }
  const config = getTypeConfig(value)
  // 选中时使用深色，未选中时使用浅色
  return isSelected ? config.bgSolid : config.bg
}

// 获取词性单词数量（基于已过滤的单词）
const getPartOfSpeechCount = (value) => {
  if (value === 'all') {
    return getFilteredWords('partOfSpeech').length
  }
  return partOfSpeechWordCount.value[value] || 0
}

// 获取 recite 状态单词数量
const getReciteCount = () => {
  return reciteWordCount.value
}

// 获取 important 状态单词数量
const getImportantCount = () => {
  return importantWordCount.value
}

// 获取 irregular 状态单词数量
const getIrregularCount = () => {
  return irregularWordCount.value
}

// 组件挂载时触发初始过滤
onMounted(() => {
  emit('filter-change', selectedFilters.value)
})
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-4 h-full overflow-y-auto">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <img src="/dev/icon-01.png" class="w-8 h-8" alt="words">
        <span>单词库</span>
      </h2>
      
      <button
        @click="resetFilters"
        class="text-sm bg-blue-500 hover:bg-blue-800 text-white py-2 px-4 rounded-xl transition-colors"
      >
        重置
      </button>
    </div>

    <!-- 过滤器组 -->
    <div v-for="group in filterGroups" :key="group.id" class="mb-6">
      <h3 class="text-sm font-semibold mb-3">{{ group.title }}</h3>

      <!-- 首字母网格布局 -->
      <div v-if="group.id === 'letter'" class="grid grid-cols-5 gap-2">

        <button
          v-for="option in group.options"
          :key="option.value"
          @click="handleFilterChange(group.id, option.value, group.type)"
          :disabled="!hasWordsForOption(group.id, option.value)"
          :class="[
            'py-1.5 px-1 text-base font-medium rounded-lg transition-all',
            option.value === 'all' ? 'col-span-5 border border-neutral-300 mb-2 shadow-xs' : '',
            !hasWordsForOption(group.id, option.value)
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-200'
              : isSelected(group.id, option.value, group.type)
                ? 'bg-blue-800 text-white'
                : 'bg-white-50 border-2 border-blue-900/35 text-blue-900 hover:bg-slate-100'
          ]"
        >
          {{ option.label }}
        </button>
      </div>

      <!-- 其他过滤器列表布局 -->
      <div v-else class="flex flex-col gap-1">
        <button
          v-for="option in group.options"
          :key="option.value"
          @click="handleFilterChange(group.id, option.value, group.type)"
          :disabled="!hasWordsForOption(group.id, option.value)"
          :class="[
            (group.id === 'partOfSpeech' && getPartOfSpeechCount(option.value) === 0) ? 'hidden' : 'flex',
            'btn',
            !hasWordsForOption(group.id, option.value)
              ? 'bg-gray-100 text-gray-600 cursor-not-allowed opacity-50 border-gray-200'
              : getFilterButtonClasses(group.id, option.value, isSelected(group.id, option.value, group.type))
          ]"
        >
          <span class="flex items-center gap-2">
            <span v-if="group.id === 'partOfSpeech'" :class="['w-3 h-3 rounded-full', getDotColorClass(option.value, isSelected(group.id, option.value, group.type))]"></span>
            <span>{{ option.label }}</span>
          </span>
          <span class="text-xs opacity-75">
            {{ group.id === 'partOfSpeech' ? getPartOfSpeechCount(option.value) :
               group.id === 'recite' ? getReciteCount() :
               group.id === 'important' ? getImportantCount() :
               group.id === 'irregular' ? getIrregularCount() : 0 }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>
