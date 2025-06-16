<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';
  import {Chart,CategoryScale,LinearScale,BarElement,BarController,LineController,LineElement,PointElement,Title,Tooltip,Legend,type ChartConfiguration} from 'chart.js';

  Chart.register(CategoryScale,LinearScale,BarElement,BarController,LineController,LineElement,PointElement,Title,Tooltip,Legend);

  // Referencias para el canvas y la instancia del chart
  const chartCanvas = ref<HTMLCanvasElement | null>(null);
  let chartInstance: Chart | null = null;

  // Estados reactivos
  const isLoading = ref(false);
  const apiData = ref<any[]>([]);
  const selectedFields = ref<string[]>([]);
  const availableFields = ref<string[]>([]);

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
      'rgba(99, 255, 132, 0.8)'
    ];
    
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(colors[i % colors.length]);
    }
    return result;
  };

  // Función para procesar datos de la API automáticamente
  const processApiData = (data: any[]) => {
    if (!data || data.length === 0) return;

    // Detectar automáticamente los campos disponibles
    const firstItem = data[0];
    const fields = Object.keys(firstItem).filter(key => {
      const value = firstItem[key];
      // Solo incluir campos que sean números o strings que puedan convertirse a números
      return typeof value === 'number' || 
             (typeof value === 'string' && !isNaN(Number(value))) ||
             typeof value === 'string';
    });
    
    availableFields.value = fields;
    
    // Si no hay campos seleccionados, seleccionar los primeros dos automáticamente
    if (selectedFields.value.length === 0) {
      selectedFields.value = fields.slice(0, 2);
    }

    updateChart();
  };

  // Función para determinar qué campo usar como etiqueta (label)
  const getLabelField = () => {
    const firstItem = apiData.value[0];
    // Buscar campos que parezcan ser etiquetas (strings, fechas, nombres, etc.)
    const labelFields = Object.keys(firstItem).filter(key => {
      const value = firstItem[key];
      return typeof value === 'string' && isNaN(Number(value));
    });
    
    return labelFields[0] || Object.keys(firstItem)[0];
  };

  // Función para actualizar la gráfica con los datos procesados
  const updateChart = () => {
    if (!apiData.value.length || !selectedFields.value.length) return;

    const labelField = getLabelField();
    const labels = apiData.value.map(item => item[labelField] || `Item ${apiData.value.indexOf(item) + 1}`);
    
    const datasets = selectedFields.value.map((field, index) => {
      const data = apiData.value.map(item => {
        const value = item[field];
        return typeof value === 'number' ? value : (isNaN(Number(value)) ? 0 : Number(value));
      });
      
      const colors = generarColores(selectedFields.value.length);
      
      return {
        label: field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' '),
        data: data,
        backgroundColor: colors[index],
        borderColor: colors[index].replace('0.8', '1'),
        borderWidth: 2
      };
    });

    // Actualizar datos del chart
    if (chartInstance) {
      chartInstance.data.labels = labels;
      chartInstance.data.datasets = datasets;
      chartInstance.update();
    } else {
      createChart(labels, datasets);
    }
  };

  // Configuración dinámica del chart
  const createChart = (labels: string[], datasets: any[]) => {
    if (!chartCanvas.value) return;

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
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
            text: 'Datos desde API'
          },
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Valores'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Categorías'
            }
          }
        }
      }
    };

    if (chartInstance) {
      chartInstance.destroy();
    }
    
    chartInstance = new Chart(chartCanvas.value, config);
  };

  const datosDeEjemplo = [
    { nombre: 'Estudiante A', edad: 22, experiencia: 2, puntuacion: 85, categoria: 'Junior' },
    { nombre: 'Estudiante B', edad: 28, experiencia: 5, puntuacion: 92, categoria: 'Senior' },
    { nombre: 'Estudiante C', edad: 25, experiencia: 3, puntuacion: 78, categoria: 'Mid' },
    { nombre: 'Estudiante D', edad: 30, experiencia: 7, puntuacion: 95, categoria: 'Senior' },
    { nombre: 'Estudiante E', edad: 24, experiencia: 1, puntuacion: 72, categoria: 'Junior' },
    { nombre: 'Estudiante F', edad: 32, experiencia: 8, puntuacion: 88, categoria: 'Senior' },
  ];

  // Peticiones Http mejorada
  const consultaGet = async () => {
    apiData.value = datosDeEjemplo;
    processApiData(datosDeEjemplo);
  };

  // Función para cambiar el tipo de gráfica
  const changeChartType = (type: 'bar' | 'line') => {
    if (chartInstance) {
      chartInstance.destroy();
      const config = chartInstance.config as ChartConfiguration<any>;
      config.type = type;
      chartInstance = new Chart(chartCanvas.value!, config);
    }
  };

  // Función para cambiar campos seleccionados
  const toggleField = (field: string) => {
    const index = selectedFields.value.indexOf(field);
    if (index > -1) {
      selectedFields.value.splice(index, 1);
    } else {
      selectedFields.value.push(field);
    }
    updateChart();
  };

  // Ciclo de Vida
  onMounted(() => {
    consultaGet();
  });

  onUnmounted(() => {
    if (chartInstance) {
      chartInstance.destroy();
    }
  });
</script>

<template>
  
  <div class="container">
    <h1>Información de los Aspirantes</h1>
    
    <!-- Controles para cargar datos -->
    <div class="controls">
      <button @click="consultaGet" class="btn btn-primary" :disabled="isLoading">
        {{ isLoading ? 'Cargando...' : 'Recargar Datos' }}
      </button>
      <button @click="changeChartType('bar')" class="btn btn-secondary">
        Barras
      </button>
      <button @click="changeChartType('line')" class="btn btn-secondary">
        Líneas
      </button>
    </div>

    <!-- Selector de campos (solo si hay datos) -->
    <div v-if="availableFields.length > 0" class="field-selector">
      <h3>Seleccionar campos para mostrar:</h3>
      <div class="checkbox-group">
        <label v-for="field in availableFields" :key="field" class="checkbox-label">
          <input 
            type="checkbox" 
            :value="field" 
            :checked="selectedFields.includes(field)"
            @change="toggleField(field)"
          />
          <span>{{ field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ') }}</span>
        </label>
      </div>
    </div>
    
    <!-- Contenedor de la gráfica -->
    <div class="chart-container">
      <div v-if="isLoading" class="loading">
        <p>Cargando datos...</p>
      </div>
      <div v-else-if="!apiData.length" class="no-data">
        <p>No hay datos disponibles</p>
      </div>
      <canvas v-else ref="chartCanvas"></canvas>
    </div>
    
    <!-- Información adicional -->
    <div v-if="apiData.length > 0" class="info-cards">
      <div class="card">
        <h3>Total Registros</h3>
        <p class="number">{{ apiData.length }}</p>
      </div>
      <div class="card">
        <h3>Campos Disponibles</h3>
        <p class="number">{{ availableFields.length }}</p>
      </div>
      <div class="card">
        <h3>Campos Seleccionados</h3>
        <p class="number">{{ selectedFields.length }}</p>
      </div>
    </div>

    <!-- Debug info (remover en producción) -->
    <div v-if="apiData.length > 0" class="debug-info">
      <h4>Vista previa de datos:</h4>
      <pre>{{ JSON.stringify(apiData.slice(0, 2), null, 2) }}</pre>
    </div>
  </div>
</template>

<style scoped>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  h1 {
    margin-top: 80px;
    text-align: center;
    color: #333;
    margin-bottom: 30px;
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
    border: none;
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

  .checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 5px;
    transition: background-color 0.2s;
  }

  .checkbox-label:hover {
    background-color: #e9ecef;
  }

  .checkbox-label input[type="checkbox"] {
    margin: 0;
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

    .checkbox-group {
      flex-direction: column;
    }
  }
</style>