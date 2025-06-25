const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

module.exports = (redisClient) => {
  router.post(
    '/',
    [
      body('username').notEmpty().withMessage('El nombre de usuario es requerido'),
      body('password_hash').notEmpty().withMessage('La contraseña es requerida'),
    ],
    async (req, res) => {
      const errores = validationResult(req);
      if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
      }

      const { username, password_hash } = req.body;
      const keys = await redisClient.keys('user:*');

      for (const key of keys) {
        const usuario = await redisClient.hGetAll(key);

        if (usuario.username === username && usuario.password_hash === password_hash) {
          const id = key.split(':')[1];
          const { password_hash, ...restoUsuario } = usuario;
          return res.json({ id, ...restoUsuario });
        }
      }

      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }
  );

  return router;
};
