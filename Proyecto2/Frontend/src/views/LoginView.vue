<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

// Interfaces
interface LoginData {
  username: string
  password_hash: string
}

interface Snackbar {
  show: boolean
  message: string
  color: string
}

// Router
const router = useRouter()

// Refs
const form = ref<any>(null)
const valid = ref(false)
const loading = ref(false)
const showPassword = ref(false)

const loginData = ref<LoginData>({
  username: '',
  password_hash: ''
})

const snackbar = ref<Snackbar>({
  show: false,
  message: '',
  color: 'success'
})

// Reglas de validación
const usernameRules = [
  (v: string) => !!v || 'El username es obligatorio',
  (v: string) => (v && v.length >= 3) || 'Mínimo 3 caracteres',
  (v: string) => (v && v.length <= 20) || 'Máximo 20 caracteres',
  (v: string) => /^[a-zA-Z0-9_]+$/.test(v) || 'Solo letras, números y guiones bajos'
]

const passwordRules = [
  (v: string) => !!v || 'La contraseña es obligatoria',
  (v: string) => (v && v.length >= 8) || 'Mínimo 8 caracteres'
]

// Función para emitir evento personalizado para actualizar la navegación
const notifyLoginSuccess = () => {
  // Emitir evento personalizado que puede ser escuchado por otros componentes
  window.dispatchEvent(new CustomEvent('user-logged-in'))
}

const submitLogin = async (): Promise<void> => {
  if (form.value.validate()) {
    loading.value = true
    
    try {
      console.log('Enviando datos de login:', {
        username: loginData.value.username,
        password_hash: '[PROTECTED]'
      })

      const requestData = {
        username: loginData.value.username,
        password_hash: loginData.value.password_hash
      }

      // Llamada a la API
      const response = await axios.post('/api/login', requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })

      console.log('Respuesta del login:', response.data)
      
      // Guardar datos de usuario en localStorage
      if (response.data.id) {
        localStorage.setItem('userId', response.data.id)
        localStorage.setItem('username', response.data.username)
        localStorage.setItem('userEmail', response.data.email)
        localStorage.setItem('userRol', response.data.rol)
        
        // Notificar que el usuario se ha logueado exitosamente
        notifyLoginSuccess()
      }
      
      snackbar.value = {
        show: true,
        message: '¡Inicio de sesión exitoso! Redirigiendo...',
        color: 'success'
      }
      
      // Redireccionar según el rol del usuario
      setTimeout(() => {
        const userRole = response.data.rol
        router.push('/lista-videojuegos')
      }, 1500)
      
    } catch (error: any) {
      console.error('Error en el login:', error)
      
      let errorMessage = 'Error al iniciar sesión. Verifica tu username y contraseña.'
      
      if (error.response) {
        console.log('Status:', error.response.status)
        console.log('Data:', error.response.data)
        console.log('Headers:', error.response.headers)
        
        if (error.response.data?.message) {
          errorMessage = error.response.data.message
        } else if (error.response.data?.errores && Array.isArray(error.response.data.errores)) {
          errorMessage = error.response.data.errores.join(', ')
        } else {
          switch (error.response.status) {
            case 400:
              errorMessage = 'Datos de login inválidos. Verifica el formato de username y contraseña.'
              break
            case 401:
              errorMessage = 'Credenciales incorrectas. Verifica tu username y contraseña.'
              break
            case 404:
              errorMessage = 'Usuario no encontrado.'
              break
            case 422:
              errorMessage = 'Datos de validación incorrectos. Verifica los campos.'
              break
            case 500:
              errorMessage = 'Error del servidor. Intenta más tarde.'
              break
            default:
              errorMessage = `Error ${error.response.status}: ${error.response.statusText}`
          }
        }
      } else if (error.request) {
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.'
        console.log('Request:', error.request)
      } else {
        console.log('Error:', error.message)
        errorMessage = 'Error de configuración: ' + error.message
      }
      
      snackbar.value = {
        show: true,
        message: errorMessage,
        color: 'error'
      }
    } finally {
      loading.value = false
    }
  }
}

const resetForm = (): void => {
  form.value.reset()
  form.value.resetValidation()
  loginData.value = {
    username: '',
    password_hash: ''
  }
}
</script>

<template>
  <v-app>
    <v-main class="gaming-background">
      <div class="background-overlay"></div>
      <v-container fluid class="pa-8 position-relative">
        <!-- Título principal -->
        <v-row justify="center" class="mb-6">
          <v-col cols="12" md="8" lg="6">
            <v-card
              class="mx-auto elevation-12 glass-card"
              color="rgba(26, 35, 126, 0.9)"
            >
              <v-card-text class="text-center py-8">
                <v-icon size="64" color="cyan-accent-2" class="mb-4">
                  mdi-login-variant
                </v-icon>
                <h1 class="text-h4 font-weight-bold text-white mb-2">
                  Iniciar Sesión
                </h1>
                <p class="text-subtitle-1 text-cyan-accent-2 mb-0">
                  Accede a tu cuenta gamer
                </p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Formulario de login -->
        <v-row justify="center">
          <v-col cols="12" md="8" lg="6">
            <v-card elevation="16" class="rounded-xl glass-card">
              <v-card-title class="text-h5 font-weight-bold gaming-gradient text-white pa-6">
                <v-icon class="mr-3" color="white">mdi-account-key</v-icon>
                Credenciales de Acceso
              </v-card-title>
              
              <v-card-text class="pa-8 card-content">
                <v-form ref="form" v-model="valid" lazy-validation>
                  <v-row>
                    <!-- Username -->
                    <v-col cols="12">
                      <v-text-field
                        v-model="loginData.username"
                        :rules="usernameRules"
                        label="Nombre de Usuario (Gamer Tag)"
                        prepend-icon="mdi-account-outline"
                        variant="outlined"
                        density="comfortable"
                        color="cyan-accent-2"
                        required
                        :loading="loading"
                        class="gaming-input"
                      ></v-text-field>
                    </v-col>

                    <!-- Contraseña -->
                    <v-col cols="12">
                      <v-text-field
                        v-model="loginData.password_hash"
                        :rules="passwordRules"
                        :type="showPassword ? 'text' : 'password'"
                        label="Contraseña"
                        prepend-icon="mdi-lock-outline"
                        :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                        @click:append="showPassword = !showPassword"
                        variant="outlined"
                        density="comfortable"
                        color="cyan-accent-2"
                        required
                        :loading="loading"
                        class="gaming-input"
                      ></v-text-field>
                    </v-col>

                    <!-- Enlace de ¿Olvidaste tu contraseña? -->
                    <v-col cols="12" class="text-right">
                      <v-btn
                        variant="text"
                        color="cyan-accent-2"
                        size="small"
                        class="text-none"
                      >
                        ¿Olvidaste tu contraseña?
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-form>
              </v-card-text>

              <!-- Botones de acción -->
              <v-card-actions class="pa-8 pt-0 card-content">
                <v-row>
                  <v-col cols="12" md="6">
                    <v-btn
                      block
                      size="large"
                      variant="outlined"
                      color="cyan-accent-2"
                      @click="resetForm"
                      :disabled="loading"
                      class="gaming-btn"
                    >
                      <v-icon start>mdi-refresh</v-icon>
                      Limpiar
                    </v-btn>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-btn
                      block
                      size="large"
                      color="cyan-accent-2"
                      @click="submitLogin"
                      :disabled="!valid"
                      :loading="loading"
                      class="gaming-btn gaming-btn-primary"
                    >
                      <v-icon start>mdi-login</v-icon>
                      Iniciar Sesión
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- Snackbar para notificaciones -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="4000"
      location="top"
    >
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="snackbar.show = false"
        >
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<style scoped>
.gaming-background {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%);
  background-attachment: fixed;
  position: relative;
}

.gaming-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(120, 219, 255, 0.1) 0%, transparent 50%);
  background-size: 100% 100%;
  pointer-events: none;
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(45deg, transparent 49%, rgba(0, 255, 255, 0.03) 50%, transparent 51%),
    linear-gradient(-45deg, transparent 49%, rgba(255, 0, 255, 0.03) 50%, transparent 51%);
  background-size: 60px 60px;
  animation: backgroundMove 20s linear infinite;
  pointer-events: none;
}

@keyframes backgroundMove {
  0% { background-position: 0 0, 0 0; }
  100% { background-position: 60px 60px, -60px 60px; }
}

.position-relative {
  position: relative;
  z-index: 1;
}

.glass-card {
  background: rgba(24, 34, 148, 0.15) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.card-content {
  background: rgba(22, 22, 54, 0.8);
  backdrop-filter: blur(10px);
}

.gaming-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%) !important;
}

.gaming-input {
  margin-bottom: 8px;
}

.gaming-input :deep(.v-field__input) {
  color: white !important;
}

.gaming-input :deep(.v-label) {
  color: rgba(255, 255, 255, 0.7) !important;
}

.gaming-input :deep(.v-field--variant-outlined .v-field__outline) {
  --v-field-border-color: rgba(0, 255, 255, 0.3);
}

.gaming-input :deep(.v-field--variant-outlined:hover .v-field__outline) {
  --v-field-border-color: rgba(0, 255, 255, 0.6);
}

.gaming-input :deep(.v-field__field) {
  background: rgba(15, 15, 35, 0.5) !important;
}

.gaming-btn {
  border-radius: 12px;
  text-transform: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.gaming-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 255, 255, 0.3);
}

.gaming-btn-primary {
  background: linear-gradient(135deg, #00e5ff 0%, #00b0ff 100%) !important;
  color: #0f0f23 !important;
}

.gaming-input :deep(.v-field--focused .v-field__outline) {
  --v-field-border-color: #00e5ff;
  --v-field-border-width: 2px;
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
}

:deep(.v-divider) {
  border-color: rgba(255, 255, 255, 0.2) !important;
}

:deep(.v-btn--variant-text) {
  color: rgba(0, 229, 255, 0.8) !important;
}

:deep(.v-btn--variant-text:hover) {
  background: rgba(0, 229, 255, 0.1) !important;
}
</style>