const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

module.exports = (redisClient) => {
  // Crear reseña
  router.post('/', async (req, res) => {
    const { game_id, user_id, score, comment } = req.body;
    const reviewId = uuidv4();
    const key = `review:${reviewId}`;
    const timestamp = Date.now().toString();

    await redisClient.hSet(key, {
      game_id,
      user_id,
      score,
      comment,
      timestamp
    });

    res.status(201).json({ reviewId, mensaje: 'Reseña creada' });
  });

  // Obtener todas las reseñas
  router.get('/', async (req, res) => {
    const keys = await redisClient.keys('review:*');
    const resenas = [];

    for (const key of keys) {
      const data = await redisClient.hGetAll(key);
      resenas.push({ id: key.split(':')[1], ...data });
    }

    res.json(resenas);
  });

  // Obtener reseña por ID
  router.get('/:id', async (req, res) => {
    const key = `review:${req.params.id}`;
    const data = await redisClient.hGetAll(key);

    if (Object.keys(data).length === 0) {
      return res.status(404).json({ mensaje: 'Reseña no encontrada' });
    }

    res.json({ id: req.params.id, ...data });
  });

  // Actualizar reseña
  router.put('/:id', async (req, res) => {
    const key = `review:${req.params.id}`;
    const { score, comment } = req.body;

    const exists = await redisClient.exists(key);
    if (!exists) {
      return res.status(404).json({ mensaje: 'Reseña no encontrada' });
    }

    await redisClient.hSet(key, {
      ...(score && { score }),
      ...(comment && { comment }),
    });

    res.json({ mensaje: 'Reseña actualizada' });
  });

  // Eliminar reseña
  router.delete('/:id', async (req, res) => {
    const key = `review:${req.params.id}`;
    const deleted = await redisClient.del(key);

    if (deleted === 0) {
      return res.status(404).json({ mensaje: 'Reseña no encontrada' });
    }

    res.json({ mensaje: 'Reseña eliminada' });
  });

  return router;
};
