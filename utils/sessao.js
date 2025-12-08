module.exports = {
    getProfessor(req) {
        return req.session?.usuario?.id_professor || null;
    },
    getAluno(req) {
        return req.session?.usuario?.id_aluno || null;
    },
    getAdmin(req) {
        return req.session?.usuario?.id_admin || null;
    }
};