// src/stores/edc.js
import { defineStore } from "pinia"
import { db } from "@/services/firebase"
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  query, where, orderBy, serverTimestamp,
  getDocs, limit, startAfter, getCountFromServer
} from "firebase/firestore"

function toDateOrNull(v){ if(!v && v!==0) return null; const d=v instanceof Date?v:new Date(v); return isNaN(d)?null:d }
function toNumberOrZero(v){ const n=Number(v); return Number.isFinite(n)?n:0 }

export const useEdcStore = defineStore("edc", {
  state: () => ({
    list: [],
    pageSize: 10,
    page: 0,
    cursors: [],              // lastVisible per halaman
    hasNext: false,
    hasPrev: false,
    lastFilter: { uid: null, vendor: "ALL" },
    loading: false,
    total: 0,
  }),

  actions: {
    async refreshTotal(){
      if (!this.lastFilter.uid) { this.total = 0; return }
      const wheres = [ where("owner_uid","==", this.lastFilter.uid) ]
      if (this.lastFilter.vendor && this.lastFilter.vendor !== "ALL") {
        wheres.push(where("vendor","==", this.lastFilter.vendor))
      }
      // hitung total dokumen yang match filter (tanpa orderBy/limit)
      const qRef = query(collection(db,"edc"), ...wheres)
      const snap = await getCountFromServer(qRef)
      this.total = snap.data().count || 0
    },
    // CREATE
    async addEdc(payload = {}){
      const {
        uid,
        vendor = "", nama_merchant = "", tid = "", mid = "",
        alamat_merchant = "", nama_uker = "",
        nama_user_pemrakarsa = "", pn_user_pemrakarsa = "",
        posisi = null, sales_volume = 0,
      } = payload

      if (!uid) throw new Error("Unauthorized")
      if (!vendor?.trim() || !nama_merchant?.trim() || !tid?.trim() || !mid?.trim())
        throw new Error("Wajib: Vendor, Nama Merchant, TID, MID")

      await addDoc(collection(db, "edc"), {
        owner_uid: uid,
        vendor: vendor.trim(),
        nama_merchant: nama_merchant.trim(),
        tid: tid.trim(),
        mid: mid.trim(),

        alamat_merchant: alamat_merchant?.trim?.() || "",
        nama_uker: nama_uker?.trim?.() || "",
        nama_user_pemrakarsa: nama_user_pemrakarsa?.trim?.() || "",
        pn_user_pemrakarsa: pn_user_pemrakarsa?.trim?.() || "",
        posisi: toDateOrNull(posisi),
        sales_volume: toNumberOrZero(sales_volume),

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      await this.refreshTotal()
    },

    // UPDATE
    async updateEdc(id, patch = {}){
      const norm = {}
      const str = [
        "vendor","nama_merchant","tid","mid",
        "alamat_merchant","nama_uker",
        "nama_user_pemrakarsa","pn_user_pemrakarsa",
      ]
      for (const f of str) if (f in patch) norm[f] = patch[f]?.trim?.() ?? patch[f]
      if ("posisi" in patch)       norm.posisi = toDateOrNull(patch.posisi)
      if ("sales_volume" in patch) norm.sales_volume = toNumberOrZero(patch.sales_volume)

      await updateDoc(doc(db, "edc", id), { ...norm, updatedAt: serverTimestamp() })
    },

    // DELETE
    async removeEdc(id){ 
      await deleteDoc(doc(db, "edc", id))
+     await this.refreshTotal()
    },

    // BIND + PAGINATION (server-side by vendor)
    async bind(uid, vendor = "ALL"){
      this.lastFilter = { uid, vendor }
      this.page = 0
      this.cursors = []
      await Promise.all([
        this.loadPage("reset"),
        this.refreshTotal()
      ])
    },

    async setVendor(vendor){
      this.lastFilter.vendor = vendor
      this.page = 0
      this.cursors = []
      await Promise.all([
        this.loadPage("reset"),
        this.refreshTotal()
      ])
    },

    async loadPage(dir = "reset"){
      if (!this.lastFilter.uid) return
      this.loading = true
      try {
        const parts = [ where("owner_uid","==", this.lastFilter.uid), orderBy("createdAt","desc") ]
        if (this.lastFilter.vendor && this.lastFilter.vendor !== "ALL")
          parts.splice(1, 0, where("vendor","==", this.lastFilter.vendor)) // sebelum orderBy

        let qRef = query(collection(db,"edc"), ...parts, limit(this.pageSize + 1))

        if (dir === "next"){
          const cur = this.cursors[this.page]
          if (cur) qRef = query(collection(db,"edc"), ...parts, startAfter(cur), limit(this.pageSize + 1))
        } else if (dir === "prev"){
          // Pergi ke halaman-1: gunakan cursor halaman-2 (jika ada)
          const beforePrev = this.cursors[this.page - 2] || null
          qRef = beforePrev
            ? query(collection(db,"edc"), ...parts, startAfter(beforePrev), limit(this.pageSize + 1))
            : query(collection(db,"edc"), ...parts, limit(this.pageSize + 1))
        }

        const snap = await getDocs(qRef)
        const docs = snap.docs
        this.hasNext = docs.length > this.pageSize
        const pageDocs = this.hasNext ? docs.slice(0, this.pageSize) : docs

        this.list = pageDocs.map(d => ({ id: d.id, ...d.data() }))

        const lastVisible = pageDocs[pageDocs.length - 1] || null
        if (dir === "next"){
          this.page += 1
          this.cursors[this.page - 1] = lastVisible
        } else if (dir === "prev"){
          this.page = Math.max(0, this.page - 1)
          this.cursors[this.page] = lastVisible
        } else {
          this.cursors = []
          this.cursors[0] = lastVisible
          this.page = 0
        }
        this.hasPrev = this.page > 0
      } finally {
        this.loading = false
      }
    },

    rebind(){ return this.bind(this.lastFilter.uid, this.lastFilter.vendor) },

    // no-op untuk kompat di onBeforeUnmount()
    unbind(){
      this.list = []
      this.page = 0
      this.cursors = []
      this.hasNext = false
      this.hasPrev = false
      this.loading = false
    },
  },
})