const quadroNotasModel = require('../models/quadroNotasModel');
const turmaModel = require('../models/turmaModel');

// Função para verificar sessão do professor
function verificarSessaoProfessor(req, res) {
    const id_professor = req.session?.usuario?.id_professor;
    if (!id_professor) {
        res.json({ sucesso: false, erro: 'Professor não identificado na sessão.' });
        return null;
    }
    return id_professor;
}

// Função para verificar sessão do aluno
function verificarSessaoAluno(req, res) {
    const id_aluno = req.session?.usuario?.id_aluno;
    if (!id_aluno) {
        res.json({ sucesso: false, erro: 'Aluno não identificado na sessão.' });
        return null;
    }
    return id_aluno;
}

module.exports = {
    // Renderizar página do quadro de notas (Professor)
    async renderQuadroNotas(req, res) {
        try {
            // Verifica a sessão do professor
            const id_professor = req.session?.usuario?.id_professor;
            console.log('🔐 Professor ID:', id_professor);
                if (!id_professor) {
                    return res.redirect('/login');
                }

            // Busca turmas do professor
            const turmas = await turmaModel.listarTurmasDisciplinasPorProfessor(id_professor);
            console.log('📚 Turmas carregadas para o quadro de notas:', turmas);

            // Renderiza a página
            res.render('pages/professor/quadroNotas', { turmas });
        
        } catch (error) {
            console.error('❌ Erro ao renderizar quadro de notas:', error);
                res.render('pages/professor/quadroNotas', { turmas: [] });
        }
    },

    // Listar notas por turma e disciplina (Professor)
    async listarNotas(req, res) {
        try {
            // Verifica a sessão do professor
            const id_professor = verificarSessaoProfessor(req, res);
                if (!id_professor) return;

            // Extrai parâmetros da query
            const { id_turma, id_disciplina } = req.query;
            console.log('🔍 Parâmetros recebidos - Turma:', id_turma, 'Disciplina:', id_disciplina, 'Professor:', id_professor);

            // Valida os parâmetros
            if (!id_turma) {
                return res.json({ sucesso: false, erro: 'Turma não informada.' });
            }

            // Busca as notas
            const notas = await quadroNotasModel.listarNotasPorTurma(id_turma, id_disciplina || null, id_professor);
            console.log('📊 Notas brutas do banco:', notas.length, 'registros');

            // Organiza os dados por aluno
            const alunosMap = {};
            notas.forEach(nota => {
                // Cria entrada do aluno se não existir
                if (!alunosMap[nota.id_aluno]) {
                    alunosMap[nota.id_aluno] = {
                        id_aluno: nota.id_aluno,
                        nome_aluno: nota.nome_aluno,
                        atividades: []
                    };
                }

                // Adiciona atividade apenas se existir
                if (nota.id_atividade) {
                    alunosMap[nota.id_aluno].atividades.push({
                        id_atividade: nota.id_atividade,
                        titulo: nota.titulo_atividade,
                        data_entrega: nota.data_entrega,
                        nota: nota.nota,
                        feedback: nota.feedback || '',
                        data_envio: nota.data_envio,
                        disciplina: nota.disciplina
                    });
                }
            });

            // Converte o Map em array
            const alunos = Object.values(alunosMap);
            console.log('👥 Total de alunos organizados:', alunos.length);

            // Retorna os dados
            res.json({ sucesso: true, dados: alunos });
        
        } catch (error) {
            console.error('❌ Erro ao listar notas:', error);
                res.json({ sucesso: false, erro: 'Erro ao listar notas: ' + error.message });
        }
    },

    // Listar notas do aluno logado
    async listarNotasAluno(req, res) {
        try {
            // Verifica a sessão do aluno
            const id_aluno = verificarSessaoAluno(req, res);
                if (!id_aluno) return;

            console.log('🔍 Buscando notas do aluno:', id_aluno);

            // Busca as notas do aluno
            const notas = await quadroNotasModel.listarNotasAluno(id_aluno);
            console.log('📊 Notas encontradas:', notas.length);

            // Retorna as notas
            res.json({ sucesso: true, dados: notas });
        
        } catch (error) {
            console.error('❌ Erro ao listar notas do aluno:', error);
                res.json({ sucesso: false, erro: 'Erro ao listar notas: ' + error.message });
        }
    },

    // API: Atualizar nota de um aluno em uma atividade
    async atualizarNota(req, res) {
        try {
            // Verifica a sessão do professor
            const id_professor = verificarSessaoProfessor(req, res);
                if (!id_professor) return;

            // Extrai os dados do corpo da requisição
            const { id_atividade, id_aluno, nota, feedback } = req.body;
            console.log('💾 Atualizando nota - Atividade:', id_atividade, 'Aluno:', id_aluno, 'Nota:', nota);

            // Valida os dados
            if (!id_atividade || !id_aluno || nota === undefined || nota === null) {
                return res.json({ sucesso: false, erro: 'Dados incompletos.' });
            }

            // Valida a nota
            const notaNum = parseFloat(nota);
                if (isNaN(notaNum) || notaNum < 0 || notaNum > 10) {
                    return res.json({ sucesso: false, erro: 'Nota deve estar entre 0 e 10.' });
                }

            // Atualiza a nota
            await quadroNotasModel.atualizarNota(id_atividade, id_aluno, notaNum, feedback || '');

            // Retorna sucesso
            res.json({ sucesso: true, mensagem: 'Nota atualizada com sucesso.' });
        
        } catch (error) {
            console.error('❌ Erro ao atualizar nota:', error);
                res.json({ sucesso: false, erro: 'Erro ao atualizar nota: ' + error.message });
        }
    },

    // API: Listar atividades para filtro
    async listarAtividades(req, res) {
        try {
            // Verifica a sessão do professor
            const id_professor = verificarSessaoProfessor(req, res);
                if (!id_professor) return;

            // Extrai parâmetros da query
            const { id_turma, id_disciplina } = req.query;
            console.log('📝 Listando atividades - Turma:', id_turma, 'Disciplina:', id_disciplina, 'Professor:', id_professor);

            // Valida os parâmetros
            if (!id_turma) {
                return res.json({ sucesso: false, erro: 'Turma não informada.' });
            }

            // Busca as atividades (✅ AGORA COM id_professor)
            const atividades = await quadroNotasModel.listarAtividades(id_turma, id_disciplina || null, id_professor);
            console.log('📚 Atividades encontradas:', atividades.length);

            // Retorna as atividades
            res.json({ sucesso: true, dados: atividades });
        
        } catch (error) {
            console.error('❌ Erro ao listar atividades:', error);
                res.json({ sucesso: false, erro: 'Erro ao listar atividades: ' + error.message });
        }
    }
};