<script setup>
import { useAuthStore } from "@/stores/auth"
import { useRouter, useRoute } from "vue-router"
import AppSidebar from "./AppSidebar.vue"

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

async function logout() { 
  await auth.logout(); router.push("/login") 
}
</script>

<template>
  <nav class="fixed top-0 z-50 bg-gradient-to-r from-blue-800/90 to-orange-500/90 w-full">
    <div class="mx-auto px-4 py-3 flex items-center justify-between backdrop-blur-sm">
      <div class="flex items-center gap-6">
        <app-sidebar />
      </div>
      <div class="flex items-center gap-3">
        <span v-if="auth.user" class="text-sm text-white hidden md:inline">{{ auth.user.email }}</span>
        <button v-if="auth.user" @click="logout" class="text-sm text-white border px-3 py-1.5 rounded hover:bg-red-700">Logout</button>
      </div>
    </div>
  </nav>
</template>