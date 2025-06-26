import { createRouter, createWebHistory } from 'vue-router'
import RegistroUsuariosView from '@/views/RegistroUsuarioView.vue'
import UsuariosView from '@/views/UsuariosView.vue'
import RegistroVideojuegoView from '@/views/RegistroVideojuegoView.vue'
import VideoJuegosView from '@/views/VideoJuegosView.vue'
import LoginView from '@/views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'iniciar-sesion',
      component: LoginView,
    },
    {
      path: '/registro-usuario',
      name: 'registro-usuario',
      component: RegistroUsuariosView,
    },
    {
      path: '/lista-usuarios',
      name: 'lista-usuarios',
      component: UsuariosView,
    },
    {
      path: '/registro-videojuego',
      name: 'registro-videojuego',
      component: RegistroVideojuegoView,
    },
    {
      path: '/lista-videojuegos',
      name: 'lista-videojuegos',
      component: VideoJuegosView,
    }
  ],
})

export default router
