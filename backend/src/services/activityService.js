const { randomUUID } = require("crypto");
const { readDatabase, writeDatabase } = require("../config/database");

const categories = ["Estudo", "Trabalho", "Saude", "Casa", "Lazer", "Bem-estar"];
const priorities = ["Baixa", "Media", "Alta"];
const days = ["Segunda", "Terca", "Quarta", "Quinta", "Sexta", "Sabado", "Domingo"];

function normalizeActivity(payload) {
  return {
    title: String(payload.title || "").trim(),
    category: String(payload.category || "").trim(),
    day: String(payload.day || "").trim(),
    date: String(payload.date || "").trim(),
    plannedMinutes: Number(payload.plannedMinutes),
    completedMinutes: Number(payload.completedMinutes || 0),
    priority: String(payload.priority || "Media").trim(),
    energy: Number(payload.energy || 3),
    completed: Boolean(payload.completed),
    notes: String(payload.notes || "").trim()
  };
}

function validateActivity(activity) {
  const errors = [];

  if (!activity.title) errors.push("Informe o nome da atividade.");
  if (!categories.includes(activity.category)) errors.push("Categoria invalida.");
  if (!days.includes(activity.day)) errors.push("Dia da semana invalido.");
  if (!activity.date) errors.push("Informe a data da atividade.");
  if (!Number.isFinite(activity.plannedMinutes) || activity.plannedMinutes < 5) {
    errors.push("O tempo planejado deve ser de pelo menos 5 minutos.");
  }
  if (!Number.isFinite(activity.completedMinutes) || activity.completedMinutes < 0) {
    errors.push("O tempo realizado nao pode ser negativo.");
  }
  if (activity.completedMinutes > activity.plannedMinutes) {
    errors.push("O tempo realizado nao pode ser maior que o tempo planejado.");
  }
  if (!priorities.includes(activity.priority)) errors.push("Prioridade invalida.");
  if (!Number.isFinite(activity.energy) || activity.energy < 1 || activity.energy > 5) {
    errors.push("Energia deve ser um valor entre 1 e 5.");
  }

  return errors;
}

function calculateSummary(activities) {
  const totalPlanned = activities.reduce((sum, item) => sum + item.plannedMinutes, 0);
  const totalCompleted = activities.reduce((sum, item) => sum + item.completedMinutes, 0);
  const completedCount = activities.filter((item) => item.completed).length;
  const productivity = totalPlanned ? Math.round((totalCompleted / totalPlanned) * 100) : 0;
  const averageEnergy = activities.length
    ? activities.reduce((sum, item) => sum + item.energy, 0) / activities.length
    : 0;

  return {
    totalActivities: activities.length,
    completedCount,
    totalPlanned,
    totalCompleted,
    productivity: Math.min(productivity, 100),
    averageEnergy: Number(averageEnergy.toFixed(1))
  };
}

function listActivities() {
  const db = readDatabase();
  return db.activities.sort((a, b) => `${a.date}${a.title}`.localeCompare(`${b.date}${b.title}`));
}

function getActivity(id) {
  return listActivities().find((activity) => activity.id === id);
}

function createActivity(payload) {
  const activity = normalizeActivity(payload);
  const errors = validateActivity(activity);

  if (errors.length) {
    const error = new Error(errors.join(" "));
    error.statusCode = 400;
    throw error;
  }

  const db = readDatabase();
  const newActivity = { id: randomUUID(), ...activity };
  db.activities.push(newActivity);
  writeDatabase(db);
  return newActivity;
}

function updateActivity(id, payload) {
  const activity = normalizeActivity(payload);
  const errors = validateActivity(activity);

  if (errors.length) {
    const error = new Error(errors.join(" "));
    error.statusCode = 400;
    throw error;
  }

  const db = readDatabase();
  const index = db.activities.findIndex((item) => item.id === id);

  if (index === -1) {
    const error = new Error("Atividade nao encontrada.");
    error.statusCode = 404;
    throw error;
  }

  db.activities[index] = { id, ...activity };
  writeDatabase(db);
  return db.activities[index];
}

function deleteActivity(id) {
  const db = readDatabase();
  const nextActivities = db.activities.filter((activity) => activity.id !== id);

  if (nextActivities.length === db.activities.length) {
    const error = new Error("Atividade nao encontrada.");
    error.statusCode = 404;
    throw error;
  }

  db.activities = nextActivities;
  writeDatabase(db);
}

function getDashboard() {
  const activities = listActivities();
  const byCategory = categories.map((category) => ({
    category,
    minutes: activities
      .filter((activity) => activity.category === category)
      .reduce((sum, activity) => sum + activity.completedMinutes, 0)
  }));
  const byDay = days.map((day) => {
    const dayActivities = activities.filter((activity) => activity.day === day);
    return {
      day,
      productivity: calculateSummary(dayActivities).productivity,
      activities: dayActivities.length
    };
  });

  return {
    summary: calculateSummary(activities),
    byCategory,
    byDay,
    activities
  };
}

module.exports = {
  listActivities,
  getActivity,
  createActivity,
  updateActivity,
  deleteActivity,
  getDashboard
};

