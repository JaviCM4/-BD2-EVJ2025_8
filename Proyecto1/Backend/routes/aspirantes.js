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


//8. Distribución de aprobados por municipio y carrera objetivo
router.get('/reporte8', async (req, res) => {
  try {
    const resultados = await collection.aggregate([
      {
        $match: {
          aprobacion: true
        }
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

    res.json({
      message: '✅ Distribución de aprobados por municipio y carrera objetivo',
      data: resultados
    });
  } catch (error) {
    console.error('❌ Error al generar reporte8:', error);
    res.status(500).json({ error: 'Error al generar el reporte8' });
  }
});

module.exports = { router, init };
