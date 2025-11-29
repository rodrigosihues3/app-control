const express = require('express');
const cors = require('cors');
const db = require('./models'); // Importa tus modelos de Sequelize
const registroRoutes = require('./routes/registroRoutes');
const visitanteRoutes = require('./routes/visitanteRoutes');
const authRoutes = require('./routes/authRoutes');
const { iniciarScheduler } = require('./services/backupService');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares ---
app.use(cors()); // Permite conexiones desde otros dominios (como tu frontend)
app.use(express.json()); // Permite recibir JSON en las peticiones

// --- Ruta de Prueba ---
app.get('/', (req, res) => {
  res.send('¡El servidor de Control de Asistencia está funcionando! 🚀');
});

// Rutas
app.use('/api/registro', registroRoutes);
app.use('/api/visitantes', visitanteRoutes);
app.use('/api/auth', authRoutes);

// --- Sincronización y Arranque ---
// "force: false" significa que NO borrará las tablas si ya existen (¡importante!)
db.sequelize.sync({ force: false }).then(() => {
  console.log('Base de datos sincronizada correctamente.');

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    iniciarScheduler();
  });
}).catch((error) => {
  console.error('Error al conectar con la base de datos:', error);
});