const express = require('express');
const router = express.Router();
const controller = require('../controllers/visitanteController');

router.get('/', controller.getVisitantes);            // Listar
router.post('/', controller.createVisitante);         // Crear
router.get('/:dni', controller.buscarPorDni);         // Buscar por DNI (App móvil)
router.put('/:id', controller.updateVisitante);       // Editar
router.delete('/:id', controller.deleteVisitante);    // Eliminar
router.get('/:id/historial', controller.getHistorialVisitante); // Historial

module.exports = router;