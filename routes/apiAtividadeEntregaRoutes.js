const express = require('express');
const router = express.Router();
const atividadeEntregaController = require('../controllers/atividadeEntregaController');
const multer = require('multer');
const path = require('path');

// Configuração do Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /pdf|doc|docx|txt|jpg|jpeg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Formato de arquivo não permitido!'));
        }
    }
});

// ✅ IMPORTANTE: Rotas da API (sem middleware de sessão aqui, já está no controller)
router.get('/listar', atividadeEntregaController.listarAtividades);
router.get('/buscar/:id_atividade', atividadeEntregaController.buscarAtividade); // ✅ ESTA ROTA
router.post('/entregar', upload.single('arquivo'), atividadeEntregaController.entregarAtividade);
router.get('/estatisticas', atividadeEntregaController.estatisticas);

module.exports = router;