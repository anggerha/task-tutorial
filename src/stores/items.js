import { defineStore } from "pinia"
import { db } from "@/services/firebase"
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, query, orderBy, where, serverTimestamp
} from "firebase/firestore"

export const useItemStore = defineStore("items", {
  state: () => ({
    items: [],
    unsub: null
  }),
  actions: {
    bind(uid) {
      const q = query(
        collection(db, "items"),
        where("uid", "==", uid),
        orderBy("createdAt", "desc")
      )
      this.unsub?.()
      this.unsub = onSnapshot(q, (snap) => {
        const res = []
        snap.forEach((d) => res.push({ id: d.id, ...d.data() }))
        this.items = res
      })
    },
    unbind() {
      this.unsub?.()
      this.unsub = null
      this.items = []
    },
    async add(item) {
      await addDoc(collection(db, "items"), {
        ...item,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    },
    async update(id, patch) {
      await updateDoc(doc(db, "items", id), {
        ...patch,
        updatedAt: serverTimestamp()
      })
    },
    async remove(id) { await deleteDoc(doc(db, "items", id)) }
  }
})