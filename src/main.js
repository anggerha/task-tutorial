import { createApp } from "vue"
import { createPinia } from "pinia"
import App from "./App.vue"
import router from "./router"
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import 'bootstrap-icons/font/bootstrap-icons.css'

// Tailwind + Flowbite
import "./assets/main.css"
import "flowbite"

// init app
const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount("#app")