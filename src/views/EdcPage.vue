<script setup>
import { onMounted, onBeforeUnmount } from "vue"
import { useAuthStore } from "@/stores/auth"
import { useEdcStore } from "@/stores/edc"
import EdcForm from "@/components/EdcForm.vue"
import EdcTable from "@/components/EdcTable.vue"

const auth = useAuthStore()
const edc = useEdcStore()

onMounted(() => {
  auth.init()
  const int = setInterval(() => {
    if (auth.user?.uid) { edc.bind(auth.user.uid); clearInterval(int) }
  }, 150)
})
onBeforeUnmount(() => edc.unbind())
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <main class="max-w-5xl mx-auto p-6 space-y-6">
        <h1 class="text-2xl font-bold">Data EDC</h1>
        <EdcForm />
        <EdcTable />
    </main>
  </div>
</template>