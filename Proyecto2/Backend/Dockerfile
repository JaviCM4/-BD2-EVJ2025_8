# Usa Node.js oficial
FROM node:18-alpine

# Crear directorio de la app
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer puerto (configurado en tu app)
EXPOSE 3000

# Comando para iniciar la app
CMD ["node", "index.js"]
