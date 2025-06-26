<template>
  <v-app>
    <v-main class="gaming-background">
      <div class="background-overlay"></div>
      <v-container fluid class="pa-8 position-relative">
        <!-- Título principal -->
        <v-row justify="center" class="mb-6">
          <v-col cols="12" md="10" lg="8">
            <v-card
              class="mx-auto elevation-12 glass-card"
              color="rgba(26, 35, 126, 0.9)"
            >
              <v-card-text class="text-center py-8">
                <v-icon size="64" color="cyan-accent-2" class="mb-4">
                  mdi-account-group-outline
                </v-icon>
                <h1 class="text-h4 font-weight-bold text-white mb-2">
                  Lista de Usuarios
                </h1>
                <p class="text-subtitle-1 text-cyan-accent-2 mb-0">
                  Panel de administración - {{ users.length }} usuarios registrados
                </p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Barra de búsqueda -->
        <v-row justify="center" class="mb-4">
          <v-col cols="12" md="8" lg="6">
            <v-text-field
              v-model="searchQuery"
              label="Buscar gamer..."
              prepend-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              color="cyan-accent-2"
              class="gaming-input"
              clearable
              :disabled="loading"
            >
              <template v-slot:append-inner>
                <v-icon color="cyan-accent-2">mdi-account-search</v-icon>
              </template>
            </v-text-field>
          </v-col>
        </v-row>

        <!-- Lista de usuarios -->
        <v-row justify="center">
          <v-col cols="12" md="10" lg="8">
            <v-card elevation="16" class="rounded-xl glass-card">
              <v-card-title class="text-h5 font-weight-bold gaming-gradient text-white pa-6">
                <v-icon class="mr-3" color="white">mdi-gamepad-variant</v-icon>
                Gamers Registrados
                <v-spacer></v-spacer>
                <v-btn
                  @click="loadUsers"
                  :loading="loading"
                  color="white"
                  variant="outlined"
                  size="small"
                >
                  <v-icon start>mdi-refresh</v-icon>
                  Actualizar
                </v-btn>
              </v-card-title>
              
              <v-card-text class="pa-0 card-content">
                <!-- Loading spinner -->
                <div v-if="loading" class="text-center py-12">
                  <v-progress-circular
                    indeterminate
                    size="64"
                    color="cyan-accent-2"
                    class="mb-4"
                  ></v-progress-circular>
                  <h3 class="text-h6 text-dark mb-2">
                    Cargando gamers...
                  </h3>
                  <p class="text-dark">
                    Obteniendo datos del servidor
                  </p>
                </div>

                <!-- Error state -->
                <div v-else-if="error" class="text-center py-12">
                  <v-icon size="64" color="error" class="mb-4">
                    mdi-alert-circle-outline
                  </v-icon>
                  <h3 class="text-h6 text-error mb-2">
                    Error al cargar datos
                  </h3>
                  <p class="text-dark mb-4">
                    {{ error }}
                  </p>
                  <v-btn
                    @click="loadUsers"
                    color="error"
                    variant="outlined"
                  >
                    <v-icon start>mdi-refresh</v-icon>
                    Reintentar
                  </v-btn>
                </div>

                <!-- Lista de usuarios -->
                <v-list v-else class="transparent">
                  <template v-for="(user, index) in filteredUsers" :key="user.id">
                    <v-list-item
                      class="gaming-list-item px-6 py-4"
                      @click="openUserDetail(user)"
                    >
                      <template v-slot:prepend>
                        <v-avatar
                          size="56"
                          class="gaming-avatar"
                          :color="getAvatarColor(user.username)"
                        >
                          <v-icon size="28" color="white">
                            {{ getAvatarIcon(user.username) }}
                          </v-icon>
                        </v-avatar>
                      </template>

                      <v-list-item-title class="text-dark font-weight-bold text-h6 mb-1">
                        {{ user.username }}
                      </v-list-item-title>
                      
                      <v-list-item-subtitle class="text-dark-secondary mb-1">
                        <v-icon size="16" class="mr-2" color="dark-secondary">mdi-email</v-icon>
                        {{ user.email }}
                      </v-list-item-subtitle>

                      <v-list-item-subtitle class="text-dark-secondary">
                        <v-chip
                          :color="getRoleColor(user.rol)"
                          size="small"
                          variant="tonal"
                        >
                          <v-icon start size="16">{{ getRoleIcon(user.rol) }}</v-icon>
                          {{ getRoleName(user.rol) }}
                        </v-chip>
                      </v-list-item-subtitle>

                      <template v-slot:append>
                        <div class="d-flex flex-column align-center">
                          <v-btn
                            size="small"
                            color="cyan-accent-2"
                            variant="outlined"
                            class="gaming-btn-mini"
                          >
                            <v-icon size="16">mdi-information</v-icon>
                          </v-btn>
                        </div>
                      </template>
                    </v-list-item>
                    
                    <v-divider 
                      v-if="index < filteredUsers.length - 1" 
                      class="gaming-divider mx-6"
                    ></v-divider>
                  </template>
                </v-list>

                <!-- Estado vacío -->
                <div v-if="!loading && !error && filteredUsers.length === 0" class="text-center py-12">
                  <v-icon size="64" color="cyan-accent-2" class="mb-4">
                    mdi-account-search-outline
                  </v-icon>
                  <h3 class="text-h6 text-dark mb-2">
                    {{ searchQuery ? 'No se encontraron gamers' : 'No hay gamers registrados' }}
                  </h3>
                  <p class="text-dark">
                    {{ searchQuery ? 'Intenta con otro término de búsqueda' : 'Los nuevos registros aparecerán aquí' }}
                  </p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- Modal de detalles del usuario -->
    <v-dialog v-model="dialog" max-width="600" persistent>  
      <v-card class="glass-card gaming-modal">
        <v-card-title class="gaming-gradient text-white pa-6">
          <v-icon class="mr-3" color="white">mdi-account-details</v-icon>
          Detalles del Gamer
        </v-card-title>

        <v-card-text v-if="selectedUser" class="pa-6 card-content">
          <!-- Avatar y datos básicos -->
          <div class="text-center mb-6">
            <v-avatar
              size="80"
              class="gaming-avatar mb-4"
              :color="getAvatarColor(selectedUser.username)"
            >
              <v-icon size="40" color="white">
                {{ getAvatarIcon(selectedUser.username) }}
              </v-icon>
            </v-avatar>
            <h2 class="text-h5 text-dark font-weight-bold mb-2">
              {{ selectedUser.username }}
            </h2>
            <v-chip
              :color="getRoleColor(selectedUser.rol)"
              size="large"
              variant="tonal"
            >
              <v-icon start size="20">{{ getRoleIcon(selectedUser.rol) }}</v-icon>
              {{ getRoleName(selectedUser.rol) }}
            </v-chip>
          </div>

          <!-- Información detallada -->
          <v-row>
            <v-col cols="12">
              <div class="info-item mb-4">
                <v-icon color="cyan-accent-2" class="mr-2">mdi-identifier</v-icon>
                <div>
                  <p class="text-dark font-weight-bold text-h6 mb-1">ID de Usuario</p>
                  <p class="text-dark text-body-2" style="font-family: monospace;">{{ selectedUser.id }}</p>
                </div>
              </div>
            </v-col>
            <v-col cols="12">
              <div class="info-item mb-4">
                <v-icon color="cyan-accent-2" class="mr-2">mdi-email</v-icon>
                <div>
                  <p class="text-dark font-weight-bold text-h6 mb-1">Correo Electrónico</p>
                  <p class="text-dark">{{ selectedUser.email }}</p>
                </div>
              </div>
            </v-col>
            <v-col cols="12">
              <div class="info-item mb-4">
                <v-icon color="cyan-accent-2" class="mr-2">mdi-shield-account</v-icon>
                <div>
                  <p class="text-dark font-weight-bold text-h6 mb-1">Rol</p>
                  <p class="text-dark">{{ getRoleName(selectedUser.rol) }}</p>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0 card-content">
          <v-btn
            variant="outlined"
            color="cyan-accent-2"
            @click="closeDialog"
            class="gaming-btn"
          >
            <v-icon start>mdi-arrow-left</v-icon>
            Volver
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            @click="deleteUser"
            :loading="deleting"
            class="gaming-btn"
          >
            <v-icon start>mdi-delete</v-icon>
            Eliminar Gamer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

// Interfaces
interface User {
  id: string
  username: string
  email: string
  password_hash: string
  rol: string
}

interface Snackbar {
  show: boolean
  message: string
  color: string
}

// Refs
const searchQuery = ref('')
const dialog = ref(false)
const selectedUser = ref<User | null>(null)
const deleting = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)

const snackbar = ref<Snackbar>({
  show: false,
  message: '',
  color: 'success'
})

// Lista de usuarios desde la API
const users = ref<User[]>([])

// Computed
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user =>
    user.username.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query)
  )
})

// Methods
const loadUsers = async (): Promise<void> => {
  loading.value = true
  error.value = null
  
  try {
    const response = await axios.get('/api/usuarios')
    users.value = response.data
    
    snackbar.value = {
      show: true,
      message: `${users.value.length} gamers cargados exitosamente`,
      color: 'success'
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al cargar los usuarios'
    snackbar.value = {
      show: true,
      message: 'Error al cargar los usuarios',
      color: 'error'
    }
    console.error('Error loading users:', err)
  } finally {
    loading.value = false
  }
}

const openUserDetail = (user: User): void => {
  selectedUser.value = user
  dialog.value = true
}

const closeDialog = (): void => {
  dialog.value = false
  selectedUser.value = null
}

const deleteUser = async (): Promise<void> => {
  if (!selectedUser.value) return
  
  deleting.value = true
  
  try {
    // Llamada a la API para eliminar usuario
    await axios.delete(`/api/usuarios/${selectedUser.value.id}`)
    
    // Eliminar usuario de la lista local
    const index = users.value.findIndex(u => u.id === selectedUser.value!.id)
    if (index > -1) {
      users.value.splice(index, 1)
    }
    
    snackbar.value = {
      show: true,
      message: `Gamer ${selectedUser.value.username} eliminado exitosamente`,
      color: 'success'
    }
    
    // Cerrar diálogos
    dialog.value = false
    selectedUser.value = null
    
  } catch (err: any) {
    snackbar.value = {
      show: true,
      message: err.response?.data?.message || 'Error al eliminar el gamer. Inténtalo de nuevo.',
      color: 'error'
    }
    console.error('Error deleting user:', err)
  } finally {
    deleting.value = false
  }
}

const getRoleName = (rol: string): string => {
  switch (rol) {
    case '1':
      return 'Administrador'
    case '2':
      return 'Usuario'
    default:
      return 'Desconocido'
  }
}

const getRoleColor = (rol: string): string => {
  switch (rol) {
    case '1':
      return 'red-darken-2'
    case '2':
      return 'blue-darken-2'
    default:
      return 'grey'
  }
}

const getRoleIcon = (rol: string): string => {
  switch (rol) {
    case '1':
      return 'mdi-shield-crown'
    case '2':
      return 'mdi-account-circle'
    default:
      return 'mdi-help-circle'
  }
}

const getAvatarColor = (username: string): string => {
  const colors = ['deep-purple', 'indigo', 'blue', 'cyan', 'teal', 'green', 'amber', 'orange', 'red', 'pink']
  const index = username.length % colors.length
  return colors[index]
}

const getAvatarIcon = (username: string): string => {
  const icons = ['mdi-gamepad-variant', 'mdi-sword', 'mdi-shield', 'mdi-rocket', 'mdi-crown', 'mdi-star', 'mdi-diamond', 'mdi-flash']
  const index = username.charCodeAt(0) % icons.length
  return icons[index]
}

// Lifecycle
onMounted(() => {
  loadUsers()
})
</script>

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
  background: rgba(255, 255, 255, 0.95);
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

.gaming-list-item {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
  margin: 4px 8px;
}

.gaming-list-item:hover {
  background: rgba(0, 255, 255, 0.1) !important;
  transform: translateX(4px);
}

.gaming-avatar {
  border: 2px solid rgba(0, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.gaming-avatar:hover {
  border-color: rgba(0, 255, 255, 0.8);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
}

.gaming-divider {
  border-color: rgba(0, 255, 255, 0.2) !important;
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

.gaming-btn-mini {
  border-radius: 8px;
  min-width: auto;
}

.gaming-modal {
  border: 1px solid rgba(0, 255, 255, 0.3);
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.info-item .v-icon {
  margin-top: 4px;
}

/* Colores de texto para mejor legibilidad */
.text-dark {
  color: #1a1a1a !important;
}

.text-dark-secondary {
  color: #111111 !important;
}

/* Efectos para inputs focus */
.gaming-input :deep(.v-field--focused .v-field__outline) {
  --v-field-border-color: #00e5ff;
  --v-field-border-width: 2px;
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
}
</style>