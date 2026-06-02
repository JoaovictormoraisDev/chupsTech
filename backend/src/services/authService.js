const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ambiente } = require("../config/env");
const repositorio = require("../repositories/userRepository");
const ErroDaApi = require("../utils/AppError");

function criarToken(usuario) {
  if (!ambiente.segredoJwt) {
    throw new ErroDaApi("Configure JWT_SECRET no backend/.env.", 503);
  }

  return jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      name: usuario.name
    },
    ambiente.segredoJwt,
    { expiresIn: ambiente.tempoJwt }
  );
}

function validarCadastro({ name, email, password }) {
  if (!name) throw new ErroDaApi("Informe seu nome.", 400);
  if (!email || !email.includes("@")) throw new ErroDaApi("Informe um email valido.", 400);
  if (!password || password.length < 6) {
    throw new ErroDaApi("A senha deve ter pelo menos 6 caracteres.", 400);
  }
}

async function cadastrar(dados = {}) {
  const name = String(dados.name || "").trim();
  const email = String(dados.email || "").trim().toLowerCase();
  const password = String(dados.password || "");
  const stack = String(dados.stack || "").trim();

  validarCadastro({ name, email, password });

  if (await repositorio.buscarPorEmail(email)) {
    throw new ErroDaApi("Ja existe uma conta com este email.", 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const usuario = await repositorio.criar({
    name,
    email,
    password_hash: passwordHash,
    stack
  });

  return {
    token: criarToken(usuario),
    user: repositorio.usuarioPublico(usuario)
  };
}

async function entrar(dados = {}) {
  const email = String(dados.email || "").trim().toLowerCase();
  const password = String(dados.password || "");
  const usuario = await repositorio.buscarPorEmail(email);

  if (!usuario || !(await bcrypt.compare(password, usuario.password_hash))) {
    throw new ErroDaApi("Email ou senha incorretos.", 401);
  }

  return {
    token: criarToken(usuario),
    user: repositorio.usuarioPublico(usuario)
  };
}

async function meuPerfil(idUsuario) {
  const usuario = await repositorio.buscarPorId(idUsuario);
  if (!usuario) throw new ErroDaApi("Usuario nao encontrado.", 404);
  return repositorio.usuarioPublico(usuario);
}

module.exports = {
  cadastrar,
  entrar,
  meuPerfil
};
