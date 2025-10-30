<script setup> 
import AppNavbar from './components/AppNavbar.vue';
import { useAuthStore } from "@/stores/auth"

const auth = useAuthStore()
</script>

<template>
  <AppNavbar v-if="auth.user"/>
  <router-view />
</template>