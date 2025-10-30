<script setup>
import { ref } from "vue"
import { useAuthStore } from "@/stores/auth"
import { useEdcStore } from "@/stores/edc"

const auth = useAuthStore()
const edc = useEdcStore()

// form state
const nama = ref("")
const merk = ref("")     // select
const tid  = ref("")
const mid  = ref("")
const saving = ref(false)
const errorMsg = ref("")
const successMsg = ref("")

// daftar merk EDC (silakan tambah sendiri)
const merkOptions = [
    "Ingenico",
    "Verifone",
    "Spectra",
    "PAX",
    "Castles",
    "EDC Lainnya",
]

async function submitEDC() {
    errorMsg.value = ""
    successMsg.value = ""

    if (!auth.user?.uid) { errorMsg.value = "Anda belum login."; return }
    
    saving.value = true
    try {
        await edc.addEdc({
            uid: auth.user.uid,
            nama: nama.value,
            merk: merk.value,
            tid: tid.value,
            mid: mid.value,
        })
        // reset form
        nama.value = ""; merk.value = ""; tid.value = ""; mid.value = ""
        successMsg.value = "Data EDC berhasil disimpan."
    } catch (e) {
        errorMsg.value = e?.message || "Gagal menyimpan data."
    } finally {
        saving.value = false
    }
}
</script>

<template>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Nama EDC -->
        <div>
            <label class="block text-sm font-medium mb-1">Nama EDC</label>
            <input
            v-model="nama"
            placeholder="Contoh: EDC Kasir 1"
            class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
            />
        </div>

        <!-- Merk EDC (Select) -->
        <div>
            <label class="block text-sm font-medium mb-1">Merk EDC</label>
            <select
            v-model="merk"
            class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
            >
            <option value="" disabled>Pilih merk</option>
            <option v-for="m in merkOptions" :key="m" :value="m">{{ m }}</option>
            </select>
        </div>

        <!-- TID -->
        <div>
            <label class="block text-sm font-medium mb-1">TID</label>
            <input
            v-model="tid"
            placeholder="Terminal ID"
            class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
            />
        </div>

        <!-- MID -->
        <div>
            <label class="block text-sm font-medium mb-1">MID</label>
            <input
            v-model="mid"
            placeholder="Merchant ID"
            class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
            />
        </div>

        <!-- Aksi -->
        <div class="md:col-span-2 flex justify-end gap-2">
            <button
            @click="submitEDC"
            :disabled="saving || !nama || !merk || !tid || !mid"
            class="inline-flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 rounded-lg text-sm px-5 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
            {{ saving ? "Menyimpan..." : "Simpan" }}
            </button>
        </div>

        <p v-if="errorMsg" class="md:col-span-2 text-sm text-red-600">{{ errorMsg }}</p>
        <p v-if="successMsg" class="md:col-span-2 text-sm text-green-600">{{ successMsg }}</p>
    </div>
</template>