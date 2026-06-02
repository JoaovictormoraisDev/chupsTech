const { pegarSupabase } = require("../config/database");
const ErroDaApi = require("../utils/AppError");

function usuarioPublico(usuario) {
  if (!usuario) return null;

  return {
    id: usuario.id,
    name: usuario.name,
    email: usuario.email,
    stack: usuario.stack,
    createdAt: usuario.created_at
  };
}

async function buscarPorEmail(email) {
  const { data, error } = await pegarSupabase()
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) throw new ErroDaApi(`Erro ao consultar usuario: ${error.message}`, 500);
  return data;
}

async function buscarPorId(id) {
  const { data, error } = await pegarSupabase()
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new ErroDaApi(`Erro ao consultar usuario: ${error.message}`, 500);
  return data;
}

async function criar(usuario) {
  const { data, error } = await pegarSupabase()
    .from("users")
    .insert(usuario)
    .select("*")
    .single();

  if (error) throw new ErroDaApi(`Erro ao cadastrar usuario: ${error.message}`, 500);
  return data;
}

module.exports = {
  usuarioPublico,
  buscarPorEmail,
  buscarPorId,
  criar
};
