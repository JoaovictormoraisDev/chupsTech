const servicoAtividades = require("./activityService");

function calcularResumo(atividades) {
  const totalPlanejado = atividades.reduce((soma, item) => soma + item.plannedMinutes, 0);
  const totalConcluido = atividades.reduce((soma, item) => soma + item.completedMinutes, 0);
  const quantidadeConcluida = atividades.filter((item) => item.completed).length;
  const produtividade = totalPlanejado ? Math.round((totalConcluido / totalPlanejado) * 100) : 0;
  const mediaEnergia = atividades.length
    ? atividades.reduce((soma, item) => soma + item.energy, 0) / atividades.length
    : 0;

  return {
    totalActivities: atividades.length,
    completedCount: quantidadeConcluida,
    totalPlanned: totalPlanejado,
    totalCompleted: totalConcluido,
    productivity: Math.min(produtividade, 100),
    averageEnergy: Number(mediaEnergia.toFixed(1))
  };
}

async function pegarPainel(idUsuario) {
  const atividades = await servicoAtividades.listarAtividades(idUsuario);
  const byCategory = servicoAtividades.categorias.map((categoria) => ({
    category: categoria,
    minutes: atividades
      .filter((atividade) => atividade.category === categoria)
      .reduce((soma, atividade) => soma + atividade.completedMinutes, 0)
  }));
  const byDay = servicoAtividades.dias.map((dia) => {
    const atividadesDoDia = atividades.filter((atividade) => atividade.day === dia);
    return {
      day: dia,
      productivity: calcularResumo(atividadesDoDia).productivity,
      activities: atividadesDoDia.length
    };
  });

  return {
    summary: calcularResumo(atividades),
    byCategory,
    byDay,
    activities: atividades
  };
}

module.exports = {
  pegarPainel
};
