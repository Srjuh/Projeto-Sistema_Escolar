const Database = require('../utils/db');
const db = new Database();

class QuadroNotasModel {
    // Listar notas por turma e disciplina (Professor) - CORRIGIDO COM FILTRO DE PROFESSOR
    async listarNotasPorTurma(id_turma, id_disciplina = null, id_professor = null) {
        let sql = `
            SELECT 
                al.id_aluno,
                u.nome AS nome_aluno,
                a.id_atividade,
                a.titulo AS titulo_atividade,
                a.data_entrega,
                d.nome AS disciplina,
                ae.nota,
                ae.feedback,
                ae.data_envio
            FROM aluno al
            JOIN usuario u ON al.id_aluno = u.id_usuario
            JOIN matricula m ON al.id_aluno = m.id_aluno
            JOIN turma t ON m.id_turma = t.id_turma
            LEFT JOIN atividade a ON a.id_turma = t.id_turma
        `;

        if (id_professor) {
            sql += ` 
            LEFT JOIN turma_professor tp ON tp.id_turma = a.id_turma 
                AND tp.id_disciplina = a.id_disciplina 
                AND tp.id_professor = ?
            `;
        }

        sql += `
            LEFT JOIN disciplina d ON a.id_disciplina = d.id_disciplina
            LEFT JOIN atividade_entrega ae ON ae.id_atividade = a.id_atividade AND ae.id_aluno = al.id_aluno
            WHERE t.id_turma = ?
        `;
        
        const params = id_professor ? [id_professor, id_turma] : [id_turma];
        
         if (id_professor) {
            sql += ' AND tp.id_professor IS NOT NULL';
        }

        if (id_disciplina) {
            sql += ' AND a.id_disciplina = ?';
            params.push(id_disciplina);
        }
        
        sql += ' ORDER BY u.nome, a.data_entrega';
        
        return db.ExecutaComando(sql, params);
    }

    // Listar notas de um aluno específico
    async listarNotasAluno(id_aluno) {
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
            JOIN usuario u ON al.id_aluno = u.id_usuario
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

    // Atualizar nota de uma entrega
    async atualizarNota(id_atividade, id_aluno, nota, feedback) {
        const sql = `
            UPDATE atividade_entrega 
            SET nota = ?, feedback = ?
            WHERE id_atividade = ? AND id_aluno = ?
        `;
        
        return db.ExecutaComandoNonQuery(sql, [nota, feedback, id_atividade, id_aluno]);
    }

    // Listar atividades de uma turma (para filtro) - CORRIGIDO COM FILTRO DE PROFESSOR
    async listarAtividades(id_turma, id_disciplina = null, id_professor = null) {
        let sql = `
            SELECT 
                a.id_atividade,
                a.titulo,
                a.data_entrega,
                d.nome AS disciplina,
                d.id_disciplina
            FROM atividade a
            JOIN disciplina d ON a.id_disciplina = d.id_disciplina
        `;

        if (id_professor) {
            sql += `
            JOIN turma_professor tp ON tp.id_turma = a.id_turma 
                AND tp.id_disciplina = a.id_disciplina 
                AND tp.id_professor = ?
            `;
        }

        sql += ' WHERE a.id_turma = ?';
        
        const params = id_professor ? [id_professor, id_turma] : [id_turma];
        
        if (id_disciplina) {
            sql += ' AND a.id_disciplina = ?';
            params.push(id_disciplina);
        }
        
        sql += ' ORDER BY a.data_entrega DESC';
        
        return db.ExecutaComando(sql, params);
    }
}

module.exports = new QuadroNotasModel();