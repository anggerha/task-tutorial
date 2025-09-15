<script setup>
import { onMounted, onBeforeUnmount } from "vue"
import { useAuthStore } from "@/stores/auth"
import { useTutorialStore } from "@/stores/tutorials"
import AppNavbar from "@/components/AppNavbar.vue"
import TutorialForm from "@/components/TutorialForm.vue"
import TutorialList from "@/components/TutorialList.vue"

const auth = useAuthStore()
const tuts = useTutorialStore()

onMounted(() => {
  auth.init()
  const int = setInterval(() => {
    if (auth.user?.uid) { tuts.bind(auth.user.uid); clearInterval(int) }
  }, 150)
})
onBeforeUnmount(() => tuts.unbind())
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <AppNavbar />
    <main class="max-w-5xl mx-auto p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold">Tutorials (Memo)</h1>
        <p class="text-sm text-gray-600">Catatan singkat tanpa status</p>
      </div>
      <TutorialForm />
      <TutorialList />
    </main>
  </div>
</template>