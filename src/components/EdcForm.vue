<script setup>
import { ref } from "vue"
import { useAuthStore } from "@/stores/auth"
import { useEdcStore } from "@/stores/edc"

const auth = useAuthStore()
const edc  = useEdcStore()

// wajib
const vendor = ref("")
const nama_merchant = ref("")
const tid = ref("")
const mid = ref("")

// opsional
const alamat_merchant = ref("")
const nama_uker = ref("")
const nama_user_pemrakarsa = ref("")
const pn_user_pemrakarsa = ref("")
const posisi = ref("")          // YYYY-MM-DD
const sales_volume = ref("")

const saving = ref(false)
const err = ref("")
const ok  = ref("")

const vendorOptions = [
  "PT.PRIMA VISTA SOLUSI",
  "PT. ALTO Network",
  "PT. Artajasa",
  "PT. GPN Persero",
  "Vendor Lainnya",
]

async function submitEDC(){
  err.value = ""; ok.value = ""
  if (!auth.user?.uid) { err.value = "Anda belum login."; return }
  saving.value = true
  try{
    await edc.addEdc({
      uid: auth.user.uid,
      vendor: vendor.value,
      nama_merchant: nama_merchant.value,
      tid: tid.value,
      mid: mid.value,

      alamat_merchant: alamat_merchant.value,
      nama_uker: nama_uker.value,
      nama_user_pemrakarsa: nama_user_pemrakarsa.value,
      pn_user_pemrakarsa: pn_user_pemrakarsa.value,
      posisi: posisi.value ? new Date(posisi.value) : null,
      sales_volume: sales_volume.value ? Number(sales_volume.value) : 0,
    })

    // reset
    vendor.value = ""; nama_merchant.value = ""; tid.value = ""; mid.value = ""
    alamat_merchant.value = ""; nama_uker.value = ""
    nama_user_pemrakarsa.value = ""; pn_user_pemrakarsa.value = ""
    posisi.value = ""; sales_volume.value = ""
    ok.value = "Data EDC berhasil disimpan."
  }catch(e){
    err.value = e?.message || "Gagal menyimpan."
  }finally{
    saving.value = false
  }
}
</script>

<template>
  <div class="bg-white border rounded-lg p-4 shadow-sm">
    <h2 class="text-lg font-semibold mb-4">Form Data EDC</h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium mb-1">Vendor</label>
        <select v-model="vendor" class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5">
          <option value="" disabled>Pilih vendor</option>
          <option v-for="v in vendorOptions" :key="v" :value="v">{{ v }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Nama Merchant</label>
        <input v-model="nama_merchant" class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5"/>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">TID</label>
        <input v-model="tid" class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5 font-mono" placeholder="Terminal ID"/>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">MID</label>
        <input v-model="mid" class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5 font-mono" placeholder="Merchant ID"/>
      </div>

      <div class="md:col-span-2">
        <label class="block text-sm font-medium mb-1">Alamat Merchant</label>
        <textarea v-model="alamat_merchant" rows="2" class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5"></textarea>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Nama Uker</label>
        <input v-model="nama_uker" class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5"/>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Nama User Pemrakarsa</label>
        <input v-model="nama_user_pemrakarsa" class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5"/>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">PN User Pemrakarsa</label>
        <input v-model="pn_user_pemrakarsa" class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5"/>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Posisi (Tanggal)</label>
        <input v-model="posisi" type="date" class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5"/>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Sales Volume</label>
        <input v-model="sales_volume" type="number" min="0" class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5" placeholder="0"/>
      </div>

      <div class="md:col-span-2 flex justify-end">
        <button
          @click="submitEDC"
          :disabled="saving || !vendor || !nama_merchant || !tid || !mid"
          class="inline-flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 rounded-lg text-sm px-5 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed">
          {{ saving ? "Menyimpan..." : "Simpan" }}
        </button>
      </div>

      <p v-if="err" class="md:col-span-2 text-sm text-red-600">{{ err }}</p>
      <p v-if="ok" class="md:col-span-2 text-sm text-green-600">{{ ok }}</p>
    </div>
  </div>
</template>