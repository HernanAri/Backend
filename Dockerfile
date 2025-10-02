# Usa una imagen base oficial de Node
FROM node:18

# Crea el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de configuración
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del proyecto
COPY . .

# Compila el proyecto NestJS
RUN npm run build

# Expone el puerto (ajústalo si usas otro)
EXPOSE 3000

# Comando para iniciar la app
CMD ["node", "dist/main"]
