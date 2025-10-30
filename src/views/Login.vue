<script setup>
import { ref, onMounted } from "vue"
import { useRouter, useRoute } from "vue-router"
import { useAuthStore } from "@/stores/auth"

const email = ref("")
const password = ref("")
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

onMounted(() => auth.init())

async function onLogin() {
  await auth.loginEmail(email.value, password.value)
  if (!auth.error) router.push(route.query.redirect || "/")
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="w-full max-w-md bg-white border rounded-lg p-6 shadow-sm">
      <h1 class="text-2xl font-bold mb-1">Welcome back</h1>
      <p class="text-sm text-gray-600 mb-6">Login to track your tasks & tutorials</p>

      <div class="space-y-4">
        <div>
          <label class="block mb-2 text-sm font-medium">Email</label>
          <input v-model="email" type="email"
                 class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                 placeholder="you@example.com"/>
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium">Password</label>
          <input v-model="password" type="password"
                 class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                 placeholder="••••••••"/>
        </div>
        <button @click="onLogin"
                class="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5">
          Login
        </button>
      </div>

      <p v-if="auth.error" class="text-red-600 mt-4 text-sm">{{ auth.error }}</p>
    </div>
  </div>
</template>