const jwt = require("jsonwebtoken");
const { ambiente } = require("../config/env");
const ErroDaApi = require("../utils/AppError");

function verificarLogin(req, _res, next) {
  if (!ambiente.segredoJwt) {
    next(new ErroDaApi("Configure JWT_SECRET no backend/.env.", 503));
    return;
  }

  const [tipo, token] = String(req.headers.authorization || "").split(" ");

  if (tipo !== "Bearer" || !token) {
    next(new ErroDaApi("Token de acesso nao informado.", 401));
    return;
  }

  try {
    req.user = jwt.verify(token, ambiente.segredoJwt);
    next();
  } catch (_erro) {
    next(new ErroDaApi("Token invalido ou expirado.", 401));
  }
}

module.exports = verificarLogin;
