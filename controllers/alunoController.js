const sessao = require('../utils/sessao');

module.exports = {
    async home(req, res) {
        try {
            const id_aluno = sessao.getAluno(req);
            if (!id_aluno) return res.redirect('/login');

            res.render('pages/aluno/alunoHome', { usuario: req.session.usuario });
        } catch (error) {
            console.error('Erro ao carregar home do aluno:', error);
            res.redirect('/login');
        }
    },

    async quadroNotas(req, res) {
        try {
            const id_aluno = sessao.getAluno(req);
            if (!id_aluno) return res.redirect('/login');

            res.render('pages/aluno/quadroNotasAlunos', { usuario: req.session.usuario });
        } catch (error) {
            console.error('Erro ao carregar quadro de notas:', error);
            res.redirect('/login');
        }
    }
};