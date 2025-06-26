<template>
    <v-app-bar height="80" color="teal-darken-4" image="https://www.awd-it.co.uk/media/.renditions/wysiwyg/8BidBv6.jpeg">
        <template v-slot:prepend>
            <v-btn icon @click.stop="drawer = !drawer">
                <v-icon>mdi-view-headline</v-icon>
            </v-btn>
        </template>

        <v-app-bar-title>Xela-Gamer</v-app-bar-title>
        
        <v-spacer></v-spacer>
        
        <!-- Mostrar información del usuario si está logueado -->
        <div v-if="isLoggedIn" class="text-white mr-4">
            <v-chip color="cyan-accent-2" text-color="black" size="small">
                <v-icon start>mdi-account</v-icon>
                {{ username }}
            </v-chip>
            <v-btn icon @click="logout" class="ml-2">
                <v-icon>mdi-logout</v-icon>
            </v-btn>
        </div>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" temporary>
        <v-divider></v-divider>

        <v-list>
            <!-- Elementos para usuarios no logueados -->
            <template v-if="!isLoggedIn">
                <v-list-item to="/" title="Iniciar Sesión" prepend-icon="mdi-login" router></v-list-item>
            </template>
            
            <!-- Elementos para rol 1 (Admin) -->
            <template v-if="userRole === '1'">
                <v-list-item to="/registro-usuario" title="Registro Usuario" prepend-icon="mdi-account-plus" router></v-list-item>
                <v-list-item to="/lista-usuarios" title="Lista de Usuarios" prepend-icon="mdi-account-multiple" router></v-list-item>
                <v-list-item to="/Registro-videojuego" title="Registro Videojuego" prepend-icon="mdi-gamepad-variant" router></v-list-item>
            </template>

            <v-list-item to="/lista-videojuegos" title="Videojuegos" prepend-icon="mdi-gamepad" router></v-list-item>

            <!-- Separador y opción de cerrar sesión para usuarios logueados -->
            <template v-if="isLoggedIn">
                <v-divider class="my-2"></v-divider>
                <v-list-item @click="logout" title="Cerrar Sesión" prepend-icon="mdi-logout" class="text-red-accent-2"></v-list-item>
            </template>
        </v-list>
    </v-navigation-drawer>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
    setup() {
        const drawer = ref(null)
        const router = useRouter()
        
        // Estados reactivos para el usuario
        const userId = ref('')
        const username = ref('')
        const userEmail = ref('')
        const userRole = ref('')
        
        // Computed properties
        const isLoggedIn = computed(() => {
            return !!userId.value && !!username.value
        })
        
        // Función para cargar datos del usuario desde localStorage
        const loadUserData = () => {
            userId.value = localStorage.getItem('userId') || ''
            username.value = localStorage.getItem('username') || ''
            userEmail.value = localStorage.getItem('userEmail') || ''
            userRole.value = localStorage.getItem('userRol') || ''
        }
        
        // Función para logout
        const logout = () => {
            // Limpiar localStorage
            localStorage.removeItem('userId')
            localStorage.removeItem('username')
            localStorage.removeItem('userEmail')
            localStorage.removeItem('userRol')
            
            // Limpiar estados reactivos
            userId.value = ''
            username.value = ''
            userEmail.value = ''
            userRole.value = ''
            
            // Cerrar drawer
            drawer.value = false
            
            // Redireccionar al login
            router.push('/')
        }
        
        // Cargar datos del usuario al montar el componente
        onMounted(() => {
            loadUserData()
            
            // Escuchar el evento de login exitoso
            window.addEventListener('user-logged-in', loadUserData)
        })
        
        // Limpiar el listener al desmontar el componente
        onUnmounted(() => {
            window.removeEventListener('user-logged-in', loadUserData)
        })
        
        // Función para actualizar datos del usuario (se puede llamar desde otros componentes)
        const updateUserData = () => {
            loadUserData()
        }
        
        return {
            drawer,
            userId,
            username,
            userEmail,
            userRole,
            isLoggedIn,
            logout,
            updateUserData
        }
    }
}
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
.v-chip {
    font-weight: 600;
}

.text-red-accent-2 {
    color: rgb(255, 82, 82) !important;
}
</style>