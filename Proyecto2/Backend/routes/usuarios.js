const express = require('express');
const { v4: uuidv4 } = require('uuid');

module.exports = (redisClient, metrics) => {
  const router = express.Router();

  const { userRegistrationsCounter } = metrics || {};

  // Crear usuario
  router.post('/', async (req, res) => {
    const { username, email, password_hash, rol } = req.body;
     // Validar campos obligatorios
    if (!username || !email || !password_hash || rol === undefined) {
      return res.status(400).json({ 
        mensaje: 'Todos los campos son obligatorios: username, email, password_hash, rol' 
      });
    }
    if (![1, 2].includes(Number(rol))) {
      return res.status(400).json({ mensaje: 'El rol debe ser 1 o 2' });
    }

    const userId = uuidv4();
    const key = `user:${userId}`;

    await redisClient.hSet(key, {
      username,
      email,
      password_hash,
      rol: String(rol) // se guarda como string en Redis
    });

    if (userRegistrationsCounter) {
      userRegistrationsCounter.inc();
    }

    res.status(201).json({ userId, mensaje: 'Usuario creado con rol' });
  });

  // Obtener todos los usuarios
  router.get('/', async (req, res) => {
    const keys = await redisClient.keys('user:*');
    const usuarios = [];

    for (const key of keys) {
      const data = await redisClient.hGetAll(key);
      usuarios.push({ id: key.split(':')[1], ...data });
    }

    res.json(usuarios);
  });

  // Obtener un usuario por ID
  router.get('/:id', async (req, res) => {
    const key = `user:${req.params.id}`;
    const data = await redisClient.hGetAll(key);

    if (Object.keys(data).length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.json({ id: req.params.id, ...data });
  });

  // Editar un usuario por ID
  router.put('/:id', async (req, res) => {
    const key = `user:${req.params.id}`;
    const { username, email, password_hash, rol } = req.body;

    const exists = await redisClient.exists(key);
    if (!exists) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    if (rol !== undefined && ![1, 2].includes(Number(rol))) {
      return res.status(400).json({ mensaje: 'El rol debe ser 1 o 2' });
    }

    await redisClient.hSet(key, {
      ...(username && { username }),
      ...(email && { email }),
      ...(password_hash && { password_hash }),
      ...(rol !== undefined && { rol: String(rol) }),
    });

    res.json({ mensaje: 'Usuario actualizado' });
  });

 // Eliminar usuario y todas sus reseñas
router.delete('/:id', async (req, res) => {
  const userId = req.params.id;
  const userKey = `user:${userId}`;

  try {
    // 1. Verificar si el usuario existe
    const userExists = await redisClient.exists(userKey);
    if (!userExists) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // 2. Encontrar todas las reseñas del usuario
    const reviewPattern = 'review:*';
    const allReviewKeys = await redisClient.keys(reviewPattern);
    const userReviews = [];

    // Usar MULTI para obtener todas las reseñas de una vez
    const multi = redisClient.multi();
    allReviewKeys.forEach(key => multi.hGetAll(key));
    const reviews = await multi.exec();

    // Filtrar reseñas del usuario
    reviews.forEach((review, index) => {
      if (review.user_id === userId) {
        userReviews.push({
          key: allReviewKeys[index],
          game_id: review.game_id
        });
      }
    });

    // 3. Eliminar todo en una transacción
    const deletionMulti = redisClient.multi();
    
    // Eliminar usuario
    deletionMulti.del(userKey);
    
    // Eliminar reseñas y sus índices
    userReviews.forEach(({ key, game_id }) => {
      deletionMulti.del(key);
      deletionMulti.del(`review_by_user:${userId}:${game_id}`);
    });

    await deletionMulti.exec();

    // 4. Actualizar métricas si es necesario
    if (userRegistrationsCounter.reviewsTotalCounter) {
      userRegistrationsCounter.reviewsTotalCounter.dec(userReviews.length);
    }

    res.json({
      mensaje: 'Usuario y reseñas eliminados correctamente',
      total_reseñas_eliminadas: userReviews.length
    });

  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

  return router;
};
