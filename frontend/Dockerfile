# --- Etapa 1: Construcción (Con Node 22) ---
FROM node:22-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# --- Etapa 2: Servidor Web (Nginx) ---
# (Nginx no depende de la versión de Node, así que alpine está bien)
FROM nginx:alpine

# Copiamos el build de React a la carpeta de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copiamos nuestra configuración personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]