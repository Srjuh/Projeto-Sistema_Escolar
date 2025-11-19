const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

class Database {

    #conexao;

    get conexao() { return this.#conexao; }
    set conexao(conexao) { this.#conexao = conexao; }

    constructor() {
        this.#conexao = mysql.createPool(process.env.DB_URL);
    }

    ExecutaComando(sql, valores) {
        return new Promise((res, rej) => {
            this.#conexao.query(sql, valores, (error, results) => {
                if (error) rej(error);
                else res(results);
            });
        });
    }

    ExecutaComandoNonQuery(sql, valores) {
        return new Promise((res, rej) => {
            this.#conexao.query(sql, valores, (error, results) => {
                if (error) rej(error);
                else res(results.affectedRows > 0);
            });
        });
    }

    ExecutaComandoLastInserted(sql, valores) {
        return new Promise((res, rej) => {
            this.#conexao.query(sql, valores, (error, results) => {
                if (error) rej(error);
                else res(results.insertId);
            });
        });
    }
}

module.exports = Database;
