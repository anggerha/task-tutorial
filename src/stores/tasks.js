import { defineStore } from "pinia"
import { db } from "@/services/firebase"
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, query, where, orderBy, serverTimestamp
} from "firebase/firestore"

export const useTaskStore = defineStore("tasks", {
  state: () => ({ tasks: [], unsub: null }),
  actions: {
    bind(uid) {
      const q = query(
        collection(db, "items"),
        where("uid", "==", uid),
        where("type", "==", "task"),
        orderBy("createdAt", "desc")
      )
      this.unsub?.()
      this.unsub = onSnapshot(q, (snap) => {
        const res = []
        snap.forEach((d) => res.push({ id: d.id, ...d.data() }))
        this.tasks = res
      })
    },
    unbind() { this.unsub?.(); this.unsub = null; this.tasks = [] },
    async addTask({ title, content, uid }) {
      if (!title?.trim()) return
      await addDoc(collection(db, "items"), {
        type: "task",
        title: title.trim(),
        content: content ?? "",
        status: "inprogress",          // default: inprogress
        uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    },
    async updateTask(id, patch) {
      await updateDoc(doc(db, "items", id), { ...patch, updatedAt: serverTimestamp() })
    },
    async removeTask(id) { await deleteDoc(doc(db, "items", id)) }
  }
})