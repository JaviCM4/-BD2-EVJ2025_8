require('dotenv').config();
const express = require('express');
const { createClient } = require('redis');
const { Counter, Histogram, register, collectDefaultMetrics } = require('prom-client');

const app = express();
app.use(express.json());

// Iniciar recolección de métricas por defecto (uso de CPU, memoria, etc.)
collectDefaultMetrics();

// MÉTRICAS PERSONALIZADAS
const apiRequestsCounter = new Counter({
  name: 'api_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['endpoint', 'method']
});

const requestDuration = new Histogram({
  name: 'api_request_duration_seconds',
  help: 'Request duration in seconds',
  labelNames: ['endpoint']
});

// Middleware para contar y medir duración de las peticiones
app.use((req, res, next) => {
  apiRequestsCounter.labels(req.path, req.method).inc();
  const end = requestDuration.labels(req.path).startTimer();
  res.on('finish', () => end());
  next();
});

// Conexión a Redis
const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.on('error', (err) => console.error('Redis Error:', err));

(async () => {
  await redisClient.connect();
  console.log('🔗 Conectado a Redis');

  // Importar y montar rutas
  const usuariosRouter = require('./routes/usuarios')(redisClient);
  app.use('/usuarios', usuariosRouter);

  const juegosRouter = require('./routes/juegos')(redisClient);
  app.use('/juegos', juegosRouter);

  const resenasRouter = require('./routes/resenas')(redisClient);
  app.use('/resenas', resenasRouter);

  const loginRouter = require('./routes/login')(redisClient);
  app.use('/login', loginRouter);

  // Endpoint para Prometheus
  app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`🚀 API corriendo en http://localhost:${port}`);
  });
})();
