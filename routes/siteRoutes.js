const express = require('express');
const router = express.Router();

// Páginas públicas
router.get('/', (req, res) => res.render('pages/site/home'));
router.get('/login', (req, res) => res.render('pages/site/login'));
router.get('/matricula', (req, res) => res.render('pages/site/matricula'));
router.get('/sobre', (req, res) => res.render('pages/site/sobre'));
router.get('/contato', (req, res) => res.render('pages/site/contato'));
router.get('/time', (req, res) => res.render('pages/site/time'));
router.get('/feedbacks', (req, res) => res.render('pages/site/feedbacks'));
router.get('/confirmacao', (req, res) => res.render('pages/site/confirmacao'));
router.get('/cursos', (req, res) => res.render('pages/site/cursos'));

module.exports = router;