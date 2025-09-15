import { defineStore } from "pinia"
import { db } from "@/services/firebase"
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, query, where, orderBy, serverTimestamp
} from "firebase/firestore"

export const useTutorialStore = defineStore("tutorials", {
  state: () => ({ tutorials: [], unsub: null }),
  actions: {
    bind(uid) {
      const q = query(
        collection(db, "items"),
        where("uid", "==", uid),
        where("type", "==", "tutorial"),
        orderBy("createdAt", "desc")
      )
      this.unsub?.()
      this.unsub = onSnapshot(q, (snap) => {
        const res = []
        snap.forEach((d) => res.push({ id: d.id, ...d.data() }))
        this.tutorials = res
      })
    },
    unbind() { this.unsub?.(); this.unsub = null; this.tutorials = [] },
    async addTutorial({ title, content, uid }) {
      if (!title?.trim()) return
      await addDoc(collection(db, "items"), {
        type: "tutorial",
        title: title.trim(),
        content: content ?? "",
        uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    },
    async updateTutorial(id, patch) {
      await updateDoc(doc(db, "items", id), { ...patch, updatedAt: serverTimestamp() })
    },
    async removeTutorial(id) { await deleteDoc(doc(db, "items", id)) }
  }
})