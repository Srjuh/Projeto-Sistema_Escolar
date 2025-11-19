const Database = require('../utils/db');
const db = new Database();

class AlunoModel {

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
        return rows && rows.length ? rows[0] : null;
    }

    criar({ id_usuario, matricula }) {
        const sql = `
            INSERT INTO aluno (id_aluno, matricula)
            VALUES (?, ?)
        `;
        return db.ExecutaComando(sql, [id_usuario, matricula]);
    }

    atualizar(id, { matricula }) {
        const sql = `
            UPDATE aluno SET matricula = ?
            WHERE id_aluno = ?
        `;
        return db.ExecutaComandoNonQuery(sql, [matricula, id]);
    }

    deletar(id) {
        return db.ExecutaComandoNonQuery(
            "DELETE FROM aluno WHERE id_aluno = ?",
            [id]
        );
    }
}

module.exports = new AlunoModel();
