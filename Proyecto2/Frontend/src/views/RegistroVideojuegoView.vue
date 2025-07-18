<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from 'axios'

// Interfaces
interface GameFormData {
  titulo: string
  genero: string
  desarrollador: string
}

interface Snackbar {
  show: boolean
  message: string
  color: string
}

// No configuramos baseURL para usar el proxy de Vite

// Refs
const form = ref<any>(null)
const valid = ref(false)
const loading = ref(false)

const formData = ref<GameFormData>({
  titulo: '',
  genero: '',
  desarrollador: ''
})

const snackbar = ref<Snackbar>({
  show: false,
  message: '',
  color: 'success'
})

// Opciones de géneros predefinidos
const generos = [
  'Acción',
  'Aventura',
  'RPG',
  'Estrategia',
  'Simulación',
  'Deportes',
  'Carreras',
  'Puzzle',
  'Terror',
  'Shooter',
  'Plataformas',
  'Indie',
  'Multijugador',
  'Otro'
]

// Reglas de validación
const tituloRules = [
  (v: string) => !!v || 'El título es obligatorio',
  (v: string) => (v && v.length >= 2) || 'Mínimo 2 caracteres',
  (v: string) => (v && v.length <= 100) || 'Máximo 100 caracteres'
]

const generoRules = [
  (v: string) => !!v || 'El género es obligatorio'
]

const desarrolladorRules = [
  (v: string) => !!v || 'El desarrollador es obligatorio',
  (v: string) => (v && v.length >= 2) || 'Mínimo 2 caracteres',
  (v: string) => (v && v.length <= 50) || 'Máximo 50 caracteres'
]

const submitForm = async (): Promise<void> => {
  if (form.value.validate()) {
    loading.value = true
    
    try {
      // Preparar datos para enviar a la API
      const gameData = {
        title: formData.value.titulo,
        genre: formData.value.genero,
        developer: formData.value.desarrollador
      }

      // Enviar datos a la API
      const response = await axios.post('/api/juegos', gameData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000 // 10 segundos de timeout
      })

      // Manejar respuesta exitosa
      if (response.status === 200 || response.status === 201) {
        snackbar.value = {
          show: true,
          message: `¡Videojuego "${formData.value.titulo}" registrado exitosamente!`,
          color: 'success'
        }
        
        resetForm()
      }
      
    } catch (error: any) {
      console.error('Error al registrar videojuego:', error)
      
      let errorMessage = 'Error al registrar el videojuego. Inténtalo de nuevo.'
      
      // Manejar diferentes tipos de errores
      if (error.response) {
        // El servidor respondió con un código de error
        const status = error.response.status
        const data = error.response.data
        
        switch (status) {
          case 400:
            errorMessage = data.message || 'Datos inválidos. Verifica la información.'
            break
          case 401:
            errorMessage = 'No autorizado. Verifica tus credenciales.'
            break
          case 403:
            errorMessage = 'No tienes permisos para realizar esta acción.'
            break
          case 404:
            errorMessage = 'Endpoint no encontrado. Verifica la URL de la API.'
            break
          case 409:
            errorMessage = 'El videojuego ya existe en la base de datos.'
            break
          case 500:
            errorMessage = 'Error interno del servidor. Inténtalo más tarde.'
            break
          default:
            errorMessage = data.message || `Error del servidor (${status})`
        }
      } else if (error.request) {
        // No se recibió respuesta del servidor
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.'
      } else if (error.code === 'ECONNABORTED') {
        // Timeout
        errorMessage = 'La petición tardó demasiado. Inténtalo de nuevo.'
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
  formData.value = {
    titulo: '',
    genero: '',
    desarrollador: ''
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
                  mdi-gamepad-variant-outline
                </v-icon>
                <h1 class="text-h4 font-weight-bold text-white mb-2">
                  Registro de Videojuegos
                </h1>
                <p class="text-subtitle-1 text-cyan-accent-2 mb-0">
                  Panel de administración
                </p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Formulario de registro -->
        <v-row justify="center">
          <v-col cols="12" md="10" lg="8">
            <v-card elevation="16" class="rounded-xl glass-card">
              <v-card-title class="text-h5 font-weight-bold gaming-gradient text-white pa-6">
                <v-icon class="mr-3" color="white">mdi-controller-classic</v-icon>
                Información del Videojuego
              </v-card-title>
              
              <v-card-text class="pa-8 card-content">
                <v-form ref="form" v-model="valid" lazy-validation>
                  <v-row>
                    <!-- Título -->
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="formData.titulo"
                        :rules="tituloRules"
                        label="Título del Videojuego"
                        prepend-icon="mdi-format-title"
                        variant="outlined"
                        density="compact"
                        color="cyan-accent-2"
                        required
                        :loading="loading"
                        class="gaming-input"
                        placeholder="Ej: The Legend of Zelda"
                      ></v-text-field>
                    </v-col>

                    <!-- Género -->
                    <v-col cols="12" md="6">
                      <v-select
                        v-model="formData.genero"
                        :rules="generoRules"
                        :items="generos"
                        label="Género"
                        prepend-icon="mdi-tag-outline"
                        variant="outlined"
                        density="compact"
                        color="cyan-accent-2"
                        required
                        :loading="loading"
                        class="gaming-input"
                      ></v-select>
                    </v-col>

                    <!-- Desarrollador -->
                    <v-col cols="12">
                      <v-text-field
                        v-model="formData.desarrollador"
                        :rules="desarrolladorRules"
                        label="Desarrollador/Estudio"
                        prepend-icon="mdi-domain"
                        variant="outlined"
                        density="compact"
                        color="cyan-accent-2"
                        required
                        :loading="loading"
                        class="gaming-input"
                        placeholder="Ej: Nintendo"
                      ></v-text-field>
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
                      Limpiar Formulario
                    </v-btn>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-btn
                      block
                      size="large"
                      color="cyan-accent-2"
                      @click="submitForm"
                      :disabled="!valid"
                      :loading="loading"
                      class="gaming-btn gaming-btn-primary"
                    >
                      <v-icon start>mdi-gamepad-variant</v-icon>
                      Registrar Videojuego
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

.gaming-input :deep(.v-select__selection-text) {
  color: white !important;
}

.gaming-input :deep(.v-field__input textarea) {
  color: white !important;
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

/* Efectos para inputs focus */
.gaming-input :deep(.v-field--focused .v-field__outline) {
  --v-field-border-color: #00e5ff;
  --v-field-border-width: 2px;
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
}
</style>