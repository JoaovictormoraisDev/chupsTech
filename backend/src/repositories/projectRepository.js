const { pegarSupabase } = require("../config/database");
const ErroDaApi = require("../utils/AppError");

function montarProjeto(linha) {
  if (!linha) return null;

  return {
    id: linha.id,
    name: linha.name,
    tasks: linha.tasks,
    isFavorite: Boolean(linha.is_favorite),
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
  const supabase = pegarSupabase();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", idUsuario)
    .order("created_at", { ascending: false });

  verificarConsulta(error, "Erro ao listar projetos");

  const { data: favoritos, error: erroFavoritos } = await supabase
    .from("project_favorites")
    .select("project_id")
    .eq("user_id", idUsuario);

  verificarConsulta(erroFavoritos, "Erro ao listar favoritos");

  const idsFavoritos = new Set(favoritos.map((favorito) => favorito.project_id));
  return data.map((linha) => montarProjeto({ ...linha, is_favorite: idsFavoritos.has(linha.id) }));
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

async function listarFavoritos(idUsuario) {
  const supabase = pegarSupabase();
  const { data: favoritos, error } = await supabase
    .from("project_favorites")
    .select("project_id")
    .eq("user_id", idUsuario)
    .order("created_at", { ascending: false });

  verificarConsulta(error, "Erro ao listar projetos favoritos");

  const ids = favoritos.map((favorito) => favorito.project_id);
  if (!ids.length) return [];

  const { data: projetosFavoritos, error: erroProjetos } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", idUsuario)
    .in("id", ids);

  verificarConsulta(erroProjetos, "Erro ao consultar projetos favoritos");

  const ordem = new Map(ids.map((id, index) => [id, index]));
  return projetosFavoritos
    .sort((a, b) => ordem.get(a.id) - ordem.get(b.id))
    .map((linha) => montarProjeto({ ...linha, is_favorite: true }));
}

async function favoritar(idUsuario, idProjeto) {
  const projeto = await buscarPorId(idUsuario, idProjeto);
  if (!projeto) return null;

  const { error } = await pegarSupabase()
    .from("project_favorites")
    .upsert(
      { user_id: idUsuario, project_id: idProjeto },
      { onConflict: "user_id,project_id", ignoreDuplicates: true }
    );

  verificarConsulta(error, "Erro ao favoritar projeto");
  return { ...projeto, isFavorite: true };
}

async function desfavoritar(idUsuario, idProjeto) {
  const { data, error } = await pegarSupabase()
    .from("project_favorites")
    .delete()
    .eq("user_id", idUsuario)
    .eq("project_id", idProjeto)
    .select("project_id")
    .maybeSingle();

  verificarConsulta(error, "Erro ao remover favorito");
  return Boolean(data);
}

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover,
  listarFavoritos,
  favoritar,
  desfavoritar
};
