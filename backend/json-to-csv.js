/**
 * Convert words_26.json to CSV files for Supabase import
 */

const fs = require('fs')
const path = require('path')

console.log('📂 Reading words_26.json...')

// Read the JSON file
const jsonPath = path.join(__dirname, 'words_26.json')
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))

console.log(`✅ Found ${data.length} words`)

// Helper function to escape CSV values
const escapeCSV = (value) => {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

// 1. Generate words_2026.csv (with additional fields)
console.log('\n📝 Generating words_2026.csv...')
const wordsCSV = ['id,word,antonym,info_title,info_body']
data.forEach(item => {
  const antonym = item.antonym || ''
  const infoTitle = item.info?.title || ''
  const infoBody = item.info?.body || ''
  wordsCSV.push(`${item.id},${escapeCSV(item.word)},${escapeCSV(antonym)},${escapeCSV(infoTitle)},${escapeCSV(infoBody)}`)
})
fs.writeFileSync(path.join(__dirname, 'words_2026.csv'), wordsCSV.join('\n'), 'utf8')
console.log(`✅ Created words_2026.csv with ${data.length} rows`)

// 2. Generate translations_2026.csv
console.log('\n📝 Generating translations_2026.csv...')
const translationsCSV = ['word_id,type,translation,used']
let translationCount = 0
data.forEach(item => {
  if (item.translations && Array.isArray(item.translations)) {
    item.translations.forEach(trans => {
      translationsCSV.push(
        `${item.id},${escapeCSV(trans.type)},${escapeCSV(trans.translation)},false`
      )
      translationCount++
    })
  }
})
fs.writeFileSync(path.join(__dirname, 'translations_2026.csv'), translationsCSV.join('\n'), 'utf8')
console.log(`✅ Created translations_2026.csv with ${translationCount} rows`)

// 3. Generate examples_2026.csv
console.log('\n📝 Generating examples_2026.csv...')
const examplesCSV = ['word_id,example']
let exampleCount = 0
data.forEach(item => {
  if (item.examples && Array.isArray(item.examples)) {
    item.examples.forEach(ex => {
      const exampleText = typeof ex === 'string' ? ex : (ex.en || '')
      if (exampleText) {
        examplesCSV.push(`${item.id},${escapeCSV(exampleText)}`)
        exampleCount++
      }
    })
  }
})
fs.writeFileSync(path.join(__dirname, 'examples_2026.csv'), examplesCSV.join('\n'), 'utf8')
console.log(`✅ Created examples_2026.csv with ${exampleCount} rows`)

// 4. Generate phonetics_2026.csv
console.log('\n📝 Generating phonetics_2026.csv...')
const phoneticsCSV = ['word_id,phonetic']
let phoneticCount = 0
data.forEach(item => {
  if (item.phonetic) {
    phoneticsCSV.push(`${item.id},${escapeCSV(item.phonetic)}`)
    phoneticCount++
  }
})
fs.writeFileSync(path.join(__dirname, 'phonetics_2026.csv'), phoneticsCSV.join('\n'), 'utf8')
console.log(`✅ Created phonetics_2026.csv with ${phoneticCount} rows`)

// 5. Generate expand_2026.csv
console.log('\n📝 Generating expand_2026.csv...')
const expandCSV = ['word_id,expand_text']
let expandCount = 0
data.forEach(item => {
  if (item.expand && Array.isArray(item.expand)) {
    item.expand.forEach(expandText => {
      if (expandText) {
        expandCSV.push(`${item.id},${escapeCSV(expandText)}`)
        expandCount++
      }
    })
  }
})
fs.writeFileSync(path.join(__dirname, 'expand_2026.csv'), expandCSV.join('\n'), 'utf8')
console.log(`✅ Created expand_2026.csv with ${expandCount} rows`)

// 6. Generate phrases_2026.csv
console.log('\n📝 Generating phrases_2026.csv...')
const phrasesCSV = ['word_id,phrase_en,phrase_cn']
let phraseCount = 0
data.forEach(item => {
  if (item.phrase && Array.isArray(item.phrase)) {
    item.phrase.forEach(phrase => {
      if (phrase.en && phrase.cn) {
        phrasesCSV.push(`${item.id},${escapeCSV(phrase.en)},${escapeCSV(phrase.cn)}`)
        phraseCount++
      }
    })
  }
})
fs.writeFileSync(path.join(__dirname, 'phrases_2026.csv'), phrasesCSV.join('\n'), 'utf8')
console.log(`✅ Created phrases_2026.csv with ${phraseCount} rows`)

// 7. Generate user_word_status_2026.csv
console.log('\n📝 Generating user_word_status_2026.csv...')
const statusPath = path.join(__dirname, 'user_word_status.json')
let statusCount = 0

// Default user ID for demo/development mode
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000'

try {
  const statusData = JSON.parse(fs.readFileSync(statusPath, 'utf8'))
  const statusCSV = ['user_id,word_id,learned,recite,important,error_count,true_count,last_review,next_review_ts']

  if (statusData.words && Array.isArray(statusData.words)) {
    statusData.words.forEach(item => {
      const s = item.status || {}
      statusCSV.push(
        `${DEFAULT_USER_ID},${item.id},${s.learned || false},${s.recite || false},${s.important || false},${s.error_count || 0},${s.true_count || 0},${escapeCSV(s.last_review || '')},${s.next_review_ts || 0}`
      )
      statusCount++
    })
  }

  fs.writeFileSync(path.join(__dirname, 'user_word_status_2026.csv'), statusCSV.join('\n'), 'utf8')
  console.log(`✅ Created user_word_status_2026.csv with ${statusCount} rows`)
} catch (err) {
  console.log(`⚠️  Could not generate user_word_status_2026.csv: ${err.message}`)
}

console.log('\n🎉 All CSV files generated successfully!')
console.log('\nNext steps:')
console.log('1. Go to Supabase Dashboard')
console.log('2. Import each CSV file to its corresponding table')
console.log('3. Make sure to match column names correctly')
