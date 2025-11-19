const Database = require('../utils/db');
const db = new Database();

class AlunoNotasModel {
    // Buscar todas as notas do aluno
    async buscarNotasAluno(id_aluno) {
        const sql = `
            SELECT 
                a.id_atividade,
                a.titulo,
                a.data_entrega,
                d.nome AS disciplina,
                ae.nota,
                ae.feedback,
                ae.data_envio
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

module.exports = new AlunoNotasModel();