import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RegistroView from '@/views/RegistroUsuarioView.vue'
import UsuariosView from '@/views/UsuariosView.vue'
import RegistroVideojuegoView from '@/views/RegistroVideojuegoView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/registro-usuario',
      name: 'registro-usuario',
      component: RegistroView,
    },
    {
      path: '/usuarios',
      name: 'usuarios',
      component: UsuariosView,
    }
    ,
    {
      path: '/registro-videojuego',
      name: 'registro-videojuego',
      component: RegistroVideojuegoView
    }
  ],
})

export default router
