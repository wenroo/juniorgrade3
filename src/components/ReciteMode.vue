<script setup>
import WordPhonetic from './WordPhonetic.vue'

defineProps({
  currentBatchList: {
    type: Array,
    required: true
  }
})

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

// 根据词性返回对应的背景色
const getTypeColor = (type) => {
  const typeColorMap = {
    'n.': 'bg-blue-200/75',      // 名词 - 蓝色
    'v.': 'bg-green-200/75',     // 动词 - 绿色
    'adj.': 'bg-purple-200/75',  // 形容词 - 紫色
    'adv.': 'bg-pink-200/75',    // 副词 - 粉色
    'prep.': 'bg-violet-200/75', // 介词 - 紫色
    'conj.': 'bg-orange-200/75', // 连词 - 橙色
    'pron.': 'bg-indigo-200/75', // 代词 - 靛蓝色
    'art.': 'bg-cyan-200/75',    // 冠词 - 青色
    'interj.': 'bg-red-200/75',  // 感叹词 - 红色
    'num.': 'bg-lime-200/75',    // 数词 - 青柠色
  }

  return typeColorMap[type] || 'bg-teal-200/75' // 默认颜色
}
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
    <div v-for="item in currentBatchList" :key="item.id"
         class="bg-white py-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative overflow-hidden">
      <!-- <div class="absolute top-0 rounded-br-full py-1 pl-2 pr-4 bg-blue-200 text-black/75 text-xs left-0">上次学习时间 {{ item.status.last_review }}</div> -->

        <div class="flex flex-col gap-1 py-2 px-6">
          <h3 @click="speak(item.word)" class="text-4xl font-bold font-sans flex items-end gap-1 cursor-pointer hover:text-neutral-500" title="朗读">
            {{ item.word }}
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>
            </svg>
          </h3>
          <WordPhonetic :word="item.word" class="" />
          <div class="flex flex-col gap-2 my-2">
            <div v-for="(trans, index) in item.translations" :key="index" class="font-medium text-sm flex gap-2 items-center">
              <div :class="getTypeColor(trans.type)" class="rounded-lg py-3 px-3 h-full">{{ trans.type }}</div>
              <div class="bg-neutral-200/75 rounded-lg py-2 px-3 text-lg">{{ trans.translation }}</div>
            </div>
          </div>
          <div class="flex flex-col gap-4 my-2">
            <div v-for="(example, index) in item.examples" :key="index" class="text-lg text-neutral-400">
              <div v-html="highlightWord(example.en, item.word)"></div>
              <div class="text-neutral-300">{{ example.cn }}</div>
            </div>
          </div>

          <div v-if="item.expand && item.expand.length > 0" class="flex flex-col gap-1 my-2 bg-orange-100 rounded-2xl border border-orange-200 p-3">
            <div class="text-xl font-medium text-orange-700">词形拓展</div>
            <div v-for="(expandItem, index) in item.expand" :key="index" class="text-lg">
              {{ expandItem }}
            </div>
          </div>
          
          <div v-if="item.phrase && item.phrase.length > 0" class="flex flex-col gap-1 my-2 bg-blue-100 rounded-2xl border border-blue-200 p-3">
            <div class="text-xl font-medium text-sky-700">常用词组</div>
            <div v-for="(phraseItem, index) in item.phrase" :key="index" class="text-lg">
              <span class="pr-2">{{ phraseItem.en }}</span><span class="text-neutral-400">{{ phraseItem.cn }}</span>
            </div>
          </div>
   

        </div>

    </div>
  </div>
</template>
