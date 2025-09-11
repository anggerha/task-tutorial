import { createRouter, createWebHistory } from "vue-router"
import Login from "@/views/Login.vue"
import Dashboard from "@/views/Dashboard.vue"
import { auth } from "@/services/firebase"
import { onAuthStateChanged } from "firebase/auth"

const routes = [
  { path: "/login", name: "login", component: Login, meta: { public: true } },
  { path: "/", name: "dashboard", component: Dashboard }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

let authResolved = false

router.beforeEach(async (to) => {
  if (to.meta.public) return true
  if (!authResolved) {
    await new Promise((resolve) => {
      const unsub = onAuthStateChanged(auth, () => {
        authResolved = true
        unsub()
        resolve()
      })
    })
  }
  if (!auth.currentUser) {
    return { name: "login", query: { redirect: to.fullPath } }
  }
  return true
})

export default router