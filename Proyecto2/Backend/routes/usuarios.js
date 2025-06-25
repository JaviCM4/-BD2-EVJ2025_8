const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

module.exports = (redisClient) => {
  // Crear usuario
  router.post('/', async (req, res) => {
    const { username, email, password_hash, rol } = req.body;

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

  // Eliminar un usuario por ID
  router.delete('/:id', async (req, res) => {
    const key = `user:${req.params.id}`;
    const result = await redisClient.del(key);

    if (result === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.json({ mensaje: 'Usuario eliminado' });
  });

  return router;
};
