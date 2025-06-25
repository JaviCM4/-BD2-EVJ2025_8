require('dotenv').config();
const express = require('express');
const { createClient } = require('redis');

const app = express();
app.use(express.json());

// Conexión a Redis
const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.on('error', (err) => console.error('Redis Error:', err));

(async () => {
  await redisClient.connect();
  console.log('🔗 Conectado a Redis');

  // Importar y monta las rutas
    const usuariosRouter = require('./routes/usuarios')(redisClient);
    app.use('/usuarios', usuariosRouter);
  

    const juegosRouter = require('./routes/juegos')(redisClient);
    app.use('/juegos', juegosRouter);

    const resenasRouter = require('./routes/resenas')(redisClient);
    app.use('/resenas', resenasRouter);

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`🚀 API corriendo en http://localhost:${port}`);
  });
})();
