const express = require('express');
const router = express.Router();
const quadroNotasController = require('../controllers/quadroNotasController');

// Renderizar página
router.get('/', quadroNotasController.renderQuadroNotas);

module.exports = router;