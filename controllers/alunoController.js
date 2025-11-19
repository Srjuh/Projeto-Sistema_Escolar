const alunoModel = require('../models/alunoModel');

// Função para verificar sessão do aluno
function verificarSessao(req, res) {
    const id_aluno = req.session?.usuario?.id_aluno;
    if (!id_aluno) {
        console.warn('⚠️ Tentativa de acesso sem sessão de aluno');
        return null;
    }
    return id_aluno;
}

module.exports = {
    // Renderizar a home do aluno
    async home(req, res) {
        try {
            // Verifica a sessão do aluno
            const id_aluno = verificarSessao(req, res);
                if (!id_aluno) {
                    return res.redirect('/login');
                }

            // Pega o usuário da sessão
            const usuario = req.session.usuario;

            // Renderiza a página
            res.render('pages/aluno/alunoHome', { usuario });
        
        } catch (error) {
            console.error('❌ Erro ao carregar home do aluno:', error);
                res.redirect('/login');
        }
    },

    // Renderizar o quadro de notas do aluno
    async quadroNotas(req, res) {
        try {
            // Verifica a sessão do aluno
            const id_aluno = verificarSessao(req, res);
                if (!id_aluno) {
                    return res.redirect('/login');
                }

            // Pega o usuário da sessão
            const usuario = req.session.usuario;

            // Renderiza a página
            res.render('pages/aluno/quadroNotasAlunos', { usuario });
        
        } catch (error) {
            console.error('❌ Erro ao carregar quadro de notas:', error);
                res.redirect('/login');
        }
    }
};
