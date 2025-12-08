const db = require('../utils/db');

class AtividadeModel {
    // ===== CRUD BÁSICO =====
    criar({ titulo, descricao, data_entrega, id_turma, id_disciplina }) {
        const sql = `
            INSERT INTO atividade (titulo, descricao, data_entrega, id_turma, id_disciplina)
            VALUES (?, ?, ?, ?, ?)
        `;
        return db.ExecutaComandoLastInserted(sql, [titulo, descricao, data_entrega, id_turma, id_disciplina]);
    }

    listar() {
        const sql = `
            SELECT a.*, t.nome AS turma, d.nome AS disciplina
            FROM atividade a
            JOIN turma t ON t.id_turma = a.id_turma
            JOIN disciplina d ON d.id_disciplina = a.id_disciplina
            ORDER BY a.id_atividade DESC
        `;
        return db.ExecutaComando(sql);
    }

    listarPorProfessor(id_professor) {
        const sql = `
            SELECT 
                a.id_atividade, a.titulo, a.descricao, a.data_entrega,
                a.id_turma, a.id_disciplina,
                t.nome AS nome_turma, d.nome AS nome_disciplina
            FROM atividade a
            JOIN turma t ON a.id_turma = t.id_turma
            JOIN disciplina d ON a.id_disciplina = d.id_disciplina
            JOIN turma_professor tp ON tp.id_turma = a.id_turma AND tp.id_disciplina = a.id_disciplina
            WHERE tp.id_professor = ?
            ORDER BY a.data_entrega DESC
        `;
        return db.ExecutaComando(sql, [id_professor]);
    }

    async buscarPorId(id) {
        const sql = `
            SELECT 
                a.id_atividade, a.titulo, a.descricao, a.data_entrega, 
                a.id_turma, a.id_disciplina,
                t.nome AS nome_turma, d.nome AS nome_disciplina
            FROM atividade a
            JOIN turma t ON a.id_turma = t.id_turma
            JOIN disciplina d ON a.id_disciplina = d.id_disciplina
            WHERE a.id_atividade = ?
        `;
        const rows = await db.ExecutaComando(sql, [id]);
        return rows?.[0] || null;
    }

    atualizar(id, { titulo, descricao, data_entrega, id_turma, id_disciplina }) {
        const sql = `
            UPDATE atividade
            SET titulo = ?, descricao = ?, data_entrega = ?, id_turma = ?, id_disciplina = ?
            WHERE id_atividade = ?
        `;
        return db.ExecutaComandoNonQuery(sql, [titulo, descricao, data_entrega, id_turma, id_disciplina, id]);
    }

    async deletar(id_atividade) {
        await db.ExecutaComandoNonQuery(`DELETE FROM atividade_entrega WHERE id_atividade = ?`, [id_atividade]);
        return db.ExecutaComandoNonQuery(`DELETE FROM atividade WHERE id_atividade = ?`, [id_atividade]);
    }

    // ===== ALUNO: Entregas =====
    listarAtividadesPorAluno(id_aluno) {
        const sql = `
            SELECT 
                a.id_atividade, a.titulo, a.descricao, a.data_entrega,
                d.nome AS disciplina, t.nome AS turma,
                ae.id_entrega, ae.arquivo, ae.texto, ae.data_envio, ae.nota, ae.feedback,
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

    async buscarAtividadeParaEntrega(id_atividade, id_aluno) {
        const sql = `
            SELECT 
                a.id_atividade, a.titulo, a.descricao, a.data_entrega,
                d.nome AS disciplina, t.nome AS turma,
                ae.id_entrega, ae.arquivo, ae.texto, ae.data_envio, ae.nota, ae.feedback
            FROM atividade a
            JOIN disciplina d ON a.id_disciplina = d.id_disciplina
            JOIN turma t ON a.id_turma = t.id_turma
            LEFT JOIN atividade_entrega ae ON ae.id_atividade = a.id_atividade AND ae.id_aluno = ?
            WHERE a.id_atividade = ?
              AND t.id_turma IN (SELECT id_turma FROM matricula WHERE id_aluno = ?)
        `;
        const result = await db.ExecutaComando(sql, [id_aluno, id_atividade, id_aluno]);
        return result?.[0] || null;
    }

    criarEntrega(id_atividade, id_aluno, arquivo = null, texto = null) {
        const sql = `
            INSERT INTO atividade_entrega (id_atividade, id_aluno, arquivo, texto, data_envio)
            VALUES (?, ?, ?, ?, NOW())
        `;
        return db.ExecutaComandoLastInserted(sql, [id_atividade, id_aluno, arquivo, texto]);
    }

    atualizarEntrega(id_entrega, arquivo = null, texto = null) {
        const sql = `
            UPDATE atividade_entrega 
            SET arquivo = ?, texto = ?, data_envio = NOW()
            WHERE id_entrega = ?
        `;
        return db.ExecutaComandoNonQuery(sql, [arquivo, texto, id_entrega]);
    }

    async estatisticasAluno(id_aluno) {
        const sql = `
            SELECT 
                COUNT(DISTINCT a.id_atividade) AS total_atividades,
                COUNT(DISTINCT ae.id_entrega) AS total_entregues,
                COUNT(DISTINCT CASE WHEN ae.nota IS NOT NULL THEN ae.id_entrega END) AS total_corrigidas,
                ROUND(AVG(ae.nota), 2) AS media_notas,
                COUNT(DISTINCT CASE WHEN ae.id_entrega IS NULL AND NOW() > a.data_entrega THEN a.id_atividade END) AS total_atrasadas
            FROM aluno al
            JOIN matricula m ON al.id_aluno = m.id_aluno
            JOIN turma t ON m.id_turma = t.id_turma
            JOIN atividade a ON a.id_turma = t.id_turma
            LEFT JOIN atividade_entrega ae ON ae.id_atividade = a.id_atividade AND ae.id_aluno = al.id_aluno
            WHERE al.id_aluno = ?
        `;
        const result = await db.ExecutaComando(sql, [id_aluno]);
        return result?.[0] || {};
    }

    // ===== PROFESSOR: Correção =====
    listarAtividadesComEntregas(id_professor, id_turma = null, id_disciplina = null) {
        let sql = `
            SELECT 
                at.id_atividade, at.titulo, at.descricao, at.data_entrega,
                d.nome AS disciplina, d.id_disciplina, t.id_turma, t.nome AS turma,
                COUNT(ae.id_entrega) AS total_entregas,
                SUM(CASE WHEN ae.nota IS NULL THEN 1 ELSE 0 END) AS pendentes_correcao
            FROM atividade at
            JOIN turma t ON at.id_turma = t.id_turma
            JOIN disciplina d ON at.id_disciplina = d.id_disciplina
            JOIN turma_professor tp ON tp.id_turma = t.id_turma AND tp.id_disciplina = d.id_disciplina
            LEFT JOIN atividade_entrega ae ON ae.id_atividade = at.id_atividade
            WHERE tp.id_professor = ?
        `;
        const params = [id_professor];

        if (id_turma) {
            sql += ` AND t.id_turma = ?`;
            params.push(id_turma);
        }
        if (id_disciplina) {
            sql += ` AND d.id_disciplina = ?`;
            params.push(id_disciplina);
        }

        sql += `
            GROUP BY at.id_atividade, at.titulo, at.descricao, at.data_entrega, d.nome, d.id_disciplina, t.id_turma, t.nome
            HAVING total_entregas > 0
            ORDER BY pendentes_correcao DESC, at.data_entrega DESC
        `;
        return db.ExecutaComando(sql, params);
    }

    listarEntregasPorAtividade(id_atividade) {
        const sql = `
            SELECT 
                ae.id_entrega, ae.id_aluno, ae.data_envio, ae.arquivo, ae.texto, ae.nota, ae.feedback,
                u.nome AS nome_aluno,
                at.titulo AS titulo_atividade, at.data_entrega,
                d.nome AS disciplina
            FROM atividade_entrega ae
            JOIN aluno a ON ae.id_aluno = a.id_aluno
            JOIN usuario u ON a.id_aluno = u.id_usuario
            JOIN atividade at ON ae.id_atividade = at.id_atividade
            JOIN disciplina d ON at.id_disciplina = d.id_disciplina
            WHERE ae.id_atividade = ?
            ORDER BY CASE WHEN ae.nota IS NULL THEN 0 ELSE 1 END, ae.data_envio DESC
        `;
        return db.ExecutaComando(sql, [id_atividade]);
    }

    async buscarEntregaPorId(id_entrega) {
        const sql = `
            SELECT 
                ae.*, u.nome AS nome_aluno, u.email AS email_aluno,
                at.titulo AS titulo_atividade, at.descricao AS descricao_atividade, at.data_entrega,
                d.nome AS disciplina, t.nome AS turma
            FROM atividade_entrega ae
            JOIN aluno a ON ae.id_aluno = a.id_aluno
            JOIN usuario u ON a.id_aluno = u.id_usuario
            JOIN atividade at ON ae.id_atividade = at.id_atividade
            JOIN disciplina d ON at.id_disciplina = d.id_disciplina
            JOIN turma t ON at.id_turma = t.id_turma
            WHERE ae.id_entrega = ?
        `;
        const result = await db.ExecutaComando(sql, [id_entrega]);
        return result?.[0] || null;
    }

    atualizarCorrecao(id_entrega, nota, feedback) {
        const sql = `UPDATE atividade_entrega SET nota = ?, feedback = ? WHERE id_entrega = ?`;
        return db.ExecutaComandoNonQuery(sql, [nota, feedback, id_entrega]);
    }

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
        return result?.[0] || null;
    }
}

module.exports = new AtividadeModel();
