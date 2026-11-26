const path = require('path');
require('dotenv').config();

if (!process.env.JWT_SECRET) {
  throw new Error('Defina JWT_SECRET no arquivo .env');
}

module.exports = {
  porta: Number(process.env.PORT) || 3000,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpira: process.env.JWT_EXPIRES_IN || '7d',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'par_guessr',
  },
  imagensDir: path.resolve(process.env.IMAGENS_DIR || path.join(__dirname, '..', 'imagens')),
  // Regras do jogo (tudo calculado no backend)
  jogo: {
    totalRodadas: 5,
    tempoLimiteSeg: 60,
    toleranciaSeg: 2,      // folga para latência de rede
    totalDicas: 4,
    pontosMax: 1000,
    escalaMetros: 150,     // quanto maior, mais "perdoa" erros de distância
    penalidadeDica: 100,   // pontos descontados por dica usada
    blurSigma: 25,         // intensidade do borrado
  },
};
