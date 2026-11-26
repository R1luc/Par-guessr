const express = require('express');
const { pool } = require('../db');
const { autenticar } = require('../middlewares/auth');
const { asyncHandler } = require('../utils/erros');

const router = express.Router();
router.use(autenticar);

// GET /ranking?limite=10 -> melhor pontuação de cada jogador
router.get('/', asyncHandler(async (req, res) => {
  const limite = Math.min(Math.max(parseInt(req.query.limite, 10) || 10, 1), 100);
  const [linhas] = await pool.query(
    `SELECT u.id AS usuarioId, u.nome, MAX(p.pontuacao_total) AS melhorPontuacao,
            COUNT(*) AS partidasJogadas
     FROM partida p JOIN usuario u ON u.id = p.usuario_id
     WHERE p.status = 'finalizada'
     GROUP BY u.id, u.nome
     ORDER BY melhorPontuacao DESC, u.nome
     LIMIT ?`,
    [limite]
  );
  res.json(linhas.map((l, i) => ({ posicao: i + 1, ...l })));
}));

module.exports = router;
