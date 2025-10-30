<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue"
import { useTutorialStore } from "@/stores/tutorials"
import { Modal } from "flowbite"
import { QuillEditor } from "@vueup/vue-quill"

const tuts = useTutorialStore()

// delete modal
const toDelete = ref(null)
const deleteModalEl = ref(null)
let deleteModal = null

// edit modal
const editing = ref({ id: null, title: "", content: "" })
const saving = ref(false)
const editModalEl = ref(null)
let editModal = null

const toolbar = [
  ["bold", "italic", "underline", "strike"],
  [{ header: 1 }, { header: 2 }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["link", "blockquote", "code-block"],
  ["clean"],
]

onMounted(() => {
  if (deleteModalEl.value) deleteModal = new Modal(deleteModalEl.value, { placement: "center", backdrop: "dynamic", closable: true })
  if (editModalEl.value)   editModal   = new Modal(editModalEl.value,   { placement: "center", backdrop: "dynamic", closable: true })
})
onBeforeUnmount(() => { deleteModal = null; editModal = null })

function openEdit(item){
  editing.value = { id: item.id, title: item.title || "", content: item.content || "" }
  editModal?.show()
}
function closeEdit(){ editModal?.hide(); saving.value = false }
async function saveEdit(){
  if(!editing.value.id) return
  const payload = { title: editing.value.title?.trim(), content: editing.value.content ?? "" }
  if(!payload.title) return
  saving.value = true
  try { await tuts.updateTutorial(editing.value.id, payload); closeEdit() }
  finally { saving.value = false }
}

function openConfirm(item){ toDelete.value = item; deleteModal?.show() }
function closeConfirm(){ deleteModal?.hide(); toDelete.value = null }
async function confirmRemove(){ if(toDelete.value?.id) await tuts.removeTutorial(toDelete.value.id); closeConfirm() }
</script>

<template>
  <div class="grid md:grid-cols-2 gap-4">
    <div v-for="i in tuts.tutorials" :key="i.id" class="bg-white border rounded-lg p-4 shadow-sm">
      <div class="flex justify-between items-start gap-3">
        <div>
          <p class="font-medium">{{ i.title }}</p>
          <div class="mt-1 text-sm text-gray-700" v-html="i.content"></div>
        </div>
        <div class="flex gap-2">
          <button class="text-xs border px-2 py-1 rounded hover:bg-gray-50" @click="openEdit(i)">Edit</button>
          <button class="text-xs border px-2 py-1 rounded hover:bg-red-50 text-red-600" @click="openConfirm(i)">Hapus</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete Modal -->
  <div ref="deleteModalEl" class="hidden fixed inset-0 z-50 overflow-y-auto overflow-x-hidden">
    <div class="relative p-4 w-full max-w-md mx-auto my-20">
      <div class="relative bg-white rounded-lg shadow">
        <button type="button" @click="closeConfirm" class="absolute top-3 right-3 text-gray-400 hover:text-gray-600">✕</button>
        <div class="p-6 text-center">
          <h3 class="mb-5 text-lg font-normal text-gray-700">Hapus <b>{{ toDelete?.title }}</b>?</h3>
          <button @click="confirmRemove" class="text-white bg-red-600 edithover:bg-red-700 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2">Ya, hapus</button>
          <button @click="closeConfirm" class="text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5">Batal</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Edit Modal -->
  <div ref="editModalEl" class="hidden fixed inset-0 z-50 overflow-y-auto overflow-x-hidden">
    <div class="relative p-4 w-full max-w-lg mx-auto my-12">
      <div class="relative bg-white rounded-lg shadow">
        <button type="button" @click="closeEdit" class="absolute top-3 right-3 text-gray-400 hover:text-gray-600">✕</button>
        <div class="p-6">
          <h3 class="text-lg font-semibold mb-4">Edit Memo</h3>
          <div class="grid grid-cols-1 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Judul</label>
              <input v-model="editing.title" class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Isi</label>
              <div class="quill-card">
                <QuillEditor
                  v-model:content="editing.content"
                  content-type="html"
                  theme="snow"
                  :toolbar="toolbar"
                  placeholder="Tulis isi memo di sini…"
                />
              </div>
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-2">
            <button @click="closeEdit" class="text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5">Batal</button>
            <button @click="saveEdit" :disabled="saving || !editing.title?.trim()" class="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed">
              {{ saving ? "Menyimpan..." : "Simpan" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>