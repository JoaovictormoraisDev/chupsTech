const path = require("path");
const express = require("express");
const cors = require("cors");
const rotasDaApi = require("./routes");
const { rotaNaoEncontrada, tratarErro } = require("./middlewares/errorMiddleware");

const app = express();
const pastaFrontend = path.join(__dirname, "..", "..", "frontend");

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use("/api", rotasDaApi);
app.use(express.static(pastaFrontend));

app.get(/^(?!\/api(?:\/|$)).*/, (_req, res) => {
  res.sendFile(path.join(pastaFrontend, "index.html"));
});

app.use(rotaNaoEncontrada);
app.use(tratarErro);

module.exports = app;
