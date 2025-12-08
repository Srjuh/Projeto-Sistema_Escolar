const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');
const turmaModel = require('../models/turmaModel');
const disciplinaModel = require('../models/disciplinaModel');

// ===== Autenticação =====
router.post('/login', loginController.login);
router.post('/logout', loginController.logout);

// ===== Turmas =====
router.get('/turmas', async (req, res) => {
    try {
        const turmas = await turmaModel.listar();
        res.json({ sucesso: true, dados: turmas });
    } catch (error) {
        console.error('Erro ao listar turmas:', error);
        res.json({ sucesso: false, erro: 'Erro ao listar turmas.' });
    }
});

// ===== Disciplinas =====
router.get('/disciplinas', async (req, res) => {
    try {
        const disciplinas = await disciplinaModel.listar();
        res.json({ sucesso: true, dados: disciplinas });
    } catch (error) {
        console.error('Erro ao listar disciplinas:', error);
        res.json({ sucesso: false, erro: 'Erro ao listar disciplinas.' });
    }
});

module.exports = router;