const turmaModel = require('../models/turmaModel');
const professorModel = require('../models/professorModel');
const disciplinaModel = require('../models/disciplinaModel');

// Função para verificar sessão do professor
function verificarSessao(req, res) {
    const id_professor = req.session?.usuario?.id_professor;
    if (!id_professor) {
        console.warn('⚠️ Tentativa de acesso sem sessão de professor');
        return null;
    }
    return id_professor;
}

module.exports = {
    // Renderizar home do professor
    async home(req, res) {
        try {
            console.log("📋 Sessão:", req.session);

            // Verifica a sessão do professor
            const id_professor = req.session?.usuario?.id_professor || req.query.id_professor;
                if (!id_professor) {
                    return res.render('pages/professor/professorHome', { turmas: [] });
                }

            // Busca turmas com disciplinas do professor
            const turmas = await turmaModel.listarTurmasDisciplinasPorProfessor(id_professor);
                res.render('pages/professor/professorHome', { turmas });
        
        } catch (error) {
            console.error('❌ Erro ao carregar painel do professor:', error);
                res.render('pages/professor/professorHome', { turmas: [] });
        }
    },

    // Renderizar página de atividades
    atividades(req, res) {
        res.render('pages/professor/atividades');
    }
};
