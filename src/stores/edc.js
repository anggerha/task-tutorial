import { defineStore } from "pinia"
import { db } from "@/services/firebase"
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, query, where, orderBy, serverTimestamp
} from "firebase/firestore"

export const useEdcStore = defineStore("edc", {
  state: () => ({
    list: [],
    unsub: null,
    lastFilter: { uid: null, merk: "ALL" },
  }),
  actions: {
    async addEdc({ uid, nama, merk, tid, mid }) {
      if (!uid) throw new Error("Unauthorized")
      if (!nama?.trim() || !merk?.trim() || !tid?.trim() || !mid?.trim()) {
        throw new Error("Semua field wajib diisi")
      }
      await addDoc(collection(db, "edc"), {
        uid,
        nama: nama.trim(),
        merk: merk.trim(),
        tid: tid.trim(),
        mid: mid.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    },

    async updateEdc(id, patch) {
      await updateDoc(doc(db, "edc", id), { ...patch, updatedAt: serverTimestamp() })
    },

    async removeEdc(id) {
      await deleteDoc(doc(db, "edc", id))
    },

    // Stream data berdasarkan uid + (opsional) merk
    bind(uid, merk = "ALL") {
      this.lastFilter = { uid, merk }
      const base = [
        where("uid", "==", uid),
        orderBy("createdAt", "desc"),
      ]
      // kalau filter merk terpilih
      const filters = merk && merk !== "ALL"
        ? [where("merk", "==", merk)]
        : []

      const q = query(collection(db, "edc"), ...[...base, ...filters])

      this.unsub?.()
      this.unsub = onSnapshot(q, (snap) => {
        const arr = []
        snap.forEach(d => arr.push({ id: d.id, ...d.data() }))
        this.list = arr
      })
    },

    // Re-bind menggunakan filter terakhir (misal setelah edit/hapus)
    rebind() {
      if (this.lastFilter.uid) {
        this.bind(this.lastFilter.uid, this.lastFilter.merk)
      }
    },

    unbind() {
      this.unsub?.()
      this.unsub = null
      this.list = []
    },
  },
})