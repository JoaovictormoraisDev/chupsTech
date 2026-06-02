const express = require("express");
const rotasAtividades = require("./activityRoutes");
const rotasLogin = require("./authRoutes");
const rotasProjetos = require("./projectRoutes");
const controlePainel = require("../controllers/dashboardController");
const verificarLogin = require("../middlewares/authMiddleware");
const tratarFuncaoAsync = require("../utils/asyncHandler");
const { ambiente } = require("../config/env");

const rotas = express.Router();

rotas.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    databaseConfigured: Boolean(ambiente.urlSupabase && ambiente.chaveSupabase),
    jwtConfigured: Boolean(ambiente.segredoJwt)
  });
});

rotas.use("/auth", rotasLogin);
rotas.use("/activities", verificarLogin, rotasAtividades);
rotas.use("/projects", verificarLogin, rotasProjetos);
rotas.get("/dashboard", verificarLogin, tratarFuncaoAsync(controlePainel.pegarPainel));

module.exports = rotas;
