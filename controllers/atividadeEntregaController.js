const atividadeEntregaModel = require('../models/atividadeEntregaModel');
const path = require('path');
const fs = require('fs');

// Função para verificar sessão do aluno (CORRIGIDA)
function verificarSessao(req, res) {
    const id_aluno = req.session?.usuario?.id_aluno;
    if (!id_aluno) {
        console.warn('⚠️ Tentativa de acesso sem sessão de aluno');
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
                    console.warn('⚠️ Aluno não autenticado, redirecionando para login');
                    return res.redirect('/login');
                }

            console.log('✅ Renderizando página de atividades para aluno:', id_aluno);
            // Renderiza a página
            res.render('pages/aluno/atividadesEntregar', { usuario: req.session.usuario });
        
        } catch (error) {
            console.error('❌ Erro ao renderizar página de atividades:', error);
                res.redirect('/login');
        }
    },

    // API: Listar atividades do aluno
    async listarAtividades(req, res) {
        try {
            // Verifica a sessão do aluno
            const id_aluno = verificarSessao(req, res);
                if (!id_aluno) {
                    return res.json({ sucesso: false, erro: 'Aluno não identificado na sessão.' });
                }

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
        console.log('🎯 ROTA CHAMADA: /api/aluno/atividades/buscar/:id_atividade');
        console.log('📥 Requisição recebida:', {
            params: req.params,
            query: req.query,
            session: req.session?.usuario
        });

        try {
            // Pega o ID da atividade dos parâmetros
            const { id_atividade } = req.params;

            console.log('🔍 Buscando atividade ID:', id_atividade);

            // Verifica a sessão do aluno
            const id_aluno = verificarSessao(req, res);
                if (!id_aluno) {
                    console.error('❌ Aluno não está na sessão!');
                    return res.json({ sucesso: false, erro: 'Aluno não identificado na sessão.' });
                }

            console.log('👤 Aluno ID:', id_aluno);

            // Busca a atividade no banco
            const atividade = await atividadeEntregaModel.buscarAtividadeParaEntrega(id_atividade, id_aluno);
                if (!atividade) {
                    console.warn('⚠️ Atividade não encontrada ou sem permissão');
                    return res.json({ sucesso: false, erro: 'Atividade não encontrada ou você não tem permissão para acessá-la.' });
                }

            console.log('✅ Atividade encontrada:', atividade.titulo);

            // Retorna a atividade
            res.json({ sucesso: true, dados: atividade });
        
        } catch (error) {
            console.error('❌ Erro ao buscar atividade:', error);
            console.error('Stack:', error.stack);
            res.json({ sucesso: false, erro: 'Erro ao buscar atividade: ' + error.message });
        }
    },

    // API: Entregar atividade (ATUALIZADO - com texto ou arquivo)
    async entregarAtividade(req, res) {
        console.log('📥 REQUISIÇÃO RECEBIDA:', {
            body: req.body,
            file: req.file,
            session: req.session?.usuario
        });

        try {
            // Verifica a sessão do aluno
            const id_aluno = verificarSessao(req, res);
                if (!id_aluno) {
                    return res.json({ sucesso: false, erro: 'Aluno não identificado na sessão.' });
                }

            // Extrai os dados do corpo da requisição
            const { id_atividade, id_entrega, texto, tipo_entrega } = req.body;

            console.log('📝 Tipo de entrega:', tipo_entrega);
            console.log('📄 Texto recebido:', texto?.substring(0, 50) + '...');
            console.log('📎 Arquivo recebido:', req.file?.filename);

            // Valida o tipo de entrega
            if (tipo_entrega === 'texto') {
                // Entrega por texto
                if (!texto || texto.trim() === '') {
                    return res.json({ sucesso: false, erro: 'O texto da resposta não pode estar vazio.' });
                }

                if (id_entrega) {
                    // Atualiza entrega existente
                    await atividadeEntregaModel.atualizarEntrega(id_entrega, null, texto);
                    console.log('✅ Entrega atualizada (texto):', id_entrega);
                    return res.json({ sucesso: true, mensagem: 'Resposta atualizada com sucesso!' });
                } else {
                    // Cria nova entrega
                    const result = await atividadeEntregaModel.criarEntrega(id_atividade, id_aluno, null, texto);
                    console.log('✅ Nova entrega criada (texto):', result.insertId);
                    return res.json({ sucesso: true, mensagem: 'Resposta enviada com sucesso!' });
                }

            } else if (tipo_entrega === 'arquivo') {
                // Entrega por arquivo
                if (!req.file) {
                    return res.json({ sucesso: false, erro: 'Nenhum arquivo foi enviado.' });
                }

                const nomeArquivo = req.file.filename;

                if (id_entrega) {
                    // Remove arquivo antigo se existir
                    const entregaAntiga = await atividadeEntregaModel.buscarAtividadeParaEntrega(id_atividade, id_aluno);
                    if (entregaAntiga?.arquivo) {
                        const caminhoAntigo = path.join(__dirname, '../uploads', entregaAntiga.arquivo);
                        if (fs.existsSync(caminhoAntigo)) {
                            fs.unlinkSync(caminhoAntigo);
                            console.log('🗑️ Arquivo antigo removido:', entregaAntiga.arquivo);
                        }
                    }

                    // Atualiza entrega existente
                    await atividadeEntregaModel.atualizarEntrega(id_entrega, nomeArquivo, null);
                    console.log('✅ Entrega atualizada (arquivo):', id_entrega);
                    return res.json({ sucesso: true, mensagem: 'Arquivo reenviado com sucesso!' });
                } else {
                    // Cria nova entrega
                    const result = await atividadeEntregaModel.criarEntrega(id_atividade, id_aluno, nomeArquivo, null);
                    console.log('✅ Nova entrega criada (arquivo):', result.insertId);
                    return res.json({ sucesso: true, mensagem: 'Arquivo enviado com sucesso!' });
                }

            } else {
                return res.json({ sucesso: false, erro: 'Tipo de entrega inválido.' });
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
                if (!id_aluno) {
                    return res.json({ sucesso: false, erro: 'Aluno não identificado na sessão.' });
                }

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