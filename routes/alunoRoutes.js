const express = require('express');
const router = express.Router();
const alunoController = require('../controllers/alunoController');
const atividadeEntregaController = require('../controllers/atividadeEntregaController');

// Rota do painel principal do aluno
router.get('/', alunoController.home);

// Rota de atividades do aluno
router.get('/atividades', atividadeEntregaController.renderAtividades);

// Rota do quadro de notas do aluno
router.get('/quadro-notas', alunoController.quadroNotas);

module.exports = router;