<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';
  import {Chart,CategoryScale,LinearScale,BarElement,BarController,LineController,LineElement,PointElement,Title,Tooltip,Legend,type ChartConfiguration} from 'chart.js';

  // Registrar todos los componentes necesarios de Chart.js
  Chart.register(CategoryScale,LinearScale,BarElement,BarController,LineController,LineElement,PointElement,Title,Tooltip,Legend);

  // Referencias para el canvas y la instancia del chart
  const chartCanvas = ref<HTMLCanvasElement | null>(null);
  let chartInstance: Chart | null = null;

  // Datos de ejemplo para la gráfica
  const chartData = ref({
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
    datasets: [
      {
        label: 'Ventas 2024',
        // fecha_na
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 205, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }
    ]
  });

  // Configuración del chart
  const chartConfig: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: chartData.value,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Reporte de Ventas Mensuales'
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
            text: 'Cantidad de Ventas'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Meses'
          }
        }
      }
    }
  };

  // Función para crear el chart
  const createChart = () => {
    if (chartCanvas.value) {
      chartInstance = new Chart(chartCanvas.value, chartConfig);
    }
  };

  // Función para actualizar los datos del chart
  const updateChartData = () => {
    if (chartInstance) {
      // Generar nuevos datos aleatorios
      const newData = Array.from({ length: 6 }, () => Math.floor(Math.random() * 20) + 1);
      chartInstance.data.datasets[0].data = newData;
      chartInstance.update();
    }
  };

  // Función para cambiar el tipo de gráfica
  const changeChartType = (type: 'bar' | 'line' | 'pie') => {
    if (chartInstance) {
      chartInstance.destroy();
      chartConfig.type = type as any;
      createChart();
    }
  };

  // Ciclo de Vida
  onMounted(() => {
    createChart();
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
    
    <!-- Controles para la gráfica -->
    <div class="controls">
      <button @click="updateChartData" class="btn btn-primary">
        Actualizar Datos
      </button>
      <button @click="changeChartType('bar')" class="btn btn-secondary">
        Barras
      </button>
      <button @click="changeChartType('line')" class="btn btn-secondary">
        Líneas
      </button>
    </div>
    
    <!-- Contenedor de la gráfica -->
    <div class="chart-container">
      <canvas ref="chartCanvas"></canvas>
    </div>
    
    <!-- Información adicional -->
    <div class="info-cards">
      <div class="card">
        <h3>Total Ventas</h3>
        <p class="number">{{ chartData.datasets[0].data.reduce((a: number, b: number) => a + b, 0) }}</p>
      </div>
      <div class="card">
        <h3>Promedio Mensual</h3>
        <p class="number">{{ Math.round(chartData.datasets[0].data.reduce((a: number, b: number) => a + b, 0) / chartData.datasets[0].data.length) }}</p>
      </div>
      <div class="card">
        <h3>Mejor Mes</h3>
        <p class="number">{{ Math.max(...(chartData.datasets[0].data as number[])) }}</p>
      </div>
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

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
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
}
</style>