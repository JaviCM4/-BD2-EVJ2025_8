const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const { router: personasRouter, init: initPersonas } = require('./routes/personas');
const {router:aspirantesRouter, init: initAspitantes} =  require('./routes/aspirantes');

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectDB() {
  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB Atlas');

    const db = client.db('usac_db');
    const collection = db.collection('Aspirantes');

    initPersonas(collection); // Inyectar colección en módulo
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error);
  }
}

connectDB();

// Rutas
app.use('/personas', personasRouter);
app.use('/aspirantes',aspirantesRouter);

// Ruta de prueba
app.get('/status', async (req, res) => {
  try {
    await client.db('admin').command({ ping: 1 });
    res.json({ message: '✅ Conexión activa con MongoDB' });
  } catch (error) {
    res.status(500).json({ message: '❌ Error de conexión', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Servidor activo en http://localhost:${port}`);
});
