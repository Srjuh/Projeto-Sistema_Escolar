const usuarioModel = require('../models/usuarioModel');

module.exports = {
    // Realizar login do usuário
    async login(req, res) {
        try {
            // Extrai os dados do corpo da requisição
            const { email, senha } = req.body;
                if (!email || !senha) {
                    return res.json({ sucesso: false, erro: 'Email e senha são obrigatórios.' });
                }

            // Busca o usuário no banco
            const usuario = await usuarioModel.login(email, senha);
                if (!usuario) {
                    return res.json({ sucesso: false, erro: 'Email ou senha inválidos.' });
                }

            // Salva o usuário na sessão
            req.session.usuario = usuario;
            console.log('✅ Login bem-sucedido:', usuario);

            // Retorna sucesso
            res.json({ sucesso: true, usuario });
        
        } catch (error) {
            console.error('❌ Erro no login:', error);
                res.json({ sucesso: false, erro: 'Erro ao processar login.' });
        }
    },

    // Realizar logout do usuário
    logout(req, res) {
        // Destrói a sessão
        req.session.destroy((err) => {
            if (err) {
                console.error('❌ Erro ao destruir sessão:', err);
            }
            res.redirect('/login');
        });
    }
};