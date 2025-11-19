const Database = require('../utils/db');
const db = new Database();

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
                d.id_disciplina,
                t.nome AS turma,
                t.id_turma,
                ae.id_entrega,
                ae.data_envio,
                ae.arquivo,
                ae.nota,
                ae.feedback,
                CASE 
                    WHEN ae.id_entrega IS NOT NULL THEN 'entregue'
                    WHEN a.data_entrega < NOW() THEN 'atrasada'
                    ELSE 'pendente'
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
                    WHEN ae.id_entrega IS NULL AND a.data_entrega >= NOW() THEN 1
                    WHEN ae.id_entrega IS NULL AND a.data_entrega < NOW() THEN 2
                    ELSE 3
                END,
                a.data_entrega DESC
        `;
        return db.ExecutaComando(sql, [id_aluno]);
    }

    // Buscar detalhes de uma atividade específica
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
                ae.data_envio,
                ae.arquivo,
                ae.nota,
                ae.feedback
            FROM atividade a
            JOIN disciplina d ON a.id_disciplina = d.id_disciplina
            JOIN turma t ON a.id_turma = t.id_turma
            LEFT JOIN atividade_entrega ae ON ae.id_atividade = a.id_atividade AND ae.id_aluno = ?
            WHERE a.id_atividade = ? 
            AND t.id_turma IN (SELECT id_turma FROM matricula WHERE id_aluno = ?)
        `;
        const result = await db.ExecutaComando(sql, [id_aluno, id_atividade, id_aluno]);
        return result.length > 0 ? result[0] : null;
    }

    // Criar nova entrega
    async criarEntrega(id_atividade, id_aluno, arquivo) {
        const sql = `
            INSERT INTO atividade_entrega (id_atividade, id_aluno, data_envio, arquivo)
            VALUES (?, ?, NOW(), ?)
        `;
        return db.ExecutaComandoLastInserted(sql, [id_atividade, id_aluno, arquivo]);
    }

    // Atualizar entrega existente
    async atualizarEntrega(id_entrega, arquivo) {
        const sql = `
            UPDATE atividade_entrega 
            SET arquivo = ?, data_envio = NOW()
            WHERE id_entrega = ?
        `;
        return db.ExecutaComandoNonQuery(sql, [arquivo, id_entrega]);
    }

    // Buscar entrega por ID
    async buscarEntregaPorId(id_entrega) {
        const sql = `SELECT * FROM atividade_entrega WHERE id_entrega = ?`;
        const result = await db.ExecutaComando(sql, [id_entrega]);
        return result.length > 0 ? result[0] : null;
    }

    // Estatísticas do aluno
    async estatisticasAluno(id_aluno) {
        const sql = `
            SELECT 
                COUNT(DISTINCT a.id_atividade) AS total_atividades,
                COUNT(DISTINCT ae.id_entrega) AS total_entregues,
                COUNT(DISTINCT CASE WHEN ae.id_entrega IS NULL AND a.data_entrega >= NOW() THEN a.id_atividade END) AS pendentes,
                COUNT(DISTINCT CASE WHEN ae.id_entrega IS NULL AND a.data_entrega < NOW() THEN a.id_atividade END) AS atrasadas,
                ROUND(AVG(ae.nota), 2) AS media_geral
            FROM aluno al
            JOIN matricula m ON al.id_aluno = m.id_aluno
            JOIN turma t ON m.id_turma = t.id_turma
            JOIN atividade a ON a.id_turma = t.id_turma
            LEFT JOIN atividade_entrega ae ON ae.id_atividade = a.id_atividade AND ae.id_aluno = al.id_aluno
            WHERE al.id_aluno = ?
        `;
        const result = await db.ExecutaComando(sql, [id_aluno]);
        return result.length > 0 ? result[0] : null;
    }
}

module.exports = new AtividadeEntregaModel();
