<template>
  <v-app>
    <v-main class="gaming-background">
      <div class="background-overlay"></div>
      <v-container fluid class="pa-8 position-relative">
        <!-- Título -->
        <v-row justify="center" class="mb-6">
          <v-col cols="12" md="10" lg="8">
            <v-card
              class="mx-auto elevation-12 glass-card"
              color="rgba(26, 35, 126, 0.9)"
            >
              <v-card-text class="text-center py-8">
                <v-icon size="64" color="cyan-accent-2" class="mb-4">
                  mdi-controller-classic-outline
                </v-icon>
                <h1 class="text-h4 font-weight-bold text-white mb-2">
                  Registro de Videojuego
                </h1>
                <p class="text-subtitle-1 text-cyan-accent-2 mb-0">
                  Ingresa los datos del nuevo título
                </p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Formulario -->
        <v-row justify="center">
          <v-col cols="12" md="10" lg="6">
            <v-card elevation="16" class="rounded-xl glass-card pa-6">
              <v-form @submit.prevent="registrarVideojuego" ref="form">
                <v-text-field
                  v-model="videojuego.titulo"
                  label="Título"
                  variant="outlined"
                  color="cyan-accent-2"
                  prepend-icon="mdi-text"
                  class="mb-4"
                  required
                />

                <v-text-field
                  v-model="videojuego.genero"
                  label="Género"
                  variant="outlined"
                  color="cyan-accent-2"
                  prepend-icon="mdi-shape"
                  class="mb-4"
                  required
                />

                <v-text-field
                  v-model="videojuego.desarrollador"
                  label="Desarrollador"
                  variant="outlined"
                  color="cyan-accent-2"
                  prepend-icon="mdi-domain"
                  class="mb-4"
                  required
                />

                <v-text-field
                  v-model="videojuego.anio"
                  label="Año de lanzamiento"
                  variant="outlined"
                  color="cyan-accent-2"
                  prepend-icon="mdi-calendar"
                  class="mb-6"
                  type="number"
                  min="1970"
                  max="2099"
                  required
                />

                <v-btn type="submit" color="cyan-accent-2" class="text-white" block>
                  Registrar Videojuego
                </v-btn>
              </v-form>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "RegistroVideojuegoView",
  data() {
    return {
      videojuego: {
        titulo: "",
        genero: "",
        desarrollador: "",
        anio: null,
      },
    };
  },
  methods: {
    registrarVideojuego() {
      console.log("Videojuego registrado:", this.videojuego);
      // Aquí podrías hacer una llamada API con axios o fetch
      this.$refs.form.reset(); // Limpia el formulario
    },
  },
};
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

.glass-card {
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.1) !important;
  border-radius: 16px;
}
</style>
