const express = require('express');
const router = express.Router();
const atividadeController = require('../controllers/atividadeController');

// Listar atividades
router.get('/', atividadeController.listar);

// Criar nova atividade
router.post('/', atividadeController.criar);

// Listar turmas e disciplinas
router.get('/turmas-disciplinas', atividadeController.listarTurmasEDisciplinas);

// Atualizar atividade
router.put('/:id', atividadeController.atualizar);

// Excluir atividade
router.delete('/:id', atividadeController.excluir);

// Buscar atividade por ID
router.get('/:id', atividadeController.buscarPorId);

module.exports = router;