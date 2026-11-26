const express = require('express');
const { pool, comTransacao } = require('../db');
const { jogo } = require('../config');
const { autenticar } = require('../middlewares/auth');
const { HttpError, asyncHandler, lerId } = require('../utils/erros');
const { haversine, calcularPontos } = require('../utils/geo');
const { gerarImagemBorrada } = require('../utils/imagem');

const router = express.Router();
router.use(autenticar);

// Carrega a rodada garantindo que pertence ao usuário logado.
// O tempo decorrido vem do próprio MySQL (NOW()) para não depender de fuso/relógio do Node.
async function carregarRodada(conn, rodadaId, usuarioId, travar = false) {
  const [linhas] = await conn.query(
    `SELECT r.*, p.status AS partida_status,
            TIMESTAMPDIFF(SECOND, r.iniciada_em, NOW()) AS decorrido_seg
     FROM rodada r JOIN partida p ON p.id = r.partida_id
     WHERE r.id = ? AND p.usuario_id = ? ${travar ? 'FOR UPDATE' : ''}`,
    [rodadaId, usuarioId]
  );
  if (!linhas[0]) throw new HttpError(404, 'Rodada não encontrada.');
  return linhas[0];
}

const paraArray = (v) => (typeof v === 'string' ? JSON.parse(v) : v);
const tempoRestante = (r) => Math.max(0, r.tempo_limite_seg - r.decorrido_seg);
const esgotada = (r) => r.decorrido_seg > r.tempo_limite_seg + jogo.toleranciaSeg;

// GET /rodadas/:id -> estado atual da rodada
router.get('/:id', asyncHandler(async (req, res) => {
  const r = await carregarRodada(pool, lerId(req.params.id), req.usuarioId);
  const [[{ dicas }]] = await pool.query(
    'SELECT COUNT(*) AS dicas FROM rodada_dica WHERE rodada_id = ?', [r.id]
  );

  const resposta = {
    id: r.id,
    partidaId: r.partida_id,
    numero: r.numero,
    totalRodadas: jogo.totalRodadas,
    tempoLimiteSeg: r.tempo_limite_seg,
    tempoRestanteSeg: r.respondida_em ? 0 : tempoRestante(r),
    dicasUsadas: dicas,
    dicasRestantes: jogo.totalDicas - dicas,
    respondida: !!r.respondida_em,
  };

  if (r.respondida_em) {
    const [[l]] = await pool.query(
      'SELECT nome, descricao, latitude, longitude FROM `local` WHERE id = ?', [r.local_id]
    );
    resposta.resultado = {
      pontos: r.pontos,
      distanciaM: r.distancia_m,
      palpite: { latitude: r.palpite_lat, longitude: r.palpite_lng },
      local: l,
    };
  }
  res.json(resposta);
}));

// GET /rodadas/:id/imagem -> JPEG borrado (com os quadrados das dicas já nítidos)
// Atenção: no Angular, buscar com HttpClient (responseType 'blob'), pois <img src> não envia o token.
router.get('/:id/imagem', asyncHandler(async (req, res) => {
  const r = await carregarRodada(pool, lerId(req.params.id), req.usuarioId);
  const [[l]] = await pool.query('SELECT imagem_url FROM `local` WHERE id = ?', [r.local_id]);
  const [dicas] = await pool.query(
    'SELECT quadrado_revelado FROM rodada_dica WHERE rodada_id = ? ORDER BY numero', [r.id]
  );

  const buffer = await gerarImagemBorrada(l.imagem_url, dicas.map((d) => d.quadrado_revelado));
  res.set({ 'Content-Type': 'image/jpeg', 'Cache-Control': 'no-store' }).send(buffer);
}));

// POST /rodadas/:id/dica -> revela mais um quadrado da imagem
router.post('/:id/dica', asyncHandler(async (req, res) => {
  const rodadaId = lerId(req.params.id);

  const resultado = await comTransacao(async (conn) => {
    const r = await carregarRodada(conn, rodadaId, req.usuarioId, true);
    if (r.respondida_em) throw new HttpError(409, 'Esta rodada já foi respondida.');
    if (r.decorrido_seg >= r.tempo_limite_seg) throw new HttpError(409, 'O tempo da rodada acabou.');

    const [[{ usadas }]] = await conn.query(
      'SELECT COUNT(*) AS usadas FROM rodada_dica WHERE rodada_id = ?', [rodadaId]
    );
    if (usadas >= jogo.totalDicas) throw new HttpError(409, 'Todas as dicas já foram usadas.');

    const quadrado = paraArray(r.ordem_quadrados)[usadas];
    await conn.query(
      'INSERT INTO rodada_dica (rodada_id, numero, quadrado_revelado, penalidade) VALUES (?, ?, ?, ?)',
      [rodadaId, usadas + 1, quadrado, jogo.penalidadeDica]
    );
    return {
      numero: usadas + 1,
      penalidade: jogo.penalidadeDica,
      dicasRestantes: jogo.totalDicas - (usadas + 1),
    };
  });
  res.status(201).json(resultado);
}));

// POST /rodadas/:id/palpite  { latitude, longitude }
// Se o tempo esgotou, o corpo pode ir vazio: a rodada fecha com 0 pontos.
router.post('/:id/palpite', asyncHandler(async (req, res) => {
  const rodadaId = lerId(req.params.id);
  const { latitude, longitude } = req.body || {};

  const resultado = await comTransacao(async (conn) => {
    const r = await carregarRodada(conn, rodadaId, req.usuarioId, true);
    if (r.respondida_em) throw new HttpError(409, 'Esta rodada já foi respondida.');

    const tempoEsgotado = esgotada(r);
    const temPalpite = latitude !== undefined && longitude !== undefined && latitude !== null && longitude !== null;

    if (temPalpite) {
      const lat = Number(latitude);
      const lng = Number(longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
        throw new HttpError(400, 'Coordenadas inválidas.');
      }
    } else if (!tempoEsgotado) {
      throw new HttpError(400, 'Informe latitude e longitude do palpite.');
    }

    const [[local]] = await conn.query(
      'SELECT nome, descricao, latitude, longitude FROM `local` WHERE id = ?', [r.local_id]
    );
    const [[{ dicas }]] = await conn.query(
      'SELECT COUNT(*) AS dicas FROM rodada_dica WHERE rodada_id = ?', [rodadaId]
    );

    const lat = temPalpite ? Number(latitude) : null;
    const lng = temPalpite ? Number(longitude) : null;
    const distanciaM = temPalpite ? haversine(lat, lng, local.latitude, local.longitude) : null;
    const pontos = tempoEsgotado || !temPalpite ? 0 : calcularPontos(distanciaM, dicas);

    await conn.query(
      `UPDATE rodada
       SET respondida_em = NOW(), palpite_lat = ?, palpite_lng = ?, distancia_m = ?, pontos = ?
       WHERE id = ?`,
      [lat, lng, distanciaM === null ? null : Math.round(distanciaM * 100) / 100, pontos, rodadaId]
    );
    await conn.query(
      `UPDATE partida
       SET pontuacao_total = (SELECT COALESCE(SUM(pontos), 0) FROM rodada WHERE partida_id = ?)
       WHERE id = ?`,
      [r.partida_id, r.partida_id]
    );

    const finalizada = r.numero >= jogo.totalRodadas;
    if (finalizada) {
      await conn.query(
        "UPDATE partida SET status = 'finalizada', finalizada_em = NOW() WHERE id = ?",
        [r.partida_id]
      );
    }

    const [[p]] = await conn.query('SELECT pontuacao_total FROM partida WHERE id = ?', [r.partida_id]);
    return {
      pontos,
      distanciaM: distanciaM === null ? null : Math.round(distanciaM * 100) / 100,
      tempoEsgotado,
      dicasUsadas: dicas,
      palpite: temPalpite ? { latitude: lat, longitude: lng } : null,
      local,
      partidaId: r.partida_id,
      pontuacaoTotal: p.pontuacao_total,
      partidaFinalizada: finalizada,
    };
  });
  res.json(resultado);
}));

module.exports = router;
