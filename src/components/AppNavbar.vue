<script setup>
import { useAuthStore } from "@/stores/auth"
import { useRouter } from "vue-router"
const auth = useAuthStore()
const router = useRouter()
async function logout() {
  await auth.logout()
  router.push("/login")
}
</script>

<template>
  <nav class="bg-white border-b">
    <div class="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
      <a href="/" class="flex items-center gap-2">
        <img src="https://flowbite.s3.amazonaws.com/logo.svg" class="h-6" alt="logo" />
        <span class="font-semibold">Tasks & Tutorials</span>
      </a>
      <div class="flex items-center gap-3">
        <span v-if="auth.user" class="text-sm text-gray-600 hidden md:inline">{{ auth.user.email }}</span>
        <button v-if="auth.user" @click="logout"
                class="text-sm border px-3 py-1.5 rounded hover:bg-gray-50">Logout</button>
      </div>
    </div>
  </nav>
</template>