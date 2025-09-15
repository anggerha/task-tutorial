<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import { useTaskStore } from "@/stores/tasks"
import { Modal } from "flowbite"

const tasks = useTaskStore()
const STATUS_ORDER = ["inprogress", "done"]

// Delete modal
const toDelete = ref(null)
const deleteModalEl = ref(null)
let deleteModal = null

// Edit modal
const editing = ref({ id: null, title: "", content: "", status: "inprogress" })
const saving = ref(false)
const editModalEl = ref(null)
let editModal = null

onMounted(() => {
  if (deleteModalEl.value) deleteModal = new Modal(deleteModalEl.value, { placement: "center", backdrop: "dynamic", closable: true })
  if (editModalEl.value)   editModal   = new Modal(editModalEl.value,   { placement: "center", backdrop: "dynamic", closable: true })
})
onBeforeUnmount(() => { deleteModal = null; editModal = null })

const grouped = computed(() => ({
  inprogress: tasks.tasks.filter(t => t.status === "inprogress"),
  done:       tasks.tasks.filter(t => t.status === "done"),
}))

async function setStatus(item, status) {
  if (item.id && STATUS_ORDER.includes(status)) await tasks.updateTask(item.id, { status })
}
const canPrev = (item) => STATUS_ORDER.indexOf(item.status) > 0
const canNext = (item) => STATUS_ORDER.indexOf(item.status) < STATUS_ORDER.length - 1
async function prev(item){ const i=STATUS_ORDER.indexOf(item.status); if(i>0) await setStatus(item, STATUS_ORDER[i-1]) }
async function next(item){ const i=STATUS_ORDER.indexOf(item.status); if(i<STATUS_ORDER.length-1) await setStatus(item, STATUS_ORDER[i+1]) }

// Delete flow
function openConfirm(item){ toDelete.value = item; deleteModal?.show() }
function closeConfirm(){ deleteModal?.hide(); toDelete.value = null }
async function confirmRemove(){ if(toDelete.value?.id) await tasks.removeTask(toDelete.value.id); closeConfirm() }

// Edit flow
function openEdit(item){
  editing.value = { id: item.id, title: item.title || "", content: item.content || "", status: item.status || "inprogress" }
  editModal?.show()
}
function closeEdit(){ editModal?.hide(); saving.value = false }
async function saveEdit(){
  if(!editing.value.id) return
  const payload = {
    title: editing.value.title?.trim(),
    content: editing.value.content ?? "",
    status: editing.value.status ?? "inprogress"
  }
  if(!payload.title) return
  saving.value = true
  try { await tasks.updateTask(editing.value.id, payload); closeEdit() }
  finally { saving.value = false }
}
</script>

<template>
  <div class="grid md:grid-cols-2 gap-4">
    <!-- In Progress -->
    <div>
      <h3 class="font-semibold mb-2">In Progress</h3>
      <div v-for="i in grouped.inprogress" :key="i.id" class="bg-white border rounded-lg p-3 mb-2 shadow-sm">
        <div class="flex justify-between items-start gap-3">
          <div>
            <p class="font-medium">{{ i.title }}</p>
            <p class="mt-1 text-sm text-gray-600 whitespace-pre-wrap">{{ i.content }}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button class="text-xs border px-2 py-1 rounded hover:bg-gray-50" :disabled="!canPrev(i)" @click="prev(i)">Prev</button>
            <button class="text-xs border px-2 py-1 rounded hover:bg-gray-50" :disabled="!canNext(i)" @click="next(i)">Next</button>
            <button class="text-xs border px-2 py-1 rounded hover:bg-gray-50" @click="openEdit(i)">Edit</button>
            <button class="text-xs border px-2 py-1 rounded hover:bg-red-50 text-red-600" @click="openConfirm(i)">Hapus</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Done -->
    <div>
      <h3 class="font-semibold mb-2">Done</h3>
      <div v-for="i in grouped.done" :key="i.id" class="bg-white border rounded-lg p-3 mb-2 shadow-sm">
        <div class="flex justify-between items-start gap-3">
          <div>
            <p class="font-medium">{{ i.title }}</p>
            <p class="mt-1 text-sm text-gray-600 whitespace-pre-wrap">{{ i.content }}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button class="text-xs border px-2 py-1 rounded hover:bg-gray-50" :disabled="!canPrev(i)" @click="prev(i)">Prev</button>
            <button class="text-xs border px-2 py-1 rounded hover:bg-gray-50" :disabled="!canNext(i)" @click="next(i)">Next</button>
            <button class="text-xs border px-2 py-1 rounded hover:bg-gray-50" @click="openEdit(i)">Edit</button>
            <button class="text-xs border px-2 py-1 rounded hover:bg-red-50 text-red-600" @click="openConfirm(i)">Hapus</button>
          </div>
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
          <button @click="confirmRemove" class="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2">Ya, hapus</button>
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
          <h3 class="text-lg font-semibold mb-4">Edit Task</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Status</label>
              <select v-model="editing.status" class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                <option value="inprogress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium mb-1">Judul</label>
              <input v-model="editing.title" class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium mb-1">Deskripsi</label>
              <textarea v-model="editing.content" rows="4" class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"></textarea>
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