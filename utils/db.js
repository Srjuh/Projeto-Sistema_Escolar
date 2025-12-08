require('dotenv').config();
const mysql = require('mysql2/promise');

let instance = null; // <--- SINGLETON

class Database {
    constructor() {
        if (instance) {
            return instance; // <--- impede múltiplos pools
        }

        // Localhost para testes
        this.pool = mysql.createPool({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: 'abc123',
            database: 'sistema_academico',
            waitForConnections: true,
            connectionLimit: 10,
            maxIdle: 10,
            idleTimeout: 60000,
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0,
            connectTimeout: 60000,
        });

/*
        this.pool = mysql.createPool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            maxIdle: 10,
            idleTimeout: 60000,
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0,
            connectTimeout: 60000,
        });
*/
        console.log('🔌 Pool de conexões MySQL criado (Railway)');

        this.testarConexao();

        instance = this; // <--- salva a instância
    }

    async testarConexao() {
        try {
            const conn = await this.pool.getConnection();
            console.log('✅ Conexão com banco de dados testada com sucesso!');
            conn.release();
        } catch (err) {
            console.error('❌ Erro ao testar conexão:', err.message);
        }
    }

    async ExecutaComando(sql, params = []) {
        const conn = await this.pool.getConnection();
        try {
            const [rows] = await conn.execute(sql, params);
            return rows;
        } finally {
            conn.release();
        }
    }

    async ExecutaComandoNonQuery(sql, params = []) {
        const conn = await this.pool.getConnection();
        try {
            const [result] = await conn.execute(sql, params);
            return result;
        } finally {
            conn.release();
        }
    }

    async ExecutaComandoLastInserted(sql, params = []) {
        const conn = await this.pool.getConnection();
        try {
            const [result] = await conn.execute(sql, params);
            return { insertId: result.insertId };
        } finally {
            conn.release();
        }
    }
}

module.exports = new Database(); // <--- exporta instância única
