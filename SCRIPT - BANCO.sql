-- ==========================================================
-- BANCO DE DADOS: Sistema de Gestão Escolar
-- ==========================================================

-- ==========================================================
-- CRIAÇÃO DO BANCO
-- ==========================================================

CREATE DATABASE railway;
USE railway;

-- ==========================================================
-- TABELAS BÁSICAS
-- ==========================================================

CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(100) NOT NULL
);

CREATE TABLE admin (
    id_admin INT PRIMARY KEY,
    FOREIGN KEY (id_admin) REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
);

CREATE TABLE professor (
    id_professor INT PRIMARY KEY,
    FOREIGN KEY (id_professor) REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
);

CREATE TABLE aluno (
    id_aluno INT PRIMARY KEY,
    matricula VARCHAR(20) UNIQUE NOT NULL,
    FOREIGN KEY (id_aluno) REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
);

CREATE TABLE ano_letivo (
    id_ano INT AUTO_INCREMENT PRIMARY KEY,
    ano INT NOT NULL,
    ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE serie (
    id_serie INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL
);

CREATE TABLE disciplina (
    id_disciplina INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL
);

CREATE TABLE sala (
    id_sala INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    capacidade INT
);

CREATE TABLE fornecedor (
    id_fornecedor INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    contato VARCHAR(100)
);

-- ==========================================================
-- MATRÍCULAS, TURMAS E RELAÇÕES
-- ==========================================================

CREATE TABLE turma (
    id_turma INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    id_serie INT NOT NULL,
    id_sala INT NOT NULL,
    id_ano INT NOT NULL,
    FOREIGN KEY (id_serie) REFERENCES serie(id_serie),
    FOREIGN KEY (id_sala) REFERENCES sala(id_sala),
    FOREIGN KEY (id_ano) REFERENCES ano_letivo(id_ano)
);

-- Tabela que associa Professor a Turma e Disciplina (N:N:N)
CREATE TABLE turma_professor (
    id_turma INT NOT NULL,
    id_professor INT NOT NULL,
    id_disciplina INT NOT NULL,
    PRIMARY KEY (id_turma, id_professor, id_disciplina),
    FOREIGN KEY (id_turma) REFERENCES turma(id_turma),
    FOREIGN KEY (id_professor) REFERENCES professor(id_professor),
    FOREIGN KEY (id_disciplina) REFERENCES disciplina(id_disciplina)
);

-- Tabela de Matrícula
CREATE TABLE matricula (
    id_matricula INT AUTO_INCREMENT PRIMARY KEY,
    id_aluno INT NOT NULL,
    id_turma INT NOT NULL,
    data_matricula DATE NOT NULL,
    UNIQUE (id_aluno, id_turma), 
    FOREIGN KEY (id_aluno) REFERENCES aluno(id_aluno),
    FOREIGN KEY (id_turma) REFERENCES turma(id_turma)
);

CREATE TABLE grade_curricular (
    id_grade INT AUTO_INCREMENT PRIMARY KEY,
    id_turma INT NOT NULL,
    id_disciplina INT NOT NULL,
    UNIQUE (id_turma, id_disciplina),
    FOREIGN KEY (id_turma) REFERENCES turma(id_turma),
    FOREIGN KEY (id_disciplina) REFERENCES disciplina(id_disciplina)
);

-- ==========================================================
-- AVALIAÇÕES, NOTAS E PRESENÇA
-- ==========================================================

CREATE TABLE atividade (
    id_atividade INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT,
    data_entrega DATE,
    id_turma INT NOT NULL,
    id_disciplina INT NOT NULL,
    FOREIGN KEY (id_turma) REFERENCES turma(id_turma),
    FOREIGN KEY (id_disciplina) REFERENCES disciplina(id_disciplina)
);

-- Tabela de Entrega/Nota da Atividade (resolve N:M entre Aluno e Atividade)
CREATE TABLE atividade_entrega (
    id_entrega INT AUTO_INCREMENT PRIMARY KEY,
    id_atividade INT NOT NULL,
    id_aluno INT NOT NULL,
    data_envio DATETIME NOT NULL,
    arquivo VARCHAR(200),
    nota DECIMAL(5,2),
    feedback TEXT,
    UNIQUE (id_atividade, id_aluno),
    FOREIGN KEY (id_atividade) REFERENCES atividade(id_atividade),
    FOREIGN KEY (id_aluno) REFERENCES aluno(id_aluno)
);

-- Tabela que define a estrutura de avaliação da disciplina na turma
CREATE TABLE quadro_notas (
    id_quadro INT AUTO_INCREMENT PRIMARY KEY,
    id_turma INT NOT NULL,
    id_disciplina INT NOT NULL,
    criterio VARCHAR(100),
    peso DECIMAL(5,2),
    FOREIGN KEY (id_turma) REFERENCES turma(id_turma),
    FOREIGN KEY (id_disciplina) REFERENCES disciplina(id_disciplina)
);

CREATE TABLE presenca (
    id_presenca INT AUTO_INCREMENT PRIMARY KEY,
    id_aluno INT NOT NULL,
    id_turma INT NOT NULL,
    data_presenca DATE NOT NULL,
    presente BOOLEAN DEFAULT TRUE,
    UNIQUE (id_aluno, id_turma, data_presenca),
    FOREIGN KEY (id_aluno) REFERENCES aluno(id_aluno),
    FOREIGN KEY (id_turma) REFERENCES turma(id_turma)
);

-- ==========================================================
-- MATERIAIS E ESTOQUE
-- ==========================================================

CREATE TABLE material (
    id_material INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(50),
    quantidade INT DEFAULT 0,
    id_fornecedor INT,
    FOREIGN KEY (id_fornecedor) REFERENCES fornecedor(id_fornecedor)
);

-- Movimentação de ENTRADA (Recebimento)
CREATE TABLE recebimento_material (
    id_recebimento INT AUTO_INCREMENT PRIMARY KEY,
    id_material INT NOT NULL,
    data_recebimento DATETIME NOT NULL,
    id_usuario INT NOT NULL,
    quantidade INT NOT NULL,
    FOREIGN KEY (id_material) REFERENCES material(id_material),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

-- Movimentação de SAÍDA (Baixa)
CREATE TABLE baixa_material (
    id_baixa INT AUTO_INCREMENT PRIMARY KEY,
    id_material INT NOT NULL,
    data_baixa DATETIME NOT NULL,
    id_usuario INT NOT NULL,
    quantidade INT NOT NULL,
    FOREIGN KEY (id_material) REFERENCES material(id_material),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

-- ===========================
-- POPULAÇÃO DE DADOS BÁSICOS
-- ===========================

INSERT INTO usuario (id_usuario, nome, email, senha)
VALUES
(1, 'Carlos Mendes', 'carlos@escola.com', '123'),
(2, 'Ana Ribeiro', 'ana@escola.com', '123'),
(3, 'Roberto Dias', 'roberto@escola.com', '123'),
(4, 'João Silva', 'joao@escola.com', '123'),
(5, 'Maria Souza', 'maria@escola.com', '123'),
(6, 'Pedro Santos', 'pedro@escola.com', '123');

INSERT INTO professor (id_professor)
VALUES
(1), -- Carlos
(2), -- Ana
(3); -- Roberto

INSERT INTO aluno (id_aluno, matricula)
VALUES
(4, 'A001'),
(5, 'A002'),
(6, 'A003');

INSERT INTO ano_letivo (id_ano, ano, ativo)
VALUES
(1, 2025, TRUE),
(2, 2026, FALSE);

INSERT INTO serie (id_serie, nome)
VALUES
(1, '7º Ano'),
(2, '8º Ano');

INSERT INTO sala (id_sala, nome, capacidade)
VALUES
(1, 'Sala 101', 35),
(2, 'Sala 102', 35),
(3, 'Sala 201', 40);

INSERT INTO disciplina (id_disciplina, nome)
VALUES
(1, 'Matemática'),
(2, 'Português'),
(3, 'História');

INSERT INTO turma (id_turma, nome, id_serie, id_sala, id_ano)
VALUES
(1, '7A', 1, 1, 1),
(2, '8A', 2, 3, 1);

INSERT INTO turma_professor (id_turma, id_professor, id_disciplina)
VALUES
(1, 1, 1), -- Carlos → Mat → 7A
(1, 2, 2), -- Ana → Port → 7A
(1, 3, 3), -- Roberto → Hist → 7A
(2, 1, 1), -- Carlos → Mat → 8A
(2, 2, 2); -- Ana → Port → 8A

INSERT INTO matricula (id_matricula, id_aluno, id_turma, data_matricula)
VALUES
(1, 4, 1, '2025-02-01'),
(2, 5, 1, '2025-02-01'),
(3, 6, 2, '2025-02-01');

INSERT INTO atividade (id_atividade, titulo, descricao, data_entrega, id_turma, id_disciplina)
VALUES
(1, 'Lista de Frações', 'Resolver 15 exercícios', '2025-03-01', 1, 1),
(2, 'Interpretação de Texto', 'Responder 10 questões', '2025-03-05', 1, 2),
(3, 'Resumo Idade Média', 'Resumo de 20 linhas', '2025-03-10', 1, 3);

INSERT INTO atividade_entrega (id_entrega, id_atividade, id_aluno, data_envio, arquivo, nota, feedback)
VALUES
(1, 1, 4, '2025-03-01 14:00:00', 'arquivo1.pdf', 8.5, 'Bom trabalho'),
(2, 1, 5, '2025-03-01 15:20:00', 'arquivo2.pdf', 9.0, 'Excelente');

INSERT INTO quadro_notas (id_quadro, id_turma, id_disciplina, criterio, peso)
VALUES
(1, 1, 1, 'Prova 1', 3.0),
(2, 1, 1, 'Trabalhos', 2.0),
(3, 1, 2, 'Redação', 4.0);


