const Database = require('../utils/db');
const db = new Database();

class CorrigirAtividadeModel {
    // Listar todas as atividades com entregas pendentes de correção
    async listarAtividadesPendentes(id_professor) {
        const sql = `
            SELECT 
                at.id_atividade,
                at.titulo,
                at.descricao,
                at.data_entrega,
                d.nome AS disciplina,
                d.id_disciplina,
                t.id_turma,
                t.nome AS turma,
                COUNT(ae.id_entrega) AS total_entregas,
                SUM(CASE WHEN ae.nota IS NULL THEN 1 ELSE 0 END) AS pendentes_correcao
            FROM atividade at
            JOIN turma t ON at.id_turma = t.id_turma
            JOIN disciplina d ON at.id_disciplina = d.id_disciplina
            JOIN turma_professor tp ON tp.id_turma = t.id_turma AND tp.id_disciplina = d.id_disciplina
            LEFT JOIN atividade_entrega ae ON ae.id_atividade = at.id_atividade
            WHERE tp.id_professor = ?
            GROUP BY at.id_atividade, at.titulo, at.descricao, at.data_entrega, d.nome, d.id_disciplina, t.id_turma, t.nome
            HAVING total_entregas > 0
            ORDER BY pendentes_correcao DESC, at.data_entrega DESC
        `;
        return db.ExecutaComando(sql, [id_professor]);
    }

    // Listar entregas de uma atividade específica
    async listarEntregasPorAtividade(id_atividade) {
        const sql = `
            SELECT 
                ae.id_entrega,
                ae.id_aluno,
                ae.data_envio,
                ae.arquivo,
                ae.nota,
                ae.feedback,
                u.nome AS nome_aluno,
                a.id_aluno,
                at.titulo AS titulo_atividade,
                at.data_entrega,
                d.nome AS disciplina
            FROM atividade_entrega ae
            JOIN aluno a ON ae.id_aluno = a.id_aluno
            JOIN usuario u ON a.id_aluno = u.id_usuario
            JOIN atividade at ON ae.id_atividade = at.id_atividade
            JOIN disciplina d ON at.id_disciplina = d.id_disciplina
            WHERE ae.id_atividade = ?
            ORDER BY 
                CASE WHEN ae.nota IS NULL THEN 0 ELSE 1 END,
                ae.data_envio DESC
        `;
        return db.ExecutaComando(sql, [id_atividade]);
    }

    // Buscar detalhes de uma entrega específica
    async buscarEntrega(id_entrega) {
        const sql = `
            SELECT 
                ae.*,
                u.nome AS nome_aluno,
                u.email AS email_aluno,
                at.titulo AS titulo_atividade,
                at.descricao AS descricao_atividade,
                at.data_entrega,
                d.nome AS disciplina,
                t.nome AS turma
            FROM atividade_entrega ae
            JOIN aluno a ON ae.id_aluno = a.id_aluno
            JOIN usuario u ON a.id_aluno = u.id_usuario
            JOIN atividade at ON ae.id_atividade = at.id_atividade
            JOIN disciplina d ON at.id_disciplina = d.id_disciplina
            JOIN turma t ON at.id_turma = t.id_turma
            WHERE ae.id_entrega = ?
        `;
        const result = await db.ExecutaComando(sql, [id_entrega]);
        return result.length > 0 ? result[0] : null;
    }

    // Corrigir uma entrega (atualizar nota e feedback)
    async corrigirEntrega(id_entrega, nota, feedback) {
        const sql = `
            UPDATE atividade_entrega 
            SET nota = ?, feedback = ?
            WHERE id_entrega = ?
        `;
        return db.ExecutaComandoNonQuery(sql, [nota, feedback, id_entrega]);
    }

    // Buscar estatísticas de uma atividade
    async estatisticasAtividade(id_atividade) {
        const sql = `
            SELECT 
                COUNT(*) AS total_entregas,
                COUNT(CASE WHEN nota IS NOT NULL THEN 1 END) AS corrigidas,
                COUNT(CASE WHEN nota IS NULL THEN 1 END) AS pendentes,
                ROUND(AVG(nota), 2) AS media_notas,
                MAX(nota) AS maior_nota,
                MIN(nota) AS menor_nota
            FROM atividade_entrega
            WHERE id_atividade = ?
        `;
        const result = await db.ExecutaComando(sql, [id_atividade]);
        return result.length > 0 ? result[0] : null;
    }
}

module.exports = new CorrigirAtividadeModel();