const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config(); // para leer variables de entorno locales

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// URI segura desde variable de entorno
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let collection;

async function connectDB() {
  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB Atlas');

    const db = client.db('miBase'); // cambia si tu base se llama diferente
    collection = db.collection('personas');
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error);
  }
}

connectDB();

// Verificar conexión
app.get('/status', async (req, res) => {
  try {
    await client.db('admin').command({ ping: 1 });
    res.json({ message: '✅ Conexión activa con MongoDB' });
  } catch (error) {
    res.status(500).json({ message: '❌ Error de conexión', error: error.message });
  }
});

// Listar personas
app.get('/personas', async (req, res) => {
  try {
    const personas = await collection.find({}).toArray();
    res.json(personas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener personas' });
  }
});

// Insertar una persona
app.post('/personas', async (req, res) => {
  try {
    const persona = req.body;
    const result = await collection.insertOne(persona);
    res.status(201).json({ message: 'Persona agregada', id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar persona' });
  }
});

// Insertar múltiples personas
app.post('/personasT', async (req, res) => {
  try {
    const personas = req.body;
    const result = await collection.insertMany(personas);
    res.status(201).json({
      message: 'Personas agregadas',
      cantidad: result.insertedCount,
      ids: result.insertedIds
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar personas', detalles: error.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Servidor activo en http://localhost:${port}`);
});
