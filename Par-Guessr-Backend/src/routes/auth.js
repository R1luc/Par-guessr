const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const { jwtSecret, jwtExpira } = require('../config');
const { autenticar } = require('../middlewares/auth');
const { HttpError, asyncHandler } = require('../utils/erros');

const router = express.Router();
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const gerarToken = (id) => jwt.sign({ id }, jwtSecret, { expiresIn: jwtExpira });

// POST /auth/registro
router.post('/registro', asyncHandler(async (req, res) => {
  const { nome, email, senha } = req.body || {};
  if (!nome || !email || !senha) throw new HttpError(400, 'Informe nome, email e senha.');
  if (!EMAIL_REGEX.test(email)) throw new HttpError(400, 'Email inválido.');
  if (String(senha).length < 6) throw new HttpError(400, 'A senha deve ter ao menos 6 caracteres.');

  const hash = await bcrypt.hash(String(senha), 10);
  try {
    const [r] = await pool.query(
      'INSERT INTO usuario (nome, email, senha_hash) VALUES (?, ?, ?)',
      [String(nome).trim(), String(email).trim().toLowerCase(), hash]
    );
    res.status(201).json({
      token: gerarToken(r.insertId),
      usuario: { id: r.insertId, nome: String(nome).trim(), email: String(email).trim().toLowerCase() },
    });
  } catch (erro) {
    if (erro.code === 'ER_DUP_ENTRY') throw new HttpError(409, 'Este email já está cadastrado.');
    throw erro;
  }
}));

// POST /auth/login
router.post('/login', asyncHandler(async (req, res) => {
  const { email, senha } = req.body || {};
  if (!email || !senha) throw new HttpError(400, 'Informe email e senha.');

  const [linhas] = await pool.query(
    'SELECT id, nome, email, senha_hash FROM usuario WHERE email = ?',
    [String(email).trim().toLowerCase()]
  );
  const u = linhas[0];
  if (!u || !(await bcrypt.compare(String(senha), u.senha_hash))) {
    throw new HttpError(401, 'Email ou senha incorretos.');
  }
  res.json({ token: gerarToken(u.id), usuario: { id: u.id, nome: u.nome, email: u.email } });
}));

// GET /auth/me
router.get('/me', autenticar, asyncHandler(async (req, res) => {
  const [linhas] = await pool.query('SELECT id, nome, email FROM usuario WHERE id = ?', [req.usuarioId]);
  if (!linhas[0]) throw new HttpError(404, 'Usuário não encontrado.');
  res.json(linhas[0]);
}));

module.exports = router;
