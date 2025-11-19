const express = require('express');
const router = express.Router();

// Página inicial
router.get('/', (req, res) => {
    res.render('pages/site/home');
});

// Página de login
router.get('/login', (req, res) => {
    res.render('pages/site/login');
});

// Página de cadastro
router.get('/matricula', (req, res) => {
    res.render('pages/site/matricula');
});

// Página sobre nós
router.get('/sobre', (req, res) => {
    res.render('pages/site/sobre');
});

// Página de contato
router.get('/contato', (req, res) => {
    res.render('pages/site/sobre');
});

// Página de time
router.get('/time', (req, res) => {
    res.render('pages/site/time');
});

// Página de feedback
router.get('/feedbacks', (req, res) => {
    res.render('pages/site/feedbacks');
});

// Página de confirmação
router.get('/confirmacao', (req, res) => {
    res.render('pages/site/confirmacao');
});

// Página de cursos
router.get('/cursos', (req, res) => {
    res.render('pages/site/cursos');
});

module.exports = router;