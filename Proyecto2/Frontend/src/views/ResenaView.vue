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
                  mdi-star-outline
                </v-icon>
                <h1 class="text-h4 font-weight-bold text-white mb-2">
                  Mis Reseñas
                </h1>
                <p class="text-subtitle-1 text-cyan-accent-2 mb-0">
                  Usuario: {{ currentUser }} - {{ reviews.length }} reseñas publicadas
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
              label="Buscar en mis reseñas..."
              prepend-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              color="cyan-accent-2"
              class="gaming-input"
              clearable
              :disabled="loading"
            >
              <template v-slot:append-inner>
                <v-icon color="cyan-accent-2">mdi-comment-search-outline</v-icon>
              </template>
            </v-text-field>
          </v-col>
        </v-row>

        <!-- Lista de reseñas -->
        <v-row justify="center">
          <v-col cols="12" md="10" lg="8">
            <v-card elevation="16" class="rounded-xl glass-card">
              <v-card-title class="text-h5 font-weight-bold gaming-gradient text-white pa-6">
                <v-icon class="mr-3" color="white">mdi-comment-text-multiple</v-icon>
                Mis Reseñas de Juegos
                <v-spacer></v-spacer>
                <v-btn
                  @click="loadReviews"
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
                    Cargando reseñas...
                  </h3>
                  <p class="text-dark">
                    Obteniendo tus reseñas del servidor
                  </p>
                </div>

                <!-- Error state -->
                <div v-else-if="error" class="text-center py-12">
                  <v-icon size="64" color="error" class="mb-4">
                    mdi-alert-circle-outline
                  </v-icon>
                  <h3 class="text-h6 text-error mb-2">
                    Error al cargar reseñas
                  </h3>
                  <p class="text-dark mb-4">
                    {{ error }}
                  </p>
                  <v-btn
                    @click="loadReviews"
                    color="error"
                    variant="outlined"
                  >
                    <v-icon start>mdi-refresh</v-icon>
                    Reintentar
                  </v-btn>
                </div>

                <!-- Lista de reseñas -->
                <v-list v-else class="transparent">
                  <template v-for="(review, index) in filteredReviews" :key="review.id">
                    <v-list-item
                      class="gaming-list-item px-6 py-4"
                      @click="openReviewDetail(review)"
                    >
                      <template v-slot:prepend>
                        <v-avatar
                          size="56"
                          class="gaming-avatar"
                          :color="getScoreColor(review.score)"
                        >
                          <v-icon size="28" color="white">
                            mdi-star
                          </v-icon>
                        </v-avatar>
                      </template>

                      <v-list-item-title class="text-dark font-weight-bold text-h6 mb-1">
                        {{ getGameName(review.game_id) }}
                      </v-list-item-title>
                      
                      <v-list-item-subtitle class="text-dark-secondary mb-2">
                        <v-rating
                          :model-value="parseInt(review.score)"
                          color="amber"
                          density="compact"
                          size="small"
                          readonly
                        ></v-rating>
                        <span class="ml-2 font-weight-bold">{{ review.score }}/5</span>
                      </v-list-item-subtitle>

                      <v-list-item-subtitle class="text-dark-secondary mb-2">
                        <v-icon size="16" class="mr-2" color="dark-secondary">mdi-comment-text</v-icon>
                        {{ truncateComment(review.comment) }}
                      </v-list-item-subtitle>

                      <v-list-item-subtitle class="text-dark-secondary">
                        <v-icon size="16" class="mr-2" color="dark-secondary">mdi-clock-outline</v-icon>
                        {{ formatDate(review.timestamp) }}
                      </v-list-item-subtitle>

                      <template v-slot:append>
                        <div class="d-flex flex-column align-center gap-2">
                          <v-btn
                            size="small"
                            color="cyan-accent-2"
                            variant="outlined"
                            class="gaming-btn-mini"
                          >
                            <v-icon size="16">mdi-information</v-icon>
                          </v-btn>
                          <v-btn
                            size="small"
                            color="error"
                            variant="outlined"
                            class="gaming-btn-mini"
                            @click.stop="confirmDelete(review)"
                          >
                            <v-icon size="16">mdi-delete</v-icon>
                          </v-btn>
                        </div>
                      </template>
                    </v-list-item>
                    
                    <v-divider 
                      v-if="index < filteredReviews.length - 1" 
                      class="gaming-divider mx-6"
                    ></v-divider>
                  </template>
                </v-list>

                <!-- Estado vacío -->
                <div v-if="!loading && !error && filteredReviews.length === 0" class="text-center py-12">
                  <v-icon size="64" color="cyan-accent-2" class="mb-4">
                    mdi-comment-search-outline
                  </v-icon>
                  <h3 class="text-h6 text-dark mb-2">
                    {{ searchQuery ? 'No se encontraron reseñas' : 'No tienes reseñas' }}
                  </h3>
                  <p class="text-dark">
                    {{ searchQuery ? 'Intenta con otro término de búsqueda' : 'Tus reseñas aparecerán aquí cuando las publiques' }}
                  </p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- Modal de detalles de la reseña -->
    <v-dialog v-model="dialog" max-width="600" persistent>  
      <v-card class="glass-card gaming-modal">
        <v-card-title class="gaming-gradient text-white pa-6">
          <v-icon class="mr-3" color="white">mdi-comment-text</v-icon>
          Detalles de la Reseña
        </v-card-title>

        <v-card-text v-if="selectedReview" class="pa-6 card-content">
          <!-- Rating y datos básicos -->
          <div class="text-center mb-6">
            <v-avatar
              size="80"
              class="gaming-avatar mb-4"
              :color="getScoreColor(selectedReview.score)"
            >
              <v-icon size="40" color="white">mdi-star</v-icon>
            </v-avatar>
            <div class="mb-4">
              <v-rating
                :model-value="parseInt(selectedReview.score)"
                color="amber"
                size="large"
                readonly
              ></v-rating>
              <p class="text-h5 text-dark font-weight-bold mt-2">
                {{ selectedReview.score }}/5 estrellas
              </p>
            </div>
          </div>

          <!-- Información detallada -->
          <v-row>
            <v-col cols="12">
              <div class="info-item mb-4">
                <v-icon color="cyan-accent-2" class="mr-2">mdi-identifier</v-icon>
                <div>
                  <p class="text-dark font-weight-bold text-h6 mb-1">ID de Reseña</p>
                  <p class="text-dark text-body-2" style="font-family: monospace;">{{ selectedReview.id }}</p>
                </div>
              </div>
            </v-col>
            <v-col cols="12">
              <div class="info-item mb-4">
                <v-icon color="cyan-accent-2" class="mr-2">mdi-gamepad-variant</v-icon>
                <div>
                  <p class="text-dark font-weight-bold text-h6 mb-1">Juego</p>
                  <p class="text-dark">{{ getGameName(selectedReview.game_id) }}</p>
                </div>
              </div>
            </v-col>
            <v-col cols="12">
              <div class="info-item mb-4">
                <v-icon color="cyan-accent-2" class="mr-2">mdi-comment-text</v-icon>
                <div>
                  <p class="text-dark font-weight-bold text-h6 mb-1">Comentario</p>
                  <p class="text-dark">{{ selectedReview.comment }}</p>
                </div>
              </div>
            </v-col>
            <v-col cols="12">
              <div class="info-item mb-4">
                <v-icon color="cyan-accent-2" class="mr-2">mdi-clock-outline</v-icon>
                <div>
                  <p class="text-dark font-weight-bold text-h6 mb-1">Fecha de Publicación</p>
                  <p class="text-dark">{{ formatDate(selectedReview.timestamp) }}</p>
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
            @click="deleteReview"
            :loading="deleting"
            class="gaming-btn"
          >
            <v-icon start>mdi-delete</v-icon>
            Eliminar Reseña
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo de confirmación para eliminar -->
    <v-dialog v-model="deleteDialog" max-width="400" persistent>
      <v-card class="glass-card">
        <v-card-title class="text-h6 gaming-gradient text-white pa-4">
          <v-icon class="mr-2" color="white">mdi-delete-alert</v-icon>
          Confirmar Eliminación
        </v-card-title>
        <v-card-text class="pa-4 card-content">
          <p class="text-dark mb-0">
            ¿Estás seguro de que deseas eliminar esta reseña? Esta acción no se puede deshacer.
          </p>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0 card-content">
          <v-btn
            variant="outlined"
            @click="deleteDialog = false"
            class="gaming-btn"
          >
            Cancelar
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            @click="deleteReview"
            :loading="deleting"
            class="gaming-btn"
          >
            <v-icon start>mdi-delete</v-icon>
            Eliminar
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
interface Review {
  id: string
  game_id: string
  user_id: string
  score: string
  comment: string
  timestamp: string
}

interface Game {
  id: string
  title: string
  genre: string
  developer: string
}

interface Snackbar {
  show: boolean
  message: string
  color: string
}

// Refs
const searchQuery = ref('')
const dialog = ref(false)
const deleteDialog = ref(false)
const selectedReview = ref<Review | null>(null)
const reviewToDelete = ref<Review | null>(null)
const deleting = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)
const currentUser = ref('')

const snackbar = ref<Snackbar>({
  show: false,
  message: '',
  color: 'success'
})

// Lista de reseñas desde la API
const reviews = ref<Review[]>([])

// Cache de juegos para evitar peticiones repetidas
const games = ref<Record<string, Game>>({})

// Computed
const filteredReviews = computed(() => {
  if (!searchQuery.value) return reviews.value
  
  const query = searchQuery.value.toLowerCase()
  return reviews.value.filter(review => {
    const gameName = getGameName(review.game_id).toLowerCase()
    return review.comment.toLowerCase().includes(query) ||
           gameName.includes(query) ||
           review.score.includes(query)
  })
})

// Methods
const loadGameData = async (gameId: string): Promise<void> => {
  // Si ya tenemos los datos del juego en cache, no hacer petición
  if (games.value[gameId]) {
    return
  }

  try {
    const response = await axios.get(`/api/juegos/${gameId}`)
    games.value[gameId] = response.data
  } catch (err: any) {
    console.error(`Error loading game data for ${gameId}:`, err)
    // Añadir un juego placeholder para evitar peticiones repetidas fallidas
    games.value[gameId] = {
      id: gameId,
      title: 'Juego no encontrado',
      genre: 'Desconocido',
      developer: 'Desconocido'
    }
  }
}

const getGameName = (gameId: string): string => {
  const game = games.value[gameId]
  if (game) {
    return game.title
  }
  
  // Si no tenemos los datos del juego, cargarlos
  loadGameData(gameId)
  
  // Mientras carga, mostrar un placeholder
  return `Cargando... (${gameId.substring(0, 8)}...)`
}

const loadReviews = async (): Promise<void> => {
  loading.value = true
  error.value = null
  
  try {
    const response = await axios.get('/api/resenas')
    const allReviews = response.data
    
    // Filtrar solo las reseñas del usuario actual
    const username = localStorage.getItem('username')
    if (!username) {
      throw new Error('No se encontró el usuario en localStorage')
    }
    
    currentUser.value = username
    reviews.value = allReviews.filter((review: Review) => review.user_id === username)
    
    // Cargar datos de todos los juegos únicos
    const uniqueGameIds = [...new Set(reviews.value.map(review => review.game_id))]
    await Promise.all(uniqueGameIds.map(gameId => loadGameData(gameId)))
    
    snackbar.value = {
      show: true,
      message: `${reviews.value.length} reseñas cargadas exitosamente`,
      color: 'success'
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || 'Error al cargar las reseñas'
    snackbar.value = {
      show: true,
      message: 'Error al cargar las reseñas',
      color: 'error'
    }
    console.error('Error loading reviews:', err)
  } finally {
    loading.value = false
  }
}

const openReviewDetail = (review: Review): void => {
  selectedReview.value = review
  dialog.value = true
}

const closeDialog = (): void => {
  dialog.value = false
  selectedReview.value = null
}

const confirmDelete = (review: Review): void => {
  reviewToDelete.value = review
  deleteDialog.value = true
}

const deleteReview = async (): Promise<void> => {
  const reviewToDeleteRef = reviewToDelete.value || selectedReview.value
  if (!reviewToDeleteRef) return
  
  deleting.value = true
  
  try {
    // Llamada a la API para eliminar reseña
    await axios.delete(`/api/resenas/${reviewToDeleteRef.id}`)
    
    // Eliminar reseña de la lista local
    const index = reviews.value.findIndex(r => r.id === reviewToDeleteRef.id)
    if (index > -1) {
      reviews.value.splice(index, 1)
    }
    
    snackbar.value = {
      show: true,
      message: 'Reseña eliminada exitosamente',
      color: 'success'
    }
    
    // Cerrar diálogos
    dialog.value = false
    deleteDialog.value = false
    selectedReview.value = null
    reviewToDelete.value = null
    
  } catch (err: any) {
    snackbar.value = {
      show: true,
      message: err.response?.data?.message || 'Error al eliminar la reseña. Inténtalo de nuevo.',
      color: 'error'
    }
    console.error('Error deleting review:', err)
  } finally {
    deleting.value = false
  }
}

const getScoreColor = (score: string): string => {
  const scoreNum = parseInt(score)
  if (scoreNum >= 4) return 'green'
  if (scoreNum >= 3) return 'amber'
  return 'red'
}

const truncateComment = (comment: string): string => {
  if (comment.length <= 80) return comment
  return comment.substring(0, 80) + '...'
}

const formatDate = (timestamp: string): string => {
  const date = new Date(parseInt(timestamp))
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  // Verificar si hay usuario en localStorage
  const username = localStorage.getItem('username')
  if (!username) {
    snackbar.value = {
      show: true,
      message: 'No se encontró información del usuario',
      color: 'error'
    }
    return
  }
  
  currentUser.value = username
  loadReviews()
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