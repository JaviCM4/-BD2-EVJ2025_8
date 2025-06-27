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
                  mdi-gamepad-variant-outline
                </v-icon>
                <h1 class="text-h4 font-weight-bold text-white mb-2">
                  Biblioteca de Videojuegos
                </h1>
                <p class="text-subtitle-1 text-cyan-accent-2 mb-0">
                  Panel de administración - {{ videogames.length }} videojuegos disponibles
                </p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Indicador de carga -->
        <v-row justify="center" class="mb-4" v-if="loading">
          <v-col cols="12" class="text-center">
            <v-progress-circular
              indeterminate
              color="cyan-accent-2"
              size="64"
            ></v-progress-circular>
            <p class="text-white mt-4">Cargando videojuegos...</p>
          </v-col>
        </v-row>

        <!-- Barra de búsqueda -->
        <v-row justify="center" class="mb-4" v-if="!loading">
          <v-col cols="12" md="8" lg="6">
            <v-text-field
              v-model="busqueda"
              label="Buscar videojuego..."
              prepend-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              color="cyan-accent-2"
              class="gaming-input"
              clearable
            >
              <template v-slot:append-inner>
                <v-icon color="cyan-accent-2">mdi-gamepad-square</v-icon>
              </template>
            </v-text-field>
          </v-col>
        </v-row>

        <!-- Lista de videojuegos -->
        <v-row justify="center" v-if="!loading">
          <v-col cols="12" md="12" lg="12">
            <v-card elevation="16" class="rounded-xl glass-card">
              <v-card-title class="text-h5 font-weight-bold gaming-gradient text-white pa-6">
                <v-icon class="mr-3" color="white">mdi-controller-classic</v-icon>
                Videojuegos Registrados
              </v-card-title>
              
              <v-card-text class="pa-0 card-content">
                <div class="pa-4">
                  <template v-for="(game, index) in filteredGames" :key="game.id">
                    <v-card
                      class="gaming-game-card mb-6 elevation-4"
                      @click="abrirResenias(game)"
                    >
                      <v-card-text class="pa-6">
                        <v-row>
                          <!-- Avatar y título principal -->
                          <v-col cols="12" md="8" class="d-flex align-start">
                            <v-avatar
                              size="80"
                              class="gaming-avatar mr-6"
                              :color="getAvatarColor(game.title)"
                            >
                              <v-icon size="40" color="white">
                                {{ getGenreIcon(game.genre) }}
                              </v-icon>
                            </v-avatar>
                            
                            <div class="flex-grow-1">
                              <h2 class="text-h4 font-weight-bold text-dark mb-2">
                                {{ game.title }}
                              </h2>
                              
                              <!-- Información básica en chips -->
                              <div class="d-flex flex-wrap gap-2 mb-3">
                                <v-chip
                                  color="cyan-accent-2"
                                  variant="outlined"
                                  size="small"
                                  prepend-icon="mdi-tag"
                                >
                                  {{ game.genre }}
                                </v-chip>
                                <v-chip
                                  color="purple"
                                  variant="outlined"
                                  size="small"
                                  prepend-icon="mdi-domain"
                                >
                                  {{ game.developer }}
                                </v-chip>
                              </div>
                              
                              <!-- Rating y estadísticas -->
                              <div class="d-flex align-center mb-3">
                                <v-rating
                                  :model-value="getAverageRating(game.id)"
                                  color="amber"
                                  density="compact"
                                  readonly
                                  size="small"
                                  class="mr-3"
                                ></v-rating>
                                <span class="text-dark-secondary font-weight-medium">
                                  {{ getAverageRating(game.id).toFixed(1) }}/5
                                </span>
                                <v-divider vertical class="mx-3"></v-divider>
                                <v-icon size="16" color="cyan-accent-2" class="mr-1">mdi-comment-multiple</v-icon>
                                <span class="text-dark-secondary">
                                  {{ game.reviews.length }} reseña{{ game.reviews.length !== 1 ? 's' : '' }}
                                </span>
                              </div>
                            </div>
                          </v-col>
                          
                          <!-- Botón de acción -->
                          <v-col cols="12" md="4" class="d-flex align-center justify-end">
                            <v-btn
                              color="cyan-accent-2"
                              variant="outlined"
                              size="large"
                              class="gaming-btn"
                              @click.stop="abrirResenias(game)"
                            >
                              <v-icon start>mdi-star-outline</v-icon>
                              Ver Reseñas
                            </v-btn>
                          </v-col>
                        </v-row>
                        
                        <!-- Información detallada -->
                        <v-row class="mt-4">
                          <v-col cols="12">
                            <v-divider class="mb-4"></v-divider>
                            <h4 class="text-subtitle-1 font-weight-bold text-dark mb-3">
                              <v-icon color="cyan-accent-2" class="mr-2">mdi-information</v-icon>
                              Información Detallada
                            </h4>
                            
                            <v-row>
                              <v-col cols="12" md="6">
                                <div class="info-detail-item">
                                  <v-icon color="purple" size="18" class="mr-2">mdi-domain</v-icon>
                                  <div>
                                    <span class="text-caption text-dark-secondary">Desarrollador</span>
                                    <p class="text-body-2 font-weight-medium text-dark mb-0">{{ game.developer }}</p>
                                  </div>
                                </div>
                              </v-col>
                              
                              <v-col cols="12" md="6">
                                <div class="info-detail-item">
                                  <v-icon color="cyan-accent-2" size="18" class="mr-2">mdi-tag</v-icon>
                                  <div>
                                    <span class="text-caption text-dark-secondary">Género</span>
                                    <p class="text-body-2 font-weight-medium text-dark mb-0">{{ game.genre }}</p>
                                  </div>
                                </div>
                              </v-col>
                            </v-row>
                          </v-col>
                        </v-row>
                        
                        <!-- Reseñas recientes (preview) -->
                        <v-row class="mt-4" v-if="game.reviews.length > 0">
                          <v-col cols="12">
                            <v-divider class="mb-4"></v-divider>
                            <h4 class="text-subtitle-1 font-weight-bold text-dark mb-3">
                              <v-icon color="cyan-accent-2" class="mr-2">mdi-comment-multiple</v-icon>
                              Reseñas Recientes
                            </h4>
                            
                            <div class="d-flex flex-column gap-3">
                              <div 
                                v-for="review in game.reviews.slice(0, 2)" 
                                :key="review.game_id"
                                class="review-preview-item"
                              >
                                <div class="d-flex align-center mb-2">
                                  <v-avatar size="24" :color="getAvatarColor(review.user_id)" class="mr-2">
                                    <span class="text-white text-caption font-weight-bold">
                                      {{ review.user_id.charAt(0).toUpperCase() }}
                                    </span>
                                  </v-avatar>
                                  <span class="text-body-2 font-weight-medium text-dark mr-2">{{ review.user_id }}</span>
                                  <span class="text-caption text-dark-secondary">{{ formatTimestamp(review.timestamp) }}</span>
                                  <v-rating
                                    :model-value="review.score"
                                    color="amber"
                                    density="compact"
                                    readonly
                                    size="x-small"
                                    class="mr-2"
                                  ></v-rating>
                                </div>
                                <p class="text-body-2 text-dark-secondary mb-0 ml-8">
                                  {{ review.comment.length > 100 ? review.comment.substring(0, 100) + '...' : review.comment }}
                                </p>
                              </div>
                              
                              <div v-if="game.reviews.length > 2" class="ml-8">
                                <v-btn
                                  variant="text"
                                  color="cyan-accent-2"
                                  size="small"
                                  @click.stop="abrirResenias(game)"
                                >
                                  Ver todas las {{ game.reviews.length }} reseñas
                                  <v-icon end size="16">mdi-arrow-right</v-icon>
                                </v-btn>
                              </div>
                            </div>
                          </v-col>
                        </v-row>
                        
                        <!-- Sin reseñas -->
                        <v-row class="mt-4" v-else>
                          <v-col cols="12">
                            <v-divider class="mb-4"></v-divider>
                            <div class="text-center py-4">
                              <v-icon color="cyan-accent-2" size="32" class="mb-2">mdi-comment-outline</v-icon>
                              <p class="text-body-2 text-dark-secondary mb-2">No hay reseñas para este juego aún</p>
                              <v-btn
                                variant="outlined"
                                color="cyan-accent-2"
                                size="small"
                                @click.stop="abrirResenias(game)"
                              >
                                <v-icon start size="16">mdi-plus</v-icon>
                                Agregar Primera Reseña
                              </v-btn>
                            </div>
                          </v-col>
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </template>
                </div>

                <!-- Estado vacío -->
                <div v-if="filteredGames.length === 0 && !loading" class="text-center py-12">
                  <v-icon size="64" color="cyan-accent-2" class="mb-4">
                    mdi-gamepad-square-outline
                  </v-icon>
                  <h3 class="text-h6 text-white mb-2">
                    {{ busqueda ? 'No se encontraron videojuegos' : 'No hay videojuegos registrados' }}
                  </h3>
                  <p class="text-cyan-accent-2">
                    {{ busqueda ? 'Intenta con otro término de búsqueda' : 'Los nuevos juegos aparecerán aquí' }}
                  </p>
                </div>

                <!-- Estado de error -->
                <div v-if="error && !loading" class="text-center py-12">
                  <v-icon size="64" color="red" class="mb-4">
                    mdi-alert-circle-outline
                  </v-icon>
                  <h3 class="text-h6 text-white mb-2">Error al cargar los videojuegos</h3>
                  <p class="text-red-accent-2 mb-4">{{ error }}</p>
                  <v-btn
                    color="cyan-accent-2"
                    variant="outlined"
                    @click="cargarVideojuegos"
                  >
                    <v-icon start>mdi-refresh</v-icon>
                    Reintentar
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- Modal de reseñas -->
    <v-dialog v-model="reseniaPanel" max-width="900" persistent>
      <v-card class="glass-card gaming-modal">
        <v-card-title class="gaming-gradient text-white pa-6">
          <v-icon class="mr-3" color="white">mdi-star-outline</v-icon>
          Reseñas de {{ selectedGameForReviews?.title }}
        </v-card-title>

        <v-card-text class="pa-6 card-content" style="max-height: 70vh; overflow-y: auto;">
          <template v-if="userRole === '2'">
            <!-- Formulario para nueva reseña -->
            <v-card class="mb-6 elevation-4" color="rgba(24, 34, 148, 0.1)">
              <v-card-title class="text-dark pb-4">
                <v-icon color="cyan-accent-2" class="mr-2">mdi-plus</v-icon>
                Agregar Nueva Reseña
              </v-card-title>
              <v-card-text>
                <v-form ref="reseniaFormulario" v-model="reseniaValida">
                  <v-row>
                    <v-col cols="12" md="6">
                      <div class="d-flex align-center">
                        <span class="text-dark mr-3">Calificación:</span>
                        <v-rating
                          v-model="nuevaResenia.calificacion"
                          color="amber"
                          hover
                          :rules="[(v: number) => v > 0 || 'Debes dar una calificación']"
                        ></v-rating>
                      </div>
                    </v-col>
                    <v-col cols="12">
                      <v-textarea
                        v-model="nuevaResenia.comentario"
                        label="Tu reseña"
                        variant="outlined"
                        rows="3"
                        color="cyan-accent-2"
                        required
                        :rules="[v => !!v || 'El comentario es obligatorio', v => (v && v.length >= 10) || 'Mínimo 10 caracteres']"
                        class="review-input"
                      ></v-textarea>
                    </v-col>
                  </v-row>
                  <v-btn
                    color="cyan-accent-2"
                    @click="addReview"
                    :disabled="!reseniaValida"
                    :loading="addingReview"
                    class="gaming-btn"
                  >
                    <v-icon start>mdi-plus</v-icon>
                    Publicar Reseña
                  </v-btn>
                </v-form>
              </v-card-text>
            </v-card>
          </template>

          <!-- Lista de reseñas existentes -->
          <div v-if="selectedGameForReviews?.reviews?.length && selectedGameForReviews.reviews.length > 0">
            <h3 class="text-h6 text-dark mb-4">
              <v-icon color="cyan-accent-2" class="mr-2">mdi-comment-multiple</v-icon>
              Reseñas ({{ selectedGameForReviews?.reviews.length || 0}})
            </h3>
            
            <v-card
              v-for="review in selectedGameForReviews.reviews"
              :key="review.game_id"
              class="mb-4 elevation-2"
              color="rgba(255, 255, 255, 0.95)"
            >
              <v-card-text class="pb-2">
                <div class="d-flex justify-space-between align-center mb-2">
                  <div class="d-flex align-center">
                    <v-avatar size="32" :color="getAvatarColor(review.user_id)" class="mr-3">
                      <span class="text-white text-caption font-weight-bold">
                        {{ review.user_id.charAt(0).toUpperCase() }}
                      </span>
                    </v-avatar>
                    <div>
                      <p class="text-dark font-weight-bold mb-0">{{ review.user_id }}</p>
                      <span class="text-caption text-dark-secondary mr-2">{{ formatTimestamp(review.timestamp) }}</span>
                    </div>
                  </div>
                  <v-rating
                    :model-value="review.score"
                    color="amber"
                    density="compact"
                    readonly
                    size="small"
                  ></v-rating>
                </div>
                <p class="text-dark mb-0">{{ review.comment }}</p>
              </v-card-text>
            </v-card>
          </div>
          
          <div v-else class="text-center py-8">
            <v-icon size="48" color="cyan-accent-2" class="mb-3">mdi-comment-outline</v-icon>
            <h4 class="text-h6 text-dark mb-2">No hay reseñas aún</h4>
            <p class="text-dark-secondary">¡Sé el primero en reseñar este juego!</p>
          </div>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0 card-content">
          <v-btn
            variant="outlined"
            color="cyan-accent-2"
            @click="cerrarResenias"
            class="gaming-btn"
          >
            <v-icon start>mdi-arrow-left</v-icon>
            Cerrar
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
interface Resenia {
  id: string
  game_id: string
  user_id: string
  score: number
  comment: string
  timestamp: string
}

interface Videojuego {
  id: string
  title: string
  genre: string
  developer: string
  reviews: Resenia[]
}

interface Snackbar {
  show: boolean
  message: string
  color: string
}

// Refs
const busqueda = ref('')
const reseniaPanel = ref(false)
const selectedGameForReviews = ref<Videojuego | null>(null)
const addingReview = ref(false)
const reseniaValida = ref(false)
const reseniaFormulario = ref<any>(null)
const loading = ref(false)
const error = ref<string | null>(null)
// Local
const username = ref('')
const userRole = ref('')


const nuevaResenia = ref({
  usuario: '',
  calificacion: 0,
  comentario: ''
})

const snackbar = ref<Snackbar>({
  show: false,
  message: '',
  color: 'success'
})

// Datos
const videogames = ref<Videojuego[]>([])

// Computed
const filteredGames = computed(() => {
  if (!busqueda.value) return videogames.value
  
  const query = busqueda.value.toLowerCase()
  return videogames.value.filter(game =>
    game.title.toLowerCase().includes(query) ||
    game.genre.toLowerCase().includes(query) ||
    game.developer.toLowerCase().includes(query)
  )
})

// Métodos
const loadUserData = () => {
    username.value = localStorage.getItem('username') || ''
    userRole.value = localStorage.getItem('userRol') || ''
}

const cargarVideojuegos = async (): Promise<void> => {
  loading.value = true
  error.value = null
  
  try {
    const response = await axios.get('/api/juegos')
    
    // Mapear los datos de la API al formato local
    videogames.value = response.data.map((game: any) => ({
      id: game.id,
      title: game.title,
      genre: game.genre,
      developer: game.developer,
      reviews: [] // Se llenarán con cargarResenias()
    }))
    
    // Cargar las reseñas después de cargar los juegos
    await cargarResenias()
    
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al cargar los videojuegos'
    console.error('Error cargando videojuegos:', err)
    
    snackbar.value = {
      show: true,
      message: 'Error al cargar los videojuegos desde la API',
      color: 'error'
    }
  } finally {
    loading.value = false
  }
}

const cargarResenias = async (): Promise<void> => {
  try {
    const response = await axios.get('/api/resenas')
    const resenias: Resenia[] = response.data
    
    // Agrupar reseñas por game_id y asignarlas a cada juego
    videogames.value.forEach(game => {
      game.reviews = resenias.filter(resenia => resenia.game_id === game.id)
    })
    
  } catch (err: any) {
    console.error('Error cargando reseñas:', err)
    snackbar.value = {
      show: true,
      message: 'Error al cargar las reseñas',
      color: 'warning'
    }
  }
}

const abrirResenias = (game: Videojuego): void => {
  selectedGameForReviews.value = game
  reseniaPanel.value = true
  resetearFormularioResenia()
}

const cerrarResenias = (): void => {
  reseniaPanel.value = false
  selectedGameForReviews.value = null
  resetearFormularioResenia()
}

const resetearFormularioResenia = (): void => {
  nuevaResenia.value = {
    usuario: '',
    calificacion: 0,
    comentario: ''
  }
  if (reseniaFormulario.value) {
    reseniaFormulario.value.resetValidation()
  }
}

const addReview = async (): Promise<void> => {
  if (!selectedGameForReviews.value || !reseniaFormulario.value.validate()) return
  addingReview.value = true

  const nuevaOpinion = {
    game_id: selectedGameForReviews.value.id,
    user_id: username.value,
    score: nuevaResenia.value.calificacion,
    comment: nuevaResenia.value.comentario
  }
  
  try {
    const response = await axios.post('/api/resenas', nuevaOpinion, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000 // 10 segundos de timeout
    })

    // Encontrar el juego y agregar la reseña localmente
    const gameIndex = videogames.value.findIndex(g => g.id === selectedGameForReviews.value!.id)
    if (gameIndex > -1) {
      videogames.value[gameIndex].reviews.push(nuevaOpinion)
      // Actualizar la referencia del juego seleccionado
      selectedGameForReviews.value = videogames.value[gameIndex]
    }
    
    snackbar.value = {
      show: true,
      message: 'Reseña agregada exitosamente',
      color: 'success'
    }
    
    resetearFormularioResenia()
    await cargarResenias()
    
  } catch (error: any) {
    console.error('Error al agregar reseña:', error)
    snackbar.value = {
      show: true,
      message: error.response?.data?.message || 'Ya has publicado una reseña para este juego.',
      color: 'error'
    }
  } finally {
    addingReview.value = false
  }
}

const getAverageRating = (gameId: string): number => {
  const game = videogames.value.find(g => g.id === gameId)
  if (!game || game.reviews.length === 0) return 0
  
  const sum = game.reviews.reduce((acc, review) => acc + review.score, 0)
  return sum / game.reviews.length
}

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(parseInt(timestamp))
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getAvatarColor = (text: string): string => {
  const colors = ['deep-purple', 'indigo', 'blue', 'cyan', 'teal', 'green', 'amber', 'orange', 'red', 'pink']
  const index = text.length % colors.length
  return colors[index]
}

const getGenreIcon = (genre: string): string => {
  const iconMap: { [key: string]: string } = {
    'Acción': 'mdi-sword',
    'Aventura': 'mdi-compass',
    'RPG': 'mdi-shield',
    'Estrategia': 'mdi-chess-pawn',
    'Simulación': 'mdi-airplane',
    'Deportes': 'mdi-soccer',
    'Carreras': 'mdi-car-sports',
    'Puzzle': 'mdi-puzzle',
    'Terror': 'mdi-ghost',
    'Shooter': 'mdi-target',
    'Plataformas': 'mdi-gamepad-variant',
    'Indie': 'mdi-diamond',
    'Multijugador': 'mdi-account-group'
  }
  return iconMap[genre] || 'mdi-gamepad-variant'
}

onMounted(async () => {
  console.log('Cargando videojuegos y reseñas desde la API...')
  await cargarVideojuegos()
  await loadUserData()
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

.gaming-game-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.98) !important;
  border: 1px solid rgba(0, 255, 255, 0.1);
}

.gaming-game-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 255, 255, 0.2);
  border-color: rgba(0, 255, 255, 0.3);
}

.gaming-avatar {
  border: 3px solid rgba(0, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.gaming-avatar:hover {
  border-color: rgba(0, 255, 255, 0.8);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.4);
}

.gaming-btn {
  border-radius: 12px;
  text-transform: none;
  font-weight: 600;
  transition: all 0.3s ease;
  padding: 12px 24px;
}

.gaming-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 255, 255, 0.3);
}

.gaming-modal {
  border: 1px solid rgba(0, 255, 255, 0.3);
}

.info-detail-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 16px;
}

.info-detail-item .v-icon {
  margin-top: 2px;
}

.review-preview-item {
  padding: 12px;
  background: rgba(0, 255, 255, 0.05);
  border-radius: 8px;
  border-left: 3px solid rgba(0, 255, 255, 0.3);
}

.line-height-relaxed {
  line-height: 1.6;
}

/* Colores de texto para mejor legibilidad */
.text-dark {
  color: #1a1a1a !important;
}

.text-dark-secondary {
  color: #666666 !important;
}

/* Efectos para inputs focus */
.gaming-input :deep(.v-field--focused .v-field__outline) {
  --v-field-border-color: #00e5ff;
  --v-field-border-width: 2px;
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
}

.review-input :deep(.v-field--focused .v-field__outline) {
  --v-field-border-color: #00e5ff;
  --v-field-border-width: 2px;
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
}
</style>