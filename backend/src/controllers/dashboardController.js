const servico = require("../services/dashboardService");

async function pegarPainel(req, res) {
  res.json(await servico.pegarPainel(req.user.id));
}

module.exports = {
  pegarPainel
};
