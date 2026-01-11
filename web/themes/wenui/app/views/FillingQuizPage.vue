<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    <div class="container mx-auto px-4 py-8">
      <div class="flex gap-6">
        <FilterSidebarFilling
          :active-filters="activeFilters"
          :available-sources="availableSources"
          @filter-change="handleFilterChange"
        />
        <div class="flex-1">
          <div class="bg-white rounded-xl shadow-lg p-8">
            <div class="mb-6">
              <h1 class="text-3xl font-bold text-slate-800 mb-2">填空题练习</h1>
              <p class="text-slate-600">共 {{ totalQuestions }} 题 | 当前显示 {{ currentQuestions.length }} 题</p>
            </div>
            <div v-if="isLoading" class="text-center py-12">
              <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p class="mt-4 text-slate-600">加载题目中...</p>
            </div>
            <div v-else-if="filteredQuestions.length === 0" class="text-center py-12">
              <p class="text-slate-600 text-lg">没有找到符合条件的题目</p>
            </div>
            <div v-else>
              <div v-for="(question, index) in currentQuestions" :key="question.library_id" class="mb-8">
                <div class="border-b pb-4 mb-4">
                  <span class="text-sm font-semibold text-blue-600">题目 {{ currentQuestionIndex + index + 1 }}</span>
                  <span class="ml-4 text-sm text-slate-500">类型: {{ question.question_type === 'complete' ? '选择填空' : '输入填空' }}</span>
                  <span v-if="question.library_from" class="ml-4 text-sm text-slate-500">来源: {{ question.library_from }}</span>
                </div>
                <div class="prose max-w-none mb-6" v-html="question.content"></div>
                <div v-if="question.question_type === 'complete'" class="space-y-4">
                  <div v-for="blank in question.blanks" :key="blank.blank_id" class="bg-slate-50 rounded-lg p-4">
                    <h4 class="font-semibold mb-3">空格 {{ blank.blank_id }}:</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <button v-for="(option, optIndex) in blank.alternatives" :key="optIndex" @click="selectAnswer(question.library_id, blank.blank_id, option)" :class="getOptionClass(question.library_id, blank.blank_id, option, blank.correct_word)" class="p-3 rounded-lg border-2 transition-all text-left">{{ option }}</button>
                    </div>
                  </div>
                </div>
                <div v-if="question.question_type === 'fill'" class="space-y-4">
                  <div v-for="blank in question.blanks" :key="blank.blank_id" class="bg-slate-50 rounded-lg p-4">
                    <h4 class="font-semibold mb-3">空格 {{ blank.blank_id }}:</h4>
                    <div class="flex gap-3">
                      <input type="text" v-model="userAnswers[question.library_id]?.[blank.blank_id]" @keyup.enter="checkFillAnswer(question.library_id, blank.blank_id, blank.correct_word)" :disabled="answerStatus[question.library_id]?.[blank.blank_id] !== undefined" class="flex-1 p-3 border-2 rounded-lg focus:outline-none focus:border-blue-500" placeholder="请输入答案..." />
                      <button v-if="answerStatus[question.library_id]?.[blank.blank_id] === undefined" @click="checkFillAnswer(question.library_id, blank.blank_id, blank.correct_word)" class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">提交</button>
                    </div>
                    <div v-if="answerStatus[question.library_id]?.[blank.blank_id] !== undefined" class="mt-3">
                      <div v-if="answerStatus[question.library_id][blank.blank_id]" class="text-green-600 font-semibold">✓ 正确！</div>
                      <div v-else class="text-red-600"><p class="font-semibold">✗ 错误</p><p class="text-sm mt-1">正确答案: {{ blank.correct_word.join(' / ') }}</p></div>
                    </div>
                  </div>
                </div>
