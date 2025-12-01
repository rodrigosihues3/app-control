const express = require('express');
const router = express.Router();
const registroController = require('../controllers/registroController');
const { enviarBackup } = require('../services/backupService');

// Ruta para registrar (POST /api/registro)
router.post('/', registroController.registrarAsistencia);

// Ruta para ver historial (GET /api/registro)
router.get('/', registroController.obtenerRegistros);

// Ruta para forzar el backup
router.get('/forzar-backup', async (req, res) => {
  await enviarBackup();
  res.send('Intento de backup iniciado. Revisa los logs.');
});

module.exports = router;
