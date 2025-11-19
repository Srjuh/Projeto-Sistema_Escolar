const express = require('express');
const router = express.Router();
const professorController = require('../controllers/professorController');

// Rota do painel principal do professor
router.get('/', professorController.home);

// Rota de atividades
router.get('/atividades', (req, res) => {
    res.render('pages/professor/atividades');
});

module.exports = router;