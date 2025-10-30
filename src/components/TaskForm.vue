<script setup>
import { ref } from "vue"
import { useAuthStore } from "@/stores/auth"
import { useTaskStore } from "@/stores/tasks"

const title = ref("")
const content = ref("")
const auth = useAuthStore()
const tasks = useTaskStore()

async function submitForm() {
  if (!auth.user) return
  await tasks.addTask({ title: title.value, content: content.value, uid: auth.user.uid })
  title.value = ""; content.value = ""
}
</script>

<template>
  <div class="bg-white border rounded-lg p-4 mb-6 shadow-sm">
    <h2 class="font-semibold mb-3">Tambah Task</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
      <input v-model="title" placeholder="Judul task" class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"/>
      <input v-model="content" placeholder="Deskripsi singkat (opsional)" class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"/>
      <button @click="submitForm" class="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5">
        Simpan
      </button>
    </div>
  </div>
</template>