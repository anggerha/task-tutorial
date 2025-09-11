<script setup>
import { ref } from "vue"
import { useAuthStore } from "@/stores/auth"
import { useItemStore } from "@/stores/items"

const type = ref("task")
const title = ref("")
const content = ref("")
const status = ref("todo")
const auth = useAuthStore()
const items = useItemStore()

async function submitForm() {
  if (!auth.user) return
  if (!title.value.trim()) return
  await items.add({
    type: type.value,
    title: title.value,
    content: content.value,
    status: status.value,
    uid: auth.user.uid
  })
  type.value = "task"; title.value = ""; content.value = ""; status.value = "todo"
}
</script>

<template>
  <div class="bg-white border rounded-lg p-4 mb-6 shadow-sm">
    <h2 class="font-semibold mb-3">Tambah Item</h2>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
      <select v-model="type" class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
        <option value="task">Task</option>
        <option value="tutorial">Tutorial</option>
      </select>
      <input v-model="title" placeholder="Judul"
             class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"/>
      <select v-model="status" class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
        <option value="todo">To-Do</option>
        <option value="inprogress">In Progress</option>
        <option value="done">Done</option>
      </select>
      <button @click="submitForm"
              class="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5">
        Simpan
      </button>
    </div>
    <label class="block mt-3 text-sm font-medium">Deskripsi / Catatan</label>
    <textarea v-model="content" rows="3"
              class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"></textarea>
  </div>
</template>