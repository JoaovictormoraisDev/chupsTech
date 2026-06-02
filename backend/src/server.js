const app = require("./app");
const { ambiente } = require("./config/env");

app.listen(ambiente.porta, () => {
  console.log(`Chups Tech API rodando em http://localhost:${ambiente.porta}`);
});
