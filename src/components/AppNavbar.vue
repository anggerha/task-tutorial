<script setup>
import { useAuthStore } from "@/stores/auth"
import { useRouter, useRoute } from "vue-router"
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
async function logout() { await auth.logout(); router.push("/login") }
const isActive = (name) => route.name === name
</script>

<template>
  <nav class="bg-white border-b">
    <div class="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-6">
        <router-link to="/tasks" class="font-medium"
          :class="isActive('tasks') ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'">Tasks</router-link>
        <router-link to="/tutorials" class="font-medium"
          :class="isActive('tutorials') ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'">Tutorials</router-link>
      </div>
      <div class="flex items-center gap-3">
        <span v-if="auth.user" class="text-sm text-gray-600 hidden md:inline">{{ auth.user.email }}</span>
        <button v-if="auth.user" @click="logout" class="text-sm border px-3 py-1.5 rounded hover:bg-gray-50">Logout</button>
      </div>
    </div>
  </nav>
</template>