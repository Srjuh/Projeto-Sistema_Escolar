const Database = require('../utils/db');
const db = new Database();

class TurmaModel {

    listar() {
        const sql = `
            SELECT 
                t.*,
                s.nome AS serie,
                sa.nome AS sala,
                a.ano AS ano_letivo
            FROM turma t
            JOIN serie s       ON s.id_serie = t.id_serie
            JOIN sala sa       ON sa.id_sala = t.id_sala
            JOIN ano_letivo a  ON a.id_ano = t.id_ano
        `;
        return db.ExecutaComando(sql);
    }

    buscar(id) {
        const sql = `
            SELECT 
                t.*,
                s.nome AS serie,
                sa.nome AS sala,
                a.ano AS ano_letivo
            FROM turma t
            JOIN serie s       ON s.id_serie = t.id_serie
            JOIN sala sa       ON sa.id_sala = t.id_sala
            JOIN ano_letivo a  ON a.id_ano = t.id_ano
            WHERE t.id_turma = ?
        `;
        return db.ExecutaComando(sql, [id]);
    }

    criar({ nome, id_serie, id_sala, id_ano }) {
        const sql = `
            INSERT INTO turma (nome, id_serie, id_sala, id_ano)
            VALUES (?, ?, ?, ?)
        `;
        return db.ExecutaComandoLastInserted(sql, [
            nome, id_serie, id_sala, id_ano
        ]);
    }

    atualizar(id, dados) {
        const sql = `
            UPDATE turma 
            SET nome=?, id_serie=?, id_sala=?, id_ano=?
            WHERE id_turma=?
        `;
        return db.ExecutaComandoNonQuery(sql, [
            dados.nome,
            dados.id_serie,
            dados.id_sala,
            dados.id_ano,
            id
        ]);
    }

    deletar(id) {
        return db.ExecutaComandoNonQuery(`
            DELETE FROM turma WHERE id_turma=?
        `, [id]);
    }

    // lista turmas vinculadas ao professor (com disciplina)
    listarPorProfessor(id_professor) {
        const sql = `
            SELECT DISTINCT
                t.id_turma, 
                t.nome AS nome_turma
            FROM turma_professor tp
            JOIN turma t ON tp.id_turma = t.id_turma
            WHERE tp.id_professor = ?
            ORDER BY t.nome
        `;
        return db.ExecutaComando(sql, [id_professor]).then(r => {
            console.log(r);
            return r;
        });
    }

    listarTurmasDisciplinasPorProfessor(id_professor) {
        const sql = `
            SELECT DISTINCT
                t.id_turma,
                t.nome AS nome_turma,
                d.id_disciplina,
                d.nome AS nome_disciplina
            FROM turma t
            INNER JOIN turma_professor tp ON t.id_turma = tp.id_turma
            INNER JOIN disciplina d ON tp.id_disciplina = d.id_disciplina
            WHERE tp.id_professor = ?
            ORDER BY t.nome, d.nome
        `;
        
        console.log('📊 SQL executando para professor:', id_professor);
        return db.ExecutaComando(sql, [id_professor]).then(r => {
            console.log('✅ Resultado da query:', r);
            return r;
        });
    }

    // verifica se o professor tem vínculo com (turma + disciplina)
    async verificarProfessorNaTurma(id_professor, id_turma, id_disciplina) {
        const sql = `
            SELECT COUNT(*) AS count 
            FROM turma_professor 
            WHERE id_professor = ? 
              AND id_turma = ? 
              AND id_disciplina = ?
        `;
        
        const resultado = await db.ExecutaComando(sql, [id_professor, id_turma, id_disciplina]);
        return resultado && resultado[0] && resultado[0].count > 0;
    }

}

module.exports = new TurmaModel();
