<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import logoSvg from '../../logo.svg'

const route = useRoute()

// 检查是否在听写页面（包括英文和中文模式）
const isDictationActive = computed(() => {
  return route.path === '/dictation' || route.path === '/dictation-chinese'
})
</script>

<template>
  <nav class="main-menu">
    <div class="container mx-auto md:px-4">
      <div class="grid grid-cols-12">
        <div class="py-3 col-span-6 md:col-span-3 pl-4 md:pl-0">
          <img :src="logoSvg" alt="BILL爱背单词" class="w-50 h-auto" />
        </div>
        <!-- <div class="tools md:order-last col-span-6 md:col-span-1 flex items-center justify-end pr-4 md:pr-0 gap-2">
          <router-link
            to="/settings"
            class="menu-item"
            active-class="menu-item menu-item-active">
            设置
          </router-link>
          <router-link
            to="/question-bank-editor"
            class="menu-item"
            active-class="menu-item menu-item-active">
            加题
          </router-link>
        </div> -->
        <div class="menu  col-span-12  md:col-span-8">
          <router-link
            to="/words"
            class="inline-flex items-center px-1 pt-1 border-b-2 text-base font-medium transition-colors duration-200"
            active-class="border-indigo-500 text-gray-900"
            exact-active-class="border-indigo-500 text-gray-900"
            :class="[$route.path.startsWith('/words') ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300']"
          >
            单词背诵
          </router-link>
          <!-- <router-link
            to="/irregular"
            class="menu-item"
            active-class="menu-item menu-item-active">
            不规则动词
          </router-link> -->
          <router-link
            to="/dictation"
            class="menu-item"
            :class="{ 'menu-item-active': isDictationActive }">
            单词默写
          </router-link>
          <router-link
            to="/quiz"
            class="menu-item"
            active-class="menu-item-active">
            答题练习
          </router-link> -->
          <!-- <router-link
            to="/wrong-words"
            class="menu-item"
            active-class="menu-item menu-item-active">
            错题本
          </router-link> -->
        </div>

      </div>
    </div>
  </nav>


</template>
