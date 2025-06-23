<script setup lang="ts">
import { ref, computed } from 'vue'

// Interfaces
interface FormData {
  username: string
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

interface Snackbar {
  show: boolean
  message: string
  color: string
}

// Refs
const form = ref<any>(null)
const valid = ref(false)
const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const formData = ref<FormData>({
  username: '',
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const snackbar = ref<Snackbar>({
  show: false,
  message: '',
  color: 'success'
})

// Reglas de validación
const usernameRules = [
  (v: string) => !!v || 'El gamer tag es obligatorio',
  (v: string) => (v && v.length >= 3) || 'Mínimo 3 caracteres',
  (v: string) => (v && v.length <= 20) || 'Máximo 20 caracteres',
  (v: string) => /^[a-zA-Z0-9_]+$/.test(v) || 'Solo letras, números y guiones bajos'
]

const nameRules = [
  (v: string) => !!v || 'Este campo es obligatorio',
  (v: string) => (v && v.length >= 2) || 'Mínimo 2 caracteres',
  (v: string) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(v) || 'Solo letras y espacios'
]

const emailRules = [
  (v: string) => !!v || 'El email es obligatorio',
  (v: string) => /.+@.+\..+/.test(v) || 'Email no válido'
]

const passwordRules = [
  (v: string) => !!v || 'La contraseña es obligatoria',
  (v: string) => (v && v.length >= 8) || 'Mínimo 8 caracteres',
  (v: string) => /(?=.*[a-z])/.test(v) || 'Debe contener al menos una minúscula',
  (v: string) => /(?=.*[A-Z])/.test(v) || 'Debe contener al menos una mayúscula',
  (v: string) => /(?=.*\d)/.test(v) || 'Debe contener al menos un número'
]

// Computed
const confirmPasswordRules = computed(() => [
  (v: string) => !!v || 'Confirma tu contraseña',
  (v: string) => v === formData.value.password || 'Las contraseñas no coinciden'
])

const submitForm = async (): Promise<void> => {
  if (form.value.validate()) {
    loading.value = true
    
    // Simular llamada a API
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      snackbar.value = {
        show: true,
        message: `¡Gamer ${formData.value.username} registrado exitosamente en GameReviews!`,
        color: 'success'
      }
      
      resetForm()
    } catch (error) {
      snackbar.value = {
        show: true,
        message: 'Error al registrar. Inténtalo de nuevo.',
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
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
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
                  mdi-account-plus-outline
                </v-icon>
                <h1 class="text-h4 font-weight-bold text-white mb-2">
                  Registro de Usuario
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
                <v-icon class="mr-3" color="white">mdi-gamepad-variant</v-icon>
                Información del Usuario
              </v-card-title>
              
              <v-card-text class="pa-8 card-content">
                <v-form ref="form" v-model="valid" lazy-validation>
                  <v-row>
                    <!-- Username -->
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="formData.username"
                        :rules="usernameRules"
                        label="Nombre de Usuario (Gamer Tag)"
                        prepend-icon="mdi-account-outline"
                        variant="outlined"
                        density="compact"
                        color="cyan-accent-2"
                        required
                        :loading="loading"
                        class="gaming-input"
                      ></v-text-field>
                    </v-col>

                    <!-- Email -->
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="formData.email"
                        :rules="emailRules"
                        label="Correo Electrónico"
                        prepend-icon="mdi-email-outline"
                        variant="outlined"
                        density="compact"
                        color="cyan-accent-2"
                        type="email"
                        required
                        :loading="loading"
                        class="gaming-input"
                      ></v-text-field>
                    </v-col>

                    <!-- Nombres -->
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="formData.firstName"
                        :rules="nameRules"
                        label="Nombres"
                        prepend-icon="mdi-account-circle-outline"
                        variant="outlined"
                        density="compact"
                        color="cyan-accent-2"
                        required
                        :loading="loading"
                        class="gaming-input"
                      ></v-text-field>
                    </v-col>

                    <!-- Apellidos -->
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="formData.lastName"
                        :rules="nameRules"
                        label="Apellidos"
                        prepend-icon="mdi-account-circle"
                        variant="outlined"
                        density="compact"
                        color="cyan-accent-2"
                        required
                        :loading="loading"
                        class="gaming-input"
                      ></v-text-field>
                    </v-col>

                    <!-- Contraseña -->
                    <v-col cols="12" md="6">
                      <div class="position-relative">
                        <v-text-field
                          v-model="formData.password"
                          :rules="passwordRules"
                          :type="showPassword ? 'text' : 'password'"
                          label="Contraseña"
                          prepend-icon="mdi-lock-outline"
                          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                          @click:append="showPassword = !showPassword"
                          variant="outlined"
                          density="compact"
                          color="cyan-accent-2"
                          required
                          :loading="loading"
                          class="gaming-input"
                        ></v-text-field>
                      </div>
                    </v-col>

                    <!-- Confirmar contraseña -->
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="formData.confirmPassword"
                        :rules="confirmPasswordRules"
                        :type="showConfirmPassword ? 'text' : 'password'"
                        label="Confirmar Contraseña"
                        prepend-icon="mdi-lock-check-outline"
                        :append-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
                        @click:append="showConfirmPassword = !showConfirmPassword"
                        variant="outlined"
                        density="compact"
                        color="cyan-accent-2"
                        required
                        :loading="loading"
                        class="gaming-input"
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
                      <v-icon start>mdi-account-plus</v-icon>
                      Registrar Gamer
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

.password-info-icon {
  position: absolute;
  right: -35px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
}

/* Efectos para inputs focus */
.gaming-input :deep(.v-field--focused .v-field__outline) {
  --v-field-border-color: #00e5ff;
  --v-field-border-width: 2px;
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
}
</style>