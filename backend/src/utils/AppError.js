class ErroDaApi extends Error {
  constructor(mensagem, codigoStatus = 500) {
    super(mensagem);
    this.name = "ErroDaApi";
    this.statusCode = codigoStatus;
  }
}

module.exports = ErroDaApi;
