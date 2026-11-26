const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');
const { HttpError } = require('../utils/erros');

function autenticar(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) {
    return next(new HttpError(401, 'Token não informado.'));
  }
  try {
    const payload = jwt.verify(token, jwtSecret);
    req.usuarioId = payload.id;
    next();
  } catch {
    next(new HttpError(401, 'Token inválido ou expirado.'));
  }
}

module.exports = { autenticar };
