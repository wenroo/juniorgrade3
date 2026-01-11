import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/words'
    },
    {
      path: '/words',
      name: 'words',
      component: () => import('../views/WordsPage.vue')
    },
    // {
    //   path: '/irregular',
    //   name: 'irregular',
    //   component: () => import('../views/IrregularPage.vue')
    // },
    // {
    //   path: '/dictation',
    //   name: 'dictation',
    //   component: () => import('../views/DictationPage.vue'),
    //   meta: { mode: 'english' }
    // },
    // {
    //   path: '/dictation-chinese',
    //   name: 'dictationChinese',
    //   component: () => import('../views/DictationPage.vue'),
    //   meta: { mode: 'chinese' }
    // },
    // {
    //   path: '/wrong-words',
    //   name: 'wrongWords',
    //   component: () => import('../views/WrongWordsPage.vue')
    // },
    // {
    //   path: '/quiz',
    //   name: 'quiz',
    //   component: () => import('../views/QuizPage.vue')
    // },
    // {
    //   path: '/settings',
    //   name: 'settings',
    //   component: () => import('../views/SettingsPage.vue')
    // },
    // {
    //   path: '/question-bank-editor',
    //   name: 'questionBankEditor',
    //   component: () => import('../views/QuestionBankEditor.vue')
    // }
  ]
})

export default router
