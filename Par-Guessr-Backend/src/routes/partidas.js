const express = require('express');
const { pool, comTransacao } = require('../db');
const { jogo } = require('../config');
const { autenticar } = require('../middlewares/auth');
const { HttpError, asyncHandler, lerId } = require('../utils/erros');
const { embaralhar } = require('../utils/imagem');

const router = express.Router();
router.use(autenticar);

// Sorteia um local ainda não usado na partida e cria a rodada
async function criarRodada(conn, partidaId, numero) {
  const [locais] = await conn.query(
    `SELECT id FROM \`local\`
     WHERE ativo = 1 AND id NOT IN (SELECT local_id FROM rodada WHERE partida_id = ?)
     ORDER BY RAND() LIMIT 1`,
    [partidaId]
  );
  if (!locais.length) throw new HttpError(409, 'Não há locais disponíveis para sortear.');

  const ordem = embaralhar([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  const [r] = await conn.query(
    `INSERT INTO rodada (partida_id, local_id, numero, ordem_quadrados, tempo_limite_seg)
     VALUES (?, ?, ?, ?, ?)`,
    [partidaId, locais[0].id, numero, JSON.stringify(ordem), jogo.tempoLimiteSeg]
  );
  return {
    id: r.insertId,
    numero,
    tempoLimiteSeg: jogo.tempoLimiteSeg,
    totalDicas: jogo.totalDicas,
    imagemUrl: `/rodadas/${r.insertId}/imagem`,
  };
}

// POST /partidas  -> cria a partida e já sorteia a rodada 1
router.post('/', asyncHandler(async (req, res) => {
  const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM `local` WHERE ativo = 1');
  if (total < jogo.totalRodadas) {
    throw new HttpError(409, `Cadastre ao menos ${jogo.totalRodadas} locais ativos para jogar.`);
  }

  const resultado = await comTransacao(async (conn) => {
    const [p] = await conn.query('INSERT INTO partida (usuario_id) VALUES (?)', [req.usuarioId]);
    const rodada = await criarRodada(conn, p.insertId, 1);
    return { partida: { id: p.insertId, totalRodadas: jogo.totalRodadas }, rodada };
  });
  res.status(201).json(resultado);
}));

// POST /partidas/:id/proxima-rodada
router.post('/:id/proxima-rodada', asyncHandler(async (req, res) => {
  const partidaId = lerId(req.params.id);

  const rodada = await comTransacao(async (conn) => {
    const [ps] = await conn.query(
      'SELECT id, status FROM partida WHERE id = ? AND usuario_id = ? FOR UPDATE',
      [partidaId, req.usuarioId]
    );
    if (!ps[0]) throw new HttpError(404, 'Partida não encontrada.');
    if (ps[0].status !== 'em_andamento') throw new HttpError(409, 'A partida já foi finalizada.');

    const [ultimas] = await conn.query(
      'SELECT numero, respondida_em FROM rodada WHERE partida_id = ? ORDER BY numero DESC LIMIT 1',
      [partidaId]
    );
    const ultima = ultimas[0];
    if (!ultima.respondida_em) throw new HttpError(409, 'Responda a rodada atual antes de avançar.');
    if (ultima.numero >= jogo.totalRodadas) throw new HttpError(409, 'Todas as rodadas já foram jogadas.');

    return criarRodada(conn, partidaId, ultima.numero + 1);
  });
  res.status(201).json({ rodada });
}));

// GET /partidas/:id -> progresso (rodadas já respondidas + rodada atual)
router.get('/:id', asyncHandler(async (req, res) => {
  const partidaId = lerId(req.params.id);

  const [ps] = await pool.query(
    `SELECT id, pontuacao_total AS pontuacaoTotal, status,
            iniciada_em AS iniciadaEm, finalizada_em AS finalizadaEm
     FROM partida WHERE id = ? AND usuario_id = ?`,
    [partidaId, req.usuarioId]
  );
  if (!ps[0]) throw new HttpError(404, 'Partida não encontrada.');

  // O local só aparece depois que a rodada foi respondida
  const [rodadas] = await pool.query(
    `SELECT r.id, r.numero, r.pontos, r.distancia_m AS distanciaM,
            r.palpite_lat AS palpiteLat, r.palpite_lng AS palpiteLng,
            l.nome AS localNome, l.latitude AS localLat, l.longitude AS localLng,
            (SELECT COUNT(*) FROM rodada_dica d WHERE d.rodada_id = r.id) AS dicasUsadas
     FROM rodada r JOIN \`local\` l ON l.id = r.local_id
     WHERE r.partida_id = ? AND r.respondida_em IS NOT NULL
     ORDER BY r.numero`,
    [partidaId]
  );
  const [abertas] = await pool.query(
    'SELECT id, numero FROM rodada WHERE partida_id = ? AND respondida_em IS NULL LIMIT 1',
    [partidaId]
  );

  res.json({
    partida: { ...ps[0], totalRodadas: jogo.totalRodadas },
    rodadas,
    rodadaAtual: abertas[0] || null,
  });
}));

module.exports = router;
