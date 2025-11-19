const Database = require('../utils/db');
const db = new Database();

class AtividadeModel {

    criar({ titulo, descricao, data_entrega, id_turma, id_disciplina }) {
        const sql = `
            INSERT INTO atividade (titulo, descricao, data_entrega, id_turma, id_disciplina)
            VALUES (?, ?, ?, ?, ?)
        `;
        return db.ExecutaComandoLastInserted(sql, [
            titulo, descricao, data_entrega, id_turma, id_disciplina
        ]);
    }

    listar() {
        const sql = `
            SELECT 
                a.*,
                t.nome AS turma,
                d.nome AS disciplina
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
                a.id_atividade, 
                a.titulo, 
                a.descricao, 
                a.data_entrega,
                a.id_turma, 
                a.id_disciplina,
                t.nome AS nome_turma, 
                d.nome AS nome_disciplina
            FROM atividade a
            JOIN turma t ON a.id_turma = t.id_turma
            JOIN disciplina d ON a.id_disciplina = d.id_disciplina
            JOIN turma_professor tp 
                ON tp.id_turma = a.id_turma
            AND tp.id_disciplina = a.id_disciplina
            WHERE tp.id_professor = ?
            ORDER BY a.data_entrega DESC

        `;
        return db.ExecutaComando(sql, [id_professor]);
    }

    atualizar(id, { titulo, descricao, data_entrega, id_turma, id_disciplina }) {
        const sql = `
            UPDATE atividade
            SET titulo = ?, descricao = ?, data_entrega = ?, id_turma = ?, id_disciplina = ?
            WHERE id_atividade = ?
        `;
        return db.ExecutaComandoNonQuery(sql, [
            titulo, descricao, data_entrega, id_turma, id_disciplina, id
        ]);
    }

    // Deletar atividade e entregas vinculadas
    async deletar(id_atividade) {
        // 1º deletar entregas (NonQuery)
        const sqlEntregas = `
            DELETE FROM atividade_entrega
            WHERE id_atividade = ?
        `;
        await db.ExecutaComandoNonQuery(sqlEntregas, [id_atividade]);

        // 2º deletar atividade (NonQuery)
        const sqlAtividade = `
            DELETE FROM atividade
            WHERE id_atividade = ?
        `;
        return db.ExecutaComandoNonQuery(sqlAtividade, [id_atividade]);
    }

    async buscarPorId(id) {
        const sql = `
            SELECT 
                a.id_atividade, 
                a.titulo, 
                a.descricao, 
                a.data_entrega, 
                a.id_turma, 
                a.id_disciplina,
                t.nome AS nome_turma,
                d.nome AS nome_disciplina
            FROM atividade a
            INNER JOIN turma t 
                ON a.id_turma = t.id_turma
            INNER JOIN disciplina d 
                ON a.id_disciplina = d.id_disciplina
            WHERE a.id_atividade = ?
        `;
        const rows = await db.ExecutaComando(sql, [id]);
        return rows && rows.length ? rows[0] : null;
    }

}

module.exports = new AtividadeModel();
