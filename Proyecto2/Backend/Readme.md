# Proyecto API con Redis, Prometheus y Grafana

## Levantar el entorno con Docker

Ejecuta el siguiente comando en la raíz del proyecto para construir y levantar todos los servicios:

```bash
docker-compose up --build

levanta los contenedores:
```bash
docker-compose up --build -d


## Servicios disponibles

- **API Node.js:** http://localhost:3000  
  Punto de entrada para tus endpoints REST.

- **Redis:** puerto 6380 
  Base de datos en memoria usada por la API.

- **Prometheus UI:** http://localhost:9090  
  Plataforma para monitoreo y recolección de métricas.

- **Grafana UI:** http://localhost:3001  
  Plataforma para visualización de métricas.  
  **Usuario:** admin  
  **Contraseña:** admin123
