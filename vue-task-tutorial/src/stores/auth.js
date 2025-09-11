import { defineStore } from "pinia"
import { auth, provider } from "@/services/firebase"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "firebase/auth"

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    loading: false,
    error: null
  }),
  actions: {
    init() {
      onAuthStateChanged(auth, (u) => { this.user = u })
    },
    async loginEmail(email, password) {
      this.loading = true; this.error = null
      try {
        await signInWithEmailAndPassword(auth, email, password)
      } catch (e) {
        this.error = e?.message || "Login gagal"
      } finally { this.loading = false }
    },
    async registerEmail(email, password) {
      this.loading = true; this.error = null
      try {
        await createUserWithEmailAndPassword(auth, email, password)
      } catch (e) {
        this.error = e?.message || "Registrasi gagal"
      } finally { this.loading = false }
    },
    async loginGoogle() {
      this.loading = true; this.error = null
      try {
        await signInWithPopup(auth, provider)
      } catch (e) {
        this.error = e?.message || "Login Google gagal"
      } finally { this.loading = false }
    },
    async logout() { await signOut(auth) }
  }
})