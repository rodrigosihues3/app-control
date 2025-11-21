const express = require('express');
const router = express.Router();
const registroController = require('../controllers/registroController');

// Ruta para registrar (POST /api/registro)
router.post('/', registroController.registrarAsistencia);

// Ruta para ver historial (GET /api/registro)
router.get('/', registroController.obtenerRegistros);

module.exports = router;