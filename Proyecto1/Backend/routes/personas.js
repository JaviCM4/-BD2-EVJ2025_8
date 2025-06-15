// routes/personas.js
const express = require('express');
const router = express.Router();

let collection; // Esta se inyectará desde app.js

// Método para inicializar la colección
function init(dbCollection) {
  collection = dbCollection;
}

// Obtener todas las personas
router.get('/', async (req, res) => {
  try {
    const personas = await collection.find({}).toArray();
    res.json(personas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener personas' });
  }
});

// Insertar una persona
router.post('/', async (req, res) => {
  try {
    const persona = req.body;
    const result = await collection.insertOne(persona);
    res.status(201).json({ message: 'Persona agregada', id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar persona' });
  }
});

// Insertar múltiples personas
router.post('/lote', async (req, res) => {
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

module.exports = { router, init };
