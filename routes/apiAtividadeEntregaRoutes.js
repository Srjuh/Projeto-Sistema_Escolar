const express = require('express');
const router = express.Router();
const atividadeEntregaController = require('../controllers/atividadeEntregaController');
const multer = require('multer');
const path = require('path');

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'atividade-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|doc|docx|txt|png|jpg|jpeg|zip|rar/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Tipo de arquivo não permitido!'));
        }
    }
});

// Listar atividades do aluno
router.get('/listar', atividadeEntregaController.listarAtividades);

// Buscar detalhes de uma atividade
router.get('/atividade/:id_atividade', atividadeEntregaController.buscarAtividade);

// Entregar atividade (upload de arquivo)
router.post('/entregar', upload.single('arquivo'), atividadeEntregaController.entregarAtividade);

// Estatísticas do aluno
router.get('/estatisticas', atividadeEntregaController.estatisticas);

module.exports = router;