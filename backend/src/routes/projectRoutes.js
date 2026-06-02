const express = require("express");
const controle = require("../controllers/projectController");
const tratarFuncaoAsync = require("../utils/asyncHandler");

const rotas = express.Router();

rotas.get("/", tratarFuncaoAsync(controle.listar));
rotas.get("/favorites", tratarFuncaoAsync(controle.listarFavoritos));
rotas.get("/favoritos", tratarFuncaoAsync(controle.listarFavoritos));
rotas.post("/:id/favorite", tratarFuncaoAsync(controle.favoritar));
rotas.post("/:id/favorito", tratarFuncaoAsync(controle.favoritar));
rotas.delete("/:id/favorite", tratarFuncaoAsync(controle.removerFavorito));
rotas.delete("/:id/favorito", tratarFuncaoAsync(controle.removerFavorito));
rotas.get("/:id", tratarFuncaoAsync(controle.pegarPeloId));
rotas.post("/", tratarFuncaoAsync(controle.criar));
rotas.put("/:id", tratarFuncaoAsync(controle.atualizar));
rotas.patch("/:id", tratarFuncaoAsync(controle.atualizar));
rotas.delete("/:id", tratarFuncaoAsync(controle.remover));

module.exports = rotas;
