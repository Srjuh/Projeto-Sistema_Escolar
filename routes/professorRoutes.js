const express = require('express');
const router = express.Router();
const professorController = require('../controllers/professorController');
const atividadeController = require('../controllers/atividadeController');
const quadroNotasController = require('../controllers/quadroNotasController');

// ===== Páginas =====
router.get('/', professorController.home);
router.get('/atividades', professorController.atividades);
router.get('/corrigir-atividades', atividadeController.renderCorrigirAtividades);
router.get('/quadro-notas', quadroNotasController.renderQuadroNotas);

// ===== API: CRUD Atividades =====
router.get('/api/atividades', atividadeController.listar);
router.get('/api/atividades/turmas-disciplinas', atividadeController.listarTurmasEDisciplinas);
router.get('/api/atividades/:id', atividadeController.buscarPorId);
router.post('/api/atividades', atividadeController.criar);
router.put('/api/atividades/:id', atividadeController.atualizar);
router.delete('/api/atividades/:id', atividadeController.excluir);

// ===== API: Correção =====
router.get('/api/corrigir/atividades', atividadeController.listarAtividadesParaCorrigir);
router.get('/api/corrigir/entregas/:id_atividade', atividadeController.listarEntregas);
router.get('/api/corrigir/entrega/:id_entrega', atividadeController.buscarEntrega);
router.put('/api/corrigir/entrega/:id_entrega', atividadeController.corrigirEntrega);

// ===== API: Quadro de Notas =====
router.get('/api/quadro-notas/notas', quadroNotasController.listarNotas);
router.get('/api/quadro-notas/atividades', quadroNotasController.listarAtividades);
router.put('/api/quadro-notas/atualizar-nota', quadroNotasController.atualizarNota);

module.exports = router;