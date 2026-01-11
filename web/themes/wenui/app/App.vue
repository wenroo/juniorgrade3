<script setup>
import NavBar from './components/NavBar.vue'
import AppFooter from './components/AppFooter.vue'
</script>

<template>
  <div id="app-wrapper">
    <NavBar />

    <main class="app-main">
      <router-view />
    </main>

    <AppFooter />
  </div>
</template>
