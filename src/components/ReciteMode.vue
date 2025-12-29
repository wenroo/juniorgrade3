<script setup>
import { ref } from 'vue'
import WordPhonetic from './WordPhonetic.vue'
import { getTypeColor } from '@/config/partOfSpeechColors'
import { useWordService } from '@/services'

// 使用 word service
const { updateWordStatus } = useWordService()

const props = defineProps({
  currentBatchList: {
    type: Array,
    required: true
  }
})

// 管理每个单词卡片的展开状态
const expandedCards = ref({})

// 切换卡片展开状态
const toggleExpand = (itemId) => {
  expandedCards.value[itemId] = !expandedCards.value[itemId]
}

// 检查卡片是否展开
const isExpanded = (itemId) => {
  return expandedCards.value[itemId] || false
}

// 检查是否有可展开的内容
const hasExpandableContent = (item) => {
  return (item.expand && item.expand.length > 0) ||
         (item.info && item.info.body !== '') ||
         (item.examples && item.examples.length > 1)
}

// TTS 发音功能
const speak = (text) => {
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  window.speechSynthesis.speak(utterance)
}

// 高亮显示目标单词
const highlightWord = (sentence, targetWord) => {
  if (!sentence || !targetWord) return sentence

  // 创建正则表达式，匹配单词的各种形式（忽略大小写，匹配完整单词）
  const regex = new RegExp(`\\b(${targetWord}[a-z]*)\\b`, 'gi')

  return sentence.replace(regex, '<span class="text-black font-medium">$1</span>')
}

// 确认对话框状态
const showConfirmDialog = ref(false)
const confirmAction = ref(null)
const confirmMessage = ref('')

// 切换 important 状态
const toggleImportant = async (item) => {
  if (item.status.important) {
    // 如果当前是 true，需要确认
    confirmMessage.value = '确定要取消标记为重要单词吗？'
    confirmAction.value = async () => {
      item.status.important = false
      const lastReview = new Date().toISOString()
      item.status.last_review = lastReview
      // 保存到后端
      await updateWordStatus(item.id, {
        important: false,
        last_review: lastReview
      })
      showConfirmDialog.value = false
    }
    showConfirmDialog.value = true
  } else {
    // 直接设置为 true
    item.status.important = true
    const lastReview = new Date().toISOString()
    item.status.last_review = lastReview
    // 保存到后端
    await updateWordStatus(item.id, {
      important: true,
      last_review: lastReview
    })
  }
}

// 切换 recite 状态
const toggleRecite = async (item) => {
  if (item.status.recite) {
    // 如果当前是 true，需要确认
    confirmMessage.value = '确定要取消背诵标记吗？'
    confirmAction.value = async () => {
      item.status.recite = false
      const lastReview = new Date().toISOString()
      item.status.last_review = lastReview
      // 保存到后端
      await updateWordStatus(item.id, {
        recite: false,
        last_review: lastReview
      })
      showConfirmDialog.value = false
    }
    showConfirmDialog.value = true
  } else {
    // 直接设置为 true
    item.status.recite = true
    const lastReview = new Date().toISOString()
    item.status.last_review = lastReview
    // 保存到后端
    await updateWordStatus(item.id, {
      recite: true,
      last_review: lastReview
    })
  }
}

// 格式化日期显示
const formatDate = (dateString) => {
  if (!dateString) return '未复习'
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays}天前`
  return date.toLocaleDateString('zh-CN')
}

// 取消确认对话框
const cancelConfirm = () => {
  showConfirmDialog.value = false
  confirmAction.value = null
}
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
    <div v-for="item in currentBatchList" :key="item.id"
         class="bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative overflow-hidden flex flex-col justify-between">
      <div class="absolute top-0 rounded-br-full py-px px-4 bg-blue-200 text-neutral-600 text-sm font-medium left-0"> NO.{{ item.id }}</div>

        <div class="flex flex-col gap-1 pb-2 pt-6 pl-4 pr-4">
          <h3 @click="speak(item.word)" class="text-4xl font-bold font-sans flex items-end gap-1 cursor-pointer hover:text-neutral-500" title="朗读">
            {{ item.word }}
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>
            </svg>
          </h3>

            <WordPhonetic :word="item.word" :word-id="item.id" :cached-phonetic="item.phonetic" />
          <!-- 状态按钮组 -->
          <div class="flex flex-col items-center gap-3 mt-5.5 flex-wrap absolute right-4 top-0">

            <!-- Important 状态按钮 -->
            <button
              @click="toggleImportant(item)"
              :title="item.status?.important ? '点击取消重要标记' : '点击标记为重要'"
            >
              <div :class="[
                  'rounded-full w-9 h-9 flex items-center justify-center',
                  item.status?.important
                    ? 'bg-lime-100 text-lime-700 border border-lime-300'
                    : 'bg-gray-100 text-gray-500 border border-gray-200']">
                <svg  class="w-6 h-6" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"  fill="none" stroke="currentColor" width="24" height="24"><path fill="currentColor" d="M977.066667 405.333333c-4.266667-17.066667-17.066667-25.6-34.133334-29.866666l-273.066666-38.4-123.733334-247.466667c-8.533333-21.333333-34.133333-29.866667-55.466666-17.066667-8.533333 4.266667-12.8 12.8-17.066667 17.066667L354.133333 332.8l-273.066666 42.666667c-17.066667 0-29.866667 12.8-38.4 29.866666-4.266667 17.066667 0 34.133333 12.8 42.666667L251.733333 640l-46.933333 273.066667c-4.266667 21.333333 12.8 46.933333 34.133333 51.2 8.533333 0 17.066667 0 25.6-4.266667l243.2-128 243.2 128c4.266667 4.266667 12.8 4.266667 21.333334 4.266667s17.066667-4.266667 25.6-8.533334c12.8-8.533333 21.333333-25.6 17.066666-42.666666l-42.666666-273.066667 196.266666-192c12.8-12.8 17.066667-29.866667 8.533334-42.666667z" p-id="5352"></path></svg>
              </div>
              <span class="text-xs font-medium" :class="[item.status?.important ? 'text-lime-700': 'text-gray-500']">
                    {{item.status?.important ? '重要' : '普通'}}
              </span>
            </button>

            <!-- Recite 状态按钮 -->
            <button
              @click="toggleRecite(item)"
              :title="item.status?.recite ? '点击取消背诵标记' : '点击标记为背诵'"
            >
              <div :class="[
                  'rounded-full w-9 h-9',
                  item.status?.recite
                    ? 'bg-red-100 text-red-700 border border-red-300'
                    : 'bg-gray-100 text-gray-500 border border-gray-200']">
                  <svg class="w-6 h-6 mx-auto mt-1.5" fill="currentColor" stroke="currentColor" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path fill="currentColor" d="M45.126654 234.223062m24.196597 0l120.982987 0q24.196597 0 24.196598 24.196598l0 0q0 24.196597-24.196598 24.196597l-120.982987 0q-24.196597 0-24.196597-24.196597l0 0q0-24.196597 24.196597-24.196598Z" p-id="9634"></path><path d="M47.304348 512a24.196597 24.196597 0 0 0 24.196597 24.196597h120.982987a24.196597 24.196597 0 0 0 0-48.393194h-120.982987a24.196597 24.196597 0 0 0-24.196597 24.196597zM216.680529 765.822306a24.196597 24.196597 0 0 0-24.196597-24.196597h-120.982987a24.196597 24.196597 0 0 0 0 48.393195h120.982987a24.196597 24.196597 0 0 0 24.196597-24.196598z" p-id="9635"></path><path d="M888.136106 0H222.729679a90.73724 90.73724 0 0 0-90.73724 90.73724V217.769376H197.565217a40.166352 40.166352 0 1 1 0 80.332703H131.992439v173.731569H197.565217a40.166352 40.166352 0 0 1 0 80.332704H131.992439V725.897921H197.565217a40.166352 40.166352 0 0 1 0 80.332703H131.992439v127.032136a90.73724 90.73724 0 0 0 90.73724 90.73724h665.406427a90.73724 90.73724 0 0 0 90.73724-90.73724V90.73724A90.73724 90.73724 0 0 0 888.136106 0zM458.646503 209.784499a34.117202 34.117202 0 0 1 48.393195-48.393195l48.393194 48.393195 48.393195-48.393195a34.117202 34.117202 0 0 1 48.393195 48.393195l-48.393195 48.393195 48.393195 48.393194a34.117202 34.117202 0 0 1-48.393195 48.393195l-48.393195-48.393195-48.393194 48.393195a34.117202 34.117202 0 0 1-48.393195-48.393195l48.393195-48.393194z m212.930057 606.36673h-285.519849a24.196597 24.196597 0 1 1 0-48.393195h285.519849a24.196597 24.196597 0 1 1 0 48.393195z m82.026465-112.514178H386.056711a24.196597 24.196597 0 0 1 0-48.393195h367.546314a24.196597 24.196597 0 0 1 0 48.393195z m67.992438-106.465028h-435.538752a24.196597 24.196597 0 1 1 0-48.393195h435.538752a24.196597 24.196597 0 0 1 0 48.393195z"></path></svg>                
              </div>
              <span class="text-xs font-medium" :class="[item.status?.recite ? 'text-red-700': 'text-gray-500']">
                    {{item.status?.recite ? '错题' : '非错题'}}
              </span>
            </button>

            <!-- Learned 状态显示 -->
            <div
              :title="item.status?.learned ? '已学习' : '未学习'"
            >
              <div :class="[
                  'rounded-full w-9 h-9',
                  item.status?.learned
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-gray-100 text-gray-500 border border-gray-200']">
                <svg class="w-6 h-6 mx-auto mt-1.5"  fill="currentColor" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M942.16192 357.82656v157.65504l35.92192 43.6224-69.44768 62.8736-63.87712-62.8736 38.31808-44.4416V383.7952C677.888 471.04 621.99808 498.70848 576.512 519.68c-45.50656 20.97152-78.2336 20.97152-123.74016 3.35872-44.72832-17.6128-249.91744-98.95936-356.88448-151.79776-71.0656-35.2256-75.85792-57.87648 1.57696-88.064C198.06208 243.77344 354.52928 180.03968 442.368 145.65376c51.89632-21.8112 79.83104-33.54624 127.73376-9.216 85.44256 36.88448 270.66368 112.35328 368.06656 154.29632 84.64384 38.56384 27.9552 51.15904 3.9936 67.09248zM586.87488 585.09312c49.50016-20.97152 116.57216-56.19712 190.01344-88.8832v259.95264S682.68032 860.16 515.80928 860.16c-178.83136 0-275.456-103.99744-275.456-103.99744V512.96256c56.70912 23.49056 119.76704 44.4416 196.4032 71.2704 47.12448 18.47296 107.008 24.33024 150.1184 0.86016z"></path></svg>
              </div>
              <span class="text-xs font-medium" :class="[item.status?.learned ? 'text-green-700': 'text-gray-500']">
                    {{item.status?.learned ? '已学习' : '未学习'}}
              </span>
            </div>

            <!-- Last Review 显示 -->
            <!-- <div
              class="flex flex-col gap-1 items-center"
              :title="item.status?.last_review || '未复习'"
            >

              <div :class="[
                  'rounded-full w-9 h-9',
                  item.status?.last_review
                    ? 'bg-slate-100 text-slate-700 border border-slate-300'
                    : 'bg-gray-100 text-gray-500 border border-gray-200']">
                <svg class="w-6 h-6 mx-auto mt-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
              <span class="text-xs font-medium" :class="[item.status?.last_review ? 'text-slate-700': 'text-gray-500']">
                  {{ formatDate(item.status?.last_review) }}
              </span>
            </div> -->
          </div>

          <div class="flex flex-col gap-2 my-2 pr-12">
            <div v-for="(trans, index) in item.translations" :key="index" class="font-medium text-sm flex gap-2 items-center">
              <div :class="getTypeColor(trans.type)" class="rounded-lg py-3 px-3 h-full">{{ trans.type }}</div>
              <div class="bg-neutral-200/75 rounded-lg py-2 px-3 text-lg">{{ trans.translation }}</div>
            </div>
          </div>
          <div class="flex flex-col gap-4 my-2 pr-12">
            <!-- 只显示第一个例句 -->
            <div v-if="item.examples && item.examples.length > 0" class="text-lg text-neutral-400">
              <div v-html="highlightWord(item.examples[0].en, item.word)"></div>
              <div class="text-neutral-300">{{ item.examples[0].cn }}</div>
            </div>
          </div>  
          
          <div v-if="item.phrase && item.phrase.length > 0" class="flex flex-col gap-1 my-2 bg-blue-100 rounded-2xl border border-blue-200 p-3">
            <div class="text-xl font-medium text-sky-700">常用词组</div>
            <div v-for="(phraseItem, index) in item.phrase" :key="index" class="text-lg">
              <span class="pr-2">{{ phraseItem.en }}</span><span class="text-neutral-400">{{ phraseItem.cn }}</span>
            </div>
          </div> 
          
        </div>

        <!-- 展开/收起按钮 - 始终显示，根据内容启用或禁用 -->
        <div class="relative bottom-0 w-full">
          <button
            @click="hasExpandableContent(item) ? toggleExpand(item.id) : null"
            :disabled="!hasExpandableContent(item)"
            :aria-expanded="isExpanded(item.id)"
            :aria-label="isExpanded(item.id) ? '收起详细信息' : '展开详细信息'"
            :class="[
              'w-full py-3 border-t border-gray-200 transition-colors flex items-center justify-between px-4 gap-2 font-medium',
              hasExpandableContent(item)
                ? 'bg-gray-50 hover:bg-gray-100 cursor-pointer'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            ]"
          >
            <span class="text-lg">{{ isExpanded(item.id) ? '收起' : '展开更多' }}</span>
            <svg
              :class="['w-6 h-6 transition-transform', isExpanded(item.id) ? 'rotate-180' : '']"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>

          <div
            :aria-expanded="isExpanded(item.id)"
            class="bg-gray-50 overflow-hidden transition-all"
            :class="isExpanded(item.id) ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'"
          >

            <!-- 从第二个例句开始显示（如果有的话） -->
            <div v-if="item.examples && item.examples.length > 1" class="flex flex-col gap-4 m-4">
              <div v-for="(example, index) in item.examples.slice(1)" :key="index" class="text-lg text-neutral-400">
                <div v-html="highlightWord(example.en, item.word)"></div>
                <div class="text-neutral-300">{{ example.cn }}</div>
              </div>
            </div>

            <div v-if="item.expand && item.expand.length > 0" class="flex flex-col gap-1 m-4 bg-orange-100 rounded-2xl border border-orange-200 p-3">
              <div class="font-medium text-orange-700">词形拓展</div>
              <div v-for="(expandItem, index) in item.expand" :key="index">
                {{ expandItem }}
              </div>
            </div>

            <div v-if="item.info && item.info.body !== ''" class="pt-10 m-4 px-4 bg-amber-50 rounded-2xl border border-amber-100 relative overflow-hidden">
              <div class="font-medium text-yellow-700 bg-amber-200 absolute left-0 top-0 px-2 py-1 rounded-br-2xl">名师点拨</div>
              <div class="py-2">{{ item.info.body }}</div>
              <hr class="border border-neutral-200 h-px overflow-hidden my-2">
              <div v-for="(infoItem, index) in item.info.items" :key="index" class="my-2">
                <span class="font-bold pr-1">{{ infoItem.word }}</span>
                <span class=" text-neutral-500" v-html="infoItem.content"></span>
              </div>
            </div>

          </div>
        </div>
    </div>
  </div>

  <!-- 确认对话框 -->
  <div
    v-if="showConfirmDialog"
    class="fixed inset-0 bg-black bg-black/75 flex items-center justify-center z-50"
    @click.self="cancelConfirm"
  >
    <div class="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4">
      <h3 class="text-xl font-bold text-gray-800 mb-4">确认操作</h3>
      <p class="text-gray-600 mb-6">{{ confirmMessage }}</p>
      <div class="flex gap-3 justify-end">
        <button
          @click="cancelConfirm"
          class="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-medium"
        >
          取消
        </button>
        <button
          @click="confirmAction"
          class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
        >
          确定
        </button>
      </div>
    </div>
  </div>
</template>
