function tratarErros(erro, req, res, next) {
  if (erro.status) {
    return res.status(erro.status).json({ erro: erro.message });
  }
  if (erro.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ erro: 'Registro já existe.' });
  }
  if (erro.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido.' });
  }
  console.error(erro);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
}

module.exports = { tratarErros };
