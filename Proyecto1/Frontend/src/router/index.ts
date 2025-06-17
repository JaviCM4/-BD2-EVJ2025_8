import { createRouter, createWebHistory } from 'vue-router'
import InicioView from '../views/InicioView.vue'
import AspiranteView from '@/views/AspiranteView.vue'
import TopView from '@/views/TopView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: InicioView,
    },
    {
      path: '/aspirante',
      name: 'Aspirante',
      component: AspiranteView
    },
    {
      path: '/top',
      name: 'Top',
      component: TopView
    }
  ],
})

export default router
