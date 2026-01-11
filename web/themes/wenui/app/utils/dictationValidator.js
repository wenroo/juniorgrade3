/**
 * 听写答案验证工具
 * 提供统一的答案验证逻辑，避免代码重复
 */

/**
 * 验证听写答案是否正确
 * @param {Object} params - 验证参数
 * @param {Object} params.item - 单词对象
 * @param {string} params.userAnswer - 用户答案
 * @param {number} params.selectedTransIndex - 选中的翻译索引（中文模式使用）
 * @param {string} params.mode - 模式：'english' 或 'chinese'
 * @returns {boolean} 是否正确
 */
export const validateAnswer = ({ item, userAnswer, selectedTransIndex, mode }) => {
  if (!item || !userAnswer) return false

  const userVal = userAnswer.trim()
  if (userVal.length < 1) return false

  if (mode === 'chinese') {
    // 中文默写：检查选中的翻译
    if (selectedTransIndex === null || selectedTransIndex === undefined) return false

    const selectedTrans = item.translations?.[selectedTransIndex]
    if (!selectedTrans) return false

    const correctAnswer = selectedTrans.translation

    // 如果用户输入长度为1，使用精确匹配逻辑
    if (userVal.length === 1) {
      // 将正确答案用 ',' 和 ';' 分割成数组
      const answerParts = correctAnswer.split(/[,;]/).map(part => part.trim())
      // 检查用户输入是否完全匹配任意一个分段
      return answerParts.includes(userVal)
    }

    // 如果用户输入长度大于等于2，使用 indexOf 模糊匹配逻辑
    return correctAnswer.indexOf(userVal) !== -1
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

/**
 * 计算状态更新
 * @param {Object} currentStatus - 当前单词状态
 * @param {boolean} isCorrect - 是否回答正确
 * @returns {Object|null} 需要更新的状态对象，如果不需要更新则返回 null
 */
export const calculateStatusUpdate = (currentStatus, isCorrect) => {
  if (!isCorrect || !currentStatus) return null

  const statusUpdates = {}

  if (!currentStatus.recite) {
    // 情况1: recite=false，回答正确
    statusUpdates.learned = true
    statusUpdates.true_count = (currentStatus.true_count || 0) + 1
  } else {
    // 情况2: recite=true，回答正确
    const newTrueCount = (currentStatus.true_count || 0) + 1
    statusUpdates.true_count = newTrueCount

    // 当 true_count 达到 3 时，重置错题状态
    if (newTrueCount >= 3) {
      statusUpdates.recite = false
      statusUpdates.true_count = 0
      statusUpdates.error_count = 0
      statusUpdates.learned = true
    }
  }

  // 添加最后复习时间
  if (Object.keys(statusUpdates).length > 0) {
    statusUpdates.last_review = new Date().toISOString()
    return statusUpdates
  }

  return null
}
