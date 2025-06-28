const express = require('express');
const { v4: uuidv4 } = require('uuid');

module.exports = (redisClient, metrics) => {
  const router = express.Router();

  const { reviewsTotalCounter } = metrics || {};

  // Crear reseña
  router.post('/', async (req, res) => {
    const { game_id, user_id, score, comment } = req.body;

    if (!game_id || !user_id || !score) {
      return res.status(400).json({ mensaje: 'game_id, user_id y score son requeridos' });
    }

    const reviewIndexKey = `review_by_user:${user_id}:${game_id}`;
    const existingReviewId = await redisClient.get(reviewIndexKey);

    if (existingReviewId) {
      return res.status(400).json({
        mensaje: 'Ya has publicado una reseña para este juego.'
      });
    }

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

    // Agregar referencia para evitar duplicados
    await redisClient.set(reviewIndexKey, reviewId);

    if (reviewsTotalCounter) {
      reviewsTotalCounter.inc();
    }

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
