const express = require('express');
const router = express.Router();
const disciplinaModel = require('../models/disciplinaModel');

// Listar disciplinas
router.get('/', async (req, res) => {
    try {
        const disciplinas = await disciplinaModel.listar();
        res.json({ sucesso: true, dados: disciplinas });
    } catch (error) {
        console.error('Erro ao listar disciplinas:', error);
        res.json({ sucesso: false, erro: 'Erro ao listar disciplinas.' });
    }
});

module.exports = router;