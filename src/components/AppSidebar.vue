<script setup>
import { initFlowbite } from 'flowbite'
import { useRouter, useRoute } from "vue-router"
import { onMounted } from 'vue'

const router = useRouter()
const route = useRoute()
const isActive = (name) => route.name === name

onMounted(() => {
  initFlowbite()
})
</script>

<template>
    <div>
        <!-- drawer init and show -->
        <div class="text-center">
            <button type="button" data-drawer-target="drawer-navigation" data-drawer-show="drawer-navigation" aria-controls="drawer-navigation">
                <span class="text-white font-bold text-2xl">SOKA</span>
            </button>
        </div>

        <!-- drawer component -->
        <div id="drawer-navigation" class="fixed top-0 left-0 z-[60] w-64 h-screen p-4 transition-transform -translate-x-full bg-white dark:bg-gray-800" tabindex="-1" aria-labelledby="drawer-navigation-label">
            <h5 id="drawer-navigation-label" class="text-base font-semibold text-black uppercase dark:text-gray-400">Menu</h5>
            <button type="button" data-drawer-hide="drawer-navigation" aria-controls="drawer-navigation" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 absolute top-2.5 end-2.5 inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" >
                <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                <span class="sr-only">Close menu</span>
            </button>
            <div class="py-4 overflow-y-auto">
                <ul class="space-y-2 font-medium">
                    <li>
                        <router-link to="/tasks" >
                            <a href="#" class="flex gap-2 items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                                <span class="font-medium" :class="isActive('tasks') ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'">
                                    <i class="bi bi-list-task w-5 h-5 transition duration-75 dark:text-gray-400 group-hover:text-orange-500 dark:group-hover:text-white"></i>
                                    Tasks
                                </span>
                            </a>
                        </router-link>
                    </li>
                    <li>
                        <router-link to="/tutorials">
                            <a href="#" class="flex gap-2 items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                                <span class="font-medium" :class="isActive('tutorials') ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'">
                                    <i class="bi bi-bookmark-fill w-5 h-5 transition duration-75 dark:text-gray-400 group-hover:text-orange-500 dark:group-hover:text-white"></i>
                                    Tutorials
                                </span>
                            </a>
                        </router-link>
                    </li>
                    <li>
                        <router-link to="/edc">
                            <a href="#" class="flex gap-2 items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                                <span class="font-medium" :class="isActive('edc') ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'">
                                    <i class="bi bi-android2 w-5 h-5 transition duration-75 dark:text-gray-400 group-hover:text-orange-500 dark:group-hover:text-white"></i>
                                    EDC
                                </span>
                            </a>
                        </router-link>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>