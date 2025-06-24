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

        <!-- Barra de búsqueda -->
        <v-row justify="center" class="mb-4">
          <v-col cols="12" md="8" lg="6">
            <v-text-field
              v-model="searchQuery"
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
        <v-row justify="center">
          <v-col cols="12" md="10" lg="8">
            <v-card elevation="16" class="rounded-xl glass-card">
              <v-card-title class="text-h5 font-weight-bold gaming-gradient text-white pa-6">
                <v-icon class="mr-3" color="white">mdi-controller-classic</v-icon>
                Videojuegos Registrados
              </v-card-title>
              
              <v-card-text class="pa-0 card-content">
                <v-list class="transparent">
                  <template v-for="(game, index) in filteredGames" :key="game.id">
                    <v-list-item
                      class="gaming-list-item px-6 py-4"
                      @click="openGameDetail(game)"
                    >
                      <template v-slot:prepend>
                        <v-avatar
                          size="56"
                          class="gaming-avatar"
                          :color="getAvatarColor(game.titulo)"
                        >
                          <v-icon size="28" color="white">
                            {{ getGenreIcon(game.genero) }}
                          </v-icon>
                        </v-avatar>
                      </template>

                      <v-list-item-title class="text-dark font-weight-bold text-h6 mb-1">
                        {{ game.titulo }}
                      </v-list-item-title>
                      
                      <v-list-item-subtitle class="text-dark-secondary mb-2">
                        <v-icon size="16" class="mr-1" color="dark-secondary">mdi-tag</v-icon>
                        {{ game.genero }} • {{ game.desarrollador }} ({{ game.ano }})
                      </v-list-item-subtitle>

                      <div class="d-flex align-center">
                        <v-rating
                          :model-value="getAverageRating(game.id)"
                          color="amber"
                          density="compact"
                          readonly
                          size="small"
                        ></v-rating>
                        <span class="text-dark-secondary ml-2">
                          ({{ game.reviews.length }} reseñas)
                        </span>
                      </div>

                      <template v-slot:append>
                        <div class="d-flex flex-column align-center gap-2">
                          <v-btn
                            size="small"
                            color="cyan-accent-2"
                            variant="outlined"
                            class="gaming-btn-mini"
                            @click.stop="openReviewsModal(game)"
                          >
                            <v-icon size="16">mdi-star-outline</v-icon>
                          </v-btn>
                          <v-btn
                            size="small"
                            color="purple"
                            variant="outlined"
                            class="gaming-btn-mini"
                          >
                            <v-icon size="16">mdi-information</v-icon>
                          </v-btn>
                        </div>
                      </template>
                    </v-list-item>
                    
                    <v-divider 
                      v-if="index < filteredGames.length - 1" 
                      class="gaming-divider mx-6"
                    ></v-divider>
                  </template>
                </v-list>

                <!-- Estado vacío -->
                <div v-if="filteredGames.length === 0" class="text-center py-12">
                  <v-icon size="64" color="cyan-accent-2" class="mb-4">
                    mdi-gamepad-square-outline
                  </v-icon>
                  <h3 class="text-h6 text-white mb-2">
                    {{ searchQuery ? 'No se encontraron videojuegos' : 'No hay videojuegos registrados' }}
                  </h3>
                  <p class="text-cyan-accent-2">
                    {{ searchQuery ? 'Intenta con otro término de búsqueda' : 'Los nuevos juegos aparecerán aquí' }}
                  </p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- Modal de detalles del videojuego -->
    <v-dialog v-model="gameDialog" max-width="800" persistent>  
      <v-card class="glass-card gaming-modal">
        <v-card-title class="gaming-gradient text-white pa-6">
          <v-icon class="mr-3" color="white">mdi-gamepad-variant</v-icon>
          Detalles del Videojuego
        </v-card-title>

        <v-card-text v-if="selectedGame" class="pa-6 card-content">
          <!-- Avatar y datos básicos -->
          <div class="text-center mb-6">
            <v-avatar
              size="80"
              class="gaming-avatar mb-4"
              :color="getAvatarColor(selectedGame.titulo)"
            >
              <v-icon size="40" color="white">
                {{ getGenreIcon(selectedGame.genero) }}
              </v-icon>
            </v-avatar>
            <h2 class="text-h5 text-dark font-weight-bold mb-2">
              {{ selectedGame.titulo }}
            </h2>
            <div class="d-flex justify-center align-center mb-4">
              <v-rating
                :model-value="getAverageRating(selectedGame.id)"
                color="amber"
                density="compact"
                readonly
              ></v-rating>
              <span class="text-dark-secondary ml-2">
                ({{ selectedGame.reviews.length }} reseñas)
              </span>
            </div>
          </div>

          <!-- Información detallada -->
          <v-row>
            <v-col cols="12" md="6">
              <div class="info-item mb-4">
                <v-icon color="cyan-accent-2" class="mr-2">mdi-tag</v-icon>
                <div>
                  <p class="text-dark font-weight-bold text-h6 mb-1">Género</p>
                  <p class="text-dark">{{ selectedGame.genero }}</p>
                </div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="info-item mb-4">
                <v-icon color="cyan-accent-2" class="mr-2">mdi-domain</v-icon>
                <div>
                  <p class="text-dark font-weight-bold text-h6 mb-1">Desarrollador</p>
                  <p class="text-dark">{{ selectedGame.desarrollador }}</p>
                </div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="info-item mb-4">
                <v-icon color="cyan-accent-2" class="mr-2">mdi-calendar</v-icon>
                <div>
                  <p class="text-dark font-weight-bold text-h6 mb-1">Año</p>
                  <p class="text-dark">{{ selectedGame.ano }}</p>
                </div>
              </div>
            </v-col>
            <v-col cols="12">
              <div class="info-item mb-4">
                <v-icon color="cyan-accent-2" class="mr-2">mdi-text</v-icon>
                <div>
                  <p class="text-dark font-weight-bold text-h6 mb-1">Descripción</p>
                  <p class="text-dark">{{ selectedGame.descripcion }}</p>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0 card-content">
          <v-btn
            variant="outlined"
            color="cyan-accent-2"
            @click="closeGameDialog"
            class="gaming-btn"
          >
            <v-icon start>mdi-arrow-left</v-icon>
            Volver
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="amber"
            @click="openReviewsModal(selectedGame)"
            class="gaming-btn"
          >
            <v-icon start>mdi-star</v-icon>
            Ver Reseñas
          </v-btn>
          <v-btn
            color="error"
            @click="deleteGame"
            :loading="deleting"
            class="gaming-btn"
          >
            <v-icon start>mdi-delete</v-icon>
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de reseñas -->
    <v-dialog v-model="reviewsDialog" max-width="900" persistent>
      <v-card class="glass-card gaming-modal">
        <v-card-title class="gaming-gradient text-white pa-6">
          <v-icon class="mr-3" color="white">mdi-star-outline</v-icon>
          Reseñas de {{ selectedGameForReviews?.titulo }}
        </v-card-title>

        <v-card-text class="pa-6 card-content" style="max-height: 70vh; overflow-y: auto;">
          <!-- Formulario para nueva reseña -->
          <v-card class="mb-6 elevation-4" color="rgba(24, 34, 148, 0.1)">
            <v-card-title class="text-dark pb-4">
              <v-icon color="cyan-accent-2" class="mr-2">mdi-plus</v-icon>
              Agregar Nueva Reseña
            </v-card-title>
            <v-card-text>
              <v-form ref="reviewForm" v-model="validReview">
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="newReview.usuario"
                      label="Tu nombre de usuario"
                      variant="outlined"
                      density="compact"
                      color="cyan-accent-2"
                      required
                      :rules="[v => !!v || 'El nombre es obligatorio']"
                      class="review-input"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="d-flex align-center">
                      <span class="text-dark mr-3">Calificación:</span>
                      <v-rating
                        v-model="newReview.calificacion"
                        color="amber"
                        hover
                        :rules="[v => v > 0 || 'Debes dar una calificación']"
                      ></v-rating>
                    </div>
                  </v-col>
                  <v-col cols="12">
                    <v-textarea
                      v-model="newReview.comentario"
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
                  :disabled="!validReview"
                  :loading="addingReview"
                  class="gaming-btn"
                >
                  <v-icon start>mdi-plus</v-icon>
                  Publicar Reseña
                </v-btn>
              </v-form>
            </v-card-text>
          </v-card>

          <!-- Lista de reseñas existentes -->
          <div v-if="selectedGameForReviews?.reviews.length > 0">
            <h3 class="text-h6 text-dark mb-4">
              <v-icon color="cyan-accent-2" class="mr-2">mdi-comment-multiple</v-icon>
              Reseñas ({{ selectedGameForReviews.reviews.length }})
            </h3>
            
            <v-card
              v-for="review in selectedGameForReviews.reviews"
              :key="review.id"
              class="mb-4 elevation-2"
              color="rgba(255, 255, 255, 0.95)"
            >
              <v-card-text class="pb-2">
                <div class="d-flex justify-space-between align-center mb-2">
                  <div class="d-flex align-center">
                    <v-avatar size="32" :color="getAvatarColor(review.usuario)" class="mr-3">
                      <span class="text-white text-caption font-weight-bold">
                        {{ review.usuario.charAt(0).toUpperCase() }}
                      </span>
                    </v-avatar>
                    <div>
                      <p class="text-dark font-weight-bold mb-0">{{ review.usuario }}</p>
                      <p class="text-dark-secondary text-caption">{{ formatDate(review.fecha) }}</p>
                    </div>
                  </div>
                  <v-rating
                    :model-value="review.calificacion"
                    color="amber"
                    density="compact"
                    readonly
                    size="small"
                  ></v-rating>
                </div>
                <p class="text-dark mb-0">{{ review.comentario }}</p>
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
            @click="closeReviewsModal"
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

// Interfaces
interface Review {
  id: number
  usuario: string
  calificacion: number
  comentario: string
  fecha: string
}

interface Videogame {
  id: number
  titulo: string
  genero: string
  descripcion: string
  desarrollador: string
  ano: number
  reviews: Review[]
}

interface Snackbar {
  show: boolean
  message: string
  color: string
}

// Refs
const searchQuery = ref('')
const gameDialog = ref(false)
const reviewsDialog = ref(false)
const selectedGame = ref<Videogame | null>(null)
const selectedGameForReviews = ref<Videogame | null>(null)
const deleting = ref(false)
const addingReview = ref(false)
const validReview = ref(false)
const reviewForm = ref<any>(null)

const newReview = ref({
  usuario: '',
  calificacion: 0,
  comentario: ''
})

const snackbar = ref<Snackbar>({
  show: false,
  message: '',
  color: 'success'
})

// Datos de ejemplo
const videogames = ref<Videogame[]>([
  {
    id: 1,
    titulo: 'The Legend of Zelda: Breath of the Wild',
    genero: 'Aventura',
    descripcion: 'Un juego de aventuras en mundo abierto que reinventa la serie Zelda con una libertad sin precedentes.',
    desarrollador: 'Nintendo EPD',
    ano: 2017,
    reviews: [
      {
        id: 1,
        usuario: 'GamerPro2024',
        calificacion: 5,
        comentario: 'Increíble juego, la libertad de exploración es fantástica. Los puzzles de los santuarios son geniales.',
        fecha: '2024-06-15T10:30:00Z'
      },
      {
        id: 2,
        usuario: 'PixelWarrior',
        calificacion: 4,
        comentario: 'Excelente mundo abierto, aunque a veces se siente un poco vacío. La mecánica de escalada es innovadora.',
        fecha: '2024-06-10T14:20:00Z'
      }
    ]
  },
  {
    id: 2,
    titulo: 'Cyberpunk 2077',
    genero: 'RPG',
    descripcion: 'Un RPG de mundo abierto ambientado en Night City, una megalópolis obsesionada con el poder, la ostentación y la modificación corporal.',
    desarrollador: 'CD Projekt RED',
    ano: 2020,
    reviews: [
      {
        id: 3,
        usuario: 'CyberNinja',
        calificacion: 3,
        comentario: 'Después de las actualizaciones está mucho mejor. La historia es interesante pero los bugs siguen siendo un problema.',
        fecha: '2024-06-12T16:45:00Z'
      }
    ]
  },
  {
    id: 3,
    titulo: 'God of War',
    genero: 'Acción',
    descripcion: 'Kratos vive ahora como un hombre en las tierras de los dioses y monstruos nórdicos. En este mundo hostil, debe luchar por sobrevivir.',
    desarrollador: 'Santa Monica Studio',
    ano: 2018,
    reviews: [
      {
        id: 4,
        usuario: 'DragonSlayer99',
        calificacion: 5,
        comentario: 'Una obra maestra absoluta. La relación entre Kratos y Atreus está perfectamente desarrollada.',
        fecha: '2024-06-08T12:15:00Z'
      },
      {
        id: 5,
        usuario: 'NeonHunter',
        calificacion: 5,
        comentario: 'El combate es visceral y satisfactorio. Los gráficos son impresionantes. 10/10.',
        fecha: '2024-06-05T18:30:00Z'
      }
    ]
  },
  {
    id: 4,
    titulo: 'Hollow Knight',
    genero: 'Indie',
    descripcion: 'Un juego de aventuras clásico en 2D ambientado en un vasto mundo interconectado lleno de secretos por descubrir.',
    desarrollador: 'Team Cherry',
    ano: 2017,
    reviews: []
  },
  {
    id: 5,
    titulo: 'Elden Ring',
    genero: 'RPG',
    descripcion: 'Un nuevo juego de rol de fantasía desarrollado por FromSoftware Inc. y producido por BANDAI NAMCO Entertainment Inc.',
    desarrollador: 'FromSoftware',
    ano: 2022,
    reviews: [
      {
        id: 6,
        usuario: 'SoulsBorne',
        calificacion: 4,
        comentario: 'Difícil pero justo. El mundo abierto añade una nueva dimensión a la fórmula de Dark Souls.',
        fecha: '2024-06-20T09:45:00Z'
      }
    ]
  }
])

// Computed
const filteredGames = computed(() => {
  if (!searchQuery.value) return videogames.value
  
  const query = searchQuery.value.toLowerCase()
  return videogames.value.filter(game =>
    game.titulo.toLowerCase().includes(query) ||
    game.genero.toLowerCase().includes(query) ||
    game.desarrollador.toLowerCase().includes(query) ||
    game.descripcion.toLowerCase().includes(query)
  )
})

// Methods
const openGameDetail = (game: Videogame): void => {
  selectedGame.value = game
  gameDialog.value = true
}

const closeGameDialog = (): void => {
  gameDialog.value = false
  selectedGame.value = null
}

const openReviewsModal = (game: Videogame): void => {
  selectedGameForReviews.value = game
  reviewsDialog.value = true
  resetReviewForm()
}

const closeReviewsModal = (): void => {
  reviewsDialog.value = false
  selectedGameForReviews.value = null
  resetReviewForm()
}

const resetReviewForm = (): void => {
  newReview.value = {
    usuario: '',
    calificacion: 0,
    comentario: ''
  }
  if (reviewForm.value) {
    reviewForm.value.resetValidation()
  }
}

const addReview = async (): Promise<void> => {
  if (!selectedGameForReviews.value || !reviewForm.value.validate()) return
  
  addingReview.value = true
  
  try {
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const review: Review = {
      id: Date.now(),
      usuario: newReview.value.usuario,
      calificacion: newReview.value.calificacion,
      comentario: newReview.value.comentario,
      fecha: new Date().toISOString()
    }
    
    // Encontrar el juego y agregar la reseña
    const gameIndex = videogames.value.findIndex(g => g.id === selectedGameForReviews.value!.id)
    if (gameIndex > -1) {
      videogames.value[gameIndex].reviews.push(review)
    }
    
    snackbar.value = {
      show: true,
      message: 'Reseña agregada exitosamente',
      color: 'success'
    }
    
    resetReviewForm()
    
  } catch (error) {
    snackbar.value = {
      show: true,
      message: 'Error al agregar la reseña. Inténtalo de nuevo.',
      color: 'error'
    }
  } finally {
    addingReview.value = false
  }
}

const deleteGame = async (): Promise<void> => {
  if (!selectedGame.value) return
  
  deleting.value = true
  
  try {
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Eliminar juego de la lista
    const index = videogames.value.findIndex(g => g.id === selectedGame.value!.id)
    if (index > -1) {
      videogames.value.splice(index, 1)
    }
    
    snackbar.value = {
      show: true,
      message: `Videojuego ${selectedGame.value.titulo} eliminado exitosamente`,
      color: 'success'
    }
    
    // Cerrar diálogo
    gameDialog.value = false
    selectedGame.value = null
    
  } catch (error) {
    snackbar.value = {
      show: true,
      message: 'Error al eliminar el videojuego. Inténtalo de nuevo.',
      color: 'error'
    }
  } finally {
    deleting.value = false
  }
}

const getAverageRating = (gameId: number): number => {
  const game = videogames.value.find(g => g.id === gameId)
  if (!game || game.reviews.length === 0) return 0
  
  const sum = game.reviews.reduce((acc, review) => acc + review.calificacion, 0)
  return sum / game.reviews.length
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
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

onMounted(() => {
  console.log('Lista de videojuegos cargada')
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