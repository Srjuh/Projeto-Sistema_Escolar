const corrigirAtividadeModel = require('../models/corrigirAtividadeModel');

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
    // Renderizar página principal de correção
    async renderCorrigirAtividades(req, res) {
        try {
            // Verifica a sessão do professor
            const id_professor = req.session?.usuario?.id_professor;
            console.log('🔐 Professor ID:', id_professor);
                if (!id_professor) {
                    return res.redirect('/login');
                }

            // Busca atividades pendentes
            const atividades = await corrigirAtividadeModel.listarAtividadesPendentes(id_professor);
            console.log('📚 Atividades com entregas:', atividades);

            // Renderiza a página
            res.render('pages/professor/corrigirAtividade', { atividades });
        
        } catch (error) {
            console.error('❌ Erro ao renderizar página de correção:', error);
                res.render('pages/professor/corrigirAtividade', { atividades: [] });
        }
    },

    // API: Listar entregas de uma atividade
    async listarEntregas(req, res) {
        try {
            // Extrai o ID da atividade da query
            const { id_atividade } = req.query;
            console.log('🔍 Buscando entregas para atividade:', id_atividade);

            // Valida o parâmetro
            if (!id_atividade) {
                return res.json({ sucesso: false, erro: 'Atividade não informada.' });
            }

            // Busca entregas e estatísticas
            const entregas = await corrigirAtividadeModel.listarEntregasPorAtividade(id_atividade);
            const estatisticas = await corrigirAtividadeModel.estatisticasAtividade(id_atividade);

            console.log('✅ Entregas encontradas:', entregas.length);
            console.log('📊 Estatísticas:', estatisticas);

            // Retorna os dados
            res.json({ sucesso: true, entregas, estatisticas });
        
        } catch (error) {
            console.error('❌ Erro ao listar entregas:', error);
            console.error('Stack trace:', error.stack);
                res.json({ sucesso: false, erro: 'Erro ao listar entregas: ' + error.message });
        }
    },

    // API: Buscar detalhes de uma entrega
    async buscarEntrega(req, res) {
        try {
            // Pega o ID da entrega dos parâmetros
            const { id_entrega } = req.params;
            console.log('🔍 Buscando entrega ID:', id_entrega);

            // Busca a entrega no banco
            const entrega = await corrigirAtividadeModel.buscarEntrega(id_entrega);
                if (!entrega) {
                    return res.json({ sucesso: false, erro: 'Entrega não encontrada.' });
                }

            console.log('✅ Entrega encontrada:', entrega);

            // Retorna a entrega
            res.json({ sucesso: true, entrega });
        
        } catch (error) {
            console.error('❌ Erro ao buscar entrega:', error);
                res.json({ sucesso: false, erro: 'Erro ao buscar entrega: ' + error.message });
        }
    },

    // API: Corrigir uma entrega
    async corrigirEntrega(req, res) {
        try {
            // Verifica a sessão do professor
            const id_professor = verificarSessao(req, res);
                if (!id_professor) return;

            // Extrai os dados do corpo da requisição
            const { id_entrega, nota, feedback } = req.body;
            console.log('💾 Corrigindo entrega:', { id_entrega, nota, feedback });

            // Valida os dados
            if (!id_entrega || nota === undefined || nota === null) {
                return res.json({ sucesso: false, erro: 'Dados incompletos.' });
            }

            // Valida a nota
            const notaNum = parseFloat(nota);
                if (isNaN(notaNum) || notaNum < 0 || notaNum > 10) {
                    return res.json({ sucesso: false, erro: 'Nota deve estar entre 0 e 10.' });
                }

            // Corrige a entrega
            await corrigirAtividadeModel.corrigirEntrega(id_entrega, notaNum, feedback || '');
            console.log('✅ Correção salva com sucesso');

            // Retorna sucesso
            res.json({ sucesso: true, mensagem: 'Entrega corrigida com sucesso.' });
        
        } catch (error) {
            console.error('❌ Erro ao corrigir entrega:', error);
                res.json({ sucesso: false, erro: 'Erro ao corrigir entrega: ' + error.message });
        }
    }
};