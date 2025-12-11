const turmaModel = require('../models/turmaModel');
const professorModel = require('../models/professorModel');
const disciplinaModel = require('../models/disciplinaModel');
const sessao = require('../utils/sessao');

module.exports = {
    // Renderizar home do professor
    async home(req, res) {
        try {
            console.log("Sessão:", req.session);

            // Verifica a sessão do professor
            const id_professor = sessao.getProfessor(req);
                if (!id_professor) {
                    return res.redirect('/login');
                }

            // Busca turmas com disciplinas do professor
            const turmas = await turmaModel.listarTurmasDisciplinasPorProfessor(id_professor);
                res.render('pages/professor/professorHome', { turmas });
        
        } catch (error) {
            console.error('Erro ao carregar painel do professor:', error);
                res.render('pages/professor/professorHome', { turmas: [] });
        }
    },

    // Renderizar página de atividades
    atividades(req, res) {
        // Verifica a sessão do professor
        const id_professor = sessao.getProfessor(req);
            if (!id_professor) {
                return res.redirect('/login');
            } 
    
        return res.render('pages/professor/atividades');
    }
};
