const db = require('../utils/db');

class AtividadeEntregaModel {
    // Listar atividades disponíveis para o aluno
    async listarAtividadesPorAluno(id_aluno) {
        const sql = `
            SELECT 
                a.id_atividade,
                a.titulo,
                a.descricao,
                a.data_entrega,
                d.nome AS disciplina,
                t.nome AS turma,
                ae.id_entrega,
                ae.arquivo,
                ae.texto,
                ae.data_envio,
                ae.nota,
                ae.feedback,
                CASE 
                    WHEN ae.id_entrega IS NOT NULL THEN 'Entregue'
                    WHEN NOW() > a.data_entrega THEN 'Atrasada'
                    ELSE 'Pendente'
                END AS status
            FROM aluno al
            JOIN matricula m ON al.id_aluno = m.id_aluno
            JOIN turma t ON m.id_turma = t.id_turma
            JOIN atividade a ON a.id_turma = t.id_turma
            JOIN disciplina d ON a.id_disciplina = d.id_disciplina
            LEFT JOIN atividade_entrega ae ON ae.id_atividade = a.id_atividade AND ae.id_aluno = al.id_aluno
            WHERE al.id_aluno = ?
            ORDER BY 
                CASE 
                    WHEN ae.id_entrega IS NULL AND NOW() <= a.data_entrega THEN 1
                    WHEN ae.id_entrega IS NULL AND NOW() > a.data_entrega THEN 2
                    ELSE 3
                END,
                a.data_entrega DESC
        `;
        
        return db.ExecutaComando(sql, [id_aluno]);
    }

    // Buscar atividade para entrega
    async buscarAtividadeParaEntrega(id_atividade, id_aluno) {
        const sql = `
            SELECT 
                a.id_atividade,
                a.titulo,
                a.descricao,
                a.data_entrega,
                d.nome AS disciplina,
                t.nome AS turma,
                ae.id_entrega,
                ae.arquivo,
                ae.texto,
                ae.data_envio,
                ae.nota,
                ae.feedback
            FROM atividade a
            JOIN disciplina d ON a.id_disciplina = d.id_disciplina
            JOIN turma t ON a.id_turma = t.id_turma
            LEFT JOIN atividade_entrega ae ON ae.id_atividade = a.id_atividade AND ae.id_aluno = ?
            WHERE a.id_atividade = ?
              AND t.id_turma IN (SELECT id_turma FROM matricula WHERE id_aluno = ?)
        `;
        
        console.log('🔍 Buscando atividade:', { id_atividade, id_aluno });
        
        try {
            const result = await db.ExecutaComando(sql, [id_aluno, id_atividade, id_aluno]);
            console.log('✅ Resultado da busca:', result.length > 0 ? 'Encontrada' : 'Não encontrada');
            return result[0] || null;
        } catch (error) {
            console.error('❌ Erro na query buscarAtividadeParaEntrega:', error);
            throw error;
        }
    }

    // Criar entrega (ATUALIZADO - com texto)
    async criarEntrega(id_atividade, id_aluno, arquivo = null, texto = null) {
        const sql = `
            INSERT INTO atividade_entrega (id_atividade, id_aluno, arquivo, texto, data_envio)
            VALUES (?, ?, ?, ?, NOW())
        `;
        
        console.log('📝 Criando entrega:', { id_atividade, id_aluno, arquivo, texto: texto?.substring(0, 30) });
        
        return db.ExecutaComandoLastInserted(sql, [id_atividade, id_aluno, arquivo, texto]);
    }

    // Atualizar entrega (CORRIGIDO - ordem dos parâmetros)
    async atualizarEntrega(id_entrega, arquivo = null, texto = null) {
        // Se for atualização de texto, limpa o arquivo
        // Se for atualização de arquivo, limpa o texto
        const sql = `
            UPDATE atividade_entrega 
            SET arquivo = ?, texto = ?, data_envio = NOW()
            WHERE id_entrega = ?
        `;
        
        console.log('📝 Atualizando entrega:', { 
            id_entrega, 
            arquivo, 
            texto: texto?.substring(0, 30),
            params: [arquivo, texto, id_entrega]
        });
        
        try {
            const result = await db.ExecutaComandoNonQuery(sql, [arquivo, texto, id_entrega]);
            console.log('✅ Entrega atualizada com sucesso');
            return result;
        } catch (error) {
            console.error('❌ Erro ao atualizar entrega:', error);
            console.error('Parâmetros:', { arquivo, texto, id_entrega });
            throw error;
        }
    }

    // Estatísticas do aluno
    async estatisticasAluno(id_aluno) {
        const sql = `
            SELECT 
                COUNT(DISTINCT a.id_atividade) AS total_atividades,
                COUNT(DISTINCT ae.id_entrega) AS total_entregues,
                COUNT(DISTINCT CASE WHEN ae.nota IS NOT NULL THEN ae.id_entrega END) AS total_corrigidas,
                ROUND(AVG(ae.nota), 2) AS media_notas,
                COUNT(DISTINCT CASE 
                    WHEN ae.id_entrega IS NULL AND NOW() > a.data_entrega 
                    THEN a.id_atividade 
                END) AS total_atrasadas
            FROM aluno al
            JOIN matricula m ON al.id_aluno = m.id_aluno
            JOIN turma t ON m.id_turma = t.id_turma
            JOIN atividade a ON a.id_turma = t.id_turma
            LEFT JOIN atividade_entrega ae ON ae.id_atividade = a.id_atividade AND ae.id_aluno = al.id_aluno
            WHERE al.id_aluno = ?
        `;
        
        const result = await db.ExecutaComando(sql, [id_aluno]);
        return result[0] || {};
    }
}

module.exports = new AtividadeEntregaModel();
