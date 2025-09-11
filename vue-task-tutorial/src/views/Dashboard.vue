<script setup>
import { onMounted, onBeforeUnmount } from "vue"
import { useAuthStore } from "@/stores/auth"
import { useItemStore } from "@/stores/items"
import AppNavbar from "@/components/AppNavbar.vue"
import ItemForm from "@/components/ItemForm.vue"
import ItemList from "@/components/ItemList.vue"

const auth = useAuthStore()
const items = useItemStore()

onMounted(() => {
  auth.init()
  if (auth.user?.uid) items.bind(auth.user.uid)
  else {
    // jika init terlambat, listen 1x
    const unwatch = setInterval(() => {
      if (auth.user?.uid) { items.bind(auth.user.uid); clearInterval(unwatch) }
    }, 200)
  }
})
onBeforeUnmount(() => items.unbind())
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <AppNavbar />
    <main class="max-w-5xl mx-auto p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold">Dashboard</h1>
        <p class="text-sm text-gray-600">Kelola task & tutorial kamu</p>
      </div>
      <ItemForm />
      <ItemList />
    </main>
  </div>
</template>