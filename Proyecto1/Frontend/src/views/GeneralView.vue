<script setup lang="ts">
  import { ref, onMounted as montar, onUnmounted as desmontar } from 'vue';
  import {Chart,CategoryScale,LinearScale,BarElement,BarController,LineController,LineElement,PointElement,ArcElement,PieController,Title,Tooltip,Legend,type ChartConfiguration} from 'chart.js';
  import axios from 'axios';
  import Zoom from 'chartjs-plugin-zoom';

  Chart.register(CategoryScale,LinearScale,BarElement,BarController,LineController,LineElement,PointElement,ArcElement,PieController,Title,Tooltip,Legend,Zoom);

  const chartCanvas = ref<HTMLCanvasElement | null>(null);
  let instanciaGrafica: Chart | null = null;

  // Estados reactivos
  const cargando = ref(false);
  const datosApi = ref<any[]>([]);
  const camposSeleccinados = ref<string[]>([]);
  const camposDisponibles = ref<string[]>([]);
  const mensajeApi = ref<string>(''); // Para mostrar el mensaje de la API
  const tipoGraficaActual = ref<'bar' | 'pie'>('bar'); // NUEVO: Estado para el tipo de gráfica
  const consultas = {
                      reporte1: `
                    db.Aspirantes.aggregate([
                      { $group: { _id: '$tipo_institucion_educativa', total: { $sum: 1 } } },
                      { $sort: { total: -1 } }
                    ])`,

                      reporte2: `
                    db.Aspirantes.aggregate([
                      { $match: { aprobacion: true } },
                      { $group: { _id: '$materia', total_aprobados: { $sum: 1 } } },
                      { $sort: { total_aprobados: -1 } }
                    ])`,

                      reporte3: `
                    db.Aspirantes.aggregate([
                      { $match: { aprobacion: true } },
                      { $group: {
                          _id: { carrera: '$carrera_objetivo', anio: '$anio_de_ingreso' },
                          total_aprobados: { $sum: 1 }
                      }},
                      { $sort: { '_id.anio': 1, total_aprobados: -1 } }
                    ])`,

                      reporte4: `
                    db.Aspirantes.aggregate([
                      { $group: {
                          _id: '$materia',
                          total: { $sum: 1 },
                          aprobados: { $sum: { $cond: [{ $eq: ['$aprobacion', true] }, 1, 0] } },
                          no_aprobados: { $sum: { $cond: [{ $eq: ['$aprobacion', false] }, 1, 0] } }
                      }},
                      { $project: {
                          materia: '$_id',
                          _id: 0,
                          total: 1,
                          aprobados: 1,
                          no_aprobados: 1,
                          porcentaje_aprobacion: {
                            $round: [{ $multiply: [{ $divide: ['$aprobados', '$total'] }, 100] }, 2]
                          }
                      }},
                      { $sort: { porcentaje_aprobacion: -1 } }
                    ])`,

                      reporte5: `
                    db.Aspirantes.aggregate([
                      { $match: { anio_nacimiento: { $type: "number", $gte: 1900, $lte: 2025 } } },
                      { $addFields: { edad: { $subtract: [2025, "$anio_nacimiento"] } } },
                      { $group: {
                          _id: "$carrera_objetivo",
                          promedio_edad: { $avg: "$edad" },
                          cantidad: { $sum: 1 }
                      }},
                      { $project: {
                          _id: 0,
                          carrera: "$_id",
                          promedio_edad: { $round: ["$promedio_edad", 2] },
                          cantidad: 1
                      }},
                      { $sort: { promedio_edad: -1 } }
                    ])`,

                      reporte7: `
                    db.Aspirantes.aggregate([
                      { $match: {
                          aprobacion: true,
                          anio_nacimiento: { $type: "number", $gte: 1900, $lte: 2025 }
                      }},
                      { $addFields: { edad: { $subtract: [2025, "$anio_nacimiento"] } } },
                      { $group: {
                          _id: { carrera: "$carrera_objetivo", tipo_institucion: "$tipo_institucion_educativa" },
                          promedio_edad: { $avg: "$edad" },
                          cantidad: { $sum: 1 }
                      }},
                      { $project: {
                          _id: 0,
                          carrera: "$_id.carrera",
                          tipo_institucion: "$_id.tipo_institucion",
                          promedio_edad: { $round: ["$promedio_edad", 2] },
                          cantidad: 1
                      }},
                      { $sort: { carrera: 1, tipo_institucion: 1 } }
                    ])`,

                      reporte8: `
                    db.Aspirantes.aggregate([
                      { $match: { aprobacion: true } },
                      { $group: {
                          _id: {
                            municipio: '$municipio_institucion_educativa',
                            carrera: '$carrera_objetivo'
                          },
                          total_aprobados: { $sum: 1 }
                      }},
                      { $project: {
                          _id: 0,
                          municipio: '$_id.municipio',
                          carrera: '$_id.carrera',
                          total_aprobados: 1
                      }},
                      { $sort: { municipio: 1, total_aprobados: -1 } }
                    ])`,

                      reporte9: `
                    db.Aspirantes.aggregate([
                      { $match: { tipo_institucion_educativa: 'PUBLICO' } },
                      { $addFields: { mes_evaluacion: { $substrBytes: ['$fecha_asignacion', 5, 2] } } },
                      { $group: {
                          _id: { mes: '$mes_evaluacion', materia: '$materia' },
                          cantidad_evaluaciones: { $sum: 1 }
                      }},
                      { $project: {
                          _id: 0,
                          mes: '$_id.mes',
                          materia: '$_id.materia',
                          cantidad_evaluaciones: 1
                      }},
                      { $sort: { mes: 1, materia: 1 } }
                    ])`,

                      reporte10: `
                    db.Aspirantes.aggregate([
                      { $match: { anio_nacimiento: { $type: "number" } } },
                      { $addFields: { edad: { $subtract: [2025, "$anio_nacimiento"] } } },
                      { $match: { edad: { $gte: 16, $lte: 18 } } },
                      { $group: { _id: "$carrera_objetivo", total_aspirantes: { $sum: 1 } } },
                      { $sort: { total_aspirantes: -1 } },
                      { $limit: 5 },
                      { $project: { _id: 0, carrera: "$_id", total_aspirantes: 1 } }
                    ])`,
                      reporte12: `
                    db.Aspirantes.aggregate([
                      { $group: {
                          _id: { sexo: "$sexo", tipo: "$tipo_institucion_educativa" },
                          total: { $sum: 1 }
                      }},
                      { $project: {
                          _id: 0,
                          sexo: "$_id.sexo",
                          tipo_institucion_educativa: "$_id.tipo",
                          total: 1
                      }},
                      { $sort: { sexo: 1, tipo_institucion_educativa: 1 } }
                    ])`,

                      reporte13: `
                    db.Aspirantes.aggregate([
                      { $match: { anio_nacimiento: { $type: "number", $gte: 1900, $lte: 2025 } } },
                      { $addFields: { edad: { $subtract: [2025, "$anio_nacimiento"] } } },
                      { $group: {
                          _id: "$edad",
                          total: { $sum: 1 },
                          aprobados: { $sum: { $cond: [{ $eq: ["$aprobacion", true] }, 1, 0] } },
                          no_aprobados: { $sum: { $cond: [{ $eq: ["$aprobacion", false] }, 1, 0] } },
                          publicos: { $sum: { $cond: [{ $eq: ["$tipo_institucion_educativa", "PUBLICO"] }, 1, 0] } },
                          privados: { $sum: { $cond: [{ $eq: ["$tipo_institucion_educativa", "PRIVADO"] }, 1, 0] } }
                      }},
                      { $project: {
                          _id: 0,
                          edad: "$_id",
                          total: 1,
                          aprobados: 1,
                          no_aprobados: 1,
                          porcentaje_aprobacion: {
                            $round: [{ $multiply: [{ $divide: ["$aprobados", "$total"] }, 100] }, 2]
                          },
                          institucion: {
                            PUBLICO: {
                              cantidad: "$publicos",
                              porcentaje: {
                                $round: [{ $multiply: [{ $divide: ["$publicos", "$total"] }, 100] }, 2]
                              }
                            },
                            PRIVADO: {
                              cantidad: "$privados",
                              porcentaje: {
                                $round: [{ $multiply: [{ $divide: ["$privados", "$total"] }, 100] }, 2]
                              }
                            }
                          }
                      }},
                      { $sort: { edad: 1 } }
                    ])`,

                      reporte14: `
                    db.Aspirantes.aggregate([
                      { $group: {
                          _id: { aspirante: "$correlativo_aspirante", materia: "$materia" },
                          intentos_por_aspirante: { $sum: 1 }
                      }},
                      { $group: {
                          _id: "$_id.materia",
                          promedio_intentos: { $avg: "$intentos_por_aspirante" }
                      }},
                      { $project: {
                          _id: 0,
                          materia: "$_id",
                          promedio_intentos: { $round: ["$promedio_intentos", 2] }
                      }},
                      { $sort: { promedio_intentos: -1 } }
                    ])`,

                    reporte16: `
                    db.Aspirantes.aggregate([
                      { $match: { numero_de_fecha_de_evaluacion: 1, aprobacion: false } },
                      { $group: { _id: '$carrera_objetivo', aspirantes_reprobados: { $sum: 1 } } },
                      { $sort: { aspirantes_reprobados: -1 } }
                    ])`
  };

  const reporteSeleccionado = ref<number>(1);
  const reportesDisponibles = ref([
    { valor: 1, nombre: 'Reporte 1 - Aspirantes por tipo de institución educativa' },
    { valor: 2, nombre: 'Reporte 2 - Cantidad de aprobados por materia' },
    { valor: 3, nombre: 'Reporte 3 - Aprobados por carrera y año' },
    { valor: 4, nombre: 'Reporte 4 - Porcentaje de aprobación por materia' },
    { valor: 5, nombre: 'Reporte 5 - Promedio de edad por carrera' },
    { valor: 7, nombre: 'Reporte 7 - Promedio de edad de los aspirantes que aprobaron por carrera y tipo de institución' },
    { valor: 8, nombre: 'Reporte 8 - Distribución de aprobados por municipio y carrera objetivo' },
    { valor: 9, nombre: 'Reporte 9 - Cantidad de evaluaciones por mes y materia, sólo para instituciones públicas' },
    { valor: 10, nombre: 'Reporte 10 - Top 5 carreras más demandadas por aspirantes entre 16 y 18 años' },
    { valor: 12, nombre: 'Reporte 12 - Distribución por sexo y tipo de institución' },
    { valor: 13, nombre: 'Reporte 13 - Tasa de aprobación por edad ' },
    { valor: 14, nombre: 'Reporte 14 - Número promedio de intentos por materia' },
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

  const procesarDatos = (data: any[]) => {
    if (!data || data.length === 0) return;

    const primerElemento = data[0];
    
    if (reporteSeleccionado.value === 13) {
      const camposEdad = Object.keys(primerElemento).filter(key => key.toLowerCase().includes('edad'));

      const campos = Object.keys(primerElemento).filter(key => {
        const value = primerElemento[key];
        if (camposEdad.includes(key)) {
          return false;
        }
        return typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)) && value.trim() !== '');
      });
      
      camposDisponibles.value = campos;
    } else {
      const campos = Object.keys(primerElemento).filter(key => {
        const value = primerElemento[key];
        return typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)) && value.trim() !== '');
      });
      
      camposDisponibles.value = campos;
    }
    
    if (camposSeleccinados.value.length === 0 && camposDisponibles.value.length > 0) {
      camposSeleccinados.value = [camposDisponibles.value[0]];
    }
    
    actualizarGrafica();
  };

  const generarEtiquetaCombinada = (item: any) => {

    if (reporteSeleccionado.value === 13) {
      const camposEdad = Object.keys(item).filter(key =>  key.toLowerCase().includes('edad'));
      
      if (camposEdad.length > 0) {
        return `${item[camposEdad[0]]} años`;
      }
      
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

  const actualizarGrafica = () => {
    if (!datosApi.value.length || !camposSeleccinados.value.length) return;

    const labels = datosApi.value.map(item => generarEtiquetaCombinada(item));
    
    if (tipoGraficaActual.value === 'pie') {
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

      if (instanciaGrafica) {
        instanciaGrafica.data.labels = labels;
        instanciaGrafica.data.datasets = datasets;
        instanciaGrafica.update();
      } else {
        crearGrafica(labels, datasets);
      }
    } else {
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

      if (instanciaGrafica) {
        instanciaGrafica.data.labels = labels;
        instanciaGrafica.data.datasets = datasets;
        instanciaGrafica.update();
      } else {
        crearGrafica(labels, datasets);
      }
    }
  };

  const obtenerTituloGrafica = () => {
    const reporteActual = reportesDisponibles.value.find(r => r.valor === reporteSeleccionado.value);
    return reporteActual ? reporteActual.nombre : `Reporte ${reporteSeleccionado.value}`;
  };

  const crearGrafica = (labels: string[], datasets: any[]) => {
    if (!chartCanvas.value) return;

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

  const consultaGet = async () => {
    cargando.value = true;

    try {
      const response = await axios.get(`/api/aspirantes/reporte${reporteSeleccionado.value}`);

      let datos: any[] = [];
      let mensaje = '';
      
      if (response.data.data && Array.isArray(response.data.data)) {
        datos = response.data.data;
        mensaje = response.data.message || '';
      } else if (Array.isArray(response.data)) {
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

  const cambiarReporte = () => {
    camposSeleccinados.value = [];
    camposDisponibles.value = [];
    consultaGet();
  };

  const cambiarTipoGrafica = (type: 'bar' | 'pie') => {
    tipoGraficaActual.value = type;
    
    if (instanciaGrafica) {
      instanciaGrafica.destroy();
      instanciaGrafica = null;
    }
    
    if (type === 'pie' && camposSeleccinados.value.length > 1) {
      camposSeleccinados.value = [camposSeleccinados.value[0]];
    }
    
    actualizarGrafica();
  };

  const intercalarCampos = (field: string) => {
    const index = camposSeleccinados.value.indexOf(field);
    if (index > -1) {
      camposSeleccinados.value.splice(index, 1);
    } else {
      if (tipoGraficaActual.value === 'pie') {
        camposSeleccinados.value = [field];
      } else {
        camposSeleccinados.value.push(field);
      }
    }
    actualizarGrafica();
  };

  const resetZoom = () => {
    if (instanciaGrafica && instanciaGrafica.resetZoom) {
      instanciaGrafica.resetZoom();
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
      <h4>Consulta utilizada:</h4>
      <pre>{{ consultas['reporte' + reporteSeleccionado as keyof typeof consultas] }}</pre>
    </div>
  </div>
</template>

<style scoped>
.container {
  margin: 0 auto;
  padding: 40px;
  background-image: url("https://i0.wp.com/i.pinimg.com/originals/98/eb/cb/98ebcbc2ca2cec8fdce270c00482da5a.jpg");
  background-size: cover;
  background-position: center;
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