const express = require('express');
const { v4: uuidv4 } = require('uuid');

module.exports = (redisClient, metrics) => {
  const router = express.Router();
  const { gamesCreatedCounter } = metrics || {};

  // Crear juego
  router.post('/', async (req, res) => {
    const { title, genre, developer } = req.body;
    const gameId = uuidv4();
    const key = `game:${gameId}`;

    await redisClient.hSet(key, { title, genre, developer });

    if (gamesCreatedCounter) {
      gamesCreatedCounter.inc();
    }

    res.status(201).json({ gameId, mensaje: 'Juego creado' });
  });

  // Obtener todos los juegos
  router.get('/', async (req, res) => {
    const keys = await redisClient.keys('game:*');
    const juegos = [];

    for (const key of keys) {
      const data = await redisClient.hGetAll(key);
      juegos.push({ id: key.split(':')[1], ...data });
    }

    res.json(juegos);
  });

  // Obtener juego por ID
  router.get('/:id', async (req, res) => {
    const key = `game:${req.params.id}`;
    const data = await redisClient.hGetAll(key);

    if (Object.keys(data).length === 0) {
      return res.status(404).json({ mensaje: 'Juego no encontrado' });
    }

    res.json({ id: req.params.id, ...data });
  });

  // Actualizar juego
  router.put('/:id', async (req, res) => {
    const key = `game:${req.params.id}`;
    const { title, genre, developer } = req.body;

    const exists = await redisClient.exists(key);
    if (!exists) {
      return res.status(404).json({ mensaje: 'Juego no encontrado' });
    }

    await redisClient.hSet(key, {
      ...(title && { title }),
      ...(genre && { genre }),
      ...(developer && { developer }),
    });

    res.json({ mensaje: 'Juego actualizado' });
  });

  // Eliminar juego
  router.delete('/:id', async (req, res) => {
    const key = `game:${req.params.id}`;
    const deleted = await redisClient.del(key);

    if (deleted === 0) {
      return res.status(404).json({ mensaje: 'Juego no encontrado' });
    }

    res.json({ mensaje: 'Juego eliminado' });
  });

  return router;
};
