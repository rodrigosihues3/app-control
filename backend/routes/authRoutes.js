const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');

// POST /api/auth/login
router.post('/login', controller.login);

router.get('/', controller.getAdmins);
router.post('/', controller.createAdmin);
router.delete('/:id', controller.deleteAdmin);

module.exports = router;