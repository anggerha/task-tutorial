<script setup>
import { ref } from "vue"
import { useAuthStore } from "@/stores/auth"
import { useTutorialStore } from "@/stores/tutorials"
import { QuillEditor } from "@vueup/vue-quill"

const title = ref("")
const content = ref("") // HTML dari editor
const auth = useAuthStore()
const tuts = useTutorialStore()

// Toolbar yang ringkas (silakan ubah sesuai selera)
const toolbar = [
  ["bold", "italic", "underline", "strike"],
  [{ header: 1 }, { header: 2 }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["link", "blockquote", "code-block"],
  ["clean"],
]

async function submitForm() {
  if (!auth.user) return
  await tuts.addTutorial({
    title: title.value,
    content: content.value,
    uid: auth.user.uid,
  })
  title.value = ""
  content.value = ""
}
</script>

<template>
  <div class="bg-white border rounded-lg p-4 mb-6 shadow-sm">
    <h2 class="text-lg font-semibold mb-4">Tambah Memo</h2>

    <div class="space-y-4">
      <!-- Judul -->
      <div>
        <label class="block text-sm font-medium mb-1">Judul memo</label>
        <input
          v-model="title"
          placeholder="Judul memo"
          class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
        />
      </div>

      <!-- Editor WYSIWYG -->
      <div>
        <label class="block text-sm font-medium mb-1">Isi</label>
        <div class="quill-card">
          <QuillEditor
            v-model:content="content"
            content-type="html"
            theme="snow"
            :toolbar="toolbar"
            placeholder="Tulis isi memo di sini…"
          />
        </div>
      </div>

      <!-- Aksi -->
      <div class="flex justify-end">
        <button
          @click="submitForm"
          class="inline-flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 rounded-lg text-sm px-5 py-2.5"
        >
          Simpan
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Biar Quill menyatu dengan kartu & tidak “berantakan” */
.quill-card :deep(.ql-toolbar) {
  border: 1px solid rgb(209 213 219);        /* border-gray-300 */
  border-bottom: 0;
  border-top-left-radius: 0.5rem;            /* rounded-t-lg */
  border-top-right-radius: 0.5rem;
  background: rgb(249 250 251);              /* bg-gray-50 */
}
.quill-card :deep(.ql-container) {
  border: 1px solid rgb(209 213 219);
  border-bottom-left-radius: 0.5rem;         /* rounded-b-lg */
  border-bottom-right-radius: 0.5rem;
  min-height: 160px;
}
.quill-card :deep(.ql-editor) {
  min-height: 120px;
}
</style>