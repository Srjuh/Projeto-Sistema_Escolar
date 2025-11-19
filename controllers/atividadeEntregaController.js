const atividadeEntregaModel = require('../models/atividadeEntregaModel');
const path = require('path');
const fs = require('fs');

// Função para verificar sessão do aluno
function verificarSessao(req, res) {
    const id_aluno = req.session?.usuario?.id_aluno;
    if (!id_aluno) {
        res.json({ sucesso: false, erro: 'Aluno não identificado na sessão.' });
        return null;
    }
    return id_aluno;
}

module.exports = {
    // Renderizar página de atividades do aluno
    async renderAtividades(req, res) {
        try {
            // Verifica a sessão do aluno
            const id_aluno = verificarSessao(req, res);
                if (!id_aluno) {
                    return res.redirect('/login');
                }

            // Renderiza a página
            res.render('pages/aluno/atividadesEntregar', { usuario: req.session.usuario });
        
        } catch (error) {
            console.error('❌ Erro ao renderizar página de atividades:', error);
                res.render('pages/aluno/atividadesEntregar', { usuario: req.session.usuario });
        }
    },

    // API: Listar atividades do aluno
    async listarAtividades(req, res) {
        try {
            // Verifica a sessão do aluno
            const id_aluno = verificarSessao(req, res);
                if (!id_aluno) return;

            // Busca as atividades do aluno
            const atividades = await atividadeEntregaModel.listarAtividadesPorAluno(id_aluno);
            console.log('📚 Atividades do aluno:', atividades.length);

            // Retorna as atividades
            res.json({ sucesso: true, dados: atividades });
        
        } catch (error) {
            console.error('❌ Erro ao listar atividades:', error);
                res.json({ sucesso: false, erro: 'Erro ao listar atividades.' });
        }
    },

    // API: Buscar detalhes de uma atividade
    async buscarAtividade(req, res) {
        try {
            // Pega o ID da atividade dos parâmetros
            const { id_atividade } = req.params;

            // Verifica a sessão do aluno
            const id_aluno = verificarSessao(req, res);
                if (!id_aluno) return;

            // Busca a atividade no banco
            const atividade = await atividadeEntregaModel.buscarAtividadeParaEntrega(id_atividade, id_aluno);
                if (!atividade) {
                    return res.json({ sucesso: false, erro: 'Atividade não encontrada.' });
                }

            // Retorna a atividade
            res.json({ sucesso: true, dados: atividade });
        
        } catch (error) {
            console.error('❌ Erro ao buscar atividade:', error);
                res.json({ sucesso: false, erro: 'Erro ao buscar atividade.' });
        }
    },

    // API: Entregar atividade
    async entregarAtividade(req, res) {
        try {
            // Verifica a sessão do aluno
            const id_aluno = verificarSessao(req, res);
                if (!id_aluno) return;

            // Extrai os dados do corpo da requisição
            const { id_atividade, id_entrega } = req.body;

            // Verifica se foi enviado um arquivo
            if (!req.file) {
                return res.json({ sucesso: false, erro: 'Nenhum arquivo enviado.' });
            }

            // Pega o nome do arquivo
            const nomeArquivo = req.file.filename;

            // Se já existe uma entrega, atualiza
            if (id_entrega) {
                await atividadeEntregaModel.atualizarEntrega(id_entrega, nomeArquivo);
                console.log('✅ Entrega atualizada:', id_entrega);
                res.json({ sucesso: true, mensagem: 'Atividade reenviada com sucesso!' });
            } else {
                // Cria nova entrega
                const result = await atividadeEntregaModel.criarEntrega(id_atividade, id_aluno, nomeArquivo);
                console.log('✅ Nova entrega criada:', result.insertId);
                res.json({ sucesso: true, mensagem: 'Atividade entregue com sucesso!' });
            }
        
        } catch (error) {
            console.error('❌ Erro ao entregar atividade:', error);
                res.json({ sucesso: false, erro: 'Erro ao entregar atividade.' });
        }
    },

    // API: Estatísticas do aluno
    async estatisticas(req, res) {
        try {
            // Verifica a sessão do aluno
            const id_aluno = verificarSessao(req, res);
                if (!id_aluno) return;

            // Busca as estatísticas
            const stats = await atividadeEntregaModel.estatisticasAluno(id_aluno);

            // Retorna as estatísticas
            res.json({ sucesso: true, dados: stats });
        
        } catch (error) {
            console.error('❌ Erro ao buscar estatísticas:', error);
                res.json({ sucesso: false, erro: 'Erro ao buscar estatísticas.' });
        }
    }
};