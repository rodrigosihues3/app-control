FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

# --- SOLUCIÓN AQUÍ ---
# Instalamos Python, Make y G++ (necesarios para compilar sqlite3)
RUN apk add --no-cache python3 make g++
# ---------------------

RUN npm install

# (Opcional) Podríamos borrar las herramientas después para ahorrar espacio,
# pero para este proyecto académico está bien dejarlas.

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]