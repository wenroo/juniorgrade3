<template>
  <div class="quiz-page">
    <div class="container mx-auto pt-50 md:pt-20">
      <h1 class="page-title">答题练习</h1>

      <!-- Tab Navigation -->
      <div class="tab-navigation">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab-button', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <MultipleChoiceQuiz v-if="activeTab === 'multiple-choice'" />
        <ClozeTestQuiz v-if="activeTab === 'cloze-test'" />
        <InitialLetterQuiz v-if="activeTab === 'initial-letter'" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MultipleChoiceQuiz from '@/components/MultipleChoiceQuiz.vue'
import ClozeTestQuiz from '@/components/ClozeTestQuiz.vue'
import InitialLetterQuiz from '@/components/InitialLetterQuiz.vue'

const activeTab = ref('multiple-choice')

const tabs = [
  { id: 'multiple-choice', label: '选择题' },
  { id: 'cloze-test', label: '完形填空' },
  { id: 'initial-letter', label: '首字母填空' }
]
</script>

<style scoped>

.page-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: white;
  text-align: center;
  margin-bottom: 2rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.tab-navigation {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.tab-button {
  padding: 0.75rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.tab-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.tab-button.active {
  background: white;
  color: #667eea;
  border-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.tab-content {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  min-height: 500px;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }

  .tab-button {
    padding: 0.6rem 1.5rem;
    font-size: 1rem;
  }

  .tab-content {
    padding: 1.5rem;
  }
}
</style>
