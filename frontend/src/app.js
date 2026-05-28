const toast = document.querySelector("#toast");
const scheduleDrop = document.querySelector("#scheduleDrop");
const scoreValue = document.querySelector("#scoreValue");
const scoreTitle = document.querySelector("#scoreTitle");
const scoreMessage = document.querySelector("#scoreMessage");
const screenMinutesEl = document.querySelector("#screenMinutes");
const lifeMinutesEl = document.querySelector("#lifeMinutes");
const screenBar = document.querySelector("#screenBar");
const lifeBar = document.querySelector("#lifeBar");
const balanceTip = document.querySelector("#balanceTip");
const homeScore = document.querySelector("#homeScore");
const homeScoreLabel = document.querySelector("#homeScoreLabel");
const homeScreen = document.querySelector("#homeScreen");
const homeLife = document.querySelector("#homeLife");
const metricBlocks = document.querySelector("#metricBlocks");
const metricScreen = document.querySelector("#metricScreen");
const metricLife = document.querySelector("#metricLife");
const metricBreaks = document.querySelector("#metricBreaks");
const projectList = document.querySelector("#projectList");

let schedule = [
  { id: crypto.randomUUID(), label: "Deep work", type: "screen", minutes: 90, tone: "violet" },
  { id: crypto.randomUUID(), label: "Pausa sem tela", type: "life", minutes: 15, tone: "green" },
  { id: crypto.randomUUID(), label: "Implementar feature", type: "screen", minutes: 75, tone: "violet" },
  { id: crypto.randomUUID(), label: "Refeicao consciente", type: "life", minutes: 45, tone: "green" }
];

let projects = [
  {
    id: crypto.randomUUID(),
    name: "Ritmo - planner dev",
    tasks: ["Finalizar drag and drop", "Validar responsivo", "Preparar pitch de 5 minutos"]
  },
  {
    id: crypto.randomUUID(),
    name: "Dashboard de produtividade",
    tasks: ["Criar cards de score", "Comparar telas vs vida real", "Exportar rotina"]
  },
  {
    id: crypto.randomUUID(),
    name: "Identidade visual",
    tasks: ["Manter dark mode violeta", "Polir microinteracoes", "Revisar contraste"]
  }
];

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function formatMinutes(minutes) {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h${String(rest).padStart(2, "0")}` : `${hours}h`;
}

function routinePayloadFromElement(element) {
  return {
    id: crypto.randomUUID(),
    label: element.dataset.label,
    type: element.dataset.type,
    minutes: Number(element.dataset.minutes),
    tone: element.dataset.tone || (element.dataset.type === "life" ? "green" : "violet")
  };
}

function calculateBalance() {
  const screen = schedule.filter((block) => block.type === "screen").reduce((sum, block) => sum + block.minutes, 0);
  const life = schedule.filter((block) => block.type === "life").reduce((sum, block) => sum + block.minutes, 0);
  const total = screen + life;
  const breaks = schedule.filter((block) => block.type === "life").length;

  if (!total) {
    return { screen, life, total, breaks, score: 0 };
  }

  const screenRatio = screen / total;
  const targetRatio = 0.62;
  const balanceScore = 100 - Math.abs(screenRatio - targetRatio) * 135;
  const breakBonus = Math.min(18, breaks * 5);
  const overloadPenalty = Math.max(0, screen - 360) / 12;
  const score = Math.max(0, Math.min(100, Math.round(balanceScore + breakBonus - overloadPenalty)));

  return { screen, life, total, breaks, score };
}

function scoreFeedback(score) {
  if (score >= 85) {
    return {
      title: "Ritmo excelente.",
      message: "Seu dia combina blocos de foco com recuperacao real.",
      tip: "Mantenha pausas longe da tela para preservar energia mental."
    };
  }

  if (score >= 65) {
    return {
      title: "Ritmo saudavel.",
      message: "A rotina esta boa, mas ainda pode ganhar mais respiro.",
      tip: "Inclua uma pausa curta entre blocos longos de implementacao."
    };
  }

  if (score >= 40) {
    return {
      title: "Ritmo em alerta.",
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

function renderSchedule() {
  scheduleDrop.innerHTML = "";

  if (!schedule.length) {
    scheduleDrop.innerHTML = `<p class="empty-state">Arraste blocos para ca e monte seu dia.</p>`;
  } else {
    schedule.forEach((block) => {
      const item = document.createElement("article");
      item.className = `scheduled-block ${block.type === "life" ? "life" : ""} tone-${block.tone || "violet"}`;
      item.innerHTML = `
        <span class="block-time">${formatMinutes(block.minutes)}</span>
        <div>
          <strong>${block.label}</strong>
          <small>${block.type === "screen" ? "Tempo de tela produtivo" : "Vida real e recuperacao"}</small>
        </div>
        <button class="remove-block" type="button" aria-label="Remover ${block.label}" data-id="${block.id}">x</button>
      `;
      scheduleDrop.appendChild(item);
      bindHoldAnimation(item);
    });
  }

  scheduleDrop.querySelectorAll("[data-id]").forEach((button) => {
    button.addEventListener("click", () => {
      schedule = schedule.filter((block) => block.id !== button.dataset.id);
      renderSchedule();
      updateBalance();
    });
  });
}

function updateBalance() {
  const { screen, life, total, breaks, score } = calculateBalance();
  const feedback = scoreFeedback(score);
  const screenPercent = total ? Math.round((screen / total) * 100) : 0;
  const lifePercent = total ? Math.round((life / total) * 100) : 0;

  scoreValue.textContent = score;
  scoreTitle.textContent = feedback.title;
  scoreMessage.textContent = feedback.message;
  balanceTip.textContent = feedback.tip;
  screenMinutesEl.textContent = formatMinutes(screen);
  lifeMinutesEl.textContent = formatMinutes(life);
  screenBar.style.width = `${screenPercent}%`;
  lifeBar.style.width = `${lifePercent}%`;
  document.documentElement.style.setProperty("--score-angle", `${score * 3.6}deg`);

  homeScore.textContent = score;
  homeScoreLabel.textContent = feedback.title;
  homeScreen.textContent = formatMinutes(screen);
  homeLife.textContent = formatMinutes(life);
  metricBlocks.textContent = schedule.length;
  metricScreen.textContent = formatMinutes(screen);
  metricLife.textContent = formatMinutes(life);
  metricBreaks.textContent = breaks;

  const screenMeter = document.querySelector(".screen-meter");
  const lifeMeter = document.querySelector(".life-meter");
  if (screenMeter && lifeMeter) {
    screenMeter.style.width = `${screenPercent || 50}%`;
    lifeMeter.style.width = `${lifePercent || 50}%`;
  }
}

function exportRoutine() {
  const { screen, life, score } = calculateBalance();
  const lines = [
    "Ritmo - rotina do programador",
    "",
    `Score de equilibrio: ${score}`,
    `Tempo de tela: ${formatMinutes(screen)}`,
    `Vida real: ${formatMinutes(life)}`,
    "",
    "Rotina:"
  ];

  schedule.forEach((block, index) => {
    lines.push(`${index + 1}. ${block.label} - ${formatMinutes(block.minutes)} - ${block.type === "screen" ? "tela" : "vida real"}`);
  });

  lines.push("", "Projetos:");
  projects.forEach((project) => {
    lines.push(`- ${project.name}: ${project.tasks.join("; ")}`);
  });

  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "rotina-ritmo.txt";
  link.click();
  URL.revokeObjectURL(url);
  showToast("Rotina exportada.");
}

function renderProjects() {
  projectList.innerHTML = "";

  projects.forEach((project) => {
    const card = document.createElement("article");
    card.className = "project-card";
    card.innerHTML = `
      <span>Projeto atual</span>
      <h3>${project.name}</h3>
      <ul>
        ${project.tasks.map((task) => `<li>${task}</li>`).join("")}
      </ul>
      <button class="button secondary" type="button" data-project="${project.id}">Remover</button>
    `;
    projectList.appendChild(card);
  });

  projectList.querySelectorAll("[data-project]").forEach((button) => {
    button.addEventListener("click", () => {
      projects = projects.filter((project) => project.id !== button.dataset.project);
      renderProjects();
    });
  });
}

function addProject() {
  const nameInput = document.querySelector("#projectName");
  const tasksInput = document.querySelector("#projectTasks");
  const name = nameInput.value.trim();
  const tasks = tasksInput.value
    .split(",")
    .map((task) => task.trim())
    .filter(Boolean);

  if (!name || !tasks.length) {
    showToast("Informe o nome do projeto e pelo menos uma pendencia separada por virgula.");
    return;
  }

  projects.unshift({
    id: crypto.randomUUID(),
    name,
    tasks
  });

  nameInput.value = "";
  tasksInput.value = "";
  renderProjects();
  showToast("Projeto adicionado.");
}

function animateHoldStart(element) {
  element.classList.add("is-held");

  if (!window.gsap || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  window.gsap.to(element, {
    scale: 1.045,
    rotate: -1.2,
    y: -4,
    duration: 0.18,
    ease: "power2.out"
  });
}

function animateHoldEnd(element) {
  element.classList.remove("is-held");

  if (!window.gsap || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  window.gsap.to(element, {
    scale: 1,
    rotate: 0,
    y: 0,
    duration: 0.22,
    ease: "elastic.out(1, 0.5)"
  });
}

function bindHoldAnimation(element) {
  if (element.dataset.holdBound === "true") return;
  element.dataset.holdBound = "true";

  element.addEventListener("pointerdown", () => animateHoldStart(element));
  element.addEventListener("pointerup", () => animateHoldEnd(element));
  element.addEventListener("pointerleave", () => animateHoldEnd(element));
  element.addEventListener("pointercancel", () => animateHoldEnd(element));
}

function bindRoutineBlock(block) {
  if (block.dataset.bound === "true") return;
  block.dataset.bound = "true";
  bindHoldAnimation(block);

  block.addEventListener("dragstart", (event) => {
    block.dataset.dragging = "true";
    animateHoldStart(block);
    event.dataTransfer.setData("application/json", JSON.stringify(routinePayloadFromElement(block)));
  });

  block.addEventListener("dragend", () => {
    animateHoldEnd(block);
    window.setTimeout(() => {
      block.dataset.dragging = "false";
    }, 80);
  });

  block.addEventListener("click", () => {
    if (block.dataset.dragging === "true") return;
    schedule.push(routinePayloadFromElement(block));
    renderSchedule();
    updateBalance();
    showToast("Bloco adicionado a rotina.");
  });
}

function createCustomBlock(event) {
  event.preventDefault();

  const nameInput = document.querySelector("#customBlockName");
  const minutesInput = document.querySelector("#customBlockMinutes");
  const typeInput = document.querySelector("#customBlockType");
  const toneInput = document.querySelector("#customBlockTone");
  const name = nameInput.value.trim();
  const minutes = Number(minutesInput.value);

  if (!name || !Number.isFinite(minutes) || minutes < 5) {
    showToast("Informe um nome e um tempo de pelo menos 5 minutos.");
    return;
  }

  const type = typeInput.value;
  const tone = toneInput.value;
  const card = document.createElement("button");
  card.className = `routine-block template ${type === "life" ? "life" : ""} tone-${tone}`;
  card.type = "button";
  card.draggable = true;
  card.dataset.type = type;
  card.dataset.label = name;
  card.dataset.minutes = String(minutes);
  card.dataset.tone = tone;
  card.innerHTML = `
    <span>Personalizado</span>
    <strong>${name}</strong>
    <small>${formatMinutes(minutes)} - ${type === "screen" ? "tela" : "vida real"}</small>
  `;

  event.currentTarget.before(card);
  bindRoutineBlock(card);

  if (window.gsap) {
    window.gsap.from(card, { autoAlpha: 0, y: 18, scale: 0.96, duration: 0.45, ease: "power2.out" });
  }

  nameInput.value = "";
  minutesInput.value = "50";
  showToast("Card personalizado criado.");
}

function setupPlanner() {
  document.querySelectorAll(".routine-block.template").forEach(bindRoutineBlock);

  scheduleDrop.addEventListener("dragover", (event) => {
    event.preventDefault();
    scheduleDrop.classList.add("drag-over");
  });

  scheduleDrop.addEventListener("dragleave", () => {
    scheduleDrop.classList.remove("drag-over");
  });

  scheduleDrop.addEventListener("drop", (event) => {
    event.preventDefault();
    scheduleDrop.classList.remove("drag-over");
    const raw = event.dataTransfer.getData("application/json");
    if (!raw) return;

    schedule.push(JSON.parse(raw));
    renderSchedule();
    updateBalance();
  });

  document.querySelector("#clearPlanner").addEventListener("click", () => {
    schedule = [];
    renderSchedule();
    updateBalance();
  });

  document.querySelector("#exportRoutine").addEventListener("click", exportRoutine);
  document.querySelector("#addProject").addEventListener("click", addProject);
  document.querySelector("#customBlockForm").addEventListener("submit", createCustomBlock);
}

function setupAuthForms() {
  const loginForm = document.querySelector("#loginForm");
  const signupForm = document.querySelector("#signupForm");

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    showToast("Login simulado. Back-end de usuarios entra na proxima etapa.");

    if (window.gsap) {
      window.gsap.fromTo(loginForm, { x: -8 }, { x: 0, duration: 0.35, ease: "elastic.out(1, 0.5)" });
    }
  });

  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    showToast("Cadastro simulado criado no front.");

    if (window.gsap) {
      window.gsap.fromTo(signupForm, { x: 8 }, { x: 0, duration: 0.35, ease: "elastic.out(1, 0.5)" });
    }
  });
}

function route() {
  const current = location.hash.replace("#", "") || "home";
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.toggle("active", page.id === current);
  });
  document.querySelectorAll(".nav a").forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
  });

  animateActivePage();
  requestAnimationFrame(() => {
    if (window.ritmoLenis) {
      window.ritmoLenis.scrollTo(0, { immediate: true });
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  });

  if (window.ScrollTrigger) {
    window.setTimeout(() => window.ScrollTrigger.refresh(true), 120);
  }
}

function initLenis() {
  if (!window.Lenis || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const lenis = new window.Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    lerp: 0.08,
    smoothWheel: true
  });
  window.ritmoLenis = lenis;

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

function initSwiper() {
  if (!window.Swiper) return;

  document.querySelectorAll(".review-swiper").forEach((swiper) => {
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

function initJQueryGlow() {
  if (!window.jQuery) return;

  const selector = ".preview-card, .preview-sidebar, .metrics article, .about-grid article, .block-library, .day-board, .score-panel, .custom-block-panel, .project-composer, .project-card, .insight-card, .review-card, .auth-card";
  window.jQuery(selector).on("mousemove", function (event) {
    const rect = this.getBoundingClientRect();
    this.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    this.style.setProperty("--my", `${event.clientY - rect.top}px`);
  });
}

function splitTextElement(element) {
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

function initGsap() {
  if (!window.gsap) return;

  const { gsap } = window;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(window.SplitText);
  if (prefersReducedMotion) return;

  gsap.from(".topbar", {
    autoAlpha: 0,
    y: -26,
    duration: 0.9,
    ease: "power3.out"
  });

  gsap.from(".particle-canvas", {
    autoAlpha: 0,
    scale: 1.04,
    duration: 1.35,
    ease: "power2.out"
  });

  gsap.from(".signal-field", {
    autoAlpha: 0,
    y: -36,
    duration: 1.2,
    ease: "power3.out",
    delay: 0.15
  });

  document.querySelectorAll("[data-split]").forEach((element) => {
    if (!element.getClientRects().length) return;

    const split = splitTextElement(element);
    const target = split ? split.chars : element;
    const isHeroText = Boolean(element.closest(".hero-content"));
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

  gsap.from(".dashboard-preview, .metrics article", {
    autoAlpha: 0,
    y: 70,
    scale: 0.98,
    stagger: 0.08,
    duration: 1,
    ease: "power3.out",
    delay: 0.25
  });

  gsap.from(".hero-actions .button", {
    autoAlpha: 0,
    y: 18,
    stagger: 0.08,
    duration: 0.7,
    ease: "power2.out",
    delay: 0.42
  });

  if (window.ScrollTrigger) {
    gsap.utils.toArray(".content-page, .reviews-section").forEach((section) => {
      const targets = section.querySelectorAll(".section-heading, .about-grid article, .planner-shell, .custom-block-panel, .project-composer, .project-card, .insight-card, .review-card, .auth-card");
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

function initIntroAnimation() {
  const intro = document.querySelector("#siteIntro");
  if (!intro) return;

  if (!window.gsap || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    intro.remove();
    return;
  }

  const { gsap } = window;
  const split = splitTextElement(intro.querySelector("[data-intro-split]"));
  const titleTargets = split ? split.chars : intro.querySelector("[data-intro-split]");
  const timeline = gsap.timeline({
    defaults: { ease: "power3.out" },
    onComplete: () => intro.remove()
  });

  timeline
    .from(".intro-mark i", {
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
    .from(".site-intro span", {
      autoAlpha: 0,
      y: 14,
      duration: 0.5
    }, "-=0.25")
    .to(".site-intro", {
      clipPath: "inset(0 0 100% 0)",
      duration: 0.82,
      delay: 0.35
    });
}

function animateActivePage() {
  if (!window.gsap || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const page = document.querySelector(".page.active");
  if (!page) return;

  const targets = page.querySelectorAll(".section-heading, .about-grid article, .planner-shell, .project-composer, .project-card, .insight-card, .auth-card");
  if (!targets.length) return;

  window.gsap.fromTo(
    targets,
    { y: 28 },
    { y: 0, stagger: 0.045, duration: 0.55, ease: "power2.out" }
  );
}

function initParticles() {
  const canvas = document.querySelector("#particleCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const palette = ["138,121,255", "106,134,255", "61,223,208"];
  let streams = [];
  let width = 0;
  let height = 0;
  let animationFrame = null;
  let startedAt = performance.now();
  let lastFrame = 0;
  let portalPoint = { x: 0, y: 0 };
  const reveal = { value: prefersReducedMotion ? 1 : 0 };
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  const targetFrameMs = 1000 / 30;

  function easeOutCubic(value) {
    return 1 - Math.pow(1 - value, 3);
  }

  function pointOnCurve(points, t) {
    const mt = 1 - t;
    const mt2 = mt * mt;
    const t2 = t * t;

    return {
      x: mt2 * mt * points[0].x + 3 * mt2 * t * points[1].x + 3 * mt * t2 * points[2].x + t2 * t * points[3].x,
      y: mt2 * mt * points[0].y + 3 * mt2 * t * points[1].y + 3 * mt * t2 * points[2].y + t2 * t * points[3].y
    };
  }

  function buildSamples(points) {
    const steps = width < 640 ? 30 : 44;
    return Array.from({ length: steps + 1 }, (_, index) => pointOnCurve(points, index / steps));
  }

  function drawSamplesSegment(samples, start, end) {
    const safeStart = Math.max(0, Math.min(1, start));
    const safeEnd = Math.max(0, Math.min(1, end));
    if (safeEnd <= safeStart) return;

    const startIndex = Math.floor(safeStart * (samples.length - 1));
    const endIndex = Math.ceil(safeEnd * (samples.length - 1));
    ctx.beginPath();

    for (let index = startIndex; index <= endIndex; index += 1) {
      const point = samples[index];
      if (index === startIndex) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    }
  }

  function strokeSamples(samples, start, end, color, alpha, lineWidth) {
    drawSamplesSegment(samples, start, end);
    ctx.strokeStyle = `rgba(${color}, ${alpha})`;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }

  function buildStreams() {
    const count = width < 640 ? 8 : Math.min(22, Math.max(14, Math.floor(width / 86)));
    const centerX = width * 0.5;
    const topbar = document.querySelector(".topbar");
    const topbarBottom = topbar ? topbar.getBoundingClientRect().bottom : 0;
    const portal = {
      x: centerX,
      y: Math.max(topbarBottom + 12, height * 0.07)
    };
    portalPoint = portal;

    streams = Array.from({ length: count }, (_, index) => {
      const progress = count === 1 ? 0 : index / (count - 1);
      const side = (progress - 0.5) * 2;
      const spread = Math.sign(side || 1) * Math.pow(Math.abs(side), 0.72);
      const color = palette[index % palette.length];
      const startY = height * (0.74 + Math.random() * 0.36);
      const startX = centerX + spread * width * (0.48 + Math.random() * 0.26);
      const centerBias = 1 - Math.min(0.78, Math.abs(side));
      const points = [
        { x: startX, y: startY },
        { x: centerX + spread * width * (0.34 + Math.random() * 0.12), y: height * (0.58 + Math.random() * 0.14) },
        { x: centerX + spread * width * (0.14 + Math.random() * 0.08), y: height * (0.24 + Math.random() * 0.12) },
        { x: portal.x + spread * width * 0.018, y: portal.y + Math.random() * 14 }
      ];

      return {
        color,
        alpha: 0.065 + centerBias * 0.11 + Math.random() * 0.025,
        lineWidth: 0.5 + Math.random() * 0.75,
        speed: 0.42 + Math.random() * 0.34,
        phase: Math.random() * 900,
        segment: 0.14 + Math.random() * 0.1,
        samples: buildSamples(points)
      };
    });
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.35);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildStreams();
  }

  function draw(now = performance.now()) {
    if (!prefersReducedMotion && now - lastFrame < targetFrameMs) {
      animationFrame = requestAnimationFrame(draw);
      return;
    }

    lastFrame = now;
    const time = performance.now() - startedAt;
    mouse.x += (mouse.targetX - mouse.x) * 0.055;
    mouse.y += (mouse.targetY - mouse.y) * 0.055;
    const intro = easeOutCubic(reveal.value);

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    const portalGlow = ctx.createRadialGradient(portalPoint.x, portalPoint.y, 8, portalPoint.x, portalPoint.y + height * 0.03, width * 0.28);
    portalGlow.addColorStop(0, "rgba(255,255,255,0.2)");
    portalGlow.addColorStop(0.22, "rgba(138,121,255,0.16)");
    portalGlow.addColorStop(0.58, "rgba(61,223,208,0.045)");
    portalGlow.addColorStop(1, "rgba(5,4,12,0)");
    ctx.fillStyle = portalGlow;
    ctx.fillRect(0, 0, width, height);

    const beam = ctx.createLinearGradient(width * 0.5, height, width * 0.5, 0);
    beam.addColorStop(0, "rgba(5,4,12,0)");
    beam.addColorStop(0.58, "rgba(138,121,255,0.035)");
    beam.addColorStop(1, "rgba(5,4,12,0)");
    ctx.fillStyle = beam;
    ctx.fillRect(0, 0, width, height);

    ctx.translate(mouse.x * 5, mouse.y * 3);

    streams.forEach((stream) => {
      const drawn = intro;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      strokeSamples(stream.samples, 0, drawn, stream.color, stream.alpha * 0.24, stream.lineWidth * 3.6);
      strokeSamples(stream.samples, 0, drawn, stream.color, stream.alpha, stream.lineWidth);

      if (drawn < 0.98 || prefersReducedMotion) return;

      const start = (stream.phase * 0.001 + time * stream.speed * 0.00012) % 1;
      const end = Math.min(1, start + stream.segment);
      strokeSamples(stream.samples, start, end, stream.color, stream.alpha * 2.5, stream.lineWidth * 3.8);
      strokeSamples(stream.samples, start, end, stream.color, Math.min(0.58, stream.alpha * 4.8), stream.lineWidth * 1.2);
    });

    ctx.restore();

    if (!prefersReducedMotion) {
      animationFrame = requestAnimationFrame(draw);
    }
  }

  function updateMouse(event) {
    if (!width || !height) return;
    mouse.targetX = event.clientX / width - 0.5;
    mouse.targetY = event.clientY / height - 0.5;
  }

  resize();

  if (window.gsap && !prefersReducedMotion) {
    window.gsap.to(reveal, {
      value: 1,
      duration: 2,
      delay: 1.05,
      ease: "power3.out"
    });
  }

  draw();

  const resizeHandler = () => {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    startedAt = performance.now();
    resize();
    draw();
  };

  if (window.jQuery) {
    window.jQuery(window)
      .on("mousemove.ritmoDataField pointermove.ritmoDataField", updateMouse)
      .on("resize.ritmoDataField", resizeHandler);
    return;
  }

  window.addEventListener("pointermove", updateMouse);
  window.addEventListener("resize", resizeHandler);
}

function initEnhancements() {
  initParticles();
  initJQueryGlow();
  initSwiper();
  initGsap();
  initIntroAnimation();
  initLenis();
}

function boot() {
  setupPlanner();
  setupAuthForms();
  renderSchedule();
  renderProjects();
  updateBalance();
  window.addEventListener("hashchange", route);
  route();
  initEnhancements();
}

if (window.Webflow && typeof window.Webflow.push === "function") {
  window.Webflow.push(boot);
} else if (window.jQuery) {
  window.jQuery(boot);
} else {
  boot();
}
