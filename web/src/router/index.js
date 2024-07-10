import { createRouter, createWebHistory } from 'vue-router'
import LogsView from '../views/LogsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/logs/:id',
      name: 'logs',
      component: LogsView
    }
  ]
})

export default router
