<script setup lang="ts">
import { ref, computed } from 'vue'

// Estados reactivos para carga CSV
const driveUrl = ref('')
const cargando = ref(false)
const exito = ref(false)
const error = ref('')
const datos = ref(null)

// Estados reactivos para crear colección
const coleccionCargada = ref(false)
const coleccionExitosa = ref(false)
const coleccionError = ref('')
const responseDataCollection = ref(null)

const exampleUrl = "https://drive.google.com/file/d/17eA7GUjf3ZUf8i4oVnvAiKSNCjqMq7yY/view"

const esValidaURL = computed(() => {
  if (!driveUrl.value) return false
  const googleDrivePattern = /^https:\/\/drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+\/view(\?[^#]*)?$/
  return googleDrivePattern.test(driveUrl.value)
})

const cargarEjemploURL = () => {
  driveUrl.value = exampleUrl
}


const limpiarFormulario = () => {
  driveUrl.value = ''
  exito.value = false
  error.value = ''
  datos.value = null
}

const clearCollectionForm = () => {
  coleccionExitosa.value = false
  coleccionError.value = ''
  responseDataCollection.value = null
}

const cargarCSV = async () => {
  if (!esValidaURL.value) {
    error.value = 'Por favor ingresa una URL válida de Google Drive'
    return
  }

  cargando.value = true
  error.value = ''
  exito.value = false
  datos.value = null

  try {
    const response = await fetch('/api/aspirantes/cargar-csv', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        driveUrl: driveUrl.value
      })
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    datos.value = data
    exito.value = true
    
  } catch (err) {
    error.value = 'Error al procesar la solicitud'
  } finally {
    cargando.value = false
  }
}

const crearColeccion = async () => {
  coleccionCargada.value = true
  coleccionError.value = ''
  coleccionExitosa.value = false
  responseDataCollection.value = null

  try {
    const response = await fetch('/api/aspirantes/generar-resumen', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    responseDataCollection.value = data
    coleccionExitosa.value = true
    
  } catch (err) {
    coleccionError.value = 'Error al crear la colección'
  } finally {
    coleccionCargada.value = false
  }
}
</script>

<template>
  <v-main class="main-background">
    <v-container class="py-8">
      <!-- Header -->
      <v-row justify="center" class="mb-8">
        <v-col cols="12" md="8">
          <v-card elevation="4" color="teal-darken-3" theme="dark">
            <v-card-title class="text-center text-h4 pa-6">
              <v-icon class="me-3" size="large">mdi-cloud-upload</v-icon>
              Carga de Aspirantes CSV
            </v-card-title>
            <v-card-subtitle class="text-center pb-4">
              Sistema de carga de datos desde Google Drive
            </v-card-subtitle>
          </v-card>
        </v-col>
      </v-row>

      <!-- Formulario principal -->
      <v-row justify="center">
        <v-col cols="12" md="8" lg="6">
          <v-card elevation="6" class="pa-6">
            <v-card-title class="text-h5 mb-4">
              <v-icon class="me-2" color="teal">mdi-file-document</v-icon>
              Cargar archivo CSV
            </v-card-title>

            <!-- Instrucciones -->
            <v-alert
              type="info"
              variant="tonal"
              class="mb-6"
              border="start"
            >
              <v-alert-title class="mb-2">Instrucciones:</v-alert-title>
              <div class="text-body-2">
                1. Asegúrate de que el archivo CSV esté disponible en Google Drive<br>
                2. Copia el enlace de visualización del archivo<br>
                3. Pega la URL en el campo de abajo<br>
                4. Haz clic en "Cargar CSV" para procesar los datos
              </div>
            </v-alert>

            <!-- Campo de URL -->
            <v-text-field
              v-model="driveUrl"
              label="URL de Google Drive"
              placeholder="https://drive.google.com/file/d/YOUR_FILE_ID/view"
              variant="outlined"
              :rules="[() => driveUrl ? esValidaURL || 'URL de Google Drive no válida' : true]"
              :error="!!error && !cargando"
              :error-messages="error && !cargando ? [error] : []"
              prepend-inner-icon="mdi-link"
              class="mb-4"
              :disabled="cargando"
            >
              <template v-slot:append>
                <v-btn
                  size="small"
                  color="grey"
                  variant="text"
                  @click="limpiarFormulario"
                  :disabled="cargando"
                >
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </template>
            </v-text-field>

            <!-- Botón de ejemplo -->
            <div class="text-center mb-4">
              <v-btn
                variant="outlined"
                color="grey"
                size="small"
                @click="cargarEjemploURL"
                :disabled="cargando"
              >
                <v-icon start>mdi-lightbulb-outline</v-icon>
                Usar URL de ejemplo
              </v-btn>
            </div>

            <!-- Botón principal -->
            <v-btn
              block
              size="large"
              color="teal"
              variant="flat"
              :loading="cargando"
              :disabled="!esValidaURL || cargando"
              @click="cargarCSV"
              class="mb-4"
            >
              <v-icon start>mdi-cloud-upload</v-icon>
              <span v-if="cargando">Cargando...</span>
              <span v-else>Cargar CSV</span>
            </v-btn>

            <!-- Indicador de progreso -->
            <v-progress-linear
              v-if="cargando"
              indeterminate
              color="teal"
              class="mb-4"
            ></v-progress-linear>
            
          </v-card>
        </v-col>
      </v-row>

      <!-- Mensaje de éxito -->
      <v-row v-if="exito" justify="center" class="mt-4">
        <v-col cols="12" md="8" lg="6">
          <v-card elevation="4" color="green-lighten-5" border="start">
            <v-card-title class="text-green-darken-2">
              <v-icon class="me-2">mdi-check-circle</v-icon>
              ¡Carga exitosa!
            </v-card-title>
            <v-card-text>
              <p class="mb-3">El archivo CSV se ha procesado correctamente.</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Mensaje de error -->
      <v-row v-if="error && !cargando" justify="center" class="mt-4">
        <v-col cols="12" md="8" lg="6">
          <v-card elevation="4" color="red-lighten-5" border="start">
            <v-card-title class="text-red-darken-2">
              <v-icon class="me-2">mdi-alert-circle</v-icon>
              Error en la carga
            </v-card-title>
            <v-card-text>
              <p class="text-red-darken-1">{{ error }}</p>
              <div class="mt-3">
                <v-btn
                  color="red"
                  variant="outlined"
                  size="small"
                  @click="limpiarFormulario"
                >
                  <v-icon start>mdi-refresh</v-icon>
                  Intentar nuevamente
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Sección Crear Colección -->
      <v-row justify="center" class="mt-8">
        <v-col cols="12" md="8" lg="6">
          <v-card elevation="6" class="pa-6">
            <v-card-title class="text-h5 mb-4">
              <v-icon class="me-2" color="purple">mdi-folder-plus</v-icon>
              Crear Colección
            </v-card-title>

            <v-card-text class="mb-4">
              <p class="text-body-1">
                Genera un resumen de los datos de aspirantes cargados para crear una nueva colección.
              </p>
            </v-card-text>

            <!-- Botón crear colección -->
            <v-btn
              block
              size="large"
              color="purple"
              variant="flat"
              :loading="coleccionCargada"
              :disabled="coleccionCargada"
              @click="crearColeccion"
              class="mb-4"
            >
              <v-icon start>mdi-folder-plus</v-icon>
              <span v-if="coleccionCargada">Creando...</span>
              <span v-else>Crear</span>
            </v-btn>

            <!-- Indicador de progreso para colección -->
            <v-progress-linear
              v-if="coleccionCargada"
              indeterminate
              color="purple"
              class="mb-4"
            ></v-progress-linear>
          </v-card>
        </v-col>
      </v-row>

      <!-- Mensaje de éxito para colección -->
      <v-row v-if="coleccionExitosa" justify="center" class="mt-4">
        <v-col cols="12" md="8" lg="6">
          <v-card elevation="4" color="purple-lighten-5" border="start">
            <v-card-title class="text-purple-darken-2">
              <v-icon class="me-2">mdi-check-circle</v-icon>
              ¡Colección creada exitosamente!
            </v-card-title>
            <v-card-text>
              <p class="mb-3">El resumen de aspirantes se ha generado correctamente.</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Mensaje de error para colección -->
      <v-row v-if="coleccionError && !coleccionCargada" justify="center" class="mt-4">
        <v-col cols="12" md="8" lg="6">
          <v-card elevation="4" color="red-lighten-5" border="start">
            <v-card-title class="text-red-darken-2">
              <v-icon class="me-2">mdi-alert-circle</v-icon>
              Error al crear colección
            </v-card-title>
            <v-card-text>
              <p class="text-red-darken-1">{{ coleccionError }}</p>
              <div class="mt-3">
                <v-btn
                  color="red"
                  variant="outlined"
                  size="small"
                  @click="clearCollectionForm"
                >
                  <v-icon start>mdi-refresh</v-icon>
                  Intentar nuevamente
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

    </v-container>
  </v-main>
</template>

<style scoped>
  .main-background {
    margin: 0 auto;
    padding: 40px;
    background-image: url("https://i0.wp.com/i.pinimg.com/originals/98/eb/cb/98ebcbc2ca2cec8fdce270c00482da5a.jpg");
    background-size: cover;
    background-position: center;
  }

  .text-mono {
    font-family: 'Courier New', monospace;
    font-size: 0.875rem;
  }

  pre {
    background-color: #f5f5f5;
    padding: 12px;
    border-radius: 4px;
    overflow-x: auto;
    max-height: 300px;
  }
</style>