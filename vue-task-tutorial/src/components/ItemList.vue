<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import { useItemStore } from "@/stores/items"
import { Modal } from "flowbite"

const items = useItemStore()

// urutan status
const STATUS_ORDER = ["todo", "inprogress", "done"]

// --- Delete modal state ---
const toDelete = ref(null)
const deleteModalEl = ref(null)
let deleteModal = null

// --- Edit modal state ---
const editing = ref({
  id: null,
  title: "",
  content: "",
  type: "task",
  status: "todo",
})
const saving = ref(false)
const editModalEl = ref(null)
let editModal = null

onMounted(() => {
  if (deleteModalEl.value) {
    deleteModal = new Modal(deleteModalEl.value, {
      placement: "center",
      backdrop: "dynamic",
      closable: true
    })
  }
  if (editModalEl.value) {
    editModal = new Modal(editModalEl.value, {
      placement: "center",
      backdrop: "dynamic",
      closable: true
    })
  }
})

onBeforeUnmount(() => {
  deleteModal = null
  editModal = null
})

const grouped = computed(() => ({
  todo: items.items.filter(i => i.status === "todo"),
  inprogress: items.items.filter(i => i.status === "inprogress"),
  done: items.items.filter(i => i.status === "done"),
}))

async function setStatus(item, status) {
  if (item.id && STATUS_ORDER.includes(status)) {
    await items.update(item.id, { status })
  }
}
function canPrev(item) {
  return STATUS_ORDER.indexOf(item.status) > 0
}
function canNext(item) {
  return STATUS_ORDER.indexOf(item.status) < STATUS_ORDER.length - 1
}
async function prev(item) {
  const idx = STATUS_ORDER.indexOf(item.status)
  if (idx > 0) await setStatus(item, STATUS_ORDER[idx - 1])
}
async function next(item) {
  const idx = STATUS_ORDER.indexOf(item.status)
  if (idx < STATUS_ORDER.length - 1) await setStatus(item, STATUS_ORDER[idx + 1])
}

// --- Delete flow ---
function openConfirm(item) {
  toDelete.value = item
  deleteModal?.show()
}
function closeConfirm() {
  deleteModal?.hide()
  toDelete.value = null
}
async function confirmRemove() {
  if (toDelete.value?.id) await items.remove(toDelete.value.id)
  closeConfirm()
}

// --- Edit flow ---
function openEdit(item) {
  editing.value = {
    id: item.id || null,
    title: item.title || "",
    content: item.content || "",
    type: item.type || "task",
    status: item.status || "todo",
  }
  editModal?.show()
}
function closeEdit() {
  editModal?.hide()
  saving.value = false
  // jangan reset supaya kalau buka lagi masih ada data terakhir (optional)
}
async function saveEdit() {
  if (!editing.value.id) return
  const payload = {
    title: editing.value.title?.trim(),
    content: editing.value.content ?? "",
    type: editing.value.type ?? "task",
    status: editing.value.status ?? "todo",
  }
  if (!payload.title) return // validasi sederhana

  saving.value = true
  try {
    await items.update(editing.value.id, payload)
    closeEdit()
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="grid md:grid-cols-3 gap-4">
    <!-- To-Do -->
    <div>
      <h3 class="font-semibold mb-2">To-Do</h3>
      <div v-for="i in grouped.todo" :key="i.id" class="bg-white border rounded-lg p-3 mb-2 shadow-sm">
        <div class="flex justify-between items-start gap-3">
          <div>
            <p class="text-xs uppercase text-gray-500">{{ i.type }}</p>
            <p class="font-medium">{{ i.title }}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              class="text-xs border px-2 py-1 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              :disabled="!canPrev(i)"
              @click="prev(i)"
              title="Previous status"
            >
              Prev
            </button>
            <button
              class="text-xs border px-2 py-1 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              :disabled="!canNext(i)"
              @click="next(i)"
              title="Next status"
            >
              Next
            </button>
            <button
              class="text-xs border px-2 py-1 rounded hover:bg-gray-50"
              @click="openEdit(i)"
              title="Edit item"
            >
              Edit
            </button>
            <button
              class="text-xs border px-2 py-1 rounded hover:bg-red-50 text-red-600"
              @click="openConfirm(i)"
            >
              Hapus
            </button>
          </div>
        </div>
        <p class="mt-2 text-sm whitespace-pre-wrap">{{ i.content }}</p>
      </div>
    </div>

    <!-- In Progress -->
    <div>
      <h3 class="font-semibold mb-2">In Progress</h3>
      <div v-for="i in grouped.inprogress" :key="i.id" class="bg-white border rounded-lg p-3 mb-2 shadow-sm">
        <div class="flex justify-between items-start gap-3">
          <div>
            <p class="text-xs uppercase text-gray-500">{{ i.type }}</p>
            <p class="font-medium">{{ i.title }}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button class="text-xs border px-2 py-1 rounded hover:bg-gray-50" :disabled="!canPrev(i)" @click="prev(i)">Prev</button>
            <button class="text-xs border px-2 py-1 rounded hover:bg-gray-50" :disabled="!canNext(i)" @click="next(i)">Next</button>
            <button class="text-xs border px-2 py-1 rounded hover:bg-gray-50" @click="openEdit(i)">Edit</button>
            <button class="text-xs border px-2 py-1 rounded hover:bg-red-50 text-red-600" @click="openConfirm(i)">Hapus</button>
          </div>
        </div>
        <p class="mt-2 text-sm whitespace-pre-wrap">{{ i.content }}</p>
      </div>
    </div>

    <!-- Done -->
    <div>
      <h3 class="font-semibold mb-2">Done</h3>
      <div v-for="i in grouped.done" :key="i.id" class="bg-white border rounded-lg p-3 mb-2 shadow-sm">
        <div class="flex justify-between items-start gap-3">
          <div>
            <p class="text-xs uppercase text-gray-500">{{ i.type }}</p>
            <p class="font-medium">{{ i.title }}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button class="text-xs border px-2 py-1 rounded hover:bg-gray-50" :disabled="!canPrev(i)" @click="prev(i)">Prev</button>
            <button class="text-xs border px-2 py-1 rounded hover:bg-gray-50" :disabled="!canNext(i)" @click="next(i)">Next</button>
            <button class="text-xs border px-2 py-1 rounded hover:bg-gray-50" @click="openEdit(i)">Edit</button>
            <button class="text-xs border px-2 py-1 rounded hover:bg-red-50 text-red-600" @click="openConfirm(i)">Hapus</button>
          </div>
        </div>
        <p class="mt-2 text-sm whitespace-pre-wrap">{{ i.content }}</p>
      </div>
    </div>
  </div>

  <!-- Delete Modal -->
  <div ref="deleteModalEl" id="confirmModal" tabindex="-1" aria-hidden="true"
       class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50
              w-full md:inset-0 h-[calc(100%-1rem)] max-h-full justify-center items-center">
    <div class="relative p-4 w-full max-w-md max-h-full mx-auto">
      <div class="relative bg-white rounded-lg shadow">
        <button type="button" @click="closeConfirm"
                class="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
          <span class="sr-only">Close</span> ✕
        </button>

        <div class="p-6 text-center">
          <div class="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-red-600" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.5a.75.75 0 00-1.5 0v5a.75.75 0 001.5 0v-5zM10 14a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd" />
            </svg>
          </div>
          <h3 class="mb-5 text-lg font-normal text-gray-700">
            Hapus <b>{{ toDelete?.title }}</b>?
          </h3>
          <button @click="confirmRemove"
                  class="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none
                         focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2">
            Ya, hapus
          </button>
          <button @click="closeConfirm"
                  class="text-gray-700 bg-white border border-gray-300 hover:bg-gray-50
                         focus:ring-4 focus:outline-none focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5">
            Batal
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Edit Modal -->
  <div ref="editModalEl" id="editModal" tabindex="-1" aria-hidden="true"
       class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50
              w-full md:inset-0 h-[calc(100%-1rem)] max-h-full justify-center items-center">
    <div class="relative p-4 w-full max-w-lg max-h-full mx-auto">
      <div class="relative bg-white rounded-lg shadow">
        <button type="button" @click="closeEdit"
                class="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
          <span class="sr-only">Close</span> ✕
        </button>

        <div class="p-6">
          <h3 class="text-lg font-semibold mb-4">Edit Item</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Jenis</label>
              <select v-model="editing.type"
                      class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                <option value="task">Task</option>
                <option value="tutorial">Tutorial</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Status</label>
              <select v-model="editing.status"
                      class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                <option value="todo">To-Do</option>
                <option value="inprogress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium mb-1">Judul</label>
              <input v-model="editing.title" placeholder="Judul"
                     class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium mb-1">Deskripsi / Catatan</label>
              <textarea v-model="editing.content" rows="4"
                        class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"></textarea>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-2">
            <button @click="closeEdit"
                    class="text-gray-700 bg-white border border-gray-300 hover:bg-gray-50
                           focus:ring-4 focus:outline-none focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5">
              Batal
            </button>
            <button @click="saveEdit" :disabled="saving || !editing.title?.trim()"
                    class="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none
                           focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5
                           disabled:opacity-40 disabled:cursor-not-allowed">
              {{ saving ? "Menyimpan..." : "Simpan" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>