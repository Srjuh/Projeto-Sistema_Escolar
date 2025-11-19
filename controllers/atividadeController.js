const atividadeModel = require('../models/atividadeModel');
const turmaModel = require('../models/turmaModel');
const disciplinaModel = require('../models/disciplinaModel');

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
            // Verifica a sessão do professor
            const id_professor = verificarSessao(req, res);
                if (!id_professor) return;

            // Extrai os dados do corpo da requisição
            const { titulo, descricao, data_entrega, id_turma, id_disciplina } = req.body;
                if (!titulo || !data_entrega || !id_turma || !id_disciplina) {
                    return res.json({ sucesso: false, erro: 'Campos obrigatórios faltando.' });
                }

            // Verifica se o professor pode criar atividade nessa turma/disciplina
            const ok = await turmaModel.verificarProfessorNaTurma(id_professor, id_turma, id_disciplina);
                if (!ok) return res.json({ sucesso: false, erro: 'Você não está vinculado a essa turma/disciplina.' });

            // Cria a atividade no banco
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
            // Verifica a sessão do professor
            const id_professor = verificarSessao(req, res);
                if (!id_professor) return;

            // Pega o ID da atividade e os novos dados
            const { id } = req.params;
            const { titulo, descricao, data_entrega, id_turma, id_disciplina } = req.body;

            // Busca a atividade atual
            const atividade = await atividadeModel.buscarPorId(id);
                if (!atividade) return res.json({ sucesso: false, erro: 'Atividade não encontrada.' });

            // Verifica permissão na atividade atual
            const okAtual = await turmaModel.verificarProfessorNaTurma(id_professor, atividade.id_turma, atividade.id_disciplina);
            
            // Verifica permissão na nova turma/disciplina
            const okNovo = await turmaModel.verificarProfessorNaTurma(id_professor, id_turma, id_disciplina);
                if (!okAtual || !okNovo) {
                    return res.json({ sucesso: false, erro: 'Sem permissão para editar esta atividade / mover para a turma escolhida.' });
                }

            // Atualiza a atividade
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