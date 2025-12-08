const atividadeModel = require('../models/atividadeModel');
const atividadeEntregaModel = require('../models/atividadeEntregaModel');
const corrigirAtividadeModel = require('../models/corrigirAtividadeModel');
const turmaModel = require('../models/turmaModel');
const sessao = require('../utils/sessao');
const path = require('path');
const fs = require('fs');

// ===== Helpers de Validação =====
function isYearValid(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return false;
    const year = dateStr.split('T')[0].split('-')[0];
    return /^\d{1,4}$/.test(year);
}

function isDateOnOrAfterToday(dateStr) {
    const input = new Date(dateStr);
    if (isNaN(input.getTime())) return false;
    const today = new Date();
    today.setHours(0,0,0,0);
    input.setHours(0,0,0,0);
    return input.getTime() >= today.getTime();
}

function validarData(data_entrega) {
    if (!isYearValid(data_entrega)) {
        return { valido: false, erro: 'Ano inválido. Informe ano com até 4 dígitos.' };
    }
    if (!isDateOnOrAfterToday(data_entrega)) {
        return { valido: false, erro: 'Data de entrega inválida. A data deve ser de hoje ou futura.' };
    }
    return { valido: true };
}

function validarNota(nota) {
    if (nota === undefined || nota === null || nota === '') {
        return { valido: false, erro: 'A nota é obrigatória.' };
    }
    const notaNum = parseFloat(nota);
    if (isNaN(notaNum) || notaNum < 0 || notaNum > 10) {
        return { valido: false, erro: 'A nota deve ser um número entre 0 e 10.' };
    }
    return { valido: true, valor: notaNum };
}

module.exports = {
    // ===== PROFESSOR: Gerenciar Atividades =====
    async listar(req, res) {
        try {
            const id_professor = sessao.getProfessor(req);
            if (!id_professor) return res.json({ sucesso: false, erro: 'Professor não identificado.' });

            const atividades = await atividadeModel.listarPorProfessor(id_professor);
            res.json({ sucesso: true, dados: atividades });
        } catch (error) {
            console.error('Erro ao listar atividades:', error);
            res.json({ sucesso: false, erro: 'Erro ao listar atividades.' });
        }
    },

    async buscarPorId(req, res) {
        try {
            const id_professor = sessao.getProfessor(req);
            if (!id_professor) return res.json({ sucesso: false, erro: 'Professor não identificado.' });

            const { id } = req.params;
            const atividade = await atividadeModel.buscarPorId(id);
            if (!atividade) return res.json({ sucesso: false, erro: 'Atividade não encontrada.' });

            const ok = await turmaModel.verificarProfessorNaTurma(id_professor, atividade.id_turma, atividade.id_disciplina);
            if (!ok) return res.json({ sucesso: false, erro: 'Sem permissão para acessar esta atividade.' });

            res.json({ sucesso: true, dados: atividade });
        } catch (error) {
            console.error('Erro ao buscar atividade:', error);
            res.json({ sucesso: false, erro: 'Erro ao buscar atividade.' });
        }
    },

    async criar(req, res) {
        try {
            const id_professor = sessao.getProfessor(req);
            if (!id_professor) return res.json({ sucesso: false, erro: 'Professor não identificado.' });

            const { titulo, descricao, data_entrega, id_turma, id_disciplina } = req.body;
            if (!titulo || !data_entrega || !id_turma || !id_disciplina) {
                return res.json({ sucesso: false, erro: 'Campos obrigatórios faltando.' });
            }

            const validacao = validarData(data_entrega);
            if (!validacao.valido) return res.json({ sucesso: false, erro: validacao.erro });

            const ok = await turmaModel.verificarProfessorNaTurma(id_professor, id_turma, id_disciplina);
            if (!ok) return res.json({ sucesso: false, erro: 'Você não está vinculado a essa turma/disciplina.' });

            const result = await atividadeModel.criar({ titulo, descricao, data_entrega, id_turma, id_disciplina });
            res.json({ sucesso: true, mensagem: 'Atividade criada.', id: result.insertId || null });
        } catch (error) {
            console.error('Erro ao criar atividade:', error);
            res.json({ sucesso: false, erro: 'Erro ao criar atividade.' });
        }
    },

    async atualizar(req, res) {
        try {
            const id_professor = sessao.getProfessor(req);
            if (!id_professor) return res.json({ sucesso: false, erro: 'Professor não identificado.' });

            const { id } = req.params;
            const { titulo, descricao, data_entrega, id_turma, id_disciplina } = req.body;

            const atividade = await atividadeModel.buscarPorId(id);
            if (!atividade) return res.json({ sucesso: false, erro: 'Atividade não encontrada.' });

            if (data_entrega) {
                const validacao = validarData(data_entrega);
                if (!validacao.valido) return res.json({ sucesso: false, erro: validacao.erro });
            }

            const okAtual = await turmaModel.verificarProfessorNaTurma(id_professor, atividade.id_turma, atividade.id_disciplina);
            const okNovo = await turmaModel.verificarProfessorNaTurma(id_professor, id_turma, id_disciplina);
            if (!okAtual || !okNovo) {
                return res.json({ sucesso: false, erro: 'Sem permissão para editar/mover esta atividade.' });
            }

            await atividadeModel.atualizar(id, { titulo, descricao, data_entrega, id_turma, id_disciplina });
            res.json({ sucesso: true, mensagem: 'Atividade atualizada.' });
        } catch (error) {
            console.error('Erro ao atualizar atividade:', error);
            res.json({ sucesso: false, erro: 'Erro ao atualizar atividade.' });
        }
    },

    async excluir(req, res) {
        try {
            const id_professor = sessao.getProfessor(req);
            if (!id_professor) return res.json({ sucesso: false, erro: 'Professor não identificado.' });

            const { id } = req.params;
            const atividade = await atividadeModel.buscarPorId(id);
            if (!atividade) return res.json({ sucesso: false, erro: 'Atividade não encontrada.' });

            const ok = await turmaModel.verificarProfessorNaTurma(id_professor, atividade.id_turma, atividade.id_disciplina);
            if (!ok) return res.json({ sucesso: false, erro: 'Sem permissão para excluir esta atividade.' });

            await atividadeModel.deletar(id);
            res.json({ sucesso: true, mensagem: 'Atividade excluída.' });
        } catch (error) {
            console.error('Erro ao excluir atividade:', error);
            res.json({ sucesso: false, erro: 'Erro ao excluir atividade.' });
        }
    },

    async listarTurmasEDisciplinas(req, res) {
        try {
            const id_professor = sessao.getProfessor(req);
            if (!id_professor) return res.json({ sucesso: false, erro: 'Professor não identificado.' });

            const turmas = await turmaModel.listarTurmasDisciplinasPorProfessor(id_professor);
            res.json({ sucesso: true, turmas });
        } catch (error) {
            console.error('Erro ao listar turmas e disciplinas:', error);
            res.json({ sucesso: false, erro: 'Erro ao listar turmas e disciplinas.' });
        }
    },

    // ===== PROFESSOR: Corrigir Atividades =====
    async renderCorrigirAtividades(req, res) {
        try {
            const id_professor = sessao.getProfessor(req);
            if (!id_professor) return res.redirect('/login');

            const turmas = await turmaModel.listarTurmasDisciplinasPorProfessor(id_professor);
            res.render('pages/professor/corrigirAtividades', { usuario: req.session.usuario, turmas });
        } catch (error) {
            console.error('Erro ao renderizar página de correção:', error);
            res.redirect('/professor/home');
        }
    },

    async listarAtividadesParaCorrigir(req, res) {
        try {
            const id_professor = sessao.getProfessor(req);
            if (!id_professor) return res.json({ sucesso: false, erro: 'Professor não identificado.' });

            const { id_turma, id_disciplina } = req.query;
            const atividades = await corrigirAtividadeModel.listarAtividadesComEntregas(id_professor, id_turma, id_disciplina);
            res.json({ sucesso: true, dados: atividades });
        } catch (error) {
            console.error('Erro ao listar atividades para corrigir:', error);
            res.json({ sucesso: false, erro: 'Erro ao listar atividades.' });
        }
    },

    async listarEntregas(req, res) {
        try {
            const id_professor = sessao.getProfessor(req);
            if (!id_professor) return res.json({ sucesso: false, erro: 'Professor não identificado.' });

            const { id_atividade } = req.params;
            const entregas = await corrigirAtividadeModel.listarEntregasPorAtividade(id_atividade);
            res.json({ sucesso: true, dados: entregas });
        } catch (error) {
            console.error('Erro ao listar entregas:', error);
            res.json({ sucesso: false, erro: 'Erro ao listar entregas.' });
        }
    },

    async buscarEntrega(req, res) {
        try {
            const id_professor = sessao.getProfessor(req);
            if (!id_professor) return res.json({ sucesso: false, erro: 'Professor não identificado.' });

            const { id_entrega } = req.params;
            const entrega = await corrigirAtividadeModel.buscarEntregaPorId(id_entrega);
            if (!entrega) return res.json({ sucesso: false, erro: 'Entrega não encontrada.' });

            res.json({ sucesso: true, dados: entrega });
        } catch (error) {
            console.error('Erro ao buscar entrega:', error);
            res.json({ sucesso: false, erro: 'Erro ao buscar entrega.' });
        }
    },

    async corrigirEntrega(req, res) {
        try {
            const id_professor = sessao.getProfessor(req);
            if (!id_professor) return res.json({ sucesso: false, erro: 'Professor não identificado.' });

            const { id_entrega } = req.params;
            const { nota, feedback } = req.body;

            const validacao = validarNota(nota);
            if (!validacao.valido) return res.json({ sucesso: false, erro: validacao.erro });

            await corrigirAtividadeModel.atualizarCorrecao(id_entrega, validacao.valor, feedback || null);
            res.json({ sucesso: true, mensagem: 'Correção salva com sucesso!' });
        } catch (error) {
            console.error('Erro ao corrigir entrega:', error);
            res.json({ sucesso: false, erro: 'Erro ao salvar correção.' });
        }
    },

    // ===== ALUNO: Entregar Atividades =====
    async renderAtividades(req, res) {
        try {
            const id_aluno = sessao.getAluno(req);
            if (!id_aluno) return res.redirect('/login');
            res.render('pages/aluno/atividadesEntregar', { usuario: req.session.usuario });
        } catch (error) {
            console.error('Erro ao renderizar página de atividades:', error);
            res.redirect('/login');
        }
    },

    async listarAtividadesAluno(req, res) {
        try {
            const id_aluno = sessao.getAluno(req);
            if (!id_aluno) return res.json({ sucesso: false, erro: 'Aluno não identificado.' });

            const atividades = await atividadeEntregaModel.listarAtividadesPorAluno(id_aluno);
            res.json({ sucesso: true, dados: atividades });
        } catch (error) {
            console.error('Erro ao listar atividades:', error);
            res.json({ sucesso: false, erro: 'Erro ao listar atividades.' });
        }
    },

    async buscarAtividadeAluno(req, res) {
        try {
            const id_aluno = sessao.getAluno(req);
            if (!id_aluno) return res.json({ sucesso: false, erro: 'Aluno não identificado.' });

            const { id_atividade } = req.params;
            const atividade = await atividadeEntregaModel.buscarAtividadeParaEntrega(id_atividade, id_aluno);
            if (!atividade) return res.json({ sucesso: false, erro: 'Atividade não encontrada ou sem permissão.' });

            res.json({ sucesso: true, dados: atividade });
        } catch (error) {
            console.error('Erro ao buscar atividade:', error);
            res.json({ sucesso: false, erro: 'Erro ao buscar atividade.' });
        }
    },

    async entregarAtividade(req, res) {
        try {
            const id_aluno = sessao.getAluno(req);
            if (!id_aluno) return res.json({ sucesso: false, erro: 'Aluno não identificado.' });

            const { id_atividade, id_entrega, texto, tipo_entrega } = req.body;

            // Entrega por texto
            if (tipo_entrega === 'texto') {
                if (!texto || texto.trim() === '') {
                    return res.json({ sucesso: false, erro: 'O texto da resposta não pode estar vazio.' });
                }
                if (id_entrega) {
                    await atividadeEntregaModel.atualizarEntrega(id_entrega, null, texto);
                    return res.json({ sucesso: true, mensagem: 'Resposta atualizada com sucesso!' });
                }
                const result = await atividadeEntregaModel.criarEntrega(id_atividade, id_aluno, null, texto);
                return res.json({ sucesso: true, mensagem: 'Resposta enviada com sucesso!', id: result.insertId });
            }

            // Entrega por arquivo
            if (tipo_entrega === 'arquivo') {
                if (!req.file) {
                    return res.json({ sucesso: false, erro: 'Nenhum arquivo foi enviado.' });
                }
                const nomeArquivo = req.file.filename;

                if (id_entrega) {
                    const entregaAntiga = await atividadeEntregaModel.buscarAtividadeParaEntrega(id_atividade, id_aluno);
                    if (entregaAntiga?.arquivo) {
                        const caminhoAntigo = path.join(__dirname, '../uploads', entregaAntiga.arquivo);
                        if (fs.existsSync(caminhoAntigo)) fs.unlinkSync(caminhoAntigo);
                    }
                    await atividadeEntregaModel.atualizarEntrega(id_entrega, nomeArquivo, null);
                    return res.json({ sucesso: true, mensagem: 'Arquivo reenviado com sucesso!' });
                }
                const result = await atividadeEntregaModel.criarEntrega(id_atividade, id_aluno, nomeArquivo, null);
                return res.json({ sucesso: true, mensagem: 'Arquivo enviado com sucesso!', id: result.insertId });
            }

            return res.json({ sucesso: false, erro: 'Tipo de entrega inválido.' });
        } catch (error) {
            console.error('Erro ao entregar atividade:', error);
            res.json({ sucesso: false, erro: 'Erro ao entregar atividade.' });
        }
    },

    async estatisticasAluno(req, res) {
        try {
            const id_aluno = sessao.getAluno(req);
            if (!id_aluno) return res.json({ sucesso: false, erro: 'Aluno não identificado.' });

            const stats = await atividadeEntregaModel.estatisticasAluno(id_aluno);
            res.json({ sucesso: true, dados: stats });
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            res.json({ sucesso: false, erro: 'Erro ao buscar estatísticas.' });
        }
    }
};