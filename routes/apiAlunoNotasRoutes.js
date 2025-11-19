const express = require('express');
const router = express.Router();
const alunoNotasModel = require('../models/alunoNotasModel');

// Buscar notas do aluno logado
router.get('/notas', async (req, res) => {
    try {
        const id_aluno = req.session?.usuario?.id_aluno;
        
        if (!id_aluno) {
            return res.json({ sucesso: false, erro: 'Aluno não identificado.' });
        }

        const notas = await alunoNotasModel.buscarNotasAluno(id_aluno);
        res.json({ sucesso: true, dados: notas });
    } catch (error) {
        console.error('❌ Erro ao buscar notas do aluno:', error);
        res.json({ sucesso: false, erro: 'Erro ao buscar notas.' });
    }
});

module.exports = router;