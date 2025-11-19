const Database = require('../utils/db');
const db = new Database();

class UsuarioModel {
    listar() {
        const sql = `SELECT id_usuario, nome, email FROM usuario`;
        return db.ExecutaComando(sql);
    }

    buscar(id_usuario) {
        const sql = `SELECT id_usuario, nome, email FROM usuario WHERE id_usuario = ?`;
        return db.ExecutaComando(sql, [id_usuario]);
    }

    async login(email, senha) {
        console.log('🔍 Tentando login com:', email);
        
        const sql = `
            SELECT 
                u.id_usuario, 
                u.nome, 
                u.email,
                p.id_professor,
                al.id_aluno,
                a.id_admin,
                CASE 
                    WHEN p.id_professor IS NOT NULL THEN 'professor'
                    WHEN al.id_aluno IS NOT NULL THEN 'aluno'
                    WHEN a.id_admin IS NOT NULL THEN 'administrador'
                    ELSE 'desconhecido'
                END AS tipo
            FROM usuario u
            LEFT JOIN professor p ON u.id_usuario = p.id_professor
            LEFT JOIN admin a ON u.id_usuario = a.id_admin
            LEFT JOIN aluno al ON u.id_usuario = al.id_aluno
            WHERE u.email = ? AND u.senha = ?
        `;
        
        console.log('📝 Executando SQL:', sql);
        console.log('🔑 Parâmetros:', [email, senha]);
        
        const result = await db.ExecutaComando(sql, [email, senha]);
        
        console.log('📊 Resultado COMPLETO do banco:', JSON.stringify(result, null, 2));
        
        if (result.length > 0) {
            console.log('✅ Usuário encontrado:', result[0]);
            console.log('📌 id_aluno retornado:', result[0].id_aluno);
            console.log('📌 id_professor retornado:', result[0].id_professor);
        } else {
            console.log('❌ Nenhum usuário encontrado');
        }
        
        return result.length > 0 ? result[0] : null;
    }

    buscarPorEmailSenha(email, senha) {
        const sql = `
            SELECT u.id_usuario, u.nome, u.email, p.id_professor, a.id_admin, al.id_aluno
            FROM usuario u
            LEFT JOIN professor p ON u.id_usuario = p.id_professor
            LEFT JOIN admin a ON u.id_usuario = a.id_admin
            LEFT JOIN aluno al ON u.id_usuario = al.id_aluno
            WHERE u.email = ? AND u.senha = ?
        `;
        return db.ExecutaComando(sql, [email, senha]);
    }

    criar({ nome, email, senha }) {
        const sql = `INSERT INTO usuario (nome, email, senha) VALUES (?, ?, ?)`;
        return db.ExecutaComandoLastInserted(sql, [nome, email, senha]);
    }

    atualizar(id_usuario, { nome, email, senha }) {
        const sql = `UPDATE usuario SET nome = ?, email = ?, senha = ? WHERE id_usuario = ?`;
        return db.ExecutaComandoNonQuery(sql, [nome, email, senha, id_usuario]);
    }

    deletar(id_usuario) {
        const sql = `DELETE FROM usuario WHERE id_usuario = ?`;
        return db.ExecutaComandoNonQuery(sql, [id_usuario]);
    }

    async buscarProfessorPorUsuario(id_usuario) {
        const sql = `SELECT * FROM professor WHERE id_professor = ?`;
        const result = await db.ExecutaComando(sql, [id_usuario]);
        return result.length > 0 ? result[0] : null;
    }

    async buscarAlunoPorUsuario(id_usuario) {
        const sql = `SELECT * FROM aluno WHERE id_aluno = ?`;
        const result = await db.ExecutaComando(sql, [id_usuario]);
        console.log('🔍 Buscando aluno com id_usuario:', id_usuario);
        console.log('📊 Resultado da busca de aluno:', result);
        return result.length > 0 ? result[0] : null;
    }
}

module.exports = new UsuarioModel();