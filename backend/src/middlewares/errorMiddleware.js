function rotaNaoEncontrada(req, _res, next) {
  const erro = new Error(`Rota nao encontrada: ${req.method} ${req.originalUrl}`);
  erro.statusCode = 404;
  next(erro);
}

function tratarErro(erro, _req, res, _next) {
  const codigoStatus = erro.statusCode || 500;

  res.status(codigoStatus).json({
    message: erro.message || "Erro interno do servidor."
  });
}

module.exports = {
  rotaNaoEncontrada,
  tratarErro
};
