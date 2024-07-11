import { createRouter, createWebHistory } from 'vue-router'
import LogsView from '../views/LogsView.vue'
import ContainersView from '../views/ContainersView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/logs/:id',
      name: 'logs',
      component: LogsView
    },
    {
      path: '/',
      name: 'containers',
      component: ContainersView
    }
  ]
})

export default router
