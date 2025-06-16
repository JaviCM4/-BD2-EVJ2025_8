const express = require('express');
const axios = require('axios');
const csv = require('csv-parser');
const router = express.Router();

let collection; // Se inyectará desde app.js

function init(dbCollection) {
  collection = dbCollection;
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
          fecha_asignacion: data.fecha_asignacion,
          correlativo_aspirante: data.correlativo_aspirante,
          sexo: data.sexo,
          anio_nacimiento: Number(data.anio_nacimiento),
          materia: data.materia,
          numero_de_fecha_de_evaluacion: Number(data.numero_de_fecha_de_evaluaci),
          anio_de_ingreso: Number(data.anio_de_ingreso),
          aprobacion: data.aprobacion.trim().toUpperCase() === 'APROBADO',
          carrera_objetivo: data.carrera_objetivo,
          departamento_institucion_educativa: data.departamento_institucion_ed,
          municipio_institucion_educativa: data.municipio_institucion_,
          tipo_institucion_educativa: data.tipo_institucion_educativa
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

module.exports = { router, init };
