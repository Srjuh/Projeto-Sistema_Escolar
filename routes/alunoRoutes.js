const express = require('express');
const router = express.Router();
const alunoController = require('../controllers/alunoController');
const atividadeController = require('../controllers/atividadeController');
const quadroNotasController = require('../controllers/quadroNotasController');
const multer = require('multer');
const path = require('path');

// Configuração do Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /pdf|doc|docx|txt|jpg|jpeg|png/;
        const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
        const mimeOk = allowed.test(file.mimetype);
        cb(extOk && mimeOk ? null : new Error('Formato não permitido!'), extOk && mimeOk);
    }
});

// ===== Páginas =====
router.get('/', alunoController.home);
router.get('/atividades', atividadeController.renderAtividades);
router.get('/quadro-notas', alunoController.quadroNotas);

// ===== API: Atividades/Entregas =====
router.get('/api/atividades', atividadeController.listarAtividadesAluno);
router.get('/api/atividades/:id_atividade', atividadeController.buscarAtividadeAluno);
router.post('/api/atividades/entregar', upload.single('arquivo'), atividadeController.entregarAtividade);
router.get('/api/estatisticas', atividadeController.estatisticasAluno);

// ===== API: Notas =====
router.get('/api/notas', quadroNotasController.listarNotasAluno);

module.exports = router;