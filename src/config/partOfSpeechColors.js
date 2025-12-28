// 词性颜色配置 - 统一管理所有词性相关的颜色
export const partOfSpeechColors = {
  'n.': {
    bg: 'bg-blue-200/75',           // 背景色 - 用于ReciteMode
    text: 'text-blue-900',          // 文字色
    bgSolid: 'bg-blue-100',         // 实色背景 - 用于FilterSidebar
    bgHover: 'hover:bg-blue-400',   // 悬停背景
    bgActive: 'bg-blue-800',        // 选中背景
    textActive: 'text-white',       // 选中文字色
    border: 'border-blue-300',      // 边框色
    label: '名词 (n.)'
  },
  'v.': {
    bg: 'bg-green-200/75',
    text: 'text-green-900',
    bgSolid: 'bg-green-100',
    bgHover: 'hover:bg-green-400',
    bgActive: 'bg-green-800',
    textActive: 'text-white',
    border: 'border-green-300',
    label: '动词 (v.)'
  },
  'adj.': {
    bg: 'bg-purple-200/75',
    text: 'text-purple-900',
    bgSolid: 'bg-purple-100',
    bgHover: 'hover:bg-purple-400',
    bgActive: 'bg-purple-800',
    textActive: 'text-white',
    border: 'border-purple-300',
    label: '形容词 (adj.)'
  },
  'adv.': {
    bg: 'bg-pink-200/75',
    text: 'text-pink-900',
    bgSolid: 'bg-pink-100',
    bgHover: 'hover:bg-pink-400',
    bgActive: 'bg-pink-800',
    textActive: 'text-white',
    border: 'border-pink-300',
    label: '副词 (adv.)'
  },
  'prep.': {
    bg: 'bg-violet-200/75',
    text: 'text-violet-900',
    bgSolid: 'bg-violet-100',
    bgHover: 'hover:bg-violet-400',
    bgActive: 'bg-violet-800',
    textActive: 'text-white',
    border: 'border-violet-300',
    label: '介词 (prep.)'
  },
  'conj.': {
    bg: 'bg-orange-200/75',
    text: 'text-orange-900',
    bgSolid: 'bg-orange-100',
    bgHover: 'hover:bg-orange-400',
    bgActive: 'bg-orange-800',
    textActive: 'text-white',
    border: 'border-orange-300',
    label: '连词 (conj.)'
  },
  'pron.': {
    bg: 'bg-indigo-200/75',
    text: 'text-indigo-900',
    bgSolid: 'bg-indigo-100',
    bgHover: 'hover:bg-indigo-400',
    bgActive: 'bg-indigo-800',
    textActive: 'text-white',
    border: 'border-indigo-300',
    label: '代词 (pron.)'
  },
  'art.': {
    bg: 'bg-cyan-200/75',
    text: 'text-cyan-900',
    bgSolid: 'bg-cyan-100',
    bgHover: 'hover:bg-cyan-400',
    bgActive: 'bg-cyan-800',
    textActive: 'text-white',
    border: 'border-cyan-300',
    label: '冠词 (art.)'
  },
  'interj.': {
    bg: 'bg-red-200/75',
    text: 'text-red-900',
    bgSolid: 'bg-red-100',
    bgHover: 'hover:bg-red-400',
    bgActive: 'bg-red-800',
    textActive: 'text-white',
    border: 'border-red-300',
    label: '感叹词 (interj.)'
  },
  'num.': {
    bg: 'bg-lime-200/75',
    text: 'text-lime-900',
    bgSolid: 'bg-lime-100',
    bgHover: 'hover:bg-lime-400',
    bgActive: 'bg-lime-800',
    textActive: 'text-white',
    border: 'border-lime-300',
    label: '数词 (num.)'
  }
}

// 默认颜色配置
export const defaultColors = {
  bg: 'bg-teal-200/75',
  text: 'text-teal-900',
  bgSolid: 'bg-teal-100',
  bgHover: 'hover:bg-teal-400',
  bgActive: 'bg-teal-800',
  textActive: 'text-white',
  border: 'border-teal-300'
}

// 获取词性背景色 - 用于ReciteMode
export const getTypeColor = (type) => {
  return partOfSpeechColors[type]?.bg || defaultColors.bg
}

// 获取词性完整配置
export const getTypeConfig = (type) => {
  return partOfSpeechColors[type] || defaultColors
}
