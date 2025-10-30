<script setup> 
import AppNavbar from './components/AppNavbar.vue';
import { useAuthStore } from "@/stores/auth"

const auth = useAuthStore()
</script>

<template>
  <div class="w-full">
    <AppNavbar v-if="auth.user"/>
  </div>

  <!-- tambahkan padding top setinggi navbar (≈56px) -->
  <main class="pt-14 md:pt-16">
    <router-view />
  </main>
</template>