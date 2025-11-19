const express = require('express');
const router = express.Router();
const quadroNotasController = require('../controllers/quadroNotasController');

// Listar notas por turma/disciplina (professor)
router.get('/notas', quadroNotasController.listarNotas);

// Listar notas do aluno logado
router.get('/minhas-notas', quadroNotasController.listarNotasAluno);

// Atualizar nota
router.put('/atualizar-nota', quadroNotasController.atualizarNota);

// Listar atividades para filtro
router.get('/atividades', quadroNotasController.listarAtividades);

module.exports = router;