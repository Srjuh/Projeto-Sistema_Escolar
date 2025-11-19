const express = require('express');
const router = express.Router();
const corrigirAtividadeController = require('../controllers/corrigirAtividadeController');

// Listar entregas de uma atividade
router.get('/entregas', corrigirAtividadeController.listarEntregas);

// Buscar detalhes de uma entrega
router.get('/entrega/:id_entrega', corrigirAtividadeController.buscarEntrega);

// Corrigir uma entrega
router.put('/corrigir', corrigirAtividadeController.corrigirEntrega);

module.exports = router;