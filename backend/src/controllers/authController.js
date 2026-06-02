const servico = require("../services/authService");

async function cadastrar(req, res) {
  res.status(201).json(await servico.cadastrar(req.body));
}

async function entrar(req, res) {
  res.json(await servico.entrar(req.body));
}

async function meuPerfil(req, res) {
  res.json(await servico.meuPerfil(req.user.id));
}

module.exports = {
  cadastrar,
  entrar,
  meuPerfil
};
