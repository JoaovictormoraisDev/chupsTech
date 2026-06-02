const aviso = document.querySelector("#aviso");
const areaSoltar = document.querySelector("#areaSoltar");
const valorScore = document.querySelector("#valorScore");
const tituloScore = document.querySelector("#tituloScore");
const mensagemScore = document.querySelector("#mensagemScore");
const minutosTelaEl = document.querySelector("#minutosTela");
const minutosVidaEl = document.querySelector("#minutosVida");
const barraTela = document.querySelector("#barraTela");
const barraVida = document.querySelector("#barraVida");
const dicaEquilibrio = document.querySelector("#dicaEquilibrio");
const scoreInicio = document.querySelector("#scoreInicio");
const textoScoreInicio = document.querySelector("#textoScoreInicio");
const nomeDevInicio = document.querySelector("#nomeDevInicio");
const metricaAtividades = document.querySelector("#metricaAtividades");
const metricaPlanejado = document.querySelector("#metricaPlanejado");
const metricaConcluido = document.querySelector("#metricaConcluido");
const metricaProdutividade = document.querySelector("#metricaProdutividade");
const listaProjetos = document.querySelector("#listaProjetos");
const botaoConta = document.querySelector("#botaoConta");
const botaoSair = document.querySelector("#botaoSair");
const MAX_MINUTOS_DIA = 24 * 60;

let rotina = [
  { id: crypto.randomUUID(), label: "Deep work", type: "screen", minutes: 90, completedMinutes: 0, tone: "violet" },
  { id: crypto.randomUUID(), label: "Pausa sem tela", type: "life", minutes: 15, completedMinutes: 0, tone: "green" },
  { id: crypto.randomUUID(), label: "Implementar feature", type: "screen", minutes: 75, completedMinutes: 0, tone: "violet" },
  { id: crypto.randomUUID(), label: "Refeicao consciente", type: "life", minutes: 45, completedMinutes: 0, tone: "green" }
];

let projetos = [];
let painelUsuario = null;
let modoGrafico = "balance";
let segundosCronometro = 0;
let intervaloCronometro = null;

function pegarSessao() {
  const token = localStorage.getItem("chupsTechToken");
  const rawUser = localStorage.getItem("chupsTechUser");
  if (!token || !rawUser) return { token: "", user: null };

  try {
    return { token, user: JSON.parse(rawUser) };
  } catch (_error) {
    localStorage.removeItem("chupsTechToken");
    localStorage.removeItem("chupsTechUser");
    return { token: "", user: null };
  }
}

async function pedirApi(path, options = {}) {
  const { token } = pegarSessao();
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  const data = await response.json();

  if (response.status === 401) sairDaConta(false);
  if (!response.ok) throw new Error(data.message || "Nao foi possivel concluir a operacao.");
  return data;
}

function atualizarTelaConta() {
  const { user } = pegarSessao();
  botaoConta.textContent = user ? `Ola, ${user.name.split(" ")[0]}` : "Entrar";
  botaoConta.href = "#conta";
  botaoSair.hidden = !user;
  document.querySelector(".area-acesso").hidden = Boolean(user);
  document.querySelector("#perfilConta").hidden = !user;
  if (user) {
    document.querySelector("#nomePerfil").textContent = `Ola, ${user.name}`;
    document.querySelector("#emailPerfil").textContent = `${user.email} - ${user.stack || "Stack nao informada"}`;
  }
}

function sairDaConta(showMessage = true) {
  localStorage.removeItem("chupsTechToken");
  localStorage.removeItem("chupsTechUser");
  projetos = [];
  painelUsuario = null;
  renderizarProjetos();
  renderizarResumoHome();
  gerarInsightPessoal();
  atualizarTelaConta();
  if (showMessage) mostrarAviso("Sessao encerrada.");
}

function montarUsoDoBanco() {
  const atividades = painelUsuario?.activities || [];
  const categoriasDeTela = ["Estudo", "Trabalho"];
  const tempoTela = atividades
    .filter((atividade) => categoriasDeTela.includes(atividade.category))
    .reduce((soma, atividade) => soma + atividade.plannedMinutes, 0);
  const tempoVidaReal = atividades
    .filter((atividade) => !categoriasDeTela.includes(atividade.category))
    .reduce((soma, atividade) => soma + atividade.plannedMinutes, 0);
  const total = tempoTela + tempoVidaReal;
  const pausas = atividades.filter((atividade) => ["Saude", "Lazer", "Bem-estar"].includes(atividade.category)).length;
  const proporcaoTela = total ? tempoTela / total : 0;
  const equilibrio = total ? Math.max(0, 100 - Math.abs(proporcaoTela - 0.62) * 135) : 0;
  const produtividade = painelUsuario?.summary?.productivity || 0;
  const score = total ? Math.round(Math.min(100, equilibrio * 0.55 + produtividade * 0.45 + Math.min(10, pausas * 2))) : 0;

  return { atividades, tempoTela, tempoVidaReal, total, pausas, score };
}

function renderizarResumoHome() {
  const { user } = pegarSessao();
  const medidorTela = document.querySelector(".medidor-tela");
  const medidorVida = document.querySelector(".medidor-vida");
  const textoUso = document.querySelector("#textoUsoInicio");

  if (!user || !painelUsuario) {
    nomeDevInicio.textContent = "";
    scoreInicio.textContent = "";
    textoScoreInicio.textContent = "";
    textoUso.textContent = "";
    metricaAtividades.textContent = "";
    metricaPlanejado.textContent = "";
    metricaConcluido.textContent = "";
    metricaProdutividade.textContent = "";
    medidorTela.style.width = "0%";
    medidorVida.style.width = "0%";
    return;
  }

  const { tempoTela, tempoVidaReal, total, score } = montarUsoDoBanco();
  const resumo = painelUsuario.summary;
  const feedback = mensagemDoScore(score);
  const porcentagemTela = total ? Math.round((tempoTela / total) * 100) : 0;
  const porcentagemVida = total ? 100 - porcentagemTela : 0;

  nomeDevInicio.textContent = `${user.name.split(" ")[0]} dev`;
  scoreInicio.textContent = score;
  textoScoreInicio.textContent = feedback.title;
  textoUso.textContent = `${formatarMinutos(tempoTela)} em telas - ${formatarMinutos(tempoVidaReal)} fora delas`;
  metricaAtividades.textContent = resumo.totalActivities;
  metricaPlanejado.textContent = formatarMinutos(resumo.totalPlanned);
  metricaConcluido.textContent = formatarMinutos(resumo.totalCompleted);
  metricaProdutividade.textContent = `${resumo.productivity}%`;
  medidorTela.style.width = `${porcentagemTela}%`;
  medidorVida.style.width = `${porcentagemVida}%`;
}

async function carregarPainelUsuario() {
  if (!pegarSessao().user) {
    painelUsuario = null;
    renderizarResumoHome();
    gerarInsightPessoal();
    return;
  }

  try {
    painelUsuario = await pedirApi("/api/dashboard");
    renderizarResumoHome();
    gerarInsightPessoal();
  } catch (error) {
    painelUsuario = null;
    renderizarResumoHome();
    mostrarAviso(error.message);
  }
}

function totalMinutosPlanejados() {
  return rotina.reduce((sum, block) => sum + block.minutes, 0);
}

function podeAdicionarMinutos(minutes) {
  if (totalMinutosPlanejados() + minutes <= MAX_MINUTOS_DIA) return true;
  mostrarAviso("Sua rotina nao pode ultrapassar 24 horas.");
  return false;
}

function mostrarAviso(message) {
  aviso.textContent = message;
  aviso.classList.add("show");
  window.setTimeout(() => aviso.classList.remove("show"), 2600);
}

function formatarMinutos(minutes) {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h${String(rest).padStart(2, "0")}` : `${hours}h`;
}

function montarBlocoDoElemento(element) {
  return {
    id: crypto.randomUUID(),
    label: element.dataset.label,
    type: element.dataset.type,
    minutes: Number(element.dataset.minutes),
    completedMinutes: 0,
    tone: element.dataset.tone || (element.dataset.type === "life" ? "green" : "violet")
  };
}

function calcularEquilibrio() {
  const screen = rotina.filter((block) => block.type === "screen").reduce((sum, block) => sum + block.minutes, 0);
  const life = rotina.filter((block) => block.type === "life").reduce((sum, block) => sum + block.minutes, 0);
  const completedScreen = rotina.filter((block) => block.type === "screen").reduce((sum, block) => sum + (block.completedMinutes || 0), 0);
  const completedLife = rotina.filter((block) => block.type === "life").reduce((sum, block) => sum + (block.completedMinutes || 0), 0);
  const total = screen + life;
  const breaks = rotina.filter((block) => block.type === "life").length;

  if (!total) {
    return { screen, life, completedScreen, completedLife, total, breaks, score: 0 };
  }

  const screenRatio = screen / total;
  const targetRatio = 0.62;
  const balanceScore = 100 - Math.abs(screenRatio - targetRatio) * 135;
  const breakBonus = Math.min(18, breaks * 5);
  const overloadPenalty = Math.max(0, screen - 360) / 12;
  const score = Math.max(0, Math.min(100, Math.round(balanceScore + breakBonus - overloadPenalty)));

  return { screen, life, completedScreen, completedLife, total, breaks, score };
}

function mensagemDoScore(score) {
  if (score >= 85) {
    return {
      title: "Chups Tech: equilibrio excelente.",
      message: "Seu dia combina blocos de foco com recuperacao real.",
      tip: "Mantenha pausas longe da tela para preservar energia mental."
    };
  }

  if (score >= 65) {
    return {
      title: "Chups Tech: rotina saudavel.",
      message: "A rotina esta boa, mas ainda pode ganhar mais respiro.",
      tip: "Inclua uma pausa curta entre blocos longos de implementacao."
    };
  }

  if (score >= 40) {
    return {
      title: "Chups Tech: rotina em alerta.",
      message: "Existe muito tempo de tela sem compensacao suficiente.",
      tip: "Troque um bloco de tela por refeicao, exercicio ou pausa sem celular."
    };
  }

  return {
    title: "Comece pelo equilibrio.",
    message: "Arraste blocos de foco e vida real para montar um dia sustentavel.",
    tip: "A cada 90 minutos de foco, encaixe uma pausa real."
  };
}

function renderizarRotina() {
  areaSoltar.innerHTML = "";

  if (!rotina.length) {
    areaSoltar.innerHTML = `<p class="estado-vazio">Arraste blocos para ca e monte seu dia.</p>`;
  } else {
    rotina.forEach((block) => {
      const item = document.createElement("article");
      const classeTom = { violet: "tom-roxo", blue: "tom-azul", green: "tom-verde" }[block.tone] || "tom-roxo";
      item.className = `bloco-agendado ${block.type === "life" ? "vida-real" : ""} ${classeTom}`;
      item.innerHTML = `
        <span class="tempo-bloco">${formatarMinutos(block.minutes)}</span>
        <div>
          <strong>${block.label}</strong>
          <small>${block.type === "screen" ? "Tempo de tela produtivo" : "Vida real e recuperacao"} - ${formatarMinutos(block.completedMinutes || 0)} concluidos</small>
        </div>
        <button class="remover-bloco" type="button" aria-label="Remover ${block.label}" data-id="${block.id}">x</button>
      `;
      areaSoltar.appendChild(item);
      configurarAnimacaoSegurar(item);
    });
  }

  areaSoltar.querySelectorAll("[data-id]").forEach((button) => {
    button.addEventListener("click", () => {
      rotina = rotina.filter((block) => block.id !== button.dataset.id);
      renderizarRotina();
      atualizarEquilibrio();
    });
  });
}

function atualizarEquilibrio() {
  const { screen, life, completedScreen, completedLife, total, breaks, score } = calcularEquilibrio();
  const feedback = mensagemDoScore(score);
  const visibleScreen = modoGrafico === "completed" ? completedScreen : screen;
  const visibleLife = modoGrafico === "completed" ? completedLife : life;
  const visibleTotal = visibleScreen + visibleLife;
  const screenPercent = visibleTotal ? Math.round((visibleScreen / visibleTotal) * 100) : 0;
  const lifePercent = visibleTotal ? Math.round((visibleLife / visibleTotal) * 100) : 0;

  valorScore.textContent = score;
  tituloScore.textContent = feedback.title;
  mensagemScore.textContent = feedback.message;
  dicaEquilibrio.textContent = feedback.tip;
  minutosTelaEl.textContent = formatarMinutos(visibleScreen);
  minutosVidaEl.textContent = formatarMinutos(visibleLife);
  barraTela.style.width = `${screenPercent}%`;
  barraVida.style.width = `${lifePercent}%`;
  document.documentElement.style.setProperty("--score-angle", `${score * 3.6}deg`);

  renderizarResumoHome();
}

function exportarRotina() {
  const { screen, life, score } = calcularEquilibrio();
  const lines = [
    "Chups Tech - rotina do programador",
    "",
    `Score de equilibrio: ${score}`,
    `Tempo de tela: ${formatarMinutos(screen)}`,
    `Vida real: ${formatarMinutos(life)}`,
    "",
    "Rotina:"
  ];

  rotina.forEach((block, index) => {
    lines.push(`${index + 1}. ${block.label} - ${formatarMinutos(block.minutes)} - ${block.type === "screen" ? "tela" : "vida real"}`);
  });

  lines.push("", "Projetos:");
  projetos.forEach((project) => {
    lines.push(`- ${project.name}: ${project.tasks.join("; ")}`);
  });

  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "rotina-chups-tech.txt";
  link.click();
  URL.revokeObjectURL(url);
  mostrarAviso("Rotina exportada.");
}

function renderizarProjetos() {
  listaProjetos.innerHTML = "";
  const { user } = pegarSessao();

  if (!user) {
    listaProjetos.innerHTML = `<p class="projeto-vazio">Entre na sua conta para salvar e consultar seus projetos.</p>`;
    return;
  }

  if (!projetos.length) {
    listaProjetos.innerHTML = `<p class="projeto-vazio">Nenhum projeto salvo ainda. Crie o primeiro acima.</p>`;
    return;
  }

  projetos.forEach((project) => {
    const card = document.createElement("article");
    card.className = "cartao-projeto";
    card.innerHTML = `
      <span>Projeto atual</span>
      <h3>${project.name}</h3>
      <ul>
        ${project.tasks.map((task) => `<li>${task}</li>`).join("")}
      </ul>
      <button class="botao secundario" type="button" data-project="${project.id}">Remover</button>
    `;
    listaProjetos.appendChild(card);
  });

  listaProjetos.querySelectorAll("[data-project]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await pedirApi(`/api/projetos/${button.dataset.project}`, { method: "DELETE" });
        projetos = projetos.filter((project) => project.id !== button.dataset.project);
        renderizarProjetos();
        mostrarAviso("Projeto removido.");
      } catch (error) {
        mostrarAviso(error.message);
      }
    });
  });
}

async function carregarProjetos() {
  if (!pegarSessao().user) {
    projetos = [];
    renderizarProjetos();
    return;
  }

  try {
    projetos = await pedirApi("/api/projetos");
    renderizarProjetos();
  } catch (error) {
    mostrarAviso(error.message);
  }
}

async function adicionarProjeto() {
  const nameInput = document.querySelector("#nomeProjeto");
  const tasksInput = document.querySelector("#tarefasProjeto");
  const name = nameInput.value.trim();
  const tasks = tasksInput.value
    .split(",")
    .map((task) => task.trim())
    .filter(Boolean);

  if (!name || !tasks.length) {
    mostrarAviso("Informe o nome do projeto e pelo menos uma pendencia separada por virgula.");
    return;
  }
  if (!pegarSessao().user) {
    mostrarAviso("Entre na sua conta para salvar projetos.");
    location.hash = "#conta";
    return;
  }

  try {
    const project = await pedirApi("/api/projetos", {
      method: "POST",
      body: JSON.stringify({ name, tasks })
    });
    projetos.unshift(project);

    nameInput.value = "";
    tasksInput.value = "";
    renderizarProjetos();
    mostrarAviso("Projeto salvo na sua conta.");
  } catch (error) {
    mostrarAviso(error.message);
  }
}

function animarSegurarInicio(element) {
  element.classList.add("segurando");

  if (!window.gsap || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  window.gsap.to(element, {
    scale: 1.045,
    rotate: -1.2,
    y: -4,
    duration: 0.18,
    ease: "power2.out"
  });
}

function animarSegurarFim(element) {
  element.classList.remove("segurando");

  if (!window.gsap || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  window.gsap.to(element, {
    scale: 1,
    rotate: 0,
    y: 0,
    duration: 0.22,
    ease: "elastic.out(1, 0.5)"
  });
}

function configurarAnimacaoSegurar(element) {
  if (element.dataset.holdBound === "true") return;
  element.dataset.holdBound = "true";

  element.addEventListener("pointerdown", () => animarSegurarInicio(element));
  element.addEventListener("pointerup", () => animarSegurarFim(element));
  element.addEventListener("pointerleave", () => animarSegurarFim(element));
  element.addEventListener("pointercancel", () => animarSegurarFim(element));
}

function configurarBlocoRotina(block) {
  if (block.dataset.bound === "true") return;
  block.dataset.bound = "true";
  configurarAnimacaoSegurar(block);

  block.addEventListener("dragstart", (event) => {
    block.dataset.dragging = "true";
    animarSegurarInicio(block);
    event.dataTransfer.setData("application/json", JSON.stringify(montarBlocoDoElemento(block)));
  });

  block.addEventListener("dragend", () => {
    animarSegurarFim(block);
    window.setTimeout(() => {
      block.dataset.dragging = "false";
    }, 80);
  });

  block.addEventListener("click", () => {
    if (block.dataset.dragging === "true") return;
    const payload = montarBlocoDoElemento(block);
    if (!podeAdicionarMinutos(payload.minutes)) return;
    rotina.push(payload);
    renderizarRotina();
    atualizarEquilibrio();
    mostrarAviso("Bloco adicionado a rotina.");
  });
}

function criarBlocoPersonalizado(event) {
  event.preventDefault();

  const nameInput = document.querySelector("#nomeBlocoPersonalizado");
  const minutesInput = document.querySelector("#minutosBlocoPersonalizado");
  const typeInput = document.querySelector("#tipoBlocoPersonalizado");
  const toneInput = document.querySelector("#tomBlocoPersonalizado");
  const name = nameInput.value.trim();
  const minutes = Number(minutesInput.value);

  if (!name || !Number.isFinite(minutes) || minutes < 5) {
    mostrarAviso("Informe um nome e um tempo de pelo menos 5 minutos.");
    return;
  }
  if (minutes > MAX_MINUTOS_DIA) {
    mostrarAviso("Um card nao pode ter mais de 24 horas.");
    return;
  }

  const type = typeInput.value;
  const tone = toneInput.value;
  const card = document.createElement("button");
  const classeTom = { violet: "tom-roxo", blue: "tom-azul", green: "tom-verde" }[tone] || "tom-roxo";
  card.className = `bloco-rotina modelo ${type === "life" ? "vida-real" : ""} ${classeTom}`;
  card.type = "button";
  card.draggable = true;
  card.dataset.type = type;
  card.dataset.label = name;
  card.dataset.minutes = String(minutes);
  card.dataset.tone = tone;
  card.innerHTML = `
    <span>Personalizado</span>
    <strong>${name}</strong>
    <small>${formatarMinutos(minutes)} - ${type === "screen" ? "tela" : "vida real"}</small>
  `;

  event.currentTarget.before(card);
  configurarBlocoRotina(card);

  if (window.gsap) {
    window.gsap.from(card, { autoAlpha: 0, y: 18, scale: 0.96, duration: 0.45, ease: "power2.out" });
  }

  nameInput.value = "";
  minutesInput.value = "50";
  mostrarAviso("Card personalizado criado.");
}

function configurarPlanejador() {
  document.querySelectorAll(".bloco-rotina.modelo").forEach(configurarBlocoRotina);

  areaSoltar.addEventListener("dragover", (event) => {
    event.preventDefault();
    areaSoltar.classList.add("arrastando-em-cima");
  });

  areaSoltar.addEventListener("dragleave", () => {
    areaSoltar.classList.remove("arrastando-em-cima");
  });

  areaSoltar.addEventListener("drop", (event) => {
    event.preventDefault();
    areaSoltar.classList.remove("arrastando-em-cima");
    const raw = event.dataTransfer.getData("application/json");
    if (!raw) return;

    const payload = JSON.parse(raw);
    if (!podeAdicionarMinutos(payload.minutes)) return;
    rotina.push(payload);
    renderizarRotina();
    atualizarEquilibrio();
  });

  document.querySelector("#limparPlanejador").addEventListener("click", () => {
    rotina = [];
    renderizarRotina();
    atualizarEquilibrio();
  });

  document.querySelector("#exportarRotina").addEventListener("click", exportarRotina);
  document.querySelector("#adicionarProjeto").addEventListener("click", adicionarProjeto);
  document.querySelector("#formBlocoPersonalizado").addEventListener("submit", criarBlocoPersonalizado);
  document.querySelector("#concluirRotina").addEventListener("click", concluirRotina);
  document.querySelector("#alternarCronometro").addEventListener("click", alternarCronometro);
  document.querySelector("#zerarCronometro").addEventListener("click", zerarCronometro);
  document.querySelectorAll("[data-chart-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      modoGrafico = button.dataset.modoGrafico;
      document.querySelectorAll("[data-chart-mode]").forEach((item) => {
        item.classList.toggle("ativo", item === button);
      });
      atualizarEquilibrio();
    });
  });
}

function configurarFormulariosAcesso() {
  const formLogin = document.querySelector("#formLogin");
  const formCadastro = document.querySelector("#formCadastro");

  async function pedirAutenticacao(endpoint, payload) {
    const response = await fetch(`/api/auth/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Nao foi possivel autenticar.");
    localStorage.setItem("chupsTechToken", data.token);
    localStorage.setItem("chupsTechUser", JSON.stringify(data.user));
    return data;
  }

  formLogin.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      const data = await pedirAutenticacao("login", {
        email: document.querySelector("#emailLogin").value,
        password: document.querySelector("#senhaLogin").value
      });
      formLogin.reset();
      mostrarAviso(`Bem-vindo de volta, ${data.user.name}.`);
      atualizarTelaConta();
      await Promise.all([carregarProjetos(), carregarPainelUsuario()]);
      location.hash = "#projetos";
    } catch (error) {
      mostrarAviso(error.message);
    }
  });

  formCadastro.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      const data = await pedirAutenticacao("register", {
        name: document.querySelector("#nomeCadastro").value,
        email: document.querySelector("#emailCadastro").value,
        password: document.querySelector("#senhaCadastro").value,
        stack: document.querySelector("#stackCadastro").value
      });
      formCadastro.reset();
      mostrarAviso(`Conta criada para ${data.user.name}.`);
      atualizarTelaConta();
      await Promise.all([carregarProjetos(), carregarPainelUsuario()]);
      location.hash = "#projetos";
    } catch (error) {
      mostrarAviso(error.message);
    }
  });
}

function formatarCronometro(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

function atualizarTelaCronometro() {
  document.querySelector("#visorCronometro").textContent = formatarCronometro(segundosCronometro);
  document.querySelector("#alternarCronometro").textContent = intervaloCronometro ? "Pausar" : segundosCronometro ? "Continuar" : "Iniciar";
  document.querySelector("#statusCronometro").textContent = intervaloCronometro ? "Cronometro em andamento" : segundosCronometro ? "Pausado" : "Pronto para iniciar";
}

function alternarCronometro() {
  if (intervaloCronometro) {
    clearInterval(intervaloCronometro);
    intervaloCronometro = null;
  } else {
    intervaloCronometro = window.setInterval(() => {
      segundosCronometro += 1;
      atualizarTelaCronometro();
    }, 1000);
  }
  atualizarTelaCronometro();
}

function zerarCronometro() {
  if (intervaloCronometro) clearInterval(intervaloCronometro);
  intervaloCronometro = null;
  segundosCronometro = 0;
  atualizarTelaCronometro();
}

function concluirRotina() {
  if (!rotina.length) {
    mostrarAviso("Adicione blocos antes de concluir a rotina.");
    return;
  }

  rotina = rotina.map((block) => ({ ...block, completedMinutes: block.minutes }));
  renderizarRotina();
  atualizarEquilibrio();
  mostrarAviso("Rotina concluida. Bom trabalho.");
}

function gerarInsightPessoal() {
  const textoInsight = document.querySelector("#insightPessoal");
  const { user } = pegarSessao();

  if (!user) {
    textoInsight.textContent = "Entre na sua conta para analisar suas atividades salvas.";
    return;
  }

  if (!painelUsuario) {
    textoInsight.textContent = "Carregando seu historico...";
    return;
  }

  const resumo = painelUsuario.summary;
  const { atividades, tempoTela, tempoVidaReal } = montarUsoDoBanco();
  if (!atividades.length) {
    textoInsight.textContent = "Sua conta ainda nao possui atividades salvas. Cadastre atividades para receber uma analise personalizada.";
    return;
  }

  const melhorCategoria = painelUsuario.byCategory
    .slice()
    .sort((a, b) => b.minutes - a.minutes)[0];
  let recomendacao = "Continue registrando suas atividades para acompanhar sua evolucao.";

  if (tempoTela > tempoVidaReal * 2) {
    recomendacao = "Seu tempo de tela esta alto. Inclua uma atividade de saude ou bem-estar entre blocos longos.";
  } else if (resumo.productivity < 60) {
    recomendacao = "Sua execucao esta abaixo do planejado. Tente planejar menos atividades e concluir as mais importantes primeiro.";
  } else if (resumo.averageEnergy < 3) {
    recomendacao = "Sua energia media esta baixa. Reserve pausas reais antes de aumentar a carga de trabalho.";
  } else if (resumo.productivity >= 80) {
    recomendacao = "Seu historico esta consistente. Mantenha a carga atual e proteja seus horarios de pausa.";
  }

  textoInsight.textContent = `Voce concluiu ${resumo.productivity}% do tempo planejado em ${resumo.totalActivities} atividades. Sua energia media foi ${resumo.averageEnergy}/5. Categoria com mais tempo concluido: ${melhorCategoria?.category || "sem categoria"}. ${recomendacao}`;
}

function configurarInsights() {
  document.querySelector("#gerarInsight").addEventListener("click", gerarInsightPessoal);
  gerarInsightPessoal();
}

function trocarTela() {
  const current = location.hash.replace("#", "") || "visao";
  document.querySelectorAll(".pagina").forEach((page) => {
    page.classList.toggle("ativo", page.id === current);
  });
  document.querySelectorAll(".navegacao a").forEach((link) => {
    link.classList.toggle("ativo", link.getAttribute("href") === `#${current}`);
  });

  animarPaginaAtiva();
  requestAnimationFrame(() => {
    if (window.chupsTechLenis) {
      window.chupsTechLenis.scrollTo(0, { immediate: true });
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  });

  if (window.ScrollTrigger) {
    window.setTimeout(() => window.ScrollTrigger.refresh(true), 120);
  }

  window.dispatchEvent(new CustomEvent("chups-tech:trocarTela", { detail: { current } }));
}

function iniciarLenis() {
  if (!window.Lenis || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const lenis = new window.Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    lerp: 0.08,
    smoothWheel: true
  });
  window.chupsTechLenis = lenis;

  if (window.ScrollTrigger) {
    lenis.on("scroll", window.ScrollTrigger.update);
  }

  if (window.gsap) {
    window.gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    window.gsap.ticker.lagSmoothing(0);
    return;
  }

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);
}

function iniciarSwiper() {
  if (!window.Swiper) return;

  document.querySelectorAll(".carrossel-avaliacoes").forEach((swiper) => {
    new window.Swiper(swiper, {
      loop: true,
      speed: 800,
      grabCursor: true,
      spaceBetween: 18,
      slidesPerView: 1,
      autoplay: {
        delay: 3600,
        disableOnInteraction: false
      },
      pagination: {
        el: swiper.querySelector(".swiper-pagination"),
        clickable: true
      },
      breakpoints: {
        760: { slidesPerView: 2 },
        1120: { slidesPerView: 3 }
      }
    });
  });
}

function iniciarBrilhoJquery() {
  if (!window.jQuery) return;

  const selector = ".cartao-resumo, .lateral-resumo, .metricas article, .grade-sobre article, .biblioteca-blocos, .quadro-dia, .painel-score, .painel-bloco-personalizado, .criador-projeto, .cartao-projeto, .cartao-insight, .cartao-avaliacao, .cartao-acesso, .rodape-site";
  window.jQuery(selector).on("mousemove", function (event) {
    const rect = this.getBoundingClientRect();
    this.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    this.style.setProperty("--my", `${event.clientY - rect.top}px`);
  });
}

function separarTextoElemento(element) {
  if (!window.SplitText) return null;

  try {
    const split = window.SplitText.create
      ? window.SplitText.create(element, { type: "words,chars" })
      : new window.SplitText(element, { type: "words,chars" });

    split.words.forEach((word) => word.classList.add("split-word"));
    split.chars.forEach((char) => char.classList.add("split-char"));
    return split;
  } catch (error) {
    return null;
  }
}

function iniciarGsap() {
  if (!window.gsap) return;

  const { gsap } = window;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(window.SplitText);
  if (prefersReducedMotion) return;

  gsap.from(".cabecalho", {
    autoAlpha: 0,
    y: -26,
    duration: 0.9,
    ease: "power3.out"
  });

  gsap.from(".campo-sinal", {
    autoAlpha: 0,
    y: -36,
    duration: 1.2,
    ease: "power3.out",
    delay: 0.15
  });

  document.querySelectorAll("[data-split]").forEach((element) => {
    if (!element.getClientRects().length) return;

    const split = separarTextoElemento(element);
    const target = split ? split.chars : element;
    const isHeroText = Boolean(element.closest(".conteudo-inicial"));
    const tween = {
      yPercent: 80,
      rotateX: -40,
      stagger: 0.012,
      duration: 0.72,
      ease: "power3.out",
      delay: isHeroText ? 0.16 : 0,
      scrollTrigger: !isHeroText && window.ScrollTrigger
        ? { trigger: element, start: "top 84%", once: true }
        : undefined
    };

    if (!isHeroText) tween.autoAlpha = 0;
    gsap.from(target, tween);
  });

  gsap.from(".resumo-painel, .metricas article", {
    autoAlpha: 0,
    y: 70,
    scale: 0.98,
    stagger: 0.08,
    duration: 1,
    ease: "power3.out",
    delay: 0.25
  });

  gsap.from(".acoes-iniciais .botao", {
    autoAlpha: 0,
    y: 18,
    stagger: 0.08,
    duration: 0.7,
    ease: "power2.out",
    delay: 0.42
  });

  if (window.ScrollTrigger) {
    gsap.utils.toArray(".pagina-conteudo, .secao-avaliacoes").forEach((section) => {
      const targets = section.querySelectorAll(".titulo-secao, .grade-sobre article, .area-planejador, .painel-bloco-personalizado, .criador-projeto, .cartao-projeto, .cartao-insight, .cartao-avaliacao, .cartao-acesso");
      gsap.from(targets, {
        y: 54,
        stagger: 0.08,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 76%", once: true }
      });
    });
  }
}

function iniciarAnimacaoIntroducao() {
  const intro = document.querySelector("#introSite");
  if (!intro) return;

  if (!window.gsap || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    intro.remove();
    return;
  }

  const { gsap } = window;
  const split = separarTextoElemento(intro.querySelector("[data-intro-split]"));
  const titleTargets = split ? split.chars : intro.querySelector("[data-intro-split]");
  const timeline = gsap.timeline({
    defaults: { ease: "power3.out" },
    onComplete: () => intro.remove()
  });

  timeline
    .from(".simbolo-intro i", {
      autoAlpha: 0,
      scale: 0,
      rotate: 45,
      stagger: 0.05,
      duration: 0.45
    })
    .from(titleTargets, {
      yPercent: 90,
      autoAlpha: 0,
      stagger: 0.035,
      duration: 0.68
    }, "-=0.1")
    .from(".intro-site span", {
      autoAlpha: 0,
      y: 14,
      duration: 0.5
    }, "-=0.25")
    .to(".intro-site", {
      clipPath: "inset(0 0 100% 0)",
      duration: 0.82,
      delay: 0.35
    });
}

function animarPaginaAtiva() {
  if (!window.gsap || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const page = document.querySelector(".pagina.ativo");
  if (!page) return;

  const targets = page.querySelectorAll(".titulo-secao, .grade-sobre article, .area-planejador, .criador-projeto, .cartao-projeto, .cartao-insight, .cartao-acesso");
  if (!targets.length) return;

  window.gsap.fromTo(
    targets,
    { y: 28 },
    { y: 0, stagger: 0.045, duration: 0.55, ease: "power2.out" }
  );
}

function iniciarParticulas() {
  const canvas = document.querySelector("#canvasParticulas");
  const paginaInicial = document.querySelector("#visao");
  if (!canvas || !paginaInicial) return;

  const contexto = canvas.getContext("2d");
  const movimentoReduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cores = ["#7543d9", "#9361ef", "#b28cff", "#6840c9"];
  const mouse = { x: 0, y: 0, destinoX: 0, destinoY: 0 };
  let largura = 0;
  let altura = 0;
  let linhas = [];
  let particulas = [];
  let quadroAnimacao = null;
  let quadroRedimensionar = null;
  let paginaVisivel = !document.hidden;
  let inicioAtivo = paginaInicial.classList.contains("ativo");
  let portal = { x: 0, y: 0 };

  function numeroAleatorio(minimo, maximo) {
    return Math.random() * (maximo - minimo) + minimo;
  }

  function corComTransparencia(cor, transparencia) {
    const valor = cor.replace("#", "");
    const vermelho = parseInt(valor.substring(0, 2), 16);
    const verde = parseInt(valor.substring(2, 4), 16);
    const azul = parseInt(valor.substring(4, 6), 16);
    return `rgba(${vermelho}, ${verde}, ${azul}, ${transparencia})`;
  }

  function pontoNaCurva(inicio, controle1, controle2, fim, tempo) {
    const inverso = 1 - tempo;
    return {
      x: inverso ** 3 * inicio.x + 3 * inverso ** 2 * tempo * controle1.x + 3 * inverso * tempo ** 2 * controle2.x + tempo ** 3 * fim.x,
      y: inverso ** 3 * inicio.y + 3 * inverso ** 2 * tempo * controle1.y + 3 * inverso * tempo ** 2 * controle2.y + tempo ** 3 * fim.y
    };
  }

  function criarCenario() {
    linhas = [];
    particulas = [];
    const celular = largura < 768;
    const quantidadeLinhas = celular ? 12 : 22;
    const centroX = portal.x;
    const fundo = Math.max(altura * 0.88, portal.y + 420);

    for (let indice = 0; indice < quantidadeLinhas; indice += 1) {
      const progresso = indice / (quantidadeLinhas - 1);
      const inicioX = progresso * largura + numeroAleatorio(-32, 32);
      const lado = inicioX < centroX ? -1 : 1;
      linhas.push({
        inicio: { x: inicioX, y: fundo + numeroAleatorio(10, 90) },
        controle1: { x: inicioX + numeroAleatorio(-48, 48), y: altura * numeroAleatorio(0.58, 0.82) },
        controle2: { x: centroX + lado * numeroAleatorio(16, 78), y: portal.y + numeroAleatorio(80, 190) },
        fim: { x: centroX + numeroAleatorio(-4, 4), y: portal.y + numeroAleatorio(-3, 4) },
        cor: cores[indice % cores.length],
        transparencia: numeroAleatorio(0.22, 0.52),
        grossura: numeroAleatorio(0.65, 1.25),
        onda: numeroAleatorio(0, Math.PI * 2)
      });

      particulas.push({
        indiceLinha: indice,
        posicao: numeroAleatorio(0, 1),
        velocidade: numeroAleatorio(0.0015, 0.003),
        tamanho: numeroAleatorio(1.2, 2.4),
        transparencia: numeroAleatorio(0.5, 0.9)
      });
    }
  }

  function redimensionarCanvas() {
    const caixaInicial = paginaInicial.getBoundingClientRect();
    const cabecalho = document.querySelector(".cabecalho");
    const caixaHeader = cabecalho?.getBoundingClientRect();
    const topoCanvas = Math.min(0, (caixaHeader?.top || caixaInicial.top) - caixaInicial.top);
    const densidade = Math.min(window.devicePixelRatio || 1, 1.25);
    largura = caixaInicial.width;
    altura = Math.min(paginaInicial.offsetHeight - topoCanvas, window.innerHeight - topoCanvas);
    portal = {
      x: caixaHeader ? caixaHeader.left + caixaHeader.width / 2 - caixaInicial.left : largura / 2,
      y: caixaHeader ? caixaHeader.bottom - caixaInicial.top - topoCanvas : 80
    };
    canvas.width = Math.floor(largura * densidade);
    canvas.height = Math.floor(altura * densidade);
    canvas.style.width = `${largura}px`;
    canvas.style.height = `${altura}px`;
    canvas.style.top = `${topoCanvas}px`;
    contexto.setTransform(densidade, 0, 0, densidade, 0, 0);
    criarCenario();
  }

  function desenharPortal() {
    const x = portal.x;
    const y = portal.y;
    const raio = largura < 768 ? 92 : 150;
    const brilho = contexto.createRadialGradient(x, y, 0, x, y, raio);
    brilho.addColorStop(0, "rgba(255, 255, 255, 0.78)");
    brilho.addColorStop(0.14, "rgba(178, 140, 255, 0.5)");
    brilho.addColorStop(0.45, "rgba(139, 91, 232, 0.25)");
    brilho.addColorStop(1, "rgba(139, 91, 232, 0)");
    contexto.fillStyle = brilho;
    contexto.beginPath();
    contexto.arc(x, y, raio, 0, Math.PI * 2);
    contexto.fill();

    [22, 36, 52].forEach((tamanho, indice) => {
      contexto.strokeStyle = `rgba(119, 73, 214, ${0.42 - indice * 0.09})`;
      contexto.lineWidth = 1.15;
      contexto.beginPath();
      contexto.ellipse(x, y, tamanho * 1.8, tamanho * 0.48, 0, 0, Math.PI * 2);
      contexto.stroke();
    });
  }

  function moverLinha(linha, tempo) {
    const onda = Math.sin(tempo * 0.0008 + linha.onda) * 6;
    return {
      inicio: linha.inicio,
      controle1: { x: linha.controle1.x + onda, y: linha.controle1.y },
      controle2: { x: linha.controle2.x + mouse.x * 5 - onda * 0.4, y: linha.controle2.y + mouse.y * 3 },
      fim: linha.fim
    };
  }

  function desenharLinhas(tempo) {
    linhas.forEach((linha) => {
      const pontos = moverLinha(linha, tempo);
      contexto.beginPath();
      contexto.moveTo(pontos.inicio.x, pontos.inicio.y);
      contexto.bezierCurveTo(pontos.controle1.x, pontos.controle1.y, pontos.controle2.x, pontos.controle2.y, pontos.fim.x, pontos.fim.y);
      contexto.strokeStyle = corComTransparencia(linha.cor, linha.transparencia * 0.15);
      contexto.lineWidth = linha.grossura * 4.2;
      contexto.stroke();

      contexto.beginPath();
      contexto.moveTo(pontos.inicio.x, pontos.inicio.y);
      contexto.bezierCurveTo(pontos.controle1.x, pontos.controle1.y, pontos.controle2.x, pontos.controle2.y, pontos.fim.x, pontos.fim.y);
      contexto.strokeStyle = corComTransparencia(linha.cor, linha.transparencia);
      contexto.lineWidth = linha.grossura;
      contexto.stroke();
    });
  }

  function desenharParticulas(tempo) {
    particulas.forEach((particula) => {
      const linha = linhas[particula.indiceLinha];
      const pontos = moverLinha(linha, tempo);
      particula.posicao = (particula.posicao + particula.velocidade) % 1;
      const ponto = pontoNaCurva(pontos.inicio, pontos.controle1, pontos.controle2, pontos.fim, particula.posicao);
      const transparencia = particula.transparencia * Math.min(particula.posicao * 3, 1) * Math.min((1 - particula.posicao) * 4, 1);

      contexto.fillStyle = corComTransparencia(linha.cor, transparencia * 0.2);
      contexto.beginPath();
      contexto.arc(ponto.x, ponto.y, particula.tamanho * 3.2, 0, Math.PI * 2);
      contexto.fill();
      contexto.fillStyle = corComTransparencia(linha.cor, transparencia);
      contexto.beginPath();
      contexto.arc(ponto.x, ponto.y, particula.tamanho, 0, Math.PI * 2);
      contexto.fill();
    });
  }

  function desenhar(tempo = 0) {
    contexto.clearRect(0, 0, largura, altura);
    if (!inicioAtivo) {
      canvas.classList.remove("visivel");
      return;
    }
    canvas.classList.add("visivel");
    mouse.x += (mouse.destinoX - mouse.x) * 0.05;
    mouse.y += (mouse.destinoY - mouse.y) * 0.05;
    desenharPortal();
    desenharLinhas(tempo);
    desenharParticulas(tempo);
  }

  function animar(tempo) {
    if (!inicioAtivo || !paginaVisivel || movimentoReduzido) return;
    desenhar(tempo);
    quadroAnimacao = requestAnimationFrame(animar);
  }

  function iniciarAnimacao() {
    if (quadroAnimacao) cancelAnimationFrame(quadroAnimacao);
    desenhar();
    if (!movimentoReduzido && inicioAtivo && paginaVisivel) {
      quadroAnimacao = requestAnimationFrame(animar);
    }
  }

  function pararAnimacao() {
    if (quadroAnimacao) cancelAnimationFrame(quadroAnimacao);
    quadroAnimacao = null;
    contexto.clearRect(0, 0, largura, altura);
    canvas.classList.remove("visivel");
  }

  paginaInicial.addEventListener("pointermove", (evento) => {
    mouse.destinoX = evento.clientX / largura - 0.5;
    mouse.destinoY = evento.clientY / altura - 0.5;
  }, { passive: true });

  window.addEventListener("chups-tech:trocarTela", (evento) => {
    inicioAtivo = evento.detail.current === "visao";
    if (inicioAtivo) {
      criarCenario();
      iniciarAnimacao();
    } else {
      pararAnimacao();
    }
  });

  document.addEventListener("visibilitychange", () => {
    paginaVisivel = !document.hidden;
    if (paginaVisivel) {
      iniciarAnimacao();
    } else {
      pararAnimacao();
    }
  });

  window.addEventListener("resize", () => {
    if (quadroRedimensionar) cancelAnimationFrame(quadroRedimensionar);
    quadroRedimensionar = requestAnimationFrame(() => {
      redimensionarCanvas();
      iniciarAnimacao();
    });
  });

  redimensionarCanvas();
  iniciarAnimacao();
}

function iniciarBotoesInterativos() {
  const movimentoReduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const seletor = ".botao, .botao-sair, .botao-grafico, .remover-bloco";

  function prepararBotao(botao) {
    if (botao.dataset.animacaoBotao) return;
    botao.dataset.animacaoBotao = "pronta";

    botao.addEventListener("pointermove", (evento) => {
      const caixa = botao.getBoundingClientRect();
      botao.style.setProperty("--botao-x", `${evento.clientX - caixa.left}px`);
      botao.style.setProperty("--botao-y", `${evento.clientY - caixa.top}px`);

      if (!window.gsap || movimentoReduzido) return;
      const deslocamentoX = ((evento.clientX - caixa.left) / caixa.width - 0.5) * 8;
      const deslocamentoY = ((evento.clientY - caixa.top) / caixa.height - 0.5) * 6;
      window.gsap.to(botao, { x: deslocamentoX, y: deslocamentoY, scale: 1.035, duration: 0.24, ease: "power2.out" });
    });

    botao.addEventListener("pointerleave", () => {
      if (!window.gsap || movimentoReduzido) return;
      window.gsap.to(botao, { x: 0, y: 0, scale: 1, duration: 0.42, ease: "elastic.out(1, 0.45)" });
    });

    botao.addEventListener("pointerdown", () => {
      if (!window.gsap || movimentoReduzido) return;
      window.gsap.to(botao, { scale: 0.95, duration: 0.1, ease: "power2.out" });
    });

    botao.addEventListener("pointerup", () => {
      if (!window.gsap || movimentoReduzido) return;
      window.gsap.to(botao, { scale: 1.035, duration: 0.2, ease: "back.out(2)" });
    });
  }

  function prepararBotoes() {
    document.querySelectorAll(seletor).forEach(prepararBotao);
  }

  prepararBotoes();
  new MutationObserver(prepararBotoes).observe(document.body, { childList: true, subtree: true });

  if (!window.THREE || movimentoReduzido) return;

  document.querySelectorAll(".acoes-iniciais .botao.principal, .botao-navegacao").forEach((botao) => {
    if (botao.dataset.webglBotao) return;
    botao.dataset.webglBotao = "pronto";
    botao.classList.add("botao-webgl");

    const largura = Math.max(1, botao.offsetWidth);
    const altura = Math.max(1, botao.offsetHeight);
    const cena = new window.THREE.Scene();
    const camera = new window.THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderizador = new window.THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderizador.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    renderizador.setSize(largura, altura, false);

    const material = new window.THREE.ShaderMaterial({
      transparent: true,
      uniforms: { tempo: { value: 0 } },
      vertexShader: "void main(){gl_Position=vec4(position,1.0);}",
      fragmentShader: `
        uniform float tempo;
        void main() {
          vec2 uv = gl_FragCoord.xy / vec2(${largura.toFixed(1)}, ${altura.toFixed(1)});
          float onda = sin((uv.x + tempo * 0.3) * 9.0) * 0.08;
          float brilho = smoothstep(0.72, 0.08, distance(uv, vec2(0.5 + onda, 0.52)));
          gl_FragColor = vec4(0.56, 0.30, 0.96, brilho * 0.38);
        }
      `
    });
    cena.add(new window.THREE.Mesh(new window.THREE.PlaneGeometry(2, 2), material));
    botao.prepend(renderizador.domElement);

    function animarBotao(tempo) {
      if (!botao.isConnected) {
        renderizador.dispose();
        return;
      }
      material.uniforms.tempo.value = tempo * 0.001;
      renderizador.render(cena, camera);
      requestAnimationFrame(animarBotao);
    }
    requestAnimationFrame(animarBotao);
  });
}

function iniciarEfeitos() {
  iniciarParticulas();
  iniciarBotoesInterativos();
  iniciarBrilhoJquery();
  iniciarSwiper();
  iniciarGsap();
  iniciarAnimacaoIntroducao();
  iniciarLenis();
}

function iniciarSite() {
  configurarPlanejador();
  configurarFormulariosAcesso();
  configurarInsights();
  botaoSair.addEventListener("click", () => sairDaConta());
  renderizarRotina();
  renderizarProjetos();
  atualizarEquilibrio();
  atualizarTelaCronometro();
  atualizarTelaConta();
  carregarProjetos();
  carregarPainelUsuario();
  window.addEventListener("hashchange", trocarTela);
  trocarTela();
  iniciarEfeitos();
}

if (window.Webflow && typeof window.Webflow.push === "function") {
  window.Webflow.push(iniciarSite);
} else if (window.jQuery) {
  window.jQuery(iniciarSite);
} else {
  iniciarSite();
}
