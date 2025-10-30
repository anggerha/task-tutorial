import { createRouter, createWebHistory } from "vue-router"
import Login from "@/views/Login.vue"
import Tasks from "@/views/Tasks.vue"
import Tutorials from "@/views/Tutorials.vue"
import EdcPage from "@/views/EdcPage.vue"
import { auth } from "@/services/firebase"
import { onAuthStateChanged } from "firebase/auth"

const routes = [
  { path: "/login", name: "login", component: Login, meta: { public: true } },
  { path: "/", redirect: "/tasks" },
  { path: "/tasks", name: "tasks", component: Tasks },
  { path: "/tutorials", name: "tutorials", component: Tutorials },
  { path: "/edc", name: "edc", component: EdcPage },
]

const router = createRouter({ history: createWebHistory(), routes })

let authResolved = false
router.beforeEach(async (to) => {
  if (to.meta.public) return true
  if (!authResolved) {
    await new Promise((resolve) => {
      const unsub = onAuthStateChanged(auth, () => { authResolved = true; unsub(); resolve() })
    })
  }
  if (!auth.currentUser) return { name: "login", query: { redirect: to.fullPath } }
  return true
})

export default router