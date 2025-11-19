const Database = require('../utils/db');
const db = new Database();

class DisciplinaModel {
    listar() {
        const sql = `SELECT id_disciplina, nome AS nome_disciplina FROM disciplina ORDER BY nome`;
        return db.ExecutaComando(sql);
    }

    buscar(id_disciplina) {
        const sql = `SELECT id_disciplina, nome AS nome_disciplina FROM disciplina WHERE id_disciplina = ?`;
        return db.ExecutaComando(sql, [id_disciplina]);
    }

    criar({ nome }) {
        const sql = `INSERT INTO disciplina (nome) VALUES (?)`;
        return db.ExecutaComandoLastInserted(sql, [nome]);
    }

    atualizar(id_disciplina, { nome }) {
        const sql = `UPDATE disciplina SET nome = ? WHERE id_disciplina = ?`;
        return db.ExecutaComandoNonQuery(sql, [nome, id_disciplina]);
    }

    deletar(id_disciplina) {
        return db.ExecutaComandoNonQuery(`DELETE FROM disciplina WHERE id_disciplina = ?`, [id_disciplina]);
    }

    listarPorProfessor(id_professor) {
        const sql = `
            SELECT DISTINCT d.id_disciplina, d.nome AS nome_disciplina
            FROM turma_professor tp
            JOIN disciplina d ON tp.id_disciplina = d.id_disciplina
            WHERE tp.id_professor = ?
            ORDER BY d.nome
        `;
        return db.ExecutaComando(sql, [id_professor]).then(r => {
            console.log(r);
            return r;
        });
    }
}

module.exports = new DisciplinaModel();
