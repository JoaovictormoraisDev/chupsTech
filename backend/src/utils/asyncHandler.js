function tratarFuncaoAsync(funcao) {
  return (req, res, next) => Promise.resolve(funcao(req, res, next)).catch(next);
}

module.exports = tratarFuncaoAsync;
