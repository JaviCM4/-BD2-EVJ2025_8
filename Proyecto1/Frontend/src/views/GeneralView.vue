<script setup lang="ts">
  import { ref, onMounted as montar, onUnmounted as desmontar } from 'vue';
  import {Chart,CategoryScale,LinearScale,BarElement,BarController,LineController,LineElement,PointElement,ArcElement,PieController,Title,Tooltip,Legend,type ChartConfiguration} from 'chart.js';
  import axios from 'axios';
  import Zoom from 'chartjs-plugin-zoom';

  Chart.register(CategoryScale,LinearScale,BarElement,BarController,LineController,LineElement,PointElement,ArcElement,PieController,Title,Tooltip,Legend,Zoom);

  // Referencias para el canvas y la instancia del chart
  const chartCanvas = ref<HTMLCanvasElement | null>(null);
  let instanciaGrafica: Chart | null = null;

  // Estados reactivos
  const cargando = ref(false);
  const datosApi = ref<any[]>([]);
  const camposSeleccinados = ref<string[]>([]);
  const camposDisponibles = ref<string[]>([]);
  const mensajeApi = ref<string>(''); // Para mostrar el mensaje de la API
  const tipoGraficaActual = ref<'bar' | 'pie'>('bar'); // NUEVO: Estado para el tipo de gráfica
  
  // NUEVO: Estado para el reporte seleccionado
  const reporteSeleccionado = ref<number>(1);

  // NUEVO: Lista de reportes disponibles con nombres descriptivos
  const reportesDisponibles = ref([
    { valor: 1, nombre: 'Reporte 1 - Aspirantes por tipo de institución educativa' },
    { valor: 2, nombre: 'Reporte 2 - Cantidad de aprobados por materia' },
    { valor: 3, nombre: 'Reporte 3 - Aprobados por carrera y año' },
    { valor: 4, nombre: 'Reporte 4 - Porcentaje de aprobación por materia' },
    { valor: 5, nombre: 'Reporte 5 - Promedio de edad por carrera' },
    { valor: 6, nombre: 'Reporte 6 - Creación de colección auxiliar ' },
    { valor: 7, nombre: 'Reporte 7 - Promedio de edad de los aspirantes que aprobaron por carrera y tipo de institución' },
    { valor: 8, nombre: 'Reporte 8 - Distribución de aprobados por municipio y carrera objetivo' },
    { valor: 9, nombre: 'Reporte 9 - Cantidad de evaluaciones por mes y materia, sólo para instituciones públicas' },
    { valor: 10, nombre: 'Reporte 10 - Top 5 carreras más demandadas por aspirantes entre 16 y 18 años' },
    { valor: 11, nombre: 'Reporte 11 - Historial de desempeño por aspirante con desglose de intentos por materia y resultados ' },
    { valor: 12, nombre: 'Reporte 12 - Distribución por sexo y tipo de institución' },
    { valor: 13, nombre: 'Reporte 13 - Tasa de aprobación por edad ' },
    { valor: 14, nombre: 'Reporte 14 - Número promedio de intentos por materia' },
    { valor: 15, nombre: 'Reporte 15 - Historial completo de un aspirante ' },
    { valor: 16, nombre: 'Reporte 16 - Carreras con más aspirantes reprobados en primer intento' }
  ]);

  const generarColores = (count: number) => {
    const colors = [
      'rgba(255, 99, 132, 0.8)',
      'rgba(54, 162, 235, 0.8)',
      'rgba(255, 205, 86, 0.8)',
      'rgba(75, 192, 192, 0.8)',
      'rgba(153, 102, 255, 0.8)',
      'rgba(255, 159, 64, 0.8)',
      'rgba(199, 199, 199, 0.8)',
      'rgba(83, 102, 255, 0.8)',
      'rgba(255, 99, 255, 0.8)',
      'rgba(99, 255, 132, 0.8)',
      'rgba(255, 159, 132, 0.8)',
      'rgba(132, 255, 99, 0.8)',
      'rgba(159, 132, 255, 0.8)',
      'rgba(255, 205, 132, 0.8)',
      'rgba(132, 205, 255, 0.8)'
    ];
    
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(colors[i % colors.length]);
    }
    return result;
  };

  // Reemplazar la función procesarDatos existente
  const procesarDatos = (data: any[]) => {
    if (!data || data.length === 0) return;

    const primerElemento = data[0];
    
    // NUEVO: Lógica especial para el reporte 13
    if (reporteSeleccionado.value === 13) {
      // Primero identificar los campos de edad
      const camposEdad = Object.keys(primerElemento).filter(key => 
        key.toLowerCase().includes('edad') || 
        key.toLowerCase().includes('age') ||
        key.toLowerCase().includes('anos') ||
        key.toLowerCase().includes('años')
      );
      
      // Filtrar campos numéricos EXCLUYENDO los campos de edad
      const campos = Object.keys(primerElemento).filter(key => {
        const value = primerElemento[key];
        // Excluir campos de edad del reporte 13
        if (camposEdad.includes(key)) {
          return false;
        }
        // Solo incluir campos numéricos
        return typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)) && value.trim() !== '');
      });
      
      camposDisponibles.value = campos;
    } else {
      // Lógica original para otros reportes
      const campos = Object.keys(primerElemento).filter(key => {
        const value = primerElemento[key];
        return typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)) && value.trim() !== '');
      });
      
      camposDisponibles.value = campos;
    }
    
    // Si no hay campos seleccionados, seleccionar el primer campo numérico automáticamente
    if (camposSeleccinados.value.length === 0 && camposDisponibles.value.length > 0) {
      camposSeleccinados.value = [camposDisponibles.value[0]];
    }
    
    actualizarGrafica();
  };

  // Reemplazar la función obtenerEtiqueta existente
  const obtenerEtiqueta = () => {
    const firstItem = datosApi.value[0];
    
    // NUEVO: Para el reporte 13, usar las edades como etiquetas
    if (reporteSeleccionado.value === 13) {
      return 'edad_label'; // Identificador especial para el reporte 13
    }
    
    // Lógica original para otros reportes
    const labelFields = Object.keys(firstItem).filter(key => {
      const value = firstItem[key];
      return typeof value === 'string' && (isNaN(Number(value)) || value.trim() === '');
    });
    
    if (labelFields.length === 0) {
      return Object.keys(firstItem)[0];
    }
    
    if (labelFields.length === 1) {
      return labelFields[0];
    }
    
    return 'combined_label';
  };

  // Reemplazar la función generarEtiquetaCombinada existente
  const generarEtiquetaCombinada = (item: any) => {
    // NUEVO: Lógica especial para el reporte 13
    if (reporteSeleccionado.value === 13) {
      // Buscar el campo que represente la edad (puede ser 'edad', 'age', etc.)
      const camposEdad = Object.keys(item).filter(key => 
        key.toLowerCase().includes('edad') || 
        key.toLowerCase().includes('age') ||
        key.toLowerCase().includes('anos') ||
        key.toLowerCase().includes('años')
      );
      
      if (camposEdad.length > 0) {
        return `${item[camposEdad[0]]} años`;
      }
      
      // Si no encuentra campo de edad, usar el primer campo de texto
      const firstItem = datosApi.value[0];
      const labelFields = Object.keys(firstItem).filter(key => {
        const value = firstItem[key];
        return typeof value === 'string' && (isNaN(Number(value)) || value.trim() === '');
      });
      
      if (labelFields.length > 0) {
        return item[labelFields[0]] || 'Sin datos';
      }
      
      return `Edad ${datosApi.value.indexOf(item) + 1}`;
    }
    
    // Lógica original para otros reportes
    const firstItem = datosApi.value[0];
    const labelFields = Object.keys(firstItem).filter(key => {
      const value = firstItem[key];
      return typeof value === 'string' && (isNaN(Number(value)) || value.trim() === '');
    });
    
    if (labelFields.length === 0) {
      return `Item ${datosApi.value.indexOf(item) + 1}`;
    }
    
    if (labelFields.length === 1) {
      return item[labelFields[0]] || 'Sin datos';
    }
    
    const combinedLabel = labelFields
      .map(field => item[field] || 'SIN DATOS')
      .join(' - ');
      
    return combinedLabel;
  };

  // MODIFICAR la función actualizarGrafica para usar las nuevas etiquetas
  const actualizarGrafica = () => {
    if (!datosApi.value.length || !camposSeleccinados.value.length) return;

    // MODIFICADO: Usar la nueva función para generar etiquetas combinadas
    const labels = datosApi.value.map(item => generarEtiquetaCombinada(item));
    
    // MODIFICADO: Configuración especial para gráfico de pastel
    if (tipoGraficaActual.value === 'pie') {
      // Para gráfico de pastel, solo usar el primer campo seleccionado
      const field = camposSeleccinados.value[0];
      const data = datosApi.value.map(item => {
        const value = item[field];
        return typeof value === 'number' ? value : (isNaN(Number(value)) ? 0 : Number(value));
      });
      
      const colors = generarColores(data.length);
      
      const datasets = [{
        label: field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' '),
        data: data,
        backgroundColor: colors,
        borderColor: colors.map(color => color.replace('0.8', '1')),
        borderWidth: 2
      }];

      // Actualizar datos del chart
      if (instanciaGrafica) {
        instanciaGrafica.data.labels = labels;
        instanciaGrafica.data.datasets = datasets;
        instanciaGrafica.update();
      } else {
        crearGrafica(labels, datasets);
      }
    } else {
      // Para gráficos de barras y líneas (configuración original)
      const datasets = camposSeleccinados.value.map((field, index) => {
        const data = datosApi.value.map(item => {
          const value = item[field];
          return typeof value === 'number' ? value : (isNaN(Number(value)) ? 0 : Number(value));
        });
        
        const colors = generarColores(camposSeleccinados.value.length);
        
        return {
          label: field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' '),
          data: data,
          backgroundColor: colors[index],
          borderColor: colors[index].replace('0.8', '1'),
          borderWidth: 2
        };
      });

      // Actualizar datos del chart
      if (instanciaGrafica) {
        instanciaGrafica.data.labels = labels;
        instanciaGrafica.data.datasets = datasets;
        instanciaGrafica.update();
      } else {
        crearGrafica(labels, datasets);
      }
    }
  };

  // MODIFICADO: Actualizar el título de la gráfica según el reporte seleccionado
  const obtenerTituloGrafica = () => {
    const reporteActual = reportesDisponibles.value.find(r => r.valor === reporteSeleccionado.value);
    return reporteActual ? reporteActual.nombre : `Reporte ${reporteSeleccionado.value}`;
  };

  // MODIFICADO: Configuración dinámica del chart
  const crearGrafica = (labels: string[], datasets: any[]) => {
    if (!chartCanvas.value) return;

    // MODIFICADO: Configuración específica para cada tipo de gráfica
    const config: ChartConfiguration<any> = {
      type: tipoGraficaActual.value,
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: obtenerTituloGrafica()
          },
          legend: {
            display: true,
            position: tipoGraficaActual.value === 'pie' ? 'right' : 'top'
          },
          // NUEVO: Configuración de zoom
          zoom: tipoGraficaActual.value !== 'pie' ? {
            limits: {
              y: {min: 0, max: 'original'},
              x: {min: 'original', max: 'original'}
            },
            pan: {
              enabled: true,
              mode: 'xy',
              threshold: 10,
            },
            zoom: {
              wheel: {
                enabled: true,
              },
              pinch: {
                enabled: true
              },
              mode: 'xy',
              sensitivity: 3,
            }
          } : undefined,



          // NUEVO: Configuración especial para tooltips en gráfico de pastel
          tooltip: tipoGraficaActual.value === 'pie' ? {
            callbacks: {
              label: function(context: any) {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          } : undefined
        },
        // MODIFICADO: Escalas solo para gráficos que no sean de pastel
        scales: tipoGraficaActual.value !== 'pie' ? {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Cantidad de Aspirantes'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Categorías'
            }
          }
        } : undefined
      }
    };

    if (instanciaGrafica) {
      instanciaGrafica.destroy();
    }
    
    instanciaGrafica = new Chart(chartCanvas.value, config);
  };

  // MODIFICADO: Petición HTTP que usa el reporte seleccionado
  const consultaGet = async () => {
    cargando.value = true;

    try {
      // MODIFICADO: URL dinámica basada en el reporte seleccionado
      const response = await axios.get(`/api/aspirantes/reporte${reporteSeleccionado.value}`);

      // Manejar tanto la estructura con 'data' como array directo
      let datos: any[] = [];
      let mensaje = '';
      
      if (response.data.data && Array.isArray(response.data.data)) {
        // Estructura: { message: "", data: [] }
        datos = response.data.data;
        mensaje = response.data.message || '';
      } else if (Array.isArray(response.data)) {
        // Estructura: array directo
        datos = response.data;
      } else {
        console.error('Estructura de respuesta no reconocida:', response.data);
        alert('La estructura de datos recibida no es compatible');
        return;
      }

      if (datos.length > 0) {
        datosApi.value = datos;
        mensajeApi.value = mensaje;
        procesarDatos(datos);
        console.log('Datos obtenidos:', datos);
        console.log('Mensaje:', mensaje);
      } else {
        console.warn('No se recibieron datos');
        alert('No se encontraron datos para mostrar');
      }
    } catch (error) {
      console.error('Error al enviar datos:', error);
      alert('Hubo un error al buscar los datos. Inténtelo nuevamente más tarde');
    } finally {
      cargando.value = false;
    }
  };

  // NUEVO: Función que se ejecuta cuando cambia el reporte seleccionado
  const cambiarReporte = () => {
    // Limpiar datos anteriores
    camposSeleccinados.value = [];
    camposDisponibles.value = [];
    
    // Cargar nuevos datos
    consultaGet();
  };

  // MODIFICADO: Función para cambiar el tipo de gráfica
  const cambiarTipoGrafica = (type: 'bar' | 'pie') => {
    tipoGraficaActual.value = type;
    
    if (instanciaGrafica) {
      instanciaGrafica.destroy();
      instanciaGrafica = null;
    }
    
    // NUEVO: Si cambiamos a gráfico de pastel y hay múltiples campos seleccionados,
    // seleccionar solo el primero
    if (type === 'pie' && camposSeleccinados.value.length > 1) {
      camposSeleccinados.value = [camposSeleccinados.value[0]];
    }
    
    actualizarGrafica();
  };

  // Función para cambiar campos seleccionados
  const intercalarCampos = (field: string) => {
    const index = camposSeleccinados.value.indexOf(field);
    if (index > -1) {
      camposSeleccinados.value.splice(index, 1);
    } else {
      // NUEVO: Si es gráfico de pastel, solo permitir un campo
      if (tipoGraficaActual.value === 'pie') {
        camposSeleccinados.value = [field];
      } else {
        camposSeleccinados.value.push(field);
      }
    }
    actualizarGrafica();
  };

  // Función para resetear el zoom
  const resetZoom = () => {
    if (instanciaGrafica && instanciaGrafica.resetZoom) {
      instanciaGrafica.resetZoom();
    }
  };

  // Función para hacer zoom in
  const zoomIn = () => {
    if (instanciaGrafica && instanciaGrafica.zoom) {
      instanciaGrafica.zoom(1.1);
    }
  };

  // Función para hacer zoom out
  const zoomOut = () => {
    if (instanciaGrafica && instanciaGrafica.zoom) {
      instanciaGrafica.zoom(0.9);
    }
  };

  // Ciclo de Vida
  montar(() => {
    consultaGet();
  });

  desmontar(() => { 
    if (instanciaGrafica) {
      instanciaGrafica.destroy();
    }
  });
</script>

<template> 
  <div class="container">
    <h1>Información de los Aspirantes</h1>
    
    <!-- NUEVO: Selector de reporte -->
    <div class="report-selector">
      <label for="reporte-select">Seleccionar Reporte:</label>
      <select 
        id="reporte-select" 
        v-model="reporteSeleccionado" 
        @change="cambiarReporte"
        class="select-reporte"
      >
        <option 
          v-for="reporte in reportesDisponibles" 
          :key="reporte.valor" 
          :value="reporte.valor"
        >
          {{ reporte.nombre }}
        </option>
      </select>
    </div>
    
    <!-- Controles para cargar datos -->
    <div class="controls">
      <button @click="consultaGet" class="btn btn-primary" :disabled="cargando">
        {{ cargando ? 'Cargando...' : 'Recargar Datos' }}
      </button>
      <button 
        @click="cambiarTipoGrafica('bar')" 
        class="btn"
        :class="tipoGraficaActual === 'bar' ? 'btn-active' : 'btn-secondary'"
      >
        Barras
      </button>
      <button 
        @click="cambiarTipoGrafica('pie')" 
        class="btn"
        :class="tipoGraficaActual === 'pie' ? 'btn-active' : 'btn-secondary'"
      >
        Pastel
      </button>
    </div>

    <!-- MODIFICADO: Aviso para gráfico de pastel -->
    <div v-if="tipoGraficaActual === 'pie' && camposDisponibles.length > 0" class="pie-notice">
      <p><strong>Nota:</strong> El gráfico de pastel solo muestra un campo a la vez. Selecciona el campo que deseas visualizar.</p>
    </div>

    <!-- Selector de campos (solo si hay datos) -->
    <div v-if="camposDisponibles.length > 0" class="field-selector">
      <h3>Seleccionar campos para mostrar:</h3>
      <div class="checkbox-grid">
        <label v-for="field in camposDisponibles" :key="field" class="checkbox-card">
          <input 
            type="checkbox" 
            :value="field" 
            :checked="camposSeleccinados.includes(field)"
            @change="intercalarCampos(field)"
            :disabled="tipoGraficaActual === 'pie' && camposSeleccinados.includes(field) === false && camposSeleccinados.length >= 1"
            class="checkbox-input"
          />
          <div class="checkbox-content">
            <div class="checkbox-icon">
              <svg v-if="camposSeleccinados.includes(field)" class="check-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
            <span class="checkbox-text">{{ field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ') }}</span>
          </div>
        </label>
      </div>
    </div>
    
    <!-- Contenedor de la gráfica -->
    <div class="chart-container">
      <div v-if="cargando" class="loading">
        <p>Cargando datos...</p>
      </div>
      <div v-else-if="!datosApi.length" class="no-data">
        <p>No hay datos disponibles</p>
      </div>
      <canvas v-else ref="chartCanvas"></canvas>
    </div>
    

    <!-- Agregar después de los botones existentes en .controls -->
    <div class="zoom-controls" v-if="tipoGraficaActual === 'bar'">
      <button @click="resetZoom" class="btn btn-secondary">
        🔍 Reset Zoom
      </button>
    </div>

    <!-- Información adicional -->
    <div v-if="datosApi.length > 0" class="info-cards">
      <div class="card">
        <h3>Reporte Actual</h3>
        <p class="number">{{ reporteSeleccionado }}</p>
      </div>
      <div class="card">
        <h3>Tipo de Gráfica</h3>
        <p class="chart-type">{{ tipoGraficaActual === 'bar' ? 'Barras' : 'Pastel' }}</p>
      </div>
      <div class="card">
        <h3>Total Registros</h3>
        <p class="number">{{ datosApi.length }}</p>
      </div>
      <div class="card">
        <h3>Campos Disponibles</h3>
        <p class="number">{{ camposDisponibles.length }}</p>
      </div>
      <div class="card">
        <h3>Campos Seleccionados</h3>
        <p class="number">{{ camposSeleccinados.length }}</p>
      </div>
    </div>

    <!-- Debug info (remover en producción) -->
    <div v-if="datosApi.length > 0" class="debug-info">
      <h4>Vista previa de datos:</h4>
      <pre>{{ JSON.stringify(datosApi.slice(0, 2), null, 2) }}</pre>
    </div>
  </div>
</template>

<style scoped>
  .container {
    margin: 0 auto;
    padding: 40px;
    background-color: #0ad2f5;
  }

  h1 {
    margin-top: 80px;
    text-align: center;
    color: #333;
    margin-bottom: 30px;
  }

  /* NUEVO: Estilos para el selector de reporte */
  .report-selector {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 10px;
    margin-bottom: 30px;
    text-align: center;
  }

  .report-selector label {
    display: block;
    margin-bottom: 10px;
    font-weight: 600;
    color: #333;
  }

  .select-reporte {
    padding: 10px 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
    background: rgb(255, 255, 255);
    color: #333;
    cursor: pointer;
    transition: border-color 0.3s ease;
    width: 1170px;
  }

  .select-reporte:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
  }

  .select-reporte:hover {
    border-color: #007bff;
  }

  .pie-notice {
    background: #fff3cd;
    color: #856404;
    padding: 10px 15px;
    border-radius: 5px;
    margin-bottom: 20px;
    border-left: 4px solid #ffc107;
  }

  .controls {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-bottom: 30px;
    flex-wrap: wrap;
  }

  .btn {
    padding: 10px 20px;
    border: 2px solid black;
    border-radius: 5px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-primary {
    background-color: #007bff;
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background-color: #0056b3;
  }

  .btn-secondary {
    background-color: #6c757d;
    color: white;
  }

  .btn-secondary:hover {
    background-color: #545b62;
  }

  /* NUEVO: Estilo para botón activo */
  .btn-active {
    background-color: #28a745;
    color: white;
  }

  .btn-active:hover {
    background-color: #218838;
  }

  .field-selector {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 10px;
    margin-bottom: 30px;
  }

  .field-selector h3 {
    margin: 0 0 15px 0;
    color: #333;
  }

  .checkbox-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
  }

  .checkbox-card {
    position: relative;
    display: block;
    background: white;
    border: 2px solid #e9ecef;
    border-radius: 12px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .checkbox-card:hover {
    border-color: #007bff;
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
    transform: translateY(-2px);
  }

  .checkbox-card:has(.checkbox-input:checked) {
    border-color: #007bff;
    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
    color: white;
    box-shadow: 0 6px 20px rgba(0, 123, 255, 0.3);
  }

  .checkbox-card:has(.checkbox-input:disabled) {
    opacity: 0.5;
    cursor: not-allowed;
    background: #f8f9fa;
  }

  .checkbox-card:has(.checkbox-input:disabled):hover {
    border-color: #e9ecef;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transform: none;
  }

  .checkbox-input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .checkbox-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .checkbox-icon {
    width: 24px;
    height: 24px;
    border: 2px solid #dee2e6;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    transition: all 0.3s ease;
    flex-shrink: 0;
  }

  .checkbox-card:has(.checkbox-input:checked) .checkbox-icon {
    background: white;
    border-color: white;
    color: #007bff;
  }

  .checkbox-card:has(.checkbox-input:disabled) .checkbox-icon {
    background: #e9ecef;
    border-color: #dee2e6;
  }

  .check-icon {
    width: 16px;
    height: 16px;
    opacity: 0;
    transform: scale(0.5);
    transition: all 0.2s ease;
  }

  .checkbox-card:has(.checkbox-input:checked) .check-icon {
    opacity: 1;
    transform: scale(1);
  }

  .checkbox-text {
    font-weight: 500;
    font-size: 14px;
    line-height: 1.4;
    transition: color 0.3s ease;
  }

  .checkbox-card:has(.checkbox-input:checked) .checkbox-text {
    color: white;
    font-weight: 600;
  }

  .checkbox-card:has(.checkbox-input:disabled) .checkbox-text {
    color: #6c757d;
  }

  .chart-container {
    position: relative;
    height: 400px;
    width: 100%;
    margin-bottom: 30px;
    background: white;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .loading, .no-data {
    text-align: center;
    color: #666;
    font-size: 1.1rem;
  }

  .info-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-top: 30px;
  }

  .card {
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    text-align: center;
    border-left: 4px solid #007bff;
  }

  .card h3 {
    margin: 0 0 10px 0;
    color: #666;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .card .number {
    margin: 0;
    font-size: 2rem;
    font-weight: bold;
    color: #333;
  }

  /* NUEVO: Estilo para el tipo de gráfica */
  .card .chart-type {
    margin: 0;
    font-size: 1.5rem;
    font-weight: bold;
    color: #007bff;
    text-transform: capitalize;
  }

  .debug-info {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 5px;
    margin-top: 30px;
    border-left: 4px solid #17a2b8;
  }

  .debug-info h4 {
    margin: 0 0 10px 0;
    color: #333;
  }

  .debug-info pre {
    background: #fff;
    padding: 10px;
    border-radius: 3px;
    font-size: 0.8rem;
    overflow-x: auto;
  }

  @media (max-width: 768px) {
    .container {
      padding: 10px;
    }
    
    .chart-container {
      height: 300px;
      padding: 10px;
    }
    
    .controls {
      flex-direction: column;
      align-items: center;
    }
    
    .btn {
      width: 200px;
    }

    .checkbox-grid {
      grid-template-columns: 1fr;
    }

    .select-reporte {
      min-width: 250px;
      font-size: 14px;
    }
  }

  .zoom-controls {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-top: 10px;
    flex-wrap: wrap;
  }

  .zoom-controls .btn {
    font-size: 14px;
    padding: 8px 16px;
  }
</style>