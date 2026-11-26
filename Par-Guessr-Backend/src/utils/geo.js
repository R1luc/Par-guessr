const { jogo } = require('../config');

const RAIO_TERRA_M = 6371000;
const rad = (graus) => (graus * Math.PI) / 180;

// Distância em metros entre dois pontos (fórmula de Haversine)
function haversine(lat1, lng1, lat2, lng2) {
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * RAIO_TERRA_M * Math.asin(Math.sqrt(a));
}

// Pontuação decai exponencialmente com a distância; cada dica desconta pontos
function calcularPontos(distanciaM, dicasUsadas) {
  const base = Math.round(jogo.pontosMax * Math.exp(-distanciaM / jogo.escalaMetros));
  return Math.max(0, base - dicasUsadas * jogo.penalidadeDica);
}

module.exports = { haversine, calcularPontos };
