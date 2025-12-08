const quadroNotasModel = require('../models/quadroNotasModel');
const turmaModel = require('../models/turmaModel');
const sessao = require('../utils/sessao');

module.exports = {
    // Renderizar quadro de notas (Professor)
    async renderQuadroNotas(req, res) {
        try {
            const id_professor = sessao.getProfessor(req);
            if (!id_professor) return res.redirect('/login');

            const turmas = await turmaModel.listarTurmasDisciplinasPorProfessor(id_professor);
            res.render('pages/professor/quadroNotas', { turmas });
        } catch (error) {
            console.error('Erro ao renderizar quadro de notas:', error);
            res.render('pages/professor/quadroNotas', { turmas: [] });
        }
    },

    // Listar notas por turma/disciplina (Professor)
    async listarNotas(req, res) {
        try {
            const id_professor = Sessao.getProfessor(req);
            if (!id_professor) return res.json({ sucesso: false, erro: 'Professor não identificado.' });

            const { id_turma, id_disciplina } = req.query;
            if (!id_turma) return res.json({ sucesso: false, erro: 'Turma não informada.' });

            const notas = await quadroNotasModel.listarNotasPorTurma(id_turma, id_disciplina || null, id_professor);

            // Agrupa por aluno
            const alunosMap = {};
            notas.forEach(nota => {
                if (!alunosMap[nota.id_aluno]) {
                    alunosMap[nota.id_aluno] = {
                        id_aluno: nota.id_aluno,
                        nome_aluno: nota.nome_aluno,
                        atividades: []
                    };
                }
                if (nota.id_atividade) {
                    alunosMap[nota.id_aluno].atividades.push({
                        id_atividade: nota.id_atividade,
                        titulo: nota.titulo_atividade,
                        data_entrega: nota.data_entrega,
                        nota: nota.nota,
                        feedback: nota.feedback || '',
                        data_envio: nota.data_envio,
                        disciplina: nota.disciplina
                    });
                }
            });

            res.json({ sucesso: true, dados: Object.values(alunosMap) });
        } catch (error) {
            console.error('Erro ao listar notas:', error);
            res.json({ sucesso: false, erro: 'Erro ao listar notas.' });
        }
    },

    // Listar notas do aluno logado
    async listarNotasAluno(req, res) {
        try {
            const id_aluno = sessao.getAluno(req);
            if (!id_aluno) return res.json({ sucesso: false, erro: 'Aluno não identificado.' });

            const notas = await quadroNotasModel.listarNotasAluno(id_aluno);
            res.json({ sucesso: true, dados: notas });
        } catch (error) {
            console.error('Erro ao listar notas do aluno:', error);
            res.json({ sucesso: false, erro: 'Erro ao listar notas.' });
        }
    },

    // Atualizar nota (Professor)
    async atualizarNota(req, res) {
        try {
            const id_professor = sessao.getProfessor(req);
            if (!id_professor) return res.json({ sucesso: false, erro: 'Professor não identificado.' });

            const { id_atividade, id_aluno, nota, feedback } = req.body;
            if (!id_atividade || !id_aluno || nota === undefined || nota === null) {
                return res.json({ sucesso: false, erro: 'Dados incompletos.' });
            }

            const notaNum = parseFloat(nota);
            if (isNaN(notaNum) || notaNum < 0 || notaNum > 10) {
                return res.json({ sucesso: false, erro: 'Nota deve estar entre 0 e 10.' });
            }

            await quadroNotasModel.atualizarNota(id_atividade, id_aluno, notaNum, feedback || '');
            res.json({ sucesso: true, mensagem: 'Nota atualizada com sucesso.' });
        } catch (error) {
            console.error('Erro ao atualizar nota:', error);
            res.json({ sucesso: false, erro: 'Erro ao atualizar nota.' });
        }
    },

    // Listar atividades para filtro (Professor)
    async listarAtividades(req, res) {
        try {
            const id_professor = sessao.getProfessor(req);
            if (!id_professor) return res.json({ sucesso: false, erro: 'Professor não identificado.' });

            const { id_turma, id_disciplina } = req.query;
            if (!id_turma) return res.json({ sucesso: false, erro: 'Turma não informada.' });

            const atividades = await quadroNotasModel.listarAtividades(id_turma, id_disciplina || null, id_professor);
            res.json({ sucesso: true, dados: atividades });
        } catch (error) {
            console.error('Erro ao listar atividades:', error);
            res.json({ sucesso: false, erro: 'Erro ao listar atividades.' });
        }
    }
};