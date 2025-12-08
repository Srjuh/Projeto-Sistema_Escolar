const db = require('../utils/db');

class AlunoModel {
    // ===== CRUD Básico =====
    listar() {
        const sql = `
            SELECT a.id_aluno, a.matricula, u.nome, u.email
            FROM aluno a
            JOIN usuario u ON u.id_usuario = a.id_aluno
        `;
        return db.ExecutaComando(sql);
    }

    async buscar(id) {
        const sql = `
            SELECT a.id_aluno, a.matricula, u.nome, u.email
            FROM aluno a
            JOIN usuario u ON u.id_usuario = a.id_aluno
            WHERE a.id_aluno = ?
        `;
        const rows = await db.ExecutaComando(sql, [id]);
        return rows?.[0] || null;
    }

    criar({ id_usuario, matricula }) {
        const sql = `INSERT INTO aluno (id_aluno, matricula) VALUES (?, ?)`;
        return db.ExecutaComando(sql, [id_usuario, matricula]);
    }

    atualizar(id, { matricula }) {
        const sql = `UPDATE aluno SET matricula = ? WHERE id_aluno = ?`;
        return db.ExecutaComandoNonQuery(sql, [matricula, id]);
    }

    deletar(id) {
        return db.ExecutaComandoNonQuery(`DELETE FROM aluno WHERE id_aluno = ?`, [id]);
    }

    // ===== Notas =====
    buscarNotasAluno(id_aluno) {
        const sql = `
            SELECT 
                a.id_atividade, a.titulo, a.data_entrega,
                d.nome AS disciplina,
                ae.nota, ae.feedback, ae.data_envio
            FROM aluno al
            JOIN matricula m ON al.id_aluno = m.id_aluno
            JOIN turma t ON m.id_turma = t.id_turma
            JOIN atividade a ON a.id_turma = t.id_turma
            JOIN disciplina d ON a.id_disciplina = d.id_disciplina
            LEFT JOIN atividade_entrega ae ON ae.id_atividade = a.id_atividade AND ae.id_aluno = al.id_aluno
            WHERE al.id_aluno = ?
            ORDER BY a.data_entrega DESC
        `;
        return db.ExecutaComando(sql, [id_aluno]);
    }
}

module.exports = new AlunoModel();