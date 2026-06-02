const express = require("express");
const controle = require("../controllers/projectController");
const tratarFuncaoAsync = require("../utils/asyncHandler");

const rotas = express.Router();

rotas.get("/", tratarFuncaoAsync(controle.listar));
rotas.get("/:id", tratarFuncaoAsync(controle.pegarPeloId));
rotas.post("/", tratarFuncaoAsync(controle.criar));
rotas.put("/:id", tratarFuncaoAsync(controle.atualizar));
rotas.patch("/:id", tratarFuncaoAsync(controle.atualizar));
rotas.delete("/:id", tratarFuncaoAsync(controle.remover));

module.exports = rotas;
