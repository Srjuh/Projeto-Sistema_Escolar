const express = require('express');
const router = express.Router();
const corrigirAtividadeController = require('../controllers/corrigirAtividadeController');

// Renderizar página
router.get('/', corrigirAtividadeController.renderCorrigirAtividades);

module.exports = router;