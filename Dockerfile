# Usar imagen base de Node.js
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json ./

# Instalar dependencias
RUN npm install --production --no-audit --no-fund && \
    npm cache clean --force

# Copiar todos los archivos de la aplicación
COPY . .

# Exponer el puerto (Render asigna el puerto dinámicamente)
EXPOSE 3000

# Variables de entorno
ENV NODE_ENV=production

# Comando para iniciar el servidor
CMD ["node", "server.js"]

