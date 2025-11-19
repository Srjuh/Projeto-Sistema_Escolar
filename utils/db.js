require('dotenv').config();
const mysql = require('mysql2/promise');

class Database {
    constructor() {
        this.config = {
            host: process.env.DB_HOST || 'shinkansen.proxy.rlwy.net',
            port: process.env.DB_PORT || 19379,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'eLeeNNBIHjKBhfCKjtrKSaaLPsVrHcUi',
            database: process.env.DB_NAME || 'railway',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0
        };

        this.pool = mysql.createPool(this.config);
        console.log('🔌 Pool de conexões MySQL criado (Railway)');
    }

    async ExecutaComando(sql, params = []) {
        try {
            const [rows] = await this.pool.execute(sql, params);
            return rows;
        } catch (error) {
            console.error('❌ Erro ao executar comando SQL:', error);
            throw error;
        }
    }

    async ExecutaComandoNonQuery(sql, params = []) {
        try {
            const [result] = await this.pool.execute(sql, params);
            return result;
        } catch (error) {
            console.error('❌ Erro ao executar comando NonQuery:', error);
            throw error;
        }
    }

    async ExecutaComandoLastInserted(sql, params = []) {
        try {
            const [result] = await this.pool.execute(sql, params);
            return { insertId: result.insertId };
        } catch (error) {
            console.error('❌ Erro ao executar comando LastInserted:', error);
            throw error;
        }
    }

    async close() {
        await this.pool.end();
        console.log('🔌 Pool de conexões MySQL fechado');
    }
}

module.exports = Database;
