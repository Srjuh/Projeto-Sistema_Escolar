const Database = require('../utils/db');
const db = new Database();

class ProfessorModel {
    listar() {
        const sql = `
            SELECT p.id_professor, u.nome, u.email
            FROM professor p
            JOIN usuario u ON u.id_usuario = p.id_professor
        `;
        return db.ExecutaComando(sql);
    }

    buscar(id_professor) {
        const sql = `
            SELECT p.id_professor, u.nome, u.email
            FROM professor p
            JOIN usuario u ON u.id_usuario = p.id_professor
            WHERE p.id_professor = ?
        `;
        return db.ExecutaComando(sql, [id_professor]);
    }

    criar(id_usuario) {
        const sql = `INSERT INTO professor (id_professor) VALUES (?)`;
        return db.ExecutaComando(sql, [id_usuario]);
    }

    deletar(id_professor) {
        const sql = `DELETE FROM professor WHERE id_professor = ?`;
        return db.ExecutaComandoNonQuery(sql, [id_professor]);
    }
}

module.exports = new ProfessorModel();