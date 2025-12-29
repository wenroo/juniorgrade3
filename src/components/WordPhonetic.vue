<script setup>
import { ref, watch, computed } from 'vue'
import { useWordService } from '@/services'

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

const { updatePhonetic, getIrregularWord } = useWordService()

const phonetic = ref('')
const isLoading = ref(false)
const error = ref(false)

// 获取不规则动词信息
const irregularWordInfo = computed(() => {
  if (!props.wordId) return null
  return getIrregularWord(props.wordId)
})

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
  // 清理单词格式，移除括号等特殊字符
  const cleanedWord = cleanWord(word)

  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${cleanedWord}`)

    // 如果返回 404，尝试使用 Datamuse API
    if (response.status === 404) {
      console.log(`⚠️ Dictionary API 返回 404，尝试 Datamuse API: ${cleanedWord}`)
      const datamuseResult = await getDatamusePronunciation(cleanedWord)
      return datamuseResult || ""
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // API通常会返回多个发音（英音/美音），这里取第一个
    let phoneticResult = ""
    if (data[0] && data[0].phonetic) {
      phoneticResult = data[0].phonetic
    } else if (data[0] && data[0].phonetics && data[0].phonetics.length > 0) {
      phoneticResult = data[0].phonetics.find(p => p.text)?.text || ""
    }

    // 如果 Dictionary API 返回空结果，尝试使用 Datamuse API
    if (!phoneticResult) {
      console.log(`⚠️ Dictionary API 返回空结果，尝试 Datamuse API: ${cleanedWord}`)
      const datamuseResult = await getDatamusePronunciation(cleanedWord)
      return datamuseResult || ""
    }

    return phoneticResult
  } catch (err) {
    console.error("获取音标失败:", err)
    throw err
  }
}


/**
 * 使用 Datamuse API 获取单词的发音数据 (Arpabet 格式)
 * @param {string} word - 需要查询的单词
 */
async function getDatamusePronunciation(word) {
  // 1. 构建 URL
  // sp = spelled like (精确拼写匹配)
  // md = metadata (元数据)，其中 'r' 代表 pronunciation (发音)
  // max = 1 (只取最匹配的一个)
  const baseUrl = 'https://api.datamuse.com/words';
  const queryParams = new URLSearchParams({
    sp: word,
    md: 'r', 
    max: 1 
  });

  const url = `${baseUrl}?${queryParams.toString()}`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.length > 0) {
      // Datamuse 把发音放在 tags 数组里，以 "pron:" 开头
      const tags = data[0].tags || [];
      const pronTag = tags.find(tag => tag.startsWith('pron:'));

      if (pronTag) {
        // 去掉 "pron:" 前缀，拿到原始发音字符串
        const rawPronunciation = pronTag.split(':')[1];
        
        console.log(`单词: ${data[0].word}`);
        console.log(`Arpabet发音码: ${convertToIpa(rawPronunciation)}`); // 输出例如: AE1 F R AH0 K AH0
        return convertToIpa(rawPronunciation);
      } else {
        console.log('未找到发音数据');
        return null;
      }
    } else {
      console.log('词库中未找到该单词');
      return null;
    }

  } catch (error) {
    console.error('API 请求失败:', error);
  }
}


// Arpabet 到 IPA 的映射表 (美式发音 General American)
const arpabetMap = {
  // 元音 (Vowels) - 数字 0,1,2 代表重音，这里我们简化处理，主要映射符号
  "AA": "ɑ", "AA0": "ɑ", "AA1": "ɑ", "AA2": "ɑ",
  "AE": "æ", "AE0": "æ", "AE1": "æ", "AE2": "æ",
  "AH": "ʌ", "AH0": "ə", "AH1": "ʌ", "AH2": "ʌ", // AH0 通常是弱读 schwa
  "AO": "ɔ", "AO0": "ɔ", "AO1": "ɔ", "AO2": "ɔ",
  "AW": "aʊ", "AW0": "aʊ", "AW1": "aʊ", "AW2": "aʊ",
  "AY": "aɪ", "AY0": "aɪ", "AY1": "aɪ", "AY2": "aɪ",
  "EH": "ɛ", "EH0": "ɛ", "EH1": "ɛ", "EH2": "ɛ",
  "ER": "ɝ", "ER0": "ɚ", "ER1": "ɝ", "ER2": "ɝ", // 卷舌音
  "EY": "eɪ", "EY0": "eɪ", "EY1": "eɪ", "EY2": "eɪ",
  "IH": "ɪ", "IH0": "ɪ", "IH1": "ɪ", "IH2": "ɪ",
  "IY": "i", "IY0": "i", "IY1": "i", "IY2": "i",
  "OW": "oʊ", "OW0": "oʊ", "OW1": "oʊ", "OW2": "oʊ",
  "OY": "ɔɪ", "OY0": "ɔɪ", "OY1": "ɔɪ", "OY2": "ɔɪ",
  "UH": "ʊ", "UH0": "ʊ", "UH1": "ʊ", "UH2": "ʊ",
  "UW": "u", "UW0": "u", "UW1": "u", "UW2": "u",
  
  // 辅音 (Consonants)
  "B": "b", "CH": "tʃ", "D": "d", "DH": "ð",
  "F": "f", "G": "g", "HH": "h", "JH": "dʒ",
  "K": "k", "L": "l", "M": "m", "N": "n",
  "NG": "ŋ", "P": "p", "R": "r", "S": "s",
  "SH": "ʃ", "T": "t", "TH": "θ", "V": "v",
  "W": "w", "Y": "j", "Z": "z", "ZH": "ʒ"
};

/**
 * 将 Arpabet 字符串转换为 IPA 字符串
 * @param {string} arpabetString - 例如 "AE1 F R AH0 K AH0"
 * @returns {string} - 例如 "/ˈæfrəkə/"
 */
function convertToIpa(arpabetString) {
  if (!arpabetString) return "";

  const parts = arpabetString.split(" ");
  let ipaString = "";
  let isStressed = false;

  parts.forEach((code) => {
    // 检查是否有重音标记 (数字 1 代表主重音)
    // 注意：标准的 IPA 重音符号 'ˈ' 应该放在音节开头，
    // 但 Arpabet 把重音标在元音上。为了简化，我们检测到 1 时，
    // 在该音素前加重音符号（虽然不完美，但对阅读辅助足够了）
    if (code.includes("1")) {
      ipaString += "ˈ"; 
    }
    
    // 甚至可以在次重音 2 时加 "ˌ"
    if (code.includes("2")) {
      ipaString += "ˌ";
    }

    // 从 Map 中获取对应的 IPA 符号，如果找不到则保留原样
    const ipaChar = arpabetMap[code] || arpabetMap[code.replace(/\d+/, '')] || code;
    
    ipaString += ipaChar;
  });

  return `/${ipaString}/`; // 习惯上用斜杠包裹音标
}

// 获取音标的主函数（带缓存逻辑）
async function getPhonetic(word, wordId, cached) {
  if (!word) return ''

  // 策略：如果音标在 phonetics.json 已存在（通过 cached 参数传入），直接使用，不通过 API 远程获取
  if (cached) {
    // console.log(`✅ 使用已缓存的音标: ${word} -> ${cached}`)
    return cached
  }

  // 只有当 phonetics.json 中不存在时，才从在线 API 获取
  console.log(`🔄 音标不存在，从 API 获取: ${word}`)
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
  <div class="flex flex-col gap-1">
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

    <!-- Irregular verb forms -->
    <div v-if="irregularWordInfo" class="flex flex-col gap-0.5 text-sm">
      <div class="text-slate-500">
        <span class="font-medium">过去式:</span>
        <span class="ml-2 text-slate-600">{{ irregularWordInfo.pasttense.word }}</span>
        <span class="ml-1 text-slate-400 text-xs">{{ irregularWordInfo.pasttense.phonetic }}</span>
      </div>
      <div class="text-slate-500" v-if="irregularWordInfo.pastparticiple">
        <span class="font-medium">过去分词:</span>
        <span class="ml-2 text-slate-600">{{ irregularWordInfo.pastparticiple.word }}</span>
        <span class="ml-1 text-slate-400 text-xs">{{ irregularWordInfo.pastparticiple.phonetic }}</span>
      </div>
    </div>
  </div>
</template>
