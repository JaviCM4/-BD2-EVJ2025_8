const express = require('express');
const axios = require('axios');
const csv = require('csv-parser');
const fs = require('fs');
const neo4j = require('neo4j-driver');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
app.use(express.json());

const port = 3000;
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Configuración Neo4j
const driver = neo4j.driver(
  'bolt://localhost:7687',
  neo4j.auth.basic('neo4j', 'mipassword') // Cambia por tu contraseña
);

// Endpoint
app.post('/cargar-csv-drive', async (req, res) => {
  const { driveUrl } = req.body;

  if (!driveUrl) {
    return res.status(400).json({ error: 'Falta el campo driveUrl en el cuerpo.' });
  }

  const fileId = extraerFileId(driveUrl);
  if (!fileId) {
    return res.status(400).json({ error: 'URL de Google Drive no válida.' });
  }

  const tmpFile = path.join(uploadsDir, `${uuidv4()}.csv`);

  try {
    await descargarDesdeDrive(fileId, tmpFile);

    const resultados = [];
    fs.createReadStream(tmpFile)
      .pipe(csv())
      .on('data', (data) => resultados.push(transformarDatos(data)))
      .on('end', async () => {
        const session = driver.session();

        try {
          for (const item of resultados) {
            await session.run(
              `CREATE (a:Aspirante {
                fecha_asignacion: $fecha_asignacion,
                sexo: $sexo,
                anio_nacimiento: $anio_nacimiento,
                materia: $materia,
                numero_de_fecha_de_evaluacion: $numero_de_fecha_de_evaluacion,
                anio_de_ingreso: $anio_de_ingreso,
                aprobacion: $aprobacion,
                carrera_objetivo: $carrera_objetivo,
                departamento_institucion_educativa: $departamento_institucion_educativa,
                municipio_institucion_educativa: $municipio_institucion_educativa,
                tipo_institucion_educativa: $tipo_institucion_educativa,
                correlativo_aspirante: $correlativo_aspirante
              })`,
              item
            );
          }

          res.json({ mensaje: 'Datos cargados exitosamente en Neo4j.' });
        } catch (err) {
          console.error(err);
          res.status(500).json({ error: 'Error al insertar en Neo4j.' });
        } finally {
          await session.close();
          fs.unlinkSync(tmpFile);
        }
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al descargar el archivo de Google Drive.' });
  }
});

function extraerFileId(url) {
  const match = url.match(/(?:\/d\/|id=)([a-zA-Z0-9_-]{25,})/);
  return match ? match[1] : null;
}

async function descargarDesdeDrive(fileId, destino) {
  const url = `https://drive.google.com/uc?export=download&id=${fileId}`;
  const response = await axios.get(url, {
    responseType: 'stream',
    maxRedirects: 5,
    headers: {
      'User-Agent': 'Mozilla/5.0'
    }
  });

  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(destino);
    response.data.pipe(writer);
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

function transformarDatos(data) {
  return {
    fecha_asignacion: data.fecha_asignacion,
    sexo: data.sexo,
    anio_nacimiento: parseInt(data.anio_nacimiento),
    materia: capitalizar(data.materia),
    numero_de_fecha_de_evaluacion: parseInt(data.numero_de_fecha_de_evaluaci),
    anio_de_ingreso: parseInt(data.anio_de_ingreso),
    aprobacion: data.aprobacion.trim().toUpperCase() === 'APROBADO',
    carrera_objetivo: capitalizar(data.carrera_objetivo),
    departamento_institucion_educativa: capitalizar(data.departamento_institucion_ed),
    municipio_institucion_educativa: capitalizar(data.municipio_institucion_),
    tipo_institucion_educativa: capitalizar(data.tipo_institucion_educativa),
    correlativo_aspirante: data.correlativo_aspirante
  };
}

function capitalizar(texto) {
  return texto
    ? texto.trim().toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
    : '';
}

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
