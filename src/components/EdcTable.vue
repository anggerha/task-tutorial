<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue"
import { useAuthStore } from "@/stores/auth"
import { useEdcStore } from "@/stores/edc"
import { Modal } from "flowbite"

const auth = useAuthStore()
const edc = useEdcStore()

// === Filter state ===
const merkOptions = ["ALL", "Ingenico", "Verifone", "Spectra", "PAX", "Castles", "EDC Lainnya"]
const merk = ref("ALL")
const q = ref("") // search query (nama/tid/mid)

// stream saat mount (kalau uid sudah ada)
onMounted(() => {
  const iv = setInterval(() => {
    if (auth.user?.uid) { edc.bind(auth.user.uid, merk.value); clearInterval(iv) }
  }, 150)
})
onBeforeUnmount(() => edc.unbind())

// re-bind jika filter merk berubah
watch(merk, (m) => {
  if (auth.user?.uid) edc.bind(auth.user.uid, m)
})

// computed pencarian lokal (client-side)
const filtered = computed(() => {
  const keyword = q.value.trim().toLowerCase()
  if (!keyword) return edc.list
  return edc.list.filter(item => {
    return (
      item.nama?.toLowerCase().includes(keyword) ||
      item.tid?.toLowerCase().includes(keyword) ||
      item.mid?.toLowerCase().includes(keyword) ||
      item.merk?.toLowerCase().includes(keyword)
    )
  })
})

// === DELETE modal ===
const delTarget = ref(null)
const deleteModalEl = ref(null)
let deleteModal = null

// === EDIT modal ===
const editing = ref({ id: null, nama: "", merk: "", tid: "", mid: "" })
const editModalEl = ref(null)
let editModal = null
const saving = ref(false)

onMounted(() => {
  if (deleteModalEl.value) deleteModal = new Modal(deleteModalEl.value, { placement: "center", backdrop: "dynamic", closable: true })
  if (editModalEl.value)   editModal   = new Modal(editModalEl.value,   { placement: "center", backdrop: "dynamic", closable: true })
})
onBeforeUnmount(() => { deleteModal = null; editModal = null })

function openDelete(item) { delTarget.value = item; deleteModal?.show() }
function closeDelete() { deleteModal?.hide(); delTarget.value = null }
async function confirmDelete() {
  if (delTarget.value?.id) await edc.removeEdc(delTarget.value.id)
  closeDelete()
  edc.rebind()
}

function openEdit(item) {
  editing.value = {
    id: item.id,
    nama: item.nama || "",
    merk: item.merk || "",
    tid: item.tid || "",
    mid: item.mid || "",
  }
  editModal?.show()
}
function closeEdit() { editModal?.hide(); saving.value = false }

async function saveEdit() {
  if (!editing.value.id) return
  const payload = {
    nama: editing.value.nama?.trim(),
    merk: editing.value.merk?.trim(),
    tid:  editing.value.tid?.trim(),
    mid:  editing.value.mid?.trim(),
  }
  if (!payload.nama || !payload.merk || !payload.tid || !payload.mid) return
  saving.value = true
  try {
    await edc.updateEdc(editing.value.id, payload)
    closeEdit()
    edc.rebind()
  } finally { saving.value = false }
}
</script>

<template>
  <div class="bg-white border rounded-lg p-4 shadow-sm">
    <div class="mb-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
      <h2 class="text-lg font-semibold">Daftar EDC</h2>
      <div class="flex flex-col md:flex-row gap-3 w-full md:w-auto">
        <select v-model="merk" class="bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5">
          <option v-for="m in merkOptions" :key="m" :value="m">{{ m === "ALL" ? "Semua Merk" : m }}</option>
        </select>
        <input
          v-model="q"
          type="search"
          placeholder="Cari nama/TID/MID…"
          class="bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5 w-full md:w-64"
        />
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50 text-gray-600">
          <tr>
            <th class="text-left px-4 py-2 font-medium">Nama EDC</th>
            <th class="text-left px-4 py-2 font-medium">Merk</th>
            <th class="text-left px-4 py-2 font-medium">TID</th>
            <th class="text-left px-4 py-2 font-medium">MID</th>
            <th class="text-right px-4 py-2 font-medium">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in filtered" :key="row.id" class="border-t">
            <td class="px-4 py-2">{{ row.nama }}</td>
            <td class="px-4 py-2">{{ row.merk }}</td>
            <td class="px-4 py-2 font-mono tracking-tight">{{ row.tid }}</td>
            <td class="px-4 py-2 font-mono tracking-tight">{{ row.mid }}</td>
            <td class="px-4 py-2">
              <div class="flex gap-2 justify-end">
                <button class="border px-3 py-1.5 rounded hover:bg-gray-50" @click="openEdit(row)">Ubah</button>
                <button class="border px-3 py-1.5 rounded hover:bg-red-50 text-red-600" @click="openDelete(row)">Hapus</button>
              </div>
            </td>
          </tr>

          <tr v-if="filtered.length === 0">
            <td colspan="5" class="px-4 py-6 text-center text-gray-500">Tidak ada data</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Delete Modal -->
  <div ref="deleteModalEl" class="hidden fixed inset-0 z-50 overflow-y-auto overflow-x-hidden">
    <div class="relative p-4 w-full max-w-md mx-auto my-20">
      <div class="relative bg-white rounded-lg shadow">
        <button type="button" @click="closeDelete" class="absolute top-3 right-3 text-gray-400 hover:text-gray-600">✕</button>
        <div class="p-6 text-center">
          <h3 class="mb-5 text-lg font-normal text-gray-700">
            Hapus <b>{{ delTarget?.nama }}</b>?
          </h3>
          <button @click="confirmDelete" class="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300 rounded-lg text-sm px-5 py-2.5 mr-2">
            Ya, hapus
          </button>
          <button @click="closeDelete" class="text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 rounded-lg text-sm px-5 py-2.5">
            Batal
          </button>
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
          <h3 class="text-lg font-semibold mb-4">Ubah Data EDC</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium mb-1">Nama EDC</label>
              <input v-model="editing.nama" class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Merk EDC</label>
              <select v-model="editing.merk" class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5">
                <option v-for="m in merkOptions.filter(x=>x!=='ALL')" :key="m" :value="m">{{ m }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">TID</label>
              <input v-model="editing.tid" class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5 font-mono" />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium mb-1">MID</label>
              <input v-model="editing.mid" class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5 font-mono" />
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-2">
            <button @click="closeEdit" class="text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 rounded-lg text-sm px-5 py-2.5">Batal</button>
            <button @click="saveEdit" :disabled="saving || !editing.nama?.trim() || !editing.merk?.trim() || !editing.tid?.trim() || !editing.mid?.trim()"
                    class="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 rounded-lg text-sm px-5 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed">
              {{ saving ? "Menyimpan..." : "Simpan" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>