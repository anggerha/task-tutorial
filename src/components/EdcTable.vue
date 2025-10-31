<script setup>
import { ref, computed, onMounted, watch } from "vue"
import { useAuthStore } from "@/stores/auth"
import { useEdcStore } from "@/stores/edc"
import { Modal } from "flowbite"

const auth = useAuthStore()
const edc  = useEdcStore()

// Filter & search
const vendor = ref("ALL")      // server-side
const q = ref("")              // client-side

const vendorOptionsFixed = [
  "ALL",
  "PT.PRIMA VISTA SOLUSI",
  "PT. ALTO Network",
  "PT. Artajasa",
  "PT. GPN Persero",
  "Vendor Lainnya",
]

onMounted(async () => {
  const iv = setInterval(async () => {
    if (auth.user?.uid) { await edc.bind(auth.user.uid, vendor.value); clearInterval(iv) }
  }, 150)
})
watch(vendor, async (v) => { if (auth.user?.uid) await edc.setVendor(v) })

const filtered = computed(() => {
  const keyword = q.value.trim().toLowerCase()
  if (!keyword) return edc.list
  return edc.list.filter(d => {
    const values = [ d.nama_uker, d.nama_merchant, d.tid, d.mid, d.vendor, d.nama_user_pemrakarsa ]
    return values.some(v => String(v || "").toLowerCase().includes(keyword))
  })
})

const totalOnPage = computed(() => edc.list.length)
const shownCount  = computed(() => filtered.value.length)

// Modals
const detail = ref(null);   
let detailModal = null;  
const detailModalEl = ref(null)
const edit = ref({
  id: null,
  vendor: "",
  nama_merchant: "",
  tid: "",  
  mid: "",
  alamat_merchant: "",
  nama_uker: "",
  nama_user_pemrakarsa: "",
  pn_user_pemrakarsa: "",
  posisi: "",
  sales_volume: ""
});
let editModal = null;  
const editModalEl = ref(null)
const saving = ref(false)
const delTarget = ref(null); let deleteModal = null; const deleteModalEl  = ref(null)

onMounted(() => {
  if (detailModalEl.value) detailModal = new Modal(detailModalEl.value, { placement:"center", backdrop:"dynamic", closable:true })
  if (editModalEl.value)   editModal   = new Modal(editModalEl.value,   { placement:"center", backdrop:"dynamic", closable:true })
  if (deleteModalEl.value) deleteModal = new Modal(deleteModalEl.value, { placement:"center", backdrop:"dynamic", closable:true })
})

function openDetail(row){ detail.value = row; detailModal?.show() }
function closeDetail(){ detailModal?.hide(); detail.value = null }

function openEdit(row){
  edit.value = {
    id: row.id,
    vendor: row.vendor || "",
    nama_merchant: row.nama_merchant || "",
    tid: row.tid || "",
    mid: row.mid || "",
    alamat_merchant: row.alamat_merchant || "",
    nama_uker: row.nama_uker || "",
    nama_user_pemrakarsa: row.nama_user_pemrakarsa || "",
    pn_user_pemrakarsa: row.pn_user_pemrakarsa || "",
    posisi: row.posisi?.toDate ? row.posisi.toDate().toISOString().slice(0,10) : (row.posisi ? new Date(row.posisi).toISOString().slice(0,10) : ""),
    sales_volume: row.sales_volume ?? ""
  }
  editModal?.show()
}
function closeEdit(){ editModal?.hide(); saving.value = false }

async function saveEdit(){
  if(!edit.value?.id) return
  const p = {
    vendor: edit.value.vendor?.trim(),
    nama_merchant: edit.value.nama_merchant?.trim(),
    tid: edit.value.tid?.trim(),
    mid: edit.value.mid?.trim(),
    alamat_merchant: edit.value.alamat_merchant?.trim(),
    nama_uker: edit.value.nama_uker?.trim(),
    nama_user_pemrakarsa: edit.value.nama_user_pemrakarsa?.trim(),
    pn_user_pemrakarsa: edit.value.pn_user_pemrakarsa?.trim(),
    posisi: edit.value.posisi ? new Date(edit.value.posisi) : null,
    sales_volume: edit.value.sales_volume ? Number(edit.value.sales_volume) : 0
  }
  saving.value = true
  try{
    await edc.updateEdc(edit.value.id, p)
    closeEdit()
    await edc.rebind()
  } finally { saving.value = false }
}

function openDelete(row){ delTarget.value = row; deleteModal?.show() }
function closeDelete(){ deleteModal?.hide(); delTarget.value = null }
async function confirmDelete(){
  if(delTarget.value?.id) await edc.removeEdc(delTarget.value.id)
  closeDelete()
  await edc.rebind()
}
</script>

<template>
  <div class="bg-white border rounded-lg p-4 shadow-sm">
    <!-- Header & Pagination -->
    <div class="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <h2 class="text-lg font-semibold">Daftar EDC</h2>

      <div class="flex items-center gap-3">
        <!-- jumlah data -->
        <span class="text-sm text-gray-600">
          Menampilkan {{ filtered.length }} dari {{ edc.total }} data (halaman {{ edc.page + 1 }})
        </span>

        <!-- tombol pagination -->
        <div class="flex items-center gap-2">
          <button class="border px-3 py-1.5 rounded disabled:opacity-40"
                  :disabled="!edc.hasPrev || edc.loading" @click="edc.loadPage('prev')">‹ Prev</button>
          <button class="border px-3 py-1.5 rounded disabled:opacity-40"
                  :disabled="!edc.hasNext || edc.loading" @click="edc.loadPage('next')">Next ›</button>
        </div>
      </div>
    </div>

    <!-- Filter -->
    <div class="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
      <div>
        <label class="block text-sm font-medium mb-1">Vendor</label>
        <select v-model="vendor" class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5">
          <option v-for="v in vendorOptionsFixed" :key="v" :value="v">{{ v === "ALL" ? "Semua Vendor" : v }}</option>
        </select>
      </div>
      <div class="md:col-span-2">
        <label class="block text-sm font-medium mb-1">Cari</label>
        <input v-model="q" type="search" placeholder="Cari uker/merchant/TID/MID/vendor/user…"
               class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5"/>
      </div>
    </div>

    <!-- Tabel ringkas -->
    <div class="overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50 text-gray-600">
          <tr>
            <th class="text-left px-4 py-2 font-medium">Nama Uker</th>
            <th class="text-left px-4 py-2 font-medium">Nama Merchant</th>
            <th class="text-left px-4 py-2 font-medium">TID</th>
            <th class="text-left px-4 py-2 font-medium">MID</th>
            <th class="text-left px-4 py-2 font-medium">Vendor</th>
            <th class="text-left px-4 py-2 font-medium">User Pemrakarsa</th>
            <th class="text-right px-4 py-2 font-medium">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in filtered" :key="row.id" class="border-t">
            <td class="px-4 py-2">{{ row.nama_uker || "-" }}</td>
            <td class="px-4 py-2">{{ row.nama_merchant || "-" }}</td>
            <td class="px-4 py-2 font-mono">{{ row.tid || "-" }}</td>
            <td class="px-4 py-2 font-mono">{{ row.mid || "-" }}</td>
            <td class="px-4 py-2">{{ row.vendor || "-" }}</td>
            <td class="px-4 py-2">{{ row.nama_user_pemrakarsa || "-" }}</td>
            <td class="px-4 py-2">
              <div class="flex gap-2 justify-end">
                <button class="border px-3 py-1.5 rounded hover:bg-gray-50 hover:text-blue-500 bg-blue-500 text-white" @click="openDetail(row)">Detail</button>
                <button class="border px-3 py-1.5 rounded hover:bg-gray-50 hover:text-green-500 bg-green-500 text-white" @click="openEdit(row)">Ubah</button>
                <button class="border px-3 py-1.5 rounded hover:bg-gray-50 hover:text-red-500 bg-red-500 text-white" @click="openDelete(row)">Hapus</button>
              </div>
            </td>
          </tr>
          <tr v-if="!edc.loading && filtered.length === 0">
            <td colspan="7" class="px-4 py-6 text-center text-gray-500">Tidak ada data</td>
          </tr>
          <tr v-if="edc.loading">
            <td colspan="7" class="px-4 py-6 text-center text-gray-500">Memuat…</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Detail Modal -->
  <div ref="detailModalEl" class="hidden fixed inset-0 z-50 overflow-y-auto overflow-x-hidden">
    <div class="relative p-4 w-full max-w-3xl mx-auto my-12">
      <div class="relative bg-white rounded-lg shadow">
        <button type="button" @click="closeDetail" class="absolute top-3 right-3 text-gray-400 hover:text-gray-600">✕</button>
        <div class="p-6">
          <h3 class="text-lg font-semibold mb-4">Detail EDC</h3>
          <div v-if="detail" class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><span class="text-gray-500">Nama Merchant</span><div class="font-medium">{{ detail.nama_merchant || "-" }}</div></div>
            <div><span class="text-gray-500">Nama Uker</span><div class="font-medium">{{ detail.nama_uker || "-" }}</div></div>
            <div><span class="text-gray-500">TID</span><div class="font-mono">{{ detail.tid || "-" }}</div></div>
            <div><span class="text-gray-500">MID</span><div class="font-mono">{{ detail.mid || "-" }}</div></div>
            <div class="md:col-span-2"><span class="text-gray-500">Alamat Merchant</span><div class="whitespace-pre-wrap">{{ detail.alamat_merchant || "-" }}</div></div>
            <div><span class="text-gray-500">User Pemrakarsa</span><div class="font-medium">{{ detail.nama_user_pemrakarsa || "-" }}</div></div>
            <div><span class="text-gray-500">PN Pemrakarsa</span><div class="font-medium">{{ detail.pn_user_pemrakarsa || "-" }}</div></div>
            <div><span class="text-gray-500">Vendor</span><div class="font-medium">{{ detail.vendor || "-" }}</div></div>
            <div><span class="text-gray-500">Posisi</span><div class="font-medium">
              {{ detail.posisi?.toDate ? detail.posisi.toDate().toLocaleDateString() : (detail.posisi ? new Date(detail.posisi).toLocaleDateString() : "-") }}
            </div></div>
            <div><span class="text-gray-500">Sales Volume</span><div class="font-mono">{{ detail.sales_volume ?? 0 }}</div></div>
            <div><span class="text-gray-500">Dibuat</span><div class="font-medium">{{ detail.createdAt?.toDate ? detail.createdAt.toDate().toLocaleString() : "-" }}</div></div>
            <div><span class="text-gray-500">Diubah</span><div class="font-medium">{{ detail.updatedAt?.toDate ? detail.updatedAt.toDate().toLocaleString() : "-" }}</div></div>
          </div>
          <div class="mt-6 flex justify-end">
            <button @click="closeDetail" class="border px-4 py-2 rounded hover:bg-gray-50">Tutup</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Edit Modal -->
  <div ref="editModalEl" class="hidden fixed inset-0 z-50 overflow-y-auto overflow-x-hidden">
    <div class="relative p-4 w-full max-w-3xl mx-auto my-12">
      <div class="relative bg-white rounded-lg shadow">
        <button type="button" @click="closeEdit" class="absolute top-3 right-3 text-gray-400 hover:text-gray-600">✕</button>
        <div class="p-6">
          <h3 class="text-lg font-semibold mb-4">Ubah Data EDC</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Vendor</label>
              <select v-model="edit.vendor" class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5">
                <option v-for="v in vendorOptionsFixed.filter(x=>x!=='ALL')" :key="v" :value="v">{{ v }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Nama Merchant</label>
              <input v-model="edit.nama_merchant" class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5"/>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">TID</label>
              <input v-model="edit.tid" class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5 font-mono"/>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">MID</label>
              <input v-model="edit.mid" class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5 font-mono"/>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium mb-1">Alamat Merchant</label>
              <textarea v-model="edit.alamat_merchant" rows="2" class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5"></textarea>
            </div>
            <div><label class="block text-sm font-medium mb-1">Nama Uker</label><input v-model="edit.nama_uker" class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5"/></div>
            <div><label class="block text-sm font-medium mb-1">User Pemrakarsa</label><input v-model="edit.nama_user_pemrakarsa" class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5"/></div>
            <div><label class="block text-sm font-medium mb-1">PN Pemrakarsa</label><input v-model="edit.pn_user_pemrakarsa" class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5"/></div>
            <div><label class="block text-sm font-medium mb-1">Posisi (Tanggal)</label><input v-model="edit.posisi" type="date" class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5"/></div>
            <div><label class="block text-sm font-medium mb-1">Sales Volume</label><input v-model="edit.sales_volume" type="number" min="0" class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5"/></div>
          </div>
          <div class="mt-6 flex justify-end gap-2">
            <button @click="closeEdit" class="text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-sm px-5 py-2.5">Batal</button>
            <button @click="saveEdit"
                    :disabled="saving || !edit.vendor?.trim() || !edit.nama_merchant?.trim() || !edit.tid?.trim() || !edit.mid?.trim()"
                    class="text-white bg-blue-600 hover:bg-blue-700 rounded-lg text-sm px-5 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed">
              {{ saving ? "Menyimpan..." : "Simpan" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete Modal -->
  <div ref="deleteModalEl" class="hidden fixed inset-0 z-50 overflow-y-auto overflow-x-hidden">
    <div class="relative p-4 w-full max-w-md mx-auto my-20">
      <div class="relative bg-white rounded-lg shadow">
        <button type="button" @click="closeDelete" class="absolute top-3 right-3 text-gray-400 hover:text-gray-600">✕</button>
        <div class="p-6 text-center">
          <h3 class="mb-5 text-lg font-normal text-gray-700">Hapus data ini?</h3>
          <button @click="confirmDelete" class="text-white bg-red-600 hover:bg-red-700 rounded-lg text-sm px-5 py-2.5 mr-2">Ya, hapus</button>
          <button @click="closeDelete" class="text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-sm px-5 py-2.5">Batal</button>
        </div>
      </div>
    </div>
  </div>
</template>