const { pegarSupabase } = require("../config/database");
const ErroDaApi = require("../utils/AppError");

function montarAtividade(linha) {
  if (!linha) return null;

  return {
    id: linha.id,
    title: linha.title,
    category: linha.category,
    day: linha.day,
    date: linha.date,
    plannedMinutes: linha.planned_minutes,
    completedMinutes: linha.completed_minutes,
    priority: linha.priority,
    energy: linha.energy,
    completed: linha.completed,
    notes: linha.notes,
    createdAt: linha.created_at,
    updatedAt: linha.updated_at
  };
}

function montarLinha(idUsuario, atividade) {
  return {
    user_id: idUsuario,
    title: atividade.title,
    category: atividade.category,
    day: atividade.day,
    date: atividade.date,
    planned_minutes: atividade.plannedMinutes,
    completed_minutes: atividade.completedMinutes,
    priority: atividade.priority,
    energy: atividade.energy,
    completed: atividade.completed,
    notes: atividade.notes,
    updated_at: new Date().toISOString()
  };
}

function verificarConsulta(erro, mensagem) {
  if (erro) throw new ErroDaApi(`${mensagem}: ${erro.message}`, 500);
}

async function listar(idUsuario) {
  const { data, error } = await pegarSupabase()
    .from("activities")
    .select("*")
    .eq("user_id", idUsuario)
    .order("date")
    .order("title");

  verificarConsulta(error, "Erro ao listar atividades");
  return data.map(montarAtividade);
}

async function buscarPorId(idUsuario, id) {
  const { data, error } = await pegarSupabase()
    .from("activities")
    .select("*")
    .eq("user_id", idUsuario)
    .eq("id", id)
    .maybeSingle();

  verificarConsulta(error, "Erro ao consultar atividade");
  return montarAtividade(data);
}

async function criar(idUsuario, atividade) {
  const { data, error } = await pegarSupabase()
    .from("activities")
    .insert(montarLinha(idUsuario, atividade))
    .select("*")
    .single();

  verificarConsulta(error, "Erro ao criar atividade");
  return montarAtividade(data);
}

async function atualizar(idUsuario, id, atividade) {
  const { data, error } = await pegarSupabase()
    .from("activities")
    .update(montarLinha(idUsuario, atividade))
    .eq("user_id", idUsuario)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  verificarConsulta(error, "Erro ao atualizar atividade");
  return montarAtividade(data);
}

async function remover(idUsuario, id) {
  const { data, error } = await pegarSupabase()
    .from("activities")
    .delete()
    .eq("user_id", idUsuario)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  verificarConsulta(error, "Erro ao excluir atividade");
  return Boolean(data);
}

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover
};
