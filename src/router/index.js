import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/recite'
    },
    {
      path: '/recite',
      name: 'recite',
      component: () => import('../views/RecitePage.vue')
    },
    {
      path: '/dictation',
      name: 'dictation',
      component: () => import('../views/DictationPage.vue'),
      meta: { mode: 'english' }
    },
    {
      path: '/dictation-chinese',
      name: 'dictationChinese',
      component: () => import('../views/DictationPage.vue'),
      meta: { mode: 'chinese' }
    },
    {
      path: '/wrong-words',
      name: 'wrongWords',
      component: () => import('../views/WrongWordsPage.vue')
    }
  ]
})

export default router
