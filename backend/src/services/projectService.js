const repositorio = require("../repositories/projectRepository");
const ErroDaApi = require("../utils/AppError");

function normalizar(dados = {}) {
  const tarefasRecebidas = Array.isArray(dados.tasks)
    ? dados.tasks
    : String(dados.tasks || "").split(",");

  return {
    name: String(dados.name || "").trim(),
    tasks: tarefasRecebidas.map((tarefa) => String(tarefa).trim()).filter(Boolean)
  };
}

function validar(projeto) {
  if (!projeto.name) throw new ErroDaApi("Informe o nome do projeto.", 400);
  if (!projeto.tasks.length) throw new ErroDaApi("Informe pelo menos uma pendencia.", 400);
}

async function listarProjetos(idUsuario) {
  return repositorio.listar(idUsuario);
}

async function pegarProjeto(idUsuario, id) {
  const projeto = await repositorio.buscarPorId(idUsuario, id);
  if (!projeto) throw new ErroDaApi("Projeto nao encontrado.", 404);
  return projeto;
}

async function criarProjeto(idUsuario, dados) {
  const projeto = normalizar(dados);
  validar(projeto);
  return repositorio.criar(idUsuario, projeto);
}

async function atualizarProjeto(idUsuario, id, dados) {
  await pegarProjeto(idUsuario, id);
  const projeto = normalizar(dados);
  validar(projeto);
  return repositorio.atualizar(idUsuario, id, projeto);
}

async function apagarProjeto(idUsuario, id) {
  const removido = await repositorio.remover(idUsuario, id);
  if (!removido) throw new ErroDaApi("Projeto nao encontrado.", 404);
}

async function listarProjetosFavoritos(idUsuario) {
  return repositorio.listarFavoritos(idUsuario);
}

async function favoritarProjeto(idUsuario, id) {
  const projeto = await repositorio.favoritar(idUsuario, id);
  if (!projeto) throw new ErroDaApi("Projeto nao encontrado.", 404);
  return projeto;
}

async function removerProjetoFavorito(idUsuario, id) {
  await pegarProjeto(idUsuario, id);
  await repositorio.desfavoritar(idUsuario, id);
}

module.exports = {
  listarProjetos,
  pegarProjeto,
  criarProjeto,
  atualizarProjeto,
  apagarProjeto,
  listarProjetosFavoritos,
  favoritarProjeto,
  removerProjetoFavorito
};
