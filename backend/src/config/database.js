const fs = require("fs");
const path = require("path");

const databaseDir = path.join(__dirname, "..", "..", "database");
const databasePath = path.join(databaseDir, "db.json");

const initialData = {
  activities: [
    {
      id: "demo-1",
      title: "Estudar programacao",
      category: "Estudo",
      day: "Segunda",
      date: "2026-05-28",
      plannedMinutes: 90,
      completedMinutes: 75,
      priority: "Alta",
      energy: 4,
      completed: true,
      notes: "Foco em front-end responsivo."
    },
    {
      id: "demo-2",
      title: "Pausa sem telas",
      category: "Bem-estar",
      day: "Segunda",
      date: "2026-05-28",
      plannedMinutes: 30,
      completedMinutes: 30,
      priority: "Media",
      energy: 5,
      completed: true,
      notes: "Caminhada curta para recuperar energia."
    }
  ]
};

function ensureDatabase() {
  if (!fs.existsSync(databaseDir)) {
    fs.mkdirSync(databaseDir, { recursive: true });
  }

  if (!fs.existsSync(databasePath)) {
    fs.writeFileSync(databasePath, JSON.stringify(initialData, null, 2));
  }
}

function readDatabase() {
  ensureDatabase();
  return JSON.parse(fs.readFileSync(databasePath, "utf8"));
}

function writeDatabase(data) {
  ensureDatabase();
  fs.writeFileSync(databasePath, JSON.stringify(data, null, 2));
}

module.exports = {
  readDatabase,
  writeDatabase
};

