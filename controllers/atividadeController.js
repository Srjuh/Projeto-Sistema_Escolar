const atividadeModel = require('../models/atividadeModel');
const turmaModel = require('../models/turmaModel');
const disciplinaModel = require('../models/disciplinaModel');

// Helper: valida se o ano tem até 4 dígitos (aceita formatos ISO e yyyy-mm-dd)
function isYearValid(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return false;

    // Pega somente a parte da data antes do "T" caso venha ISO
    const onlyDate = dateStr.split('T')[0];

    // Extrai ano (parte antes do primeiro '-')
    const parts = onlyDate.split('-');
    const year = parts[0];

    // Ano deve ser numérico e ter entre 1 e 4 dígitos
    return /^\d{1,4}$/.test(year);
}

// Helper: valida se a data (yyyy-mm-dd ou ISO) é hoje ou futura
function isDateOnOrAfterToday(dateStr) {
    const input = new Date(dateStr);
    if (isNaN(input.getTime())) return false;

    const today = new Date();
    today.setHours(0,0,0,0);
    input.setHours(0,0,0,0);

    return input.getTime() >= today.getTime();
}

// Função para verificar sessão do professor
function verificarSessao(req, res) {
    const id_professor = req.session?.usuario?.id_professor;
    if (!id_professor) {
        res.json({ sucesso: false, erro: 'Professor não identificado na sessão.' });
        return null;
    }
    return id_professor;
}

module.exports = {
    // Listar todas as atividades do professor
    async listar(req, res) {
        try {
            // Verifica a sessão do professor
            const id_professor = verificarSessao(req, res);
                if (!id_professor) return;

            // Busca as atividades do professor
            const atividades = await atividadeModel.listarPorProfessor(id_professor);
                res.json({ sucesso: true, dados: atividades });
        
        } catch (error) {
            console.error('Erro ao listar atividades:', error);
                res.json({ sucesso: false, erro: 'Erro ao listar atividades.' });
        }
    },

    // Buscar atividade por ID
    async buscarPorId(req, res) {
        try {
            // Pega o ID da atividade dos parâmetros
            const { id } = req.params;

            // Verifica a sessão do professor
            const id_professor = verificarSessao(req, res);
                if (!id_professor) return;

            // Busca a atividade no banco
            const atividade = await atividadeModel.buscarPorId(id);
                if (!atividade) return res.json({ sucesso: false, erro: 'Atividade não encontrada.' });

            // Verifica se o professor tem permissão para acessar esta atividade
            const ok = await turmaModel.verificarProfessorNaTurma(id_professor, atividade.id_turma, atividade.id_disciplina);
                if (!ok) return res.json({ sucesso: false, erro: 'Sem permissão para acessar esta atividade.' });

            // Retorna a atividade
            res.json({ sucesso: true, dados: atividade });
        
        } catch (error) {
            console.error('Erro ao buscar atividade:', error);
                res.json({ sucesso: false, erro: 'Erro ao buscar atividade.' });
        }
    },

    // Criar nova atividade
    async criar(req, res) {
        try {
            const id_professor = verificarSessao(req, res);
            if (!id_professor) return;

            const { titulo, descricao, data_entrega, id_turma, id_disciplina } = req.body;
            if (!titulo || !data_entrega || !id_turma || !id_disciplina) {
                return res.json({ sucesso: false, erro: 'Campos obrigatórios faltando.' });
            }

            // Validação: ano com até 4 dígitos
            if (!isYearValid(data_entrega)) {
                return res.json({
                    sucesso: false,
                    erro: 'Ano inválido. Informe uma data com ano de até 4 dígitos (ex.: 2025, 2026...).'
                });
            }

            // Validação: data hoje ou futura
            if (!isDateOnOrAfterToday(data_entrega)) {
                return res.json({
                    sucesso: false,
                    erro: 'Data de entrega inválida. A data deve ser de hoje ou futura.'
                });
            }

            const ok = await turmaModel.verificarProfessorNaTurma(id_professor, id_turma, id_disciplina);
            if (!ok) return res.json({ sucesso: false, erro: 'Você não está vinculado a essa turma/disciplina.' });

            const result = await atividadeModel.criar({ titulo, descricao, data_entrega, id_turma, id_disciplina });
            res.json({ sucesso: true, mensagem: 'Atividade criada.', id: result.insertId || null });

        } catch (error) {
            console.error('Erro ao criar atividade:', error);
            res.json({ sucesso: false, erro: 'Erro ao criar atividade.' });
        }
    },

    // Atualizar atividade
    async atualizar(req, res) {
        try {
            const id_professor = verificarSessao(req, res);
            if (!id_professor) return;

            const { id } = req.params;
            const { titulo, descricao, data_entrega, id_turma, id_disciplina } = req.body;

            const atividade = await atividadeModel.buscarPorId(id);
            if (!atividade) return res.json({ sucesso: false, erro: 'Atividade não encontrada.' });

            // Validações somente se data_entrega foi informada
            if (data_entrega) {
                if (!isYearValid(data_entrega)) {
                    return res.json({
                        sucesso: false,
                        erro: 'Ano inválido. Informe uma data com ano de até 4 dígitos (ex.: 2025, 2026...).'
                    });
                }

                if (!isDateOnOrAfterToday(data_entrega)) {
                    return res.json({
                        sucesso: false,
                        erro: 'Data de entrega inválida. A data deve ser de hoje ou futura.'
                    });
                }
            }

            const okAtual = await turmaModel.verificarProfessorNaTurma(id_professor, atividade.id_turma, atividade.id_disciplina);
            const okNovo = await turmaModel.verificarProfessorNaTurma(id_professor, id_turma, id_disciplina);
            if (!okAtual || !okNovo) {
                return res.json({ sucesso: false, erro: 'Sem permissão para editar esta atividade / mover para a turma escolhida.' });
            }

            await atividadeModel.atualizar(id, { titulo, descricao, data_entrega, id_turma, id_disciplina });
            res.json({ sucesso: true, mensagem: 'Atividade atualizada.' });

        } catch (error) {
            console.error('Erro ao atualizar atividade:', error);
            res.json({ sucesso: false, erro: 'Erro ao atualizar atividade.' });
        }
    },

    // Excluir atividade
    async excluir(req, res) {
        try {
            // Verifica a sessão do professor
            const id_professor = verificarSessao(req, res);
                if (!id_professor) return;

            // Pega o ID da atividade
            const { id } = req.params;
            
            // Busca a atividade
            const atividade = await atividadeModel.buscarPorId(id);
                if (!atividade) return res.json({ sucesso: false, erro: 'Atividade não encontrada.' });

            // Verifica se o professor tem permissão
            const ok = await turmaModel.verificarProfessorNaTurma(id_professor, atividade.id_turma, atividade.id_disciplina);
                if (!ok) return res.json({ sucesso: false, erro: 'Sem permissão para excluir esta atividade.' });

            // Exclui a atividade
            await atividadeModel.deletar(id);
                res.json({ sucesso: true, mensagem: 'Atividade excluída.' });
        
        } catch (error) {
            console.error('Erro ao excluir atividade:', error);
                res.json({ sucesso: false, erro: 'Erro ao excluir atividade.' });
        }
    },

    // Listar turmas e disciplinas do professor (CORRIGIDO)
    async listarTurmasEDisciplinas(req, res) {
        try {
            // Verifica a sessão do professor
            const id_professor = verificarSessao(req, res);
                if (!id_professor) return;

            console.log('🔍 Buscando turmas e disciplinas do professor:', id_professor);

            // Busca turmas com disciplinas do professor (mesma query do quadroNotas)
            const turmas = await turmaModel.listarTurmasDisciplinasPorProfessor(id_professor);

            console.log('📚 Turmas/Disciplinas encontradas:', turmas.length);

            // Retorna os dados (frontend vai extrair turmas e disciplinas únicas)
            res.json({ sucesso: true, turmas });
        
        } catch (error) {
            console.error('Erro ao listar turmas e disciplinas:', error);
                res.json({ sucesso: false, erro: 'Erro ao listar turmas e disciplinas.' });
        }
    }
};