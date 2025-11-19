const express = require('express');
const router = express.Router();
const turmaModel = require('../models/turmaModel');

// Listar turmas
router.get('/', async (req, res) => {
    try {
        const turmas = await turmaModel.listar();
        res.json({ sucesso: true, dados: turmas });
    } catch (error) {
        console.error('Erro ao listar turmas:', error);
        res.json({ sucesso: false, erro: 'Erro ao listar turmas.' });
    }
});

module.exports = router;