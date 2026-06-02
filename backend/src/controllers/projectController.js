const servico = require("../services/projectService");

async function listar(req, res) {
  res.json(await servico.listarProjetos(req.user.id));
}

async function pegarPeloId(req, res) {
  res.json(await servico.pegarProjeto(req.user.id, req.params.id));
}

async function criar(req, res) {
  res.status(201).json(await servico.criarProjeto(req.user.id, req.body));
}

async function atualizar(req, res) {
  res.json(await servico.atualizarProjeto(req.user.id, req.params.id, req.body));
}

async function remover(req, res) {
  await servico.apagarProjeto(req.user.id, req.params.id);
  res.json({ message: "Projeto excluido com sucesso." });
}

module.exports = {
  listar,
  pegarPeloId,
  criar,
  atualizar,
  remover
};
