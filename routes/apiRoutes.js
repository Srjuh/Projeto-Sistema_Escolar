const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');
const turmaModel = require('../models/turmaModel');
const disciplinaModel = require('../models/disciplinaModel');

// ===== Autenticação =====
router.post('/usuarios/login', loginController.login);
router.post('/usuarios/logout', loginController.logout);

// ===== Turmas =====
router.get('/turmas', async function(req, res) {
    try {
        var turmas = await turmaModel.listar();
        res.json({ sucesso: true, dados: turmas });
    } catch (error) {
        console.error('Erro ao listar turmas:', error);
        res.json({ sucesso: false, erro: 'Erro ao listar turmas.' });
    }
});

// ===== Disciplinas =====
router.get('/disciplinas', async function(req, res) {
    try {
        var disciplinas = await disciplinaModel.listar();
        res.json({ sucesso: true, dados: disciplinas });
    } catch (error) {
        console.error('Erro ao listar disciplinas:', error);
        res.json({ sucesso: false, erro: 'Erro ao listar disciplinas.' });
    }
});

module.exports = router;