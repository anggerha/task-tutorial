<script setup>
import { onMounted, onBeforeUnmount } from "vue"
import { useAuthStore } from "@/stores/auth"
import { useTaskStore } from "@/stores/tasks"
import AppNavbar from "@/components/AppNavbar.vue"
import TaskForm from "@/components/TaskForm.vue"
import TaskBoard from "@/components/TaskBoard.vue"

const auth = useAuthStore()
const tasks = useTaskStore()

onMounted(() => {
  auth.init()
  const int = setInterval(() => {
    if (auth.user?.uid) { tasks.bind(auth.user.uid); clearInterval(int) }
  }, 150)
})
onBeforeUnmount(() => tasks.unbind())
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <AppNavbar />
    <main class="max-w-5xl mx-auto p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold">Tasks</h1>
        <p class="text-sm text-gray-600">Kelola task dengan status In Progress & Done</p>
      </div>
      <TaskForm />
      <TaskBoard />
    </main>
  </div>
</template>