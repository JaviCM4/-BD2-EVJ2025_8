<script setup lang="ts">
  import { ref, computed } from 'vue';
  import axios from 'axios';

  // Definir interfaces para tipado fuerte
  interface RegistroHistorial {
    correlativo_aspirante: string;
    sexo: string;
    anio_nacimiento: number;
    carrera_objetivo: string;
    departamento_institucion_educativa: string;
    municipio_institucion_educativa: string;
    tipo_institucion_educativa: string;
    anio_de_ingreso: number;
    fecha_asignacion: string;
    materia: string;
    numero_de_fecha_de_evaluacion: number;
    aprobacion: boolean;
  }

  interface EstudianteGeneral {
    aspirante: string;
    historial: MateriaHistorial[];
  }

  interface MateriaHistorial {
    materia: string;
    intentos: number;
    aprobados: number;
  }

  interface HistorialGeneral {
    message: string;
    total_estudiantes: number;
    estudiantes: EstudianteGeneral[];
  }

  interface EstudianteProcesado {
    aspirante: string;
    totalIntentos: number;
    totalAprobados: number;
    porcentajeExito: number;
    materias: number;
    historial: MateriaHistorial[];
  }

  // Estados reactivos existentes
  const cargando = ref(false);
  const carnetEstudiante = ref('');
  const datosHistorial = ref<RegistroHistorial[]>([]);
  const mensajeApi = ref('');
  const mostrarResultados = ref(false);
  const error = ref('');

  // Nuevos estados para el historial general
  const cargandoGeneral = ref(false);
  const datosHistorialGeneral = ref<HistorialGeneral>({} as HistorialGeneral);
  const mostrarModalGeneral = ref(false);
  const errorGeneral = ref('');

  // Datos del aspirante (extraídos del primer registro)
  const datosAspirante = computed(() => {
    if (datosHistorial.value.length === 0) return null;
    
    const primerRegistro = datosHistorial.value[0];
    return {
      correlativo: primerRegistro.correlativo_aspirante,
      sexo: primerRegistro.sexo,
      anioNacimiento: primerRegistro.anio_nacimiento,
      edad: new Date().getFullYear() - primerRegistro.anio_nacimiento,
      carreraObjetivo: primerRegistro.carrera_objetivo,
      departamento: primerRegistro.departamento_institucion_educativa,
      municipio: primerRegistro.municipio_institucion_educativa,
      tipoInstitucion: primerRegistro.tipo_institucion_educativa,
      anioIngreso: primerRegistro.anio_de_ingreso
    };
  });

  // Estadísticas del aspirante
  const estadisticas = computed(() => {
    if (datosHistorial.value.length === 0) return null;
    
    const totalEvaluaciones = datosHistorial.value.length;
    const aprobadas = datosHistorial.value.filter(registro => registro.aprobacion).length;
    const reprobadas = totalEvaluaciones - aprobadas;
    const porcentajeAprobacion = ((aprobadas / totalEvaluaciones) * 100).toFixed(1);
    
    // Materias únicas
    const materiasUnicas = [...new Set(datosHistorial.value.map(r => r.materia))];
    
    return {
      totalEvaluaciones,
      aprobadas,
      reprobadas,
      porcentajeAprobacion,
      totalMaterias: materiasUnicas.length,
      materias: materiasUnicas
    };
  });

  // Computed para procesar datos del historial general
  const datosHistorialProcesados = computed((): EstudianteProcesado[] => {
    if (!datosHistorialGeneral.value.estudiantes) return [];
    
    return datosHistorialGeneral.value.estudiantes.map((estudiante: EstudianteGeneral): EstudianteProcesado => {
      const totalIntentos = estudiante.historial.reduce((sum: number, materia: MateriaHistorial) => sum + materia.intentos, 0);
      const totalAprobados = estudiante.historial.reduce((sum: number, materia: MateriaHistorial) => sum + materia.aprobados, 0);
      const porcentajeExito = totalIntentos > 0 ? ((totalAprobados / totalIntentos) * 100) : 0;
      
      return {
        aspirante: estudiante.aspirante,
        totalIntentos,
        totalAprobados,
        porcentajeExito: parseFloat(porcentajeExito.toFixed(1)),
        materias: estudiante.historial.length,
        historial: estudiante.historial
      };
    });
  });

  // Headers para la tabla individual
  const headers = [
    { title: 'Fecha', key: 'fecha_asignacion', sortable: true },
    { title: 'Materia', key: 'materia', sortable: true },
    { title: 'Intento', key: 'numero_de_fecha_de_evaluacion', sortable: true },
    { title: 'Estado', key: 'aprobacion', sortable: true },
    { title: 'Año Ingreso', key: 'anio_de_ingreso', sortable: true }
  ];

  // Headers para la tabla general
  const headersGeneral = [
    { title: 'Aspirante', key: 'aspirante', sortable: true },
    { title: 'Total Intentos', key: 'totalIntentos', sortable: true },
    { title: 'Total Aprobados', key: 'totalAprobados', sortable: true },
    { title: '% Éxito', key: 'porcentajeExito', sortable: true },
    { title: 'Materias', key: 'materias', sortable: true },
    { title: 'Acciones', key: 'acciones', sortable: false }
  ];

  // Función para buscar historial individual
  const buscarHistorial = async () => {
    if (!carnetEstudiante.value.trim()) {
      error.value = 'Por favor ingresa un carnet de estudiante';
      return;
    }
    
    cargando.value = true;
    error.value = '';
    
    try {
      const response = await axios.get(`/api/aspirantes/reporte15/${carnetEstudiante.value}`);
      
      if (response.data.data && Array.isArray(response.data.data)) {
        datosHistorial.value = response.data.data;
        mensajeApi.value = response.data.message || '';
        mostrarResultados.value = true;
        
        if (datosHistorial.value.length === 0) {
          error.value = 'No se encontraron registros para este carnet';
        }
      } else {
        error.value = 'Formato de respuesta no válido';
      }
    } catch (error: any) {
      console.error('Error al buscar historial:', error);
      if (error.response?.status === 404) {
        error.value = 'No se encontraron datos para este carnet de estudiante';
      } else {
        error.value = 'Error al consultar el historial. Inténtalo nuevamente.';
      }
      datosHistorial.value = [];
      mostrarResultados.value = false;
    } finally {
      cargando.value = false;
    }
  };

  // Nueva función para cargar historial general
  const cargarHistorialGeneral = async () => {
    cargandoGeneral.value = true;
    errorGeneral.value = '';
    
    try {
      // Aquí debes cambiar la URL por tu endpoint real
      const response = await axios.get('/api/aspirantes/reporte11');
      
      datosHistorialGeneral.value = response.data;
      mostrarModalGeneral.value = true;
    } catch (error: any) {
      console.error('Error al cargar historial general:', error);
      errorGeneral.value = 'Error al cargar el historial general. Inténtalo nuevamente.';
    } finally {
      cargandoGeneral.value = false;
    }
  };

  // Función para limpiar la búsqueda
  const limpiarBusqueda = () => {
    carnetEstudiante.value = '';
    datosHistorial.value = [];
    mensajeApi.value = '';
    mostrarResultados.value = false;
    error.value = '';
  };

  // Función para formatear fecha
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-GT');
  };

  // Función para obtener color del chip de estado
  const obtenerColorEstado = (aprobacion: boolean) => {
    return aprobacion ? 'success' : 'error';
  };

  // Función para obtener texto del estado
  const obtenerTextoEstado = (aprobacion: boolean) => {
    return aprobacion ? 'Aprobado' : 'Reprobado';
  };

  // Función para obtener color según porcentaje de éxito
  const obtenerColorPorcentaje = (porcentaje: number) => {
    if (porcentaje >= 70) return 'success';
    if (porcentaje >= 50) return 'warning';
    return 'error';
  };

  // Función para buscar un aspirante específico desde la tabla general
  const buscarAspiranteDesdeGeneral = (aspirante: string) => {
    carnetEstudiante.value = aspirante;
    mostrarModalGeneral.value = false;
    buscarHistorial();
  };
</script>

<template>
  <v-container fluid class="pa-6">
    <!-- Título -->
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-6">
          <h1 class="text-h4 font-weight-bold">
            Historial Completo del Aspirante
          </h1>
          
          <!-- Botón para abrir historial general -->
          <v-btn
            @click="cargarHistorialGeneral"
            :loading="cargandoGeneral"
            color="secondary"
            variant="elevated"
            size="large"
            prepend-icon="mdi-chart-line"
          >
            Ver Historial General
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Buscador -->
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card elevation="4" class="pa-4">
          <v-card-title class="text-h6 text-center">
            <v-icon left>mdi-account-search</v-icon>
            Buscar Aspirante
          </v-card-title>
          
          <v-card-text>
            <v-text-field
              v-model="carnetEstudiante"
              label="Carnet del Estudiante"
              placeholder="Ejemplo: fd9118d2ff503e5892bcf"
              prepend-inner-icon="mdi-card-account-details"
              variant="outlined"
              :error-messages="error"
              @keyup.enter="buscarHistorial"
              :disabled="cargando"
              clearable
            />
            
            <div class="d-flex gap-3 justify-center">
              <v-btn
                @click="buscarHistorial"
                :loading="cargando"
                color="primary"
                size="large"
                prepend-icon="mdi-magnify"
              >
                Buscar Historial
              </v-btn>
              
              <v-btn
                @click="limpiarBusqueda"
                variant="outlined"
                color="secondary"
                size="large"
                prepend-icon="mdi-refresh"
              >
                Limpiar
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Modal para Historial General -->
    <v-dialog v-model="mostrarModalGeneral" max-width="1200px" scrollable>
      <v-card>
        <v-card-title class="bg-secondary text-white d-flex align-center">
          <v-icon left>mdi-chart-box-multiple</v-icon>
          <span>Historial de Desempeño General</span>
          <v-spacer></v-spacer>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="mostrarModalGeneral = false"
          ></v-btn>
        </v-card-title>

        <v-card-text class="pa-0">
          <div v-if="cargandoGeneral" class="text-center pa-8">
            <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
            <p class="mt-4">Cargando historial general...</p>
          </div>

          <div v-else-if="errorGeneral" class="pa-4">
            <v-alert type="error" :text="errorGeneral"></v-alert>
          </div>

          <div v-else-if="datosHistorialGeneral.message">
            <!-- Información general -->
            <v-card-text>
              <v-alert type="success" variant="tonal" class="mb-4">
                {{ datosHistorialGeneral.message }}
              </v-alert>
              
              <v-chip color="primary" variant="tonal" size="large" class="mb-4">
                <v-icon left>mdi-account-group</v-icon>
                Total de estudiantes: {{ datosHistorialGeneral.total_estudiantes }}
              </v-chip>
            </v-card-text>

            <!-- Tabla de historial general con tipado fuerte -->
            <v-data-table
              :headers="headersGeneral"
              :items="datosHistorialProcesados"
              :items-per-page="15"
              class="elevation-0"
              hover
            >
              <template #item.aspirante="{ item }: { item: EstudianteProcesado }">
                <v-chip color="indigo" variant="tonal" size="small">
                  {{ item.aspirante.substring(0, 10) }}...
                </v-chip>
              </template>

              <template #item.totalIntentos="{ item }: { item: EstudianteProcesado }">
                <v-chip color="blue" variant="tonal" size="small">
                  {{ item.totalIntentos }}
                </v-chip>
              </template>

              <template #item.totalAprobados="{ item }: { item: EstudianteProcesado }">
                <v-chip color="green" variant="tonal" size="small">
                  {{ item.totalAprobados }}
                </v-chip>
              </template>

              <template #item.porcentajeExito="{ item }: { item: EstudianteProcesado }">
                <v-chip 
                  :color="obtenerColorPorcentaje(item.porcentajeExito)"
                  variant="tonal"
                  size="small"
                >
                  {{ item.porcentajeExito }}%
                </v-chip>
              </template>

              <template #item.materias="{ item }: { item: EstudianteProcesado }">
                <v-chip color="purple" variant="tonal" size="small">
                  {{ item.materias }}
                </v-chip>
              </template>

              <template #item.acciones="{ item }: { item: EstudianteProcesado }">
                <v-btn
                  @click="buscarAspiranteDesdeGeneral(item.aspirante)"
                  color="primary"
                  variant="text"
                  size="small"
                  prepend-icon="mdi-eye"
                >
                  Ver Detalle
                </v-btn>
              </template>

              <!-- Expandir fila para mostrar detalles por materia -->
              <template #expanded-row="{ item }: { item: EstudianteProcesado }">
                <tr>
                  <td colspan="6" class="pa-4">
                    <v-card variant="tonal">
                      <v-card-title class="text-subtitle-1">
                        Desglose por Materia - {{ item.aspirante }}
                      </v-card-title>
                      <v-card-text>
                        <v-row>
                          <v-col 
                            v-for="materia in item.historial" 
                            :key="materia.materia"
                            cols="12" md="6" lg="4"
                          >
                            <v-card variant="outlined">
                              <v-card-text class="text-center">
                                <div class="text-h6 font-weight-bold mb-2">
                                  {{ materia.materia }}
                                </div>
                                <div class="d-flex justify-space-around">
                                  <div>
                                    <div class="text-caption">Intentos</div>
                                    <div class="text-h6">{{ materia.intentos }}</div>
                                  </div>
                                  <div>
                                    <div class="text-caption">Aprobados</div>
                                    <div class="text-h6 text-success">{{ materia.aprobados }}</div>
                                  </div>
                                </div>
                                <v-progress-linear
                                  :model-value="(materia.aprobados / materia.intentos) * 100"
                                  :color="obtenerColorPorcentaje((materia.aprobados / materia.intentos) * 100)"
                                  height="8"
                                  rounded
                                  class="mt-2"
                                ></v-progress-linear>
                              </v-card-text>
                            </v-card>
                          </v-col>
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </td>
                </tr>
              </template>
            </v-data-table>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Información del Aspirante -->
    <v-row v-if="datosAspirante && mostrarResultados" class="mt-4">
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title class="bg-primary text-white">
            <v-icon left>mdi-account</v-icon>
            Información Personal
          </v-card-title>
          
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-list density="compact">
                  <v-list-item>
                    <template #prepend>
                      <v-icon>mdi-identifier</v-icon>
                    </template>
                    <v-list-item-title>Correlativo:</v-list-item-title>
                    <v-list-item-subtitle>{{ datosAspirante.correlativo }}</v-list-item-subtitle>
                  </v-list-item>
                  
                  <v-list-item>
                    <template #prepend>
                      <v-icon>mdi-human-male-female</v-icon>
                    </template>
                    <v-list-item-title>Sexo:</v-list-item-title>
                    <v-list-item-subtitle>{{ datosAspirante.sexo === 'M' ? 'Masculino' : 'Femenino' }}</v-list-item-subtitle>
                  </v-list-item>
                  
                  <v-list-item>
                    <template #prepend>
                      <v-icon>mdi-cake</v-icon>
                    </template>
                    <v-list-item-title>Edad:</v-list-item-title>
                    <v-list-item-subtitle>{{ datosAspirante.edad }} años ({{ datosAspirante.anioNacimiento }})</v-list-item-subtitle>
                  </v-list-item>
                  
                  <v-list-item>
                    <template #prepend>
                      <v-icon>mdi-calendar</v-icon>
                    </template>
                    <v-list-item-title>Año de Ingreso:</v-list-item-title>
                    <v-list-item-subtitle>{{ datosAspirante.anioIngreso }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-list density="compact">
                  <v-list-item>
                    <template #prepend>
                      <v-icon>mdi-school</v-icon>
                    </template>
                    <v-list-item-title>Carrera Objetivo:</v-list-item-title>
                    <v-list-item-subtitle>{{ datosAspirante.carreraObjetivo }}</v-list-item-subtitle>
                  </v-list-item>
                  
                  <v-list-item>
                    <template #prepend>
                      <v-icon>mdi-map-marker</v-icon>
                    </template>
                    <v-list-item-title>Ubicación:</v-list-item-title>
                    <v-list-item-subtitle>{{ datosAspirante.municipio }}, {{ datosAspirante.departamento }}</v-list-item-subtitle>
                  </v-list-item>
                  
                  <v-list-item>
                    <template #prepend>
                      <v-icon>mdi-domain</v-icon>
                    </template>
                    <v-list-item-title>Tipo de Institución:</v-list-item-title>
                    <v-list-item-subtitle>{{ datosAspirante.tipoInstitucion }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Estadísticas -->
    <v-row v-if="estadisticas && mostrarResultados" class="mt-4">
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title class="bg-info text-white">
            <v-icon left>mdi-chart-box</v-icon>
            Estadísticas de Rendimiento
          </v-card-title>
          
          <v-card-text>
            <v-row>
              <v-col cols="6" md="3">
                <v-card variant="tonal" color="primary">
                  <v-card-text class="text-center">
                    <div class="text-h4 font-weight-bold">{{ estadisticas.totalEvaluaciones }}</div>
                    <div class="text-subtitle-1">Total Evaluaciones</div>
                  </v-card-text>
                </v-card>
              </v-col>
              
              <v-col cols="6" md="3">
                <v-card variant="tonal" color="success">
                  <v-card-text class="text-center">
                    <div class="text-h4 font-weight-bold">{{ estadisticas.aprobadas }}</div>
                    <div class="text-subtitle-1">Aprobadas</div>
                  </v-card-text>
                </v-card>
              </v-col>
              
              <v-col cols="6" md="3">
                <v-card variant="tonal" color="error">
                  <v-card-text class="text-center">
                    <div class="text-h4 font-weight-bold">{{ estadisticas.reprobadas }}</div>
                    <div class="text-subtitle-1">Reprobadas</div>
                  </v-card-text>
                </v-card>
              </v-col>
              
              <v-col cols="6" md="3">
                <v-card variant="tonal" color="warning">
                  <v-card-text class="text-center">
                    <div class="text-h4 font-weight-bold">{{ estadisticas.porcentajeAprobacion }}%</div>
                    <div class="text-subtitle-1">Tasa de Aprobación</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
            
            <v-row class="mt-2">
              <v-col cols="12">
                <div class="text-subtitle-1 font-weight-bold mb-2">
                  Materias Evaluadas ({{ estadisticas.totalMaterias }}):
                </div>
                <div class="d-flex flex-wrap gap-2">
                  <v-chip
                    v-for="materia in estadisticas.materias"
                    :key="materia"
                    color="secondary"
                    variant="tonal"
                    size="small"
                  >
                    {{ materia }}
                  </v-chip>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tabla de Historial con tipado fuerte -->
    <v-row v-if="mostrarResultados && datosHistorial.length > 0" class="mt-4">
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title class="bg-secondary text-white">
            <v-icon left>mdi-history</v-icon>
            Historial Detallado de Evaluaciones
          </v-card-title>
          
          <v-data-table
            :headers="headers"
            :items="datosHistorial"
            :items-per-page="10"
            class="elevation-0"
            hover
          >
            <template #item.fecha_asignacion="{ item }: { item: RegistroHistorial }">
              <v-chip color="blue-grey" variant="tonal" size="small">
                {{ formatearFecha(item.fecha_asignacion) }}
              </v-chip>
            </template>
            
            <template #item.materia="{ item }: { item: RegistroHistorial }">
              <v-chip color="indigo" variant="tonal" size="small">
                {{ item.materia }}
              </v-chip>
            </template>
            
            <template #item.numero_de_fecha_de_evaluacion="{ item }: { item: RegistroHistorial }">
              <v-chip color="orange" variant="tonal" size="small">
                Intento {{ item.numero_de_fecha_de_evaluacion }}
              </v-chip>
            </template>
            
            <template #item.aprobacion="{ item }: { item: RegistroHistorial }">
              <v-chip
                :color="obtenerColorEstado(item.aprobacion)"
                variant="tonal"
                size="small"
              >
                <v-icon left size="small">
                  {{ item.aprobacion ? 'mdi-check' : 'mdi-close' }}
                </v-icon>
                {{ obtenerTextoEstado(item.aprobacion) }}
              </v-chip>
            </template>
            
            <template #item.anio_de_ingreso="{ item }: { item: RegistroHistorial }">
              <span class="font-weight-medium">{{ item.anio_de_ingreso }}</span>
            </template>
            
            <template #bottom>
              <div class="text-center pt-2">
                <span class="text-caption text-medium-emphasis">
                  Total de registros: {{ datosHistorial.length }}
                </span>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Estado vacío cuando no hay resultados -->
    <v-row v-if="mostrarResultados && datosHistorial.length === 0 && !cargando" class="mt-8">
      <v-col cols="12">
        <v-card elevation="2" class="text-center pa-8">
          <v-icon size="64" color="grey-lighten-1">mdi-database-search</v-icon>
          <h3 class="text-h6 mt-4 mb-2">No se encontraron registros</h3>
          <p class="text-body-2 text-medium-emphasis mb-4">
            No hay historial disponible para el carnet ingresado
          </p>
          <v-btn @click="limpiarBusqueda" color="primary" variant="outlined">
            Realizar nueva búsqueda
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
  .pa-6 {
    margin: 0 auto;
    padding: 40px;
    background-image: url("https://i0.wp.com/i.pinimg.com/originals/98/eb/cb/98ebcbc2ca2cec8fdce270c00482da5a.jpg");
    background-size: cover;
    background-position: center;
    min-height: 100vh;
  }

  .v-card {
    transition: all 0.3s ease;
  }

  .v-card:hover {
    transform: translateY(-2px);
  }

  .v-data-table {
    border-radius: 0 0 8px 8px;
  }

  .v-chip {
    font-weight: 500;
  }

  .v-dialog .v-card {
    border-radius: 12px;
    overflow: hidden;
  }

  .v-dialog .v-card-title {
    position: sticky;
    top: 0;
    z-index: 1;
  }
</style>