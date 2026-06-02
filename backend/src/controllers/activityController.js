const servico = require("../services/activityService");

async function listar(req, res) {
  res.json(await servico.listarAtividades(req.user.id));
}

async function pegarPeloId(req, res) {
  res.json(await servico.pegarAtividade(req.user.id, req.params.id));
}

async function criar(req, res) {
  res.status(201).json(await servico.criarAtividade(req.user.id, req.body));
}

async function atualizar(req, res) {
  res.json(await servico.atualizarAtividade(req.user.id, req.params.id, req.body));
}

async function remover(req, res) {
  await servico.apagarAtividade(req.user.id, req.params.id);
  res.json({ message: "Atividade excluida com sucesso." });
}

module.exports = {
  listar,
  pegarPeloId,
  criar,
  atualizar,
  remover
};
