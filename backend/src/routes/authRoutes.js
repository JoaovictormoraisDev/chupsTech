const express = require("express");
const controle = require("../controllers/authController");
const verificarLogin = require("../middlewares/authMiddleware");
const tratarFuncaoAsync = require("../utils/asyncHandler");

const rotas = express.Router();

rotas.post("/register", tratarFuncaoAsync(controle.cadastrar));
rotas.post("/login", tratarFuncaoAsync(controle.entrar));
rotas.get("/me", verificarLogin, tratarFuncaoAsync(controle.meuPerfil));

module.exports = rotas;
