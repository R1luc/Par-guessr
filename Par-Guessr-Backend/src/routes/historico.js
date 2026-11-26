const express = require('express');
const { pool } = require('../db');
const { autenticar } = require('../middlewares/auth');
const { asyncHandler } = require('../utils/erros');

const router = express.Router();
router.use(autenticar);

// GET /historico -> partidas finalizadas do usuário logado
router.get('/', asyncHandler(async (req, res) => {
  const [linhas] = await pool.query(
    `SELECT id, pontuacao_total AS pontuacaoTotal,
            iniciada_em AS iniciadaEm, finalizada_em AS finalizadaEm
     FROM partida
     WHERE usuario_id = ? AND status = 'finalizada'
     ORDER BY finalizada_em DESC`,
    [req.usuarioId]
  );
  res.json(linhas);
}));

module.exports = router;
