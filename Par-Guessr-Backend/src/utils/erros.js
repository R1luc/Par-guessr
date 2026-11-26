class HttpError extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

function lerId(valor) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'ID inválido.');
  return id;
}

module.exports = { HttpError, asyncHandler, lerId };
