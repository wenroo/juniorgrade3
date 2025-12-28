<script setup>
// NavBar使用router-link进行导航
</script>

<template>
  <nav class="main-menu">
    <div class="container mx-auto px-4">
      <div class="flex flex-col lg:flex-row justify-between items-center">
        <div class="py-3">
          <img src="../assets/logo.svg" alt="BILL爱背单词" class="w-50 h-auto" />
        </div>
        <div class="menu">
          <router-link
            to="/recite"
            class="menu-item"
            active-class="menu-item-active">
            背诵模式
          </router-link>
          <router-link
            to="/dictation"
            class="menu-item"
            active-class="menu-item menu-item-active">
            英文默写
          </router-link>
          <router-link
            to="/dictation-chinese"
            class="menu-item"
            disabled
            active-class="menu-item menu-item-active">
            中文默写
          </router-link>          
          <router-link
            to="/dictation-chinese"
            class="menu-item"
            disabled
            active-class="menu-item menu-item-active">
            首字母填空
          </router-link>
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
