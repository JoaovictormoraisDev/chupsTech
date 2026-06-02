const repositorio = require("../repositories/activityRepository");
const ErroDaApi = require("../utils/AppError");

const categorias = ["Estudo", "Trabalho", "Saude", "Casa", "Lazer", "Bem-estar"];
const prioridades = ["Baixa", "Media", "Alta"];
const dias = ["Segunda", "Terca", "Quarta", "Quinta", "Sexta", "Sabado", "Domingo"];

function normalizar(dados = {}) {
  return {
    title: String(dados.title || "").trim(),
    category: String(dados.category || "").trim(),
    day: String(dados.day || "").trim(),
    date: String(dados.date || "").trim(),
    plannedMinutes: Number(dados.plannedMinutes),
    completedMinutes: Number(dados.completedMinutes || 0),
    priority: String(dados.priority || "Media").trim(),
    energy: Number(dados.energy || 3),
    completed: Boolean(dados.completed),
    notes: String(dados.notes || "").trim()
  };
}

function validar(atividade) {
  const erros = [];

  if (!atividade.title) erros.push("Informe o nome da atividade.");
  if (!categorias.includes(atividade.category)) erros.push("Categoria invalida.");
  if (!dias.includes(atividade.day)) erros.push("Dia da semana invalido.");
  if (!atividade.date) erros.push("Informe a data da atividade.");
  if (!Number.isFinite(atividade.plannedMinutes) || atividade.plannedMinutes < 5) {
    erros.push("O tempo planejado deve ser de pelo menos 5 minutos.");
  }
  if (!Number.isFinite(atividade.completedMinutes) || atividade.completedMinutes < 0) {
    erros.push("O tempo realizado nao pode ser negativo.");
  }
  if (atividade.completedMinutes > atividade.plannedMinutes) {
    erros.push("O tempo realizado nao pode ser maior que o tempo planejado.");
  }
  if (!prioridades.includes(atividade.priority)) erros.push("Prioridade invalida.");
  if (!Number.isFinite(atividade.energy) || atividade.energy < 1 || atividade.energy > 5) {
    erros.push("Energia deve ser um valor entre 1 e 5.");
  }

  if (erros.length) throw new ErroDaApi(erros.join(" "), 400);
}

async function listarAtividades(idUsuario) {
  return repositorio.listar(idUsuario);
}

async function pegarAtividade(idUsuario, id) {
  const atividade = await repositorio.buscarPorId(idUsuario, id);
  if (!atividade) throw new ErroDaApi("Atividade nao encontrada.", 404);
  return atividade;
}

async function criarAtividade(idUsuario, dados) {
  const atividade = normalizar(dados);
  validar(atividade);
  return repositorio.criar(idUsuario, atividade);
}

async function atualizarAtividade(idUsuario, id, dados) {
  await pegarAtividade(idUsuario, id);
  const atividade = normalizar(dados);
  validar(atividade);
  return repositorio.atualizar(idUsuario, id, atividade);
}

async function apagarAtividade(idUsuario, id) {
  const removido = await repositorio.remover(idUsuario, id);
  if (!removido) throw new ErroDaApi("Atividade nao encontrada.", 404);
}

module.exports = {
  categorias,
  prioridades,
  dias,
  listarAtividades,
  pegarAtividade,
  criarAtividade,
  atualizarAtividade,
  apagarAtividade
};
