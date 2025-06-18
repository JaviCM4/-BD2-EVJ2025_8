import { createRouter, createWebHistory } from 'vue-router'
import InicioView from '../views/InicioView.vue'
import GeneralView from '@/views/GeneralView.vue'
import HistorialView from '@/views/HistorialView.vue'
import AjustesView from '@/views/AjustesView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: InicioView,
    },
    {
      path: '/general',
      name: 'General',
      component: GeneralView,
    },
    {
      path: '/historial',
      name: 'Historial',
      component: HistorialView,
    },
    {
      path: '/ajustes',
      name: 'Ajustes',
      component: AjustesView,
    }
  ],
})

export default router
