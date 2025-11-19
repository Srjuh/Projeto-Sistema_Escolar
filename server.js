// Iniciações & Importações
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

const siteRoutes = require('./routes/siteRoutes');
const profRoutes = require('./routes/professorRoutes');
const alunoRoutes = require('./routes/alunoRoutes');
const apiUsuarioRoutes = require('./routes/apiUsuarioRoutes');
const atividadeRoutes = require('./routes/atividadeRoutes');
const turmaRoutes = require('./routes/turmaRoutes');
const disciplinaRoutes = require('./routes/disciplinaRoutes');
const quadroNotasRoutes = require('./routes/quadroNotasRoutes');
const apiQuadroNotasRoutes = require('./routes/apiQuadroNotasRoutes');
const corrigirAtividadeRoutes = require('./routes/corrigirAtividadeRoutes');
const apiCorrigirAtividadeRoutes = require('./routes/apiCorrigirAtividadeRoutes');
const apiAtividadeEntregaRoutes = require('./routes/apiAtividadeEntregaRoutes');
const apiAlunoNotasRoutes = require('./routes/apiAlunoNotasRoutes');

const app = express();
const port = 5000;

// Criar pasta uploads se não existir
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('📁 Pasta uploads criada com sucesso!');
}

app.use(cors());
app.use(bodyParser.json());

// EJS e arquivos estáticos
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public') ));

// Session precisa vir após bodyParser e antes das rotas
app.use(session({
    secret: "PF$2@@@2$FP",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 5 }
}));

// Middleware para expor sessão ao EJS (opcional, útil para menus)
app.use((req, res, next) => {
    res.locals.usuario = req.session.usuario || null;
    next();
});

// ============================================
// ROTAS DO SITE
// ============================================
app.use('/', siteRoutes);

// ============================================
// ROTAS DOS PAINÉIS
// ============================================
app.use('/professor', profRoutes);
app.use('/aluno', alunoRoutes);
app.use('/api/aluno', apiAlunoNotasRoutes);
app.use('/api/aluno/atividades', apiAtividadeEntregaRoutes);

// ============================================
// ROTAS DE USUÁRIOS
// ============================================
app.use('/api/usuarios', apiUsuarioRoutes);
app.use('/api/atividades', atividadeRoutes);

// Rotas de turmas
app.use('/api/turmas', turmaRoutes);

// Rotas de disciplinas
app.use('/api/disciplinas', disciplinaRoutes);

// Rotas do quadro de notas
app.use('/professor/quadro-notas', quadroNotasRoutes);
app.use('/api/quadro-notas', apiQuadroNotasRoutes);

// Rotas de corrigir atividades
app.use('/professor/corrigir-atividades', corrigirAtividadeRoutes);
app.use('/api/corrigir-atividades', apiCorrigirAtividadeRoutes);

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
