// Iniciações & Importações
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

// Rotas principais
const siteRoutes = require('./routes/siteRoutes');
const professorRoutes = require('./routes/professorRoutes');
const alunoRoutes = require('./routes/alunoRoutes');
const apiRoutes = require('./routes/apiRoutes');

const app = express();
const port = 5000;

// Criar pasta uploads se não existir
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Pasta uploads criada com sucesso!');
}

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// EJS e arquivos estáticos
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// servir a pasta uploads em /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session
app.use(session({
    secret: "PF$2@@@2$FP",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 5 }
}));

// Middleware para expor sessão ao EJS
app.use(function(req, res, next) {
    res.locals.usuario = req.session.usuario || null;
    next();
});

// ============================================
// ROTAS
// ============================================
app.use('/', siteRoutes);
app.use('/professor', professorRoutes);
app.use('/aluno', alunoRoutes);
app.use('/api', apiRoutes);

// ============================================
// INICIALIZAÇÃO
// ============================================
app.listen(port, function() {
    console.log('Servidor rodando em http://localhost:' + port);
});