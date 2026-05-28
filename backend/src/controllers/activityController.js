const service = require("../services/activityService");

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

function handleError(res, error) {
  sendJson(res, error.statusCode || 500, {
    message: error.message || "Erro interno do servidor."
  });
}

async function handleActivities(req, res, id) {
  try {
    if (req.method === "GET" && !id) {
      sendJson(res, 200, service.listActivities());
      return;
    }

    if (req.method === "GET" && id) {
      const activity = service.getActivity(id);
      sendJson(res, activity ? 200 : 404, activity || { message: "Atividade nao encontrada." });
      return;
    }

    if (req.method === "POST" && !id) {
      const payload = await readBody(req);
      sendJson(res, 201, service.createActivity(payload));
      return;
    }

    if (req.method === "PUT" && id) {
      const payload = await readBody(req);
      sendJson(res, 200, service.updateActivity(id, payload));
      return;
    }

    if (req.method === "DELETE" && id) {
      service.deleteActivity(id);
      sendJson(res, 200, { message: "Atividade excluida com sucesso." });
      return;
    }

    sendJson(res, 405, { message: "Metodo nao permitido." });
  } catch (error) {
    handleError(res, error);
  }
}

function handleDashboard(req, res) {
  if (req.method !== "GET") {
    sendJson(res, 405, { message: "Metodo nao permitido." });
    return;
  }

  sendJson(res, 200, service.getDashboard());
}

module.exports = {
  handleActivities,
  handleDashboard
};

