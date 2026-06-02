const { pegarSupabase } = require("../config/database");
const ErroDaApi = require("../utils/AppError");

function montarProjeto(linha) {
  if (!linha) return null;

  return {
    id: linha.id,
    name: linha.name,
    tasks: linha.tasks,
    createdAt: linha.created_at,
    updatedAt: linha.updated_at
  };
}

function montarLinha(idUsuario, projeto) {
  return {
    user_id: idUsuario,
    name: projeto.name,
    tasks: projeto.tasks,
    updated_at: new Date().toISOString()
  };
}

function verificarConsulta(erro, mensagem) {
  if (erro) throw new ErroDaApi(`${mensagem}: ${erro.message}`, 500);
}

async function listar(idUsuario) {
  const { data, error } = await pegarSupabase()
    .from("projects")
    .select("*")
    .eq("user_id", idUsuario)
    .order("created_at", { ascending: false });

  verificarConsulta(error, "Erro ao listar projetos");
  return data.map(montarProjeto);
}

async function buscarPorId(idUsuario, id) {
  const { data, error } = await pegarSupabase()
    .from("projects")
    .select("*")
    .eq("user_id", idUsuario)
    .eq("id", id)
    .maybeSingle();

  verificarConsulta(error, "Erro ao consultar projeto");
  return montarProjeto(data);
}

async function criar(idUsuario, projeto) {
  const { data, error } = await pegarSupabase()
    .from("projects")
    .insert(montarLinha(idUsuario, projeto))
    .select("*")
    .single();

  verificarConsulta(error, "Erro ao criar projeto");
  return montarProjeto(data);
}

async function atualizar(idUsuario, id, projeto) {
  const { data, error } = await pegarSupabase()
    .from("projects")
    .update(montarLinha(idUsuario, projeto))
    .eq("user_id", idUsuario)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  verificarConsulta(error, "Erro ao atualizar projeto");
  return montarProjeto(data);
}

async function remover(idUsuario, id) {
  const { data, error } = await pegarSupabase()
    .from("projects")
    .delete()
    .eq("user_id", idUsuario)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  verificarConsulta(error, "Erro ao excluir projeto");
  return Boolean(data);
}

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover
};
