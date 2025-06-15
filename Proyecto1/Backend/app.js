const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());

const uri = "mongodb+srv://gomezeiler250:HMwvvn7Arf0qsWud@cluster0.nbvrl6x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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
    console.log('✅ Conectado a MongoDB');

    const db = client.db('miBase'); // nombre de la base
    collection = db.collection('personas'); // colección 'personas'
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
  }
}

// Llamamos a la conexión al iniciar la app
connectDB();

// Endpoints


// GET /status - verificar conexión a MongoDB
app.get('/status', async (req, res) => {
  try {
    // Ping a la base admin para verificar conexión
    await client.db('admin').command({ ping: 1 });
    res.json({ message: '✅ Conectado correctamente a MongoDB' });
  } catch (error) {
    res.status(500).json({ message: '❌ No se pudo conectar a MongoDB', error: error.message });
  }
});


// GET /personas - listar todas las personas
app.get('/personas', async (req, res) => {
  try {
    const personas = await collection.find({}).toArray();
    res.json(personas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener personas' });
  }
});

// POST /personas - agregar una persona
app.post('/personas', async (req, res) => {
  try {
    const persona = req.body;
    const result = await collection.insertOne(persona);
    res.status(201).json({ message: 'Persona agregada', id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar persona' });
  }
});

// POST /personasT - agregar varias personas
app.post('/personasT', async (req, res) => {
  try {
    const personas = req.body; // debe ser un arreglo de objetos
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
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
