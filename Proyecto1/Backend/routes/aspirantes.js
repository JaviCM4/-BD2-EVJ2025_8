const express = require('express');
const axios = require('axios');
const csv = require('csv-parser');
const router = express.Router();

let collection; // Se inyectará desde app.js
let resumenCollection; // Se inyectará desde app.js


function init(dbCollection, resumenDbCollection) {
  collection = dbCollection;
  resumenCollection = resumenDbCollection;
}

// Ruta para cargar CSV desde Google Drive e insertar en la colección "Aspirantes"
router.post('/cargar-csv', async (req, res) => {
  const { driveUrl } = req.body;

  if (!driveUrl) {
    return res.status(400).json({ error: 'Debe proporcionar una URL de Google Drive' });
  }

  try {
    const fileId = extractDriveFileId(driveUrl);
    if (!fileId) {
      return res.status(400).json({ error: 'URL de Google Drive inválida' });
    }

    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const response = await axios.get(downloadUrl, { responseType: 'stream' });

    const aspirantes = [];

    response.data
      .pipe(csv())
      .on('data', (data) => {
        aspirantes.push({
            fecha_asignacion: data.fecha_asignacion?.trim(),
            correlativo_aspirante: data.correlativo_aspirante?.trim(),
            sexo: data.sexo?.trim().toUpperCase(),
            anio_nacimiento: Number(data.anio_nacimiento),
            materia: data.materia?.trim().toUpperCase(),
            numero_de_fecha_de_evaluacion: Number(data.numero_de_fecha_de_evaluaci),
            anio_de_ingreso: Number(data.anio_de_ingreso),
            aprobacion: data.aprobacion?.trim().toUpperCase() === 'APROBADO',
            carrera_objetivo: data.carrera_objetivo?.trim().toUpperCase(),
            departamento_institucion_educativa: data.departamento_institucion_ed?.trim().toUpperCase(),
            municipio_institucion_educativa: data.municipio_institucion_?.trim().toUpperCase(),
            tipo_institucion_educativa: data.tipo_institucion_educativa?.trim().toUpperCase()
            });
      })
      .on('end', async () => {
        await collection.insertMany(aspirantes);
        res.json({
          message: '✅ Aspirantes cargados correctamente',
          cantidad: aspirantes.length
        });
      });

  } catch (error) {
    console.error('❌ Error al procesar el CSV:', error.message);
    res.status(500).json({ error: 'Error al cargar o insertar datos en la base de datos' });
  }
});

// Extrae el ID del archivo desde una URL de Google Drive
function extractDriveFileId(url) {
  const regex = /(?:\/d\/|id=)([a-zA-Z0-9_-]{10,})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}


// Reporte: Aspirantes por tipo de institución educativa
router.get('/reporte1', async (req, res) => {
  try {
    const resultado = await collection.aggregate([
      {
        $group: {
          _id: '$tipo_institucion_educativa',
          total: { $sum: 1 }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]).toArray();

    res.json({
      message: '✅ Reporte generado correctamente',
      data: resultado.map(item => ({
        tipo_institucion_educativa: item._id,
        total_aspirantes: item.total
      }))
    });
  } catch (error) {
    console.error('❌ Error al generar reporte 1:', error.message);
    res.status(500).json({ error: 'Error al generar el reporte' });
  }
});


// Reporte: Cantidad de aprobados por materia
router.get('/reporte2', async (req, res) => {
  try {
    const resultado = await collection.aggregate([
      { $match: { aprobacion: true } },
      {
        $group: {
          _id: '$materia',
          total_aprobados: { $sum: 1 }
        }
      },
      { $sort: { total_aprobados: -1 } }
    ]).toArray();

    res.json({
      message: '✅ Reporte generado correctamente',
      data: resultado.map(item => ({
        materia: item._id,
        total_aprobados: item.total_aprobados
      }))
    });
  } catch (error) {
    console.error('❌ Error al generar reporte:', error.message);
    res.status(500).json({ error: 'Error al generar el reporte' });
  }
});

// Reporte: Aprobados por carrera y año
router.get('/reporte3', async (req, res) => {
  try {
    const resultado = await collection.aggregate([
      { $match: { aprobacion: true } },
      {
        $group: {
          _id: {
            carrera: '$carrera_objetivo',
            anio: '$anio_de_ingreso'
          },
          total_aprobados: { $sum: 1 }
        }
      },
      {
        $sort: {
          '_id.anio': 1,
          'total_aprobados': -1
        }
      }
    ]).toArray();

    // Formatear para claridad
    const data = resultado.map(item => ({
      carrera: item._id.carrera,
      anio: item._id.anio,
      total_aprobados: item.total_aprobados
    }));

    res.json({
      message: '✅ Reporte generado correctamente',
      data
    });
  } catch (error) {
    console.error('❌ Error al generar el reporte:', error.message);
    res.status(500).json({ error: 'Error al generar el reporte' });
  }
});
router.get('/reporte4', async (req, res) => {
  try {
    const resultado = await collection.aggregate([
      {
        $group: {
          _id: '$materia',
          total: { $sum: 1 },
          aprobados: {
            $sum: {
              $cond: [{ $eq: ['$aprobacion', true] }, 1, 0]
            }
          },
          no_aprobados: {
            $sum: {
              $cond: [{ $eq: ['$aprobacion', false] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          materia: '$_id',
          _id: 0,
          total: 1,
          aprobados: 1,
          no_aprobados: 1,
          porcentaje_aprobacion: {
            $round: [{ $multiply: [{ $divide: ['$aprobados', '$total'] }, 100] }, 2]
          }
        }
      },
      {
        $sort: { porcentaje_aprobacion: -1 }
      }
    ]).toArray();

    res.json({
      message: '✅ Porcentaje de aprobación por materia con no aprobados',
      data: resultado
    });
  } catch (error) {
    console.error('❌ Error al calcular el porcentaje:', error.message);
    res.status(500).json({ error: 'Error al generar el reporte' });
  }
});


// promedio de edad por carrera
router.get('/reporte5', async (req, res) => {
  try {
    const pipeline = [
      {
        $match: {
          anio_nacimiento: { $type: "number", $gte: 1900, $lte: 2025 }
        }
      },
      {
        $addFields: {
          edad: { $subtract: [2025, "$anio_nacimiento"] }
        }
      },
      {
        $group: {
          _id: "$carrera_objetivo",
          promedio_edad: { $avg: "$edad" },
          cantidad: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          carrera: "$_id",
          promedio_edad: { $round: ["$promedio_edad", 2] },
          cantidad: 1
        }
      },
      { $sort: { promedio_edad: -1 } }
    ];

    const resultados = await collection.aggregate(pipeline).toArray();
    res.json(resultados);
  } catch (error) {
    console.error('❌ Error al obtener promedio de edad:', error);
    res.status(500).json({ error: 'Error al obtener promedio de edad por carrera' });
  }
});


// reporte 6 generar resumen de la carrera
router.post('/generar-resumen', async (req, res) => {
  try {
    // 1. Aspirantes por tipo de institución educativa
    const reporte1 = await collection.aggregate([
      { $group: { _id: '$tipo_institucion_educativa', total: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]).toArray();

    // 2. Cantidad de aprobados por materia
    const reporte2 = await collection.aggregate([
      { $match: { aprobacion: true } },
      { $group: { _id: '$materia', total_aprobados: { $sum: 1 } } },
      { $sort: { total_aprobados: -1 } }
    ]).toArray();

    // 3. Aprobados por carrera y año
    const reporte3 = await collection.aggregate([
      { $match: { aprobacion: true } },
      {
        $group: {
          _id: { carrera: '$carrera_objetivo', anio: '$anio_de_ingreso' },
          total_aprobados: { $sum: 1 }
        }
      },
      { $sort: { '_id.anio': 1, total_aprobados: -1 } }
    ]).toArray();

    // 4. Porcentaje de aprobación por materia
    const reporte4 = await collection.aggregate([
      {
        $group: {
          _id: '$materia',
          total: { $sum: 1 },
          aprobados: { $sum: { $cond: [{ $eq: ['$aprobacion', true] }, 1, 0] } },
          no_aprobados: { $sum: { $cond: [{ $eq: ['$aprobacion', false] }, 1, 0] } }
        }
      },
      {
        $project: {
          materia: '$_id',
          _id: 0,
          total: 1,
          aprobados: 1,
          no_aprobados: 1,
          porcentaje_aprobacion: {
            $round: [{ $multiply: [{ $divide: ['$aprobados', '$total'] }, 100] }, 2]
          }
        }
      },
      { $sort: { porcentaje_aprobacion: -1 } }
    ]).toArray();

    // 5. Promedio de edad por carrera
    const reporte5 = await collection.aggregate([
      { $match: { anio_nacimiento: { $type: "number", $gte: 1900, $lte: 2025 } } },
      { $addFields: { edad: { $subtract: [2025, "$anio_nacimiento"] } } },
      {
        $group: {
          _id: "$carrera_objetivo",
          promedio_edad: { $avg: "$edad" },
          cantidad: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          carrera: "$_id",
          promedio_edad: { $round: ["$promedio_edad", 2] },
          cantidad: 1
        }
      },
      { $sort: { promedio_edad: -1 } }
    ]).toArray();

    // Armar resumen
    const resumen = {
      fecha_actualizacion: new Date(),
      aspirantes_por_tipo_institucion: reporte1.map(item => ({
        tipo_institucion_educativa: item._id,
        total_aspirantes: item.total
      })),
      aprobados_por_materia: reporte2.map(item => ({
        materia: item._id,
        total_aprobados: item.total_aprobados
      })),
      aprobados_por_carrera_anio: reporte3.map(item => ({
        carrera: item._id.carrera,
        anio: item._id.anio,
        total_aprobados: item.total_aprobados
      })),
      porcentaje_aprobacion_por_materia: reporte4,
      promedio_edad_por_carrera: reporte5
    };

    // Guardar o actualizar el resumen en la colección resumen_carrera
    // Por ejemplo, guardamos un único documento (puedes cambiar la lógica)
    await resumenCollection.updateOne(
      { _id: 'resumen_general' },
      { $set: resumen },
      { upsert: true }
    );

    res.json({
      message: '✅ Resumen generado y guardado correctamente',
      resumen
    });
  } catch (error) {
    console.error('❌ Error al generar resumen:', error);
    res.status(500).json({ error: 'Error al generar y guardar resumen' });
  }
});


// 7. Promedio de edad de los aspirantes que aprobaron por carrera y tipo de institución
router.get('/reporte7', async (req, res) => {
  try {
    const resultados = await collection.aggregate([
      {
        $match: {
          aprobacion: true,
          anio_nacimiento: { $type: "number", $gte: 1900, $lte: 2025 }
        }
      },
      {
        $addFields: {
          edad: { $subtract: [2025, "$anio_nacimiento"] }
        }
      },
      {
        $group: {
          _id: {
            carrera: "$carrera_objetivo",
            tipo_institucion: "$tipo_institucion_educativa"
          },
          promedio_edad: { $avg: "$edad" },
          cantidad: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          carrera: "$_id.carrera",
          tipo_institucion: "$_id.tipo_institucion",
          promedio_edad: { $round: ["$promedio_edad", 2] },
          cantidad: 1
        }
      },
      { $sort: { carrera: 1, tipo_institucion: 1 } }
    ]).toArray();

    res.json({
      message: '✅ Promedio de edad de aspirantes aprobados por carrera y tipo de institución',
      data: resultados
    });
  } catch (error) {
    console.error('❌ Error al generar reporte7:', error);
    res.status(500).json({ error: 'Error al generar el reporte7' });
  }
});

// Reporte 8: Distribución de aprobados por municipio y carrera objetivo con total general
router.get('/reporte8', async (req, res) => {
  try {
    const resultado = await collection.aggregate([
      {
        $match: { aprobacion: true }
      },
      {
        $group: {
          _id: {
            municipio: '$municipio_institucion_educativa',
            carrera: '$carrera_objetivo'
          },
          total_aprobados: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          municipio: '$_id.municipio',
          carrera: '$_id.carrera',
          total_aprobados: 1
        }
      },
      {
        $sort: {
          municipio: 1,
          total_aprobados: -1
        }
      }
    ]).toArray();

    // Calcular total general de aprobados
    const total_general = resultado.reduce((acc, item) => acc + item.total_aprobados, 0);

    res.json({
      message: '✅ Distribución de aprobados por municipio y carrera objetivo',
      total_general_aprobados: total_general,
      data: resultado
    });

  } catch (error) {
    console.error('❌ Error en reporte 8:', error.message);
    res.status(500).json({ error: 'Error al generar el reporte' });
  }
});


// Reporte 9: Cantidad de evaluaciones por mes y materia para instituciones públicas
router.get('/reporte9', async (req, res) => {
  try {
    const resultado = await collection.aggregate([
      {
        $match: {
          tipo_institucion_educativa: 'PUBLICO'
        }
      },
      {
        $addFields: {
          mes_evaluacion: { $substrBytes: ['$fecha_asignacion', 5, 2] } // extrae mes MM
        }
      },
      {
        $group: {
          _id: {
            mes: '$mes_evaluacion',
            materia: '$materia'
          },
          cantidad_evaluaciones: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          mes: '$_id.mes',
          materia: '$_id.materia',
          cantidad_evaluaciones: 1
        }
      },
      {
        $sort: { mes: 1, materia: 1 }
      }
    ]).toArray();

    res.json({
      message: '✅ Cantidad de evaluaciones por mes y materia (instituciones públicas)',
      data: resultado
    });
  } catch (error) {
    console.error('❌ Error al generar reporte 9:', error.message);
    res.status(500).json({ error: 'Error al generar el reporte 9' });
  }
});


// Reporte 10: Top 5 carreras más demandadas por aspirantes entre 16 y 18 años
router.get('/reporte10', async (req, res) => {
  try {
    const currentYear = 2025; // o usa new Date().getFullYear()

    const resultado = await collection.aggregate([
      {
        $match: {
          anio_nacimiento: { $type: "number" }
        }
      },
      {
        $addFields: {
          edad: { $subtract: [currentYear, "$anio_nacimiento"] }
        }
      },
      {
        $match: {
          edad: { $gte: 16, $lte: 18 }
        }
      },
      {
        $group: {
          _id: "$carrera_objetivo",
          total_aspirantes: { $sum: 1 }
        }
      },
      {
        $sort: { total_aspirantes: -1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          _id: 0,
          carrera: "$_id",
          total_aspirantes: 1
        }
      }
    ]).toArray();

    res.json({
      message: '✅ Top 5 carreras más demandadas por aspirantes entre 16 y 18 años',
      data: resultado
    });
  } catch (error) {
    console.error('❌ Error al generar reporte 10:', error.message);
    res.status(500).json({ error: 'Error al generar el reporte 10' });
  }
});


// Reporte 11: Historial de desempeño por aspirante con desglose de intentos por materia y resultados
router.get('/reporte11', async (req, res) => {
  try {
    const resultado = await collection.aggregate([
      {
        $group: {
          _id: {
            aspirante: "$correlativo_aspirante",
            materia: "$materia"
          },
          total_intentos: { $sum: 1 },
          total_aprobados: {
            $sum: {
              $cond: [{ $eq: ["$aprobacion", true] }, 1, 0]
            }
          }
        }
      },
      {
        $group: {
          _id: "$_id.aspirante",
          historial: {
            $push: {
              materia: "$_id.materia",
              intentos: "$total_intentos",
              aprobados: "$total_aprobados"
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          total_estudiantes: { $sum: 1 },
          estudiantes: {
            $push: {
              aspirante: "$_id",
              historial: "$historial"
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          total_estudiantes: 1,
          estudiantes: 1
        }
      }
    ]).toArray();

    res.json({
      message: '✅ Historial de desempeño por aspirante generado correctamente',
      ...resultado[0]
    });

  } catch (error) {
    console.error('❌ Error al generar reporte 11:', error.message);
    res.status(500).json({ error: 'Error al generar el reporte 11' });
  }
});

// Reporte 12: Distribución por sexo y tipo de institución educativa
router.get('/reporte12', async (req, res) => {
  try {
    const resultado = await collection.aggregate([
      {
        $group: {
          _id: {
            sexo: "$sexo",
            tipo: "$tipo_institucion_educativa"
          },
          total: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          sexo: "$_id.sexo",
          tipo_institucion_educativa: "$_id.tipo",
          total: 1
        }
      },
      { $sort: { sexo: 1, tipo_institucion_educativa: 1 } }
    ]).toArray();

    res.json({
      message: "✅ Distribución por sexo y tipo de institución educativa",
      data: resultado
    });
  } catch (error) {
    console.error('❌ Error al generar el reporte 12:', error.message);
    res.status(500).json({ error: 'Error al generar el reporte' });
  }
});


// Reporte 13: Tasa de aprobación por edad (con aprobados y no aprobados)
router.get('/reporte13', async (req, res) => {
  try {
    const resultado = await collection.aggregate([
      {
        $match: {
          anio_nacimiento: { $type: "number", $gte: 1900, $lte: 2025 }
        }
      },
      {
        $addFields: {
          edad: { $subtract: [2025, "$anio_nacimiento"] }
        }
      },
      {
        $group: {
          _id: "$edad",
          total: { $sum: 1 },
          aprobados: {
            $sum: { $cond: [{ $eq: ["$aprobacion", true] }, 1, 0] }
          },
          no_aprobados: {
            $sum: { $cond: [{ $eq: ["$aprobacion", false] }, 1, 0] }
          },
          publicos: {
            $sum: { $cond: [{ $eq: ["$tipo_institucion_educativa", "PUBLICO"] }, 1, 0] }
          },
          privados: {
            $sum: { $cond: [{ $eq: ["$tipo_institucion_educativa", "PRIVADO"] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          edad: "$_id",
          total: 1,
          aprobados: 1,
          no_aprobados: 1,
          porcentaje_aprobacion: {
            $round: [
              { $multiply: [{ $divide: ["$aprobados", "$total"] }, 100] },
              2
            ]
          },
          institucion: {
            "PUBLICO": {
              cantidad: "$publicos",
              porcentaje: {
                $round: [
                  { $multiply: [{ $divide: ["$publicos", "$total"] }, 100] },
                  2
                ]
              }
            },
            "PRIVADO": {
              cantidad: "$privados",
              porcentaje: {
                $round: [
                  { $multiply: [{ $divide: ["$privados", "$total"] }, 100] },
                  2
                ]
              }
            }
          }
        }
      },
      { $sort: { edad: 1 } }
    ]).toArray();

    res.json({
      message: '✅ Tasa de aprobación por edad con detalle de tipo de institución educativa',
      data: resultado
    });
  } catch (error) {
    console.error('❌ Error en reporte 13:', error.message);
    res.status(500).json({ error: 'Error al generar el reporte' });
  }
});
// reporte 14 
router.get('/reporte14', async (req, res) => {
  try {
    const resultado = await collection.aggregate([
      {
        $group: {
          _id: {
            aspirante: "$correlativo_aspirante",
            materia: "$materia"
          },
          intentos_por_aspirante: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.materia",
          promedio_intentos: { $avg: "$intentos_por_aspirante" }
        }
      },
      {
        $project: {
          _id: 0,
          materia: "$_id",
          promedio_intentos: { $round: ["$promedio_intentos", 2] }
        }
      },
      { $sort: { promedio_intentos: -1 } }
    ]).toArray();

    res.json({
      message: '✅ Número promedio de intentos por materia',
      data: resultado
    });
  } catch (error) {
    console.error('❌ Error al generar reporte 14:', error.message);
    res.status(500).json({ error: 'Error al generar el reporte' });
  }
});

// reporte 15

router.get('/reporte15/:aspiranteId', async (req, res) => {
  try {
    const aspiranteId = req.params.aspiranteId;

    const historial = await collection.find({ correlativo_aspirante: aspiranteId }).toArray();

    if (historial.length === 0) {
      return res.status(404).json({ message: 'No se encontró historial para el aspirante' });
    }

    res.json({
      message: `✅ Historial completo del aspirante ${aspiranteId}`,
      data: historial
    });
  } catch (error) {
    console.error('❌ Error al obtener historial:', error.message);
    res.status(500).json({ error: 'Error al obtener historial del aspirante' });
  }
});

// reporte 16
router.get('/reporte16', async (req, res) => {
  try {
    const resultado = await collection.aggregate([
      {
        $match: {
          numero_de_fecha_de_evaluacion: 1,
          aprobacion: false
        }
      },
      {
        $group: {
          _id: '$carrera_objetivo',
          aspirantes_reprobados: { $sum: 1 }
        }
      },
      {
        $sort: { aspirantes_reprobados: -1 }
      }
    ]).toArray();

    res.json({
      message: '✅ Carreras con más aspirantes reprobados en primer intento',
      data: resultado.map(item => ({
        carrera: item._id,
        reprobados_primer_intento: item.aspirantes_reprobados
      }))
    });
  } catch (error) {
    console.error('❌ Error al generar reporte 16:', error);
    res.status(500).json({ error: 'Error al generar el reporte' });
  }
});


module.exports = { router, init };
