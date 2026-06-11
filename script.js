const SUPABASE_URL = "https://vddrzynnfnfxbikesbkg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_DS7qrBwkpMAPkyT-V2CyXA_NuIacvmi";
const ADMIN_EMAIL = "danielfinotti2@gmail.com";

const packages = {
  landing: {
    name: "Landing Page",
    price: 500,
    deadline: "Entrega média em 3 dias",
    description: "Ideal para divulgar produto, serviço, evento ou promoção com foco em conversão.",
    features: [
      "Página única com visual profissional",
      "Botões para WhatsApp, email ou formulário",
      "Versão responsiva para celular",
      "Texto de venda organizado por seções",
      "Domínio incluso e publicação orientada por mim"
    ]
  },
  institucional: {
    name: "Site Institucional",
    price: 350,
    deadline: "Entrega média em 7 dias",
    description: "Perfeito para empresas que precisam apresentar serviços, história, contato e credibilidade.",
    features: [
      "Até 5 seções ou páginas principais",
      "Área de serviços, sobre e contato",
      "Integração com redes sociais",
      "Formulário ou botão direto para WhatsApp",
      "Domínio incluso e site publicado no endereço combinado"
    ]
  },
  ecommerce: {
    name: "Loja Online",
    price: 700,
    deadline: "Entrega média em 14 dias",
    description: "Uma loja online para vender produtos com catálogo, carrinho visual e caminho de compra organizado.",
    features: [
      "Página inicial da loja",
      "Cadastro visual de produtos",
      "Carrinho e fluxo de compra",
      "Integração com formas de pagamento, quando disponível",
      "Domínio incluso e orientação para pedidos"
    ]
  },
  redesign: {
    name: "Redesign",
    price: 150,
    deadline: "Entrega média em 5 dias",
    description: "Para quem já tem um site, mas quer deixar o visual mais moderno, rápido e confiável.",
    features: [
      "Modernização do layout atual",
      "Melhoria da experiência no celular",
      "Ajustes de cores, textos e espaçamentos",
      "Organização das chamadas para ação",
      "Publicação final feita por mim"
    ]
  }
};

const defaultProjects = [
  {
    id: "proj-loja-01",
    badge: "LOJA 01",
    title: "Vitrine minimalista",
    description: "Modelo para produtos, combos e chamada rápida para WhatsApp.",
    link: "",
    imageUrl: "",
    sort_order: 1
  },
  {
    id: "proj-site-02",
    badge: "SITE 02",
    title: "Empresa local",
    description: "Modelo institucional para apresentar serviço, confiança e contato.",
    link: "",
    imageUrl: "",
    sort_order: 2
  },
  {
    id: "proj-lp-03",
    badge: "LP 03",
    title: "Oferta direta",
    description: "Landing page para promoção, lançamento ou campanha com foco em venda.",
    link: "",
    imageUrl: "",
    sort_order: 3
  }
];

const storageKey = "euodeene_store_database";
const localAdminPassword = "euodeene";
let selectedPackageId = "landing";
let packageChart = null;
let appDatabase = normalizeDatabase(null);

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

const hasSupabaseConfig =
  typeof window.supabase !== "undefined" &&
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes("COLE_AQUI") &&
  !SUPABASE_ANON_KEY.includes("COLE_AQUI");

const supabaseClient = hasSupabaseConfig
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function parseCurrency(value) {
  const numbers = String(value || "").replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  return Number(numbers) || 0;
}

function syncPackagePricesFromCards() {
  $$("[data-package-card]").forEach((card) => {
    const packageId = card.dataset.packageCard;
    const priceText = $("strong", card)?.textContent;
    if (packages[packageId] && priceText) {
      packages[packageId].price = parseCurrency(priceText);
    }
  });
}

function createId(prefix = "id") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeDatabase(database) {
  const fallback = {
    updatedAt: null,
    views: [],
    leads: [],
    projects: clone(defaultProjects)
  };

  const db = { ...fallback, ...(database || {}) };
  db.views = Array.isArray(db.views) ? db.views : [];
  db.leads = Array.isArray(db.leads) ? db.leads : [];
  db.projects = Array.isArray(db.projects) ? db.projects : [];
  return db;
}

function getLocalDatabase() {
  try {
    return normalizeDatabase(JSON.parse(localStorage.getItem(storageKey)));
  } catch {
    return normalizeDatabase(null);
  }
}

function saveLocalDatabase(database) {
  const next = normalizeDatabase({ ...database, updatedAt: new Date().toISOString() });
  localStorage.setItem(storageKey, JSON.stringify(next));
  appDatabase = next;
  window.euodeeneDatabase = next;
  return next;
}

function viewFromSupabase(row) {
  return {
    id: row.id,
    packageId: row.package_id,
    packageName: row.package_name,
    createdAt: row.created_at,
    viewedAt: row.created_at
  };
}

function leadFromSupabase(row) {
  return {
    id: row.id,
    packageId: row.package_id,
    packageName: row.package_name,
    projectPrice: row.project_price,
    name: row.name,
    contact: row.contact,
    domainNote: row.domain_note,
    createdAt: row.created_at
  };
}

function projectFromSupabase(row) {
  return {
    id: row.id,
    badge: row.badge,
    title: row.title,
    description: row.description,
    link: row.link || "",
    imageUrl: row.image_url || row.imageUrl || "",
    sort_order: row.sort_order || 0
  };
}

function projectToSupabase(project, index = 0) {
  return {
    id: project.id,
    badge: project.badge || "PROJETO",
    title: project.title || "Projeto",
    description: project.description || "Descrição do projeto.",
    link: project.link || "",
    image_url: project.imageUrl || "",
    sort_order: Number(project.sort_order || index + 1)
  };
}

async function loadPublicProjects() {
  if (!supabaseClient) {
    appDatabase = getLocalDatabase();
    window.euodeeneDatabase = appDatabase;
    return appDatabase.projects;
  }

  const { data, error } = await supabaseClient
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.warn("Erro ao carregar projetos do Supabase:", error.message);
    appDatabase.projects = clone(defaultProjects);
  } else {
    appDatabase.projects = data && data.length ? data.map(projectFromSupabase) : [];
  }

  window.euodeeneDatabase = appDatabase;
  return appDatabase.projects;
}

async function loadAdminDatabase() {
  if (!supabaseClient) {
    appDatabase = getLocalDatabase();
    window.euodeeneDatabase = appDatabase;
    return appDatabase;
  }

  const [projectsRes, leadsRes, viewsRes] = await Promise.all([
    supabaseClient.from("projects").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: true }),
    supabaseClient.from("leads").select("*").order("created_at", { ascending: true }),
    supabaseClient.from("package_views").select("*").order("created_at", { ascending: true })
  ]);

  if (projectsRes.error) console.warn("Erro projects:", projectsRes.error.message);
  if (leadsRes.error) console.warn("Erro leads:", leadsRes.error.message);
  if (viewsRes.error) console.warn("Erro package_views:", viewsRes.error.message);

  appDatabase = normalizeDatabase({
    projects: projectsRes.data ? projectsRes.data.map(projectFromSupabase) : [],
    leads: leadsRes.data ? leadsRes.data.map(leadFromSupabase) : [],
    views: viewsRes.data ? viewsRes.data.map(viewFromSupabase) : []
  });

  window.euodeeneDatabase = appDatabase;
  return appDatabase;
}

async function registerPackageView(packageId) {
  const pack = packages[packageId];
  if (!pack) return;

  if (supabaseClient) {
    const { error } = await supabaseClient.from("package_views").insert({
      package_id: packageId,
      package_name: pack.name
    });
    if (error) console.warn("Erro ao salvar clique:", error.message);
    return;
  }

  const db = getLocalDatabase();
  db.views.push({ packageId, packageName: pack.name, viewedAt: new Date().toISOString(), createdAt: new Date().toISOString() });
  saveLocalDatabase(db);
}

function buildWhatsappLink(packageId) {
  const pack = packages[packageId];
  const message = [
    `Olá! Tenho interesse no pacote ${pack.name}.`,
    `Valor base: ${formatCurrency(pack.price)}.`,
    "Vi que o domínio está incluso e que a euodeene também publica o site."
  ].join(" ");
  return `https://wa.me/5521994856055?text=${encodeURIComponent(message)}`;
}

async function openPackageModal(packageId) {
  const pack = packages[packageId];
  const modal = $("#packageModal");
  if (!pack || !modal) return;

  selectedPackageId = packageId;
  $("#modalTitle").textContent = pack.name;
  $("#modalDescription").textContent = pack.description;
  $("#modalPrice").textContent = formatCurrency(pack.price);
  $("#modalDeadline").textContent = pack.deadline;
  $("#modalWhatsapp").href = buildWhatsappLink(packageId);
  $("#modalStatus").textContent = "";

  const list = $("#modalFeatures");
  list.innerHTML = "";
  pack.features.forEach((feature) => {
    const item = document.createElement("li");
    item.textContent = feature;
    list.appendChild(item);
  });

  await registerPackageView(packageId);
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("mobile-lock");
  document.body.style.overflow = "hidden";
}

function closePackageModal() {
  const modal = $("#packageModal");
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  if (!$("#adminPanel")?.classList.contains("open")) {
    document.body.classList.remove("mobile-lock");
    document.body.style.overflow = "";
  }
}

function setupModal() {
  $$(".js-open-package").forEach((button) => {
    button.addEventListener("click", () => openPackageModal(button.dataset.package));
  });
  $$(".js-close-modal").forEach((button) => button.addEventListener("click", closePackageModal));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closePackageModal();
      closeAdmin();
    }
  });

  $("#leadForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const pack = packages[selectedPackageId];
    const lead = {
      packageId: selectedPackageId,
      packageName: pack.name,
      projectPrice: pack.price,
      name: $("#leadName").value.trim() || "Nome não informado",
      contact: $("#leadContact").value.trim() || "Contato não informado",
      domainNote: "Domínio incluso no projeto e publicação feita pela euodeene.",
      createdAt: new Date().toISOString()
    };

    if (supabaseClient) {
      const { error } = await supabaseClient.from("leads").insert({
        package_id: lead.packageId,
        package_name: lead.packageName,
        project_price: lead.projectPrice,
        name: lead.name,
        contact: lead.contact,
        domain_note: lead.domainNote
      });
      if (error) {
        $("#modalStatus").textContent = "Não consegui salvar agora. Confere o Supabase.";
        console.error(error);
        return;
      }
    } else {
      const db = getLocalDatabase();
      db.leads.push({ id: createId("lead"), ...lead });
      saveLocalDatabase(db);
    }

    $("#modalStatus").textContent = "Interesse salvo. Agora chama no WhatsApp para fechar os detalhes.";
    event.target.reset();
    await renderAdmin();
  });
}

async function renderProjects() {
  const grid = $("#portfolioGrid");
  if (!grid) return;

  const projects = await loadPublicProjects();
  grid.innerHTML = "";

  if (!projects.length) {
    grid.innerHTML = `<article class="project-card reveal show"><div class="project-thumb">VAZIO</div><h3>Nenhum projeto cadastrado</h3><p>Abra o painel interno e adicione um novo projeto.</p></article>`;
    return;
  }

  projects.forEach((project) => {
    const article = document.createElement("article");
    article.className = "project-card reveal show";
    const safeLink = (project.link || "").trim();
    const safeImage = (project.imageUrl || "").trim();
    const thumb = safeImage
      ? `<div class="project-thumb has-image"><img src="${escapeAttribute(safeImage)}" alt="${escapeAttribute(project.title || "Projeto")}"></div>`
      : `<div class="project-thumb">${escapeHtml(project.badge || "PROJETO")}</div>`;
    article.innerHTML = `
      ${thumb}
      <h3>${escapeHtml(project.title || "Projeto")}</h3>
      <p>${escapeHtml(project.description || "Descrição do projeto.")}</p>
      ${safeLink ? `<a class="project-link" href="${escapeAttribute(safeLink)}" target="_blank" rel="noreferrer">Ver projeto →</a>` : ""}
    `;
    grid.appendChild(article);
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#039;",
    '"': "&quot;"
  }[char]));
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}

function imageFileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("Arquivo de imagem inválido."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Não consegui ler a imagem."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Não consegui preparar a imagem."));
      image.onload = () => {
        const maxSize = 1200;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function setupReveal() {
  const items = $$(".reveal");
  if (!items.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 55, 420)}ms`;
    observer.observe(item);
  });
}

function setupLab() {
  const lab = $("#vitrine");
  const world = $("#labWorld");
  const vel = $("#velReadout");
  if (!lab || !world) return;

  let lastY = window.scrollY;
  let speed = 0;
  let targetX = 0;
  let targetY = 0;

  lab.addEventListener("pointermove", (event) => {
    const rect = lab.getBoundingClientRect();
    targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
  });

  function animate() {
    const currentY = window.scrollY;
    speed += ((currentY - lastY) - speed) * 0.08;
    lastY = currentY;

    if (vel) vel.textContent = Math.abs(speed).toFixed(2);
    const rotateX = targetY * -4 + speed * -0.02;
    const rotateY = targetX * 6;
    world.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

    $$(".lab-card", world).forEach((card, index) => {
      const depth = (index + 1) * 8;
      card.style.transform = `translate(-50%, -50%) translate3d(${targetX * depth}px, ${targetY * depth}px, ${index * 18}px) rotateZ(calc(var(--r) * 1deg))`;
    });

    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

function openAdmin() {
  const panel = $("#adminPanel");
  if (!panel) return;
  panel.classList.add("open");
  panel.setAttribute("aria-hidden", "false");
  document.body.classList.add("mobile-lock");
  document.body.style.overflow = "hidden";
  $("#adminPassword")?.focus();
}

function closeAdmin() {
  const panel = $("#adminPanel");
  if (!panel) return;
  panel.classList.remove("open");
  panel.setAttribute("aria-hidden", "true");
  if (!$("#packageModal")?.classList.contains("open")) {
    document.body.classList.remove("mobile-lock");
    document.body.style.overflow = "";
  }
  if (location.hash === "#admin") history.replaceState(null, "", location.pathname + location.search);
}

function getPackageCounts(db) {
  const counts = Object.fromEntries(Object.keys(packages).map((key) => [key, 0]));
  db.views.forEach((view) => {
    if (counts[view.packageId] !== undefined) counts[view.packageId] += 1;
  });
  return counts;
}

async function renderAdmin() {
  const panel = $("#adminDashboard");
  if (!panel || panel.hidden) return;

  const db = await loadAdminDatabase();
  const counts = getPackageCounts(db);
  const entries = Object.entries(counts);
  const top = entries.sort((a, b) => b[1] - a[1])[0];
  const money = db.leads.reduce((sum, lead) => sum + (Number(lead.projectPrice) || 0), 0);

  $("#statViews").textContent = db.views.length;
  $("#statLeads").textContent = db.leads.length;
  $("#statTop").textContent = top && top[1] > 0 ? packages[top[0]].name : "-";
  $("#statMoney").textContent = formatCurrency(money);

  const leadList = $("#leadList");
  leadList.innerHTML = "";
  const recent = db.leads.slice().reverse().slice(0, 8);
  if (!recent.length) {
    leadList.innerHTML = `<div class="lead-item"><strong>Nenhum lead salvo</strong><span>Quando alguém salvar interesse, aparece aqui.</span></div>`;
  } else {
    recent.forEach((lead) => {
      const item = document.createElement("div");
      item.className = "lead-item";
      item.innerHTML = `
        <strong>${escapeHtml(lead.name)}</strong>
        <span>${escapeHtml(lead.packageName)} • ${escapeHtml(lead.contact)}</span><br>
        <span>${new Date(lead.createdAt).toLocaleString("pt-BR")}</span>
      `;
      leadList.appendChild(item);
    });
  }

  renderChart(counts);
  renderProjectManager();
}

function renderChart(counts) {
  const labels = Object.keys(counts).map((key) => packages[key].name);
  const data = Object.values(counts);
  const canvas = $("#packageChart");
  const fallback = $("#barFallback");
  if (!fallback) return;

  fallback.innerHTML = "";
  const max = Math.max(...data, 1);
  Object.keys(counts).forEach((key) => {
    const row = document.createElement("div");
    row.className = "bar-row";
    row.innerHTML = `<span>${packages[key].name}</span><div class="bar-line"><i style="width:${(counts[key] / max) * 100}%"></i></div><b>${counts[key]}</b>`;
    fallback.appendChild(row);
  });

  if (!window.Chart || !canvas) {
    fallback.style.display = "grid";
    return;
  }

  fallback.style.display = "none";
  if (packageChart) packageChart.destroy();
  packageChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Cliques",
        data,
        backgroundColor: "rgba(255,255,255,.85)",
        borderColor: "rgba(255,255,255,1)",
        borderWidth: 1,
        borderRadius: 12
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "#aaa" }, grid: { color: "rgba(255,255,255,.06)" } },
        y: { ticks: { color: "#aaa", precision: 0 }, grid: { color: "rgba(255,255,255,.06)" }, beginAtZero: true }
      }
    }
  });
}

function resetProjectForm() {
  $("#projectForm")?.reset();
  if ($("#projectId")) $("#projectId").value = "";
  if ($("#projectImageUrl")) $("#projectImageUrl").value = "";
  if ($("#projectImageFile")) $("#projectImageFile").value = "";
  if ($("#saveProject")) $("#saveProject").textContent = "Salvar projeto";
}

function fillProjectForm(project) {
  $("#projectId").value = project.id;
  $("#projectTitle").value = project.title || "";
  $("#projectBadge").value = project.badge || "";
  $("#projectDescription").value = project.description || "";
  $("#projectLink").value = project.link || "";
  if ($("#projectImageUrl")) $("#projectImageUrl").value = project.imageUrl || "";
  if ($("#projectImageFile")) $("#projectImageFile").value = "";
  $("#saveProject").textContent = "Atualizar projeto";
  $("#projectTitle").focus();
}

function renderProjectManager() {
  const list = $("#projectAdminList");
  if (!list) return;

  const db = appDatabase;
  list.innerHTML = "";

  if (!db.projects.length) {
    list.innerHTML = `<div class="project-admin-item"><strong>Nenhum projeto</strong><span>Cadastre um projeto no formulário acima.</span></div>`;
    return;
  }

  db.projects.forEach((project) => {
    const item = document.createElement("div");
    item.className = "project-admin-item";
    const safeImage = (project.imageUrl || "").trim();
    const preview = safeImage
      ? `<img class="project-admin-thumb" src="${escapeAttribute(safeImage)}" alt="">`
      : `<span class="project-admin-thumb empty">${escapeHtml(project.badge || "PROJETO")}</span>`;
    item.innerHTML = `
      ${preview}
      <div>
        <strong>${escapeHtml(project.title)}</strong>
        <span>${escapeHtml(project.badge)} • ${escapeHtml(project.description)}</span>
      </div>
      <div class="project-actions">
        <button class="btn-mini" type="button" data-edit-project="${escapeAttribute(project.id)}">Editar</button>
        <button class="btn-mini danger" type="button" data-delete-project="${escapeAttribute(project.id)}">Apagar</button>
      </div>
    `;
    list.appendChild(item);
  });
}

async function saveProject(project) {
  if (supabaseClient) {
    const { error } = await supabaseClient.from("projects").upsert(projectToSupabase(project));
    if (error) throw error;
    return;
  }

  const db = getLocalDatabase();
  const index = db.projects.findIndex((item) => item.id === project.id);
  if (index >= 0) db.projects[index] = project;
  else db.projects.unshift(project);
  saveLocalDatabase(db);
}

async function deleteProject(projectId) {
  if (supabaseClient) {
    const { error } = await supabaseClient.from("projects").delete().eq("id", projectId);
    if (error) throw error;
    return;
  }

  const db = getLocalDatabase();
  db.projects = db.projects.filter((item) => item.id !== projectId);
  saveLocalDatabase(db);
}

async function resetProjectsToDefault() {
  if (supabaseClient) {
    const { error: deleteError } = await supabaseClient.from("projects").delete().neq("id", "__never__");
    if (deleteError) throw deleteError;
    const { error: insertError } = await supabaseClient.from("projects").insert(defaultProjects.map(projectToSupabase));
    if (insertError) throw insertError;
    return;
  }

  const db = getLocalDatabase();
  db.projects = clone(defaultProjects);
  saveLocalDatabase(db);
}

function setupProjectManager() {
  $("#projectImageFile")?.addEventListener("change", async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    try {
      $("#projectImageUrl").value = await imageFileToDataUrl(file);
    } catch (error) {
      alert("Não consegui carregar essa imagem. Tente outra foto ou cole um link.");
      console.error(error);
      event.target.value = "";
    }
  });

  $("#projectForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = $("#projectId").value || createId("project");
    const project = {
      id,
      title: $("#projectTitle").value.trim(),
      badge: $("#projectBadge").value.trim(),
      description: $("#projectDescription").value.trim(),
      link: $("#projectLink").value.trim(),
      imageUrl: $("#projectImageUrl")?.value.trim() || "",
      sort_order: Date.now()
    };

    try {
      await saveProject(project);
      resetProjectForm();
      await renderProjects();
      await renderAdmin();
      setupReveal();
    } catch (error) {
      alert("Erro ao salvar projeto. Veja se você está logado no painel e se o Supabase está configurado.");
      console.error(error);
    }
  });

  $("#cancelProjectEdit")?.addEventListener("click", resetProjectForm);

  $("#resetProjects")?.addEventListener("click", async () => {
    if (!confirm("Restaurar os projetos modelo? Isso apaga os projetos cadastrados.")) return;
    try {
      await resetProjectsToDefault();
      resetProjectForm();
      await renderProjects();
      await renderAdmin();
      setupReveal();
    } catch (error) {
      alert("Erro ao restaurar projetos.");
      console.error(error);
    }
  });

  $("#projectAdminList")?.addEventListener("click", async (event) => {
    const editButton = event.target.closest("[data-edit-project]");
    const deleteButton = event.target.closest("[data-delete-project]");
    const db = appDatabase;

    if (editButton) {
      const project = db.projects.find((item) => item.id === editButton.dataset.editProject);
      if (project) fillProjectForm(project);
      return;
    }

    if (deleteButton) {
      const project = db.projects.find((item) => item.id === deleteButton.dataset.deleteProject);
      if (!project) return;
      if (!confirm(`Apagar o projeto "${project.title}"?`)) return;
      try {
        await deleteProject(project.id);
        resetProjectForm();
        await renderProjects();
        await renderAdmin();
        setupReveal();
      } catch (error) {
        alert("Erro ao apagar projeto.");
        console.error(error);
      }
    }
  });
}

async function loginAdmin() {
  const pass = $("#adminPassword").value;

  if (supabaseClient) {
    if (!ADMIN_EMAIL || ADMIN_EMAIL.includes("COLE_AQUI")) {
      $("#adminStatus").textContent = "Configure o ADMIN_EMAIL no script.js.";
      return;
    }

    const { error } = await supabaseClient.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: pass
    });

    if (error) {
      $("#adminStatus").textContent = "Login inválido no Supabase.";
      console.error(error.message);
      return;
    }
  } else if (pass !== localAdminPassword) {
    $("#adminStatus").textContent = "Senha incorreta.";
    return;
  }

  $("#adminLogin").hidden = true;
  $("#adminDashboard").hidden = false;
  await renderAdmin();
}

function setupAdmin() {
  if (location.hash === "#admin") openAdmin();
  window.addEventListener("hashchange", () => {
    if (location.hash === "#admin") openAdmin();
  });

  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "e") openAdmin();
  });

  $("#adminClose")?.addEventListener("click", closeAdmin);
  $("#adminEnter")?.addEventListener("click", loginAdmin);
  $("#adminPassword")?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") $("#adminEnter").click();
  });
  $("#clearData")?.addEventListener("click", async () => {
    if (!confirm("Limpar visualizações e leads salvos? Os projetos não serão apagados.")) return;

    if (supabaseClient) {
      const [leadDelete, viewDelete] = await Promise.all([
        supabaseClient.from("leads").delete().neq("id", "__never__"),
        supabaseClient.from("package_views").delete().neq("id", "__never__")
      ]);
      if (leadDelete.error || viewDelete.error) {
        alert("Erro ao limpar dados. Confira as permissões do Supabase.");
        console.error(leadDelete.error || viewDelete.error);
      }
    } else {
      const db = getLocalDatabase();
      db.views = [];
      db.leads = [];
      saveLocalDatabase(db);
    }

    await renderAdmin();
  });

  setupProjectManager();
}

function setupVideoFallback() {
  const video = $(".hero-video");
  if (!video) return;
  video.addEventListener("error", () => {
    video.style.display = "none";
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  window.euodeeneDatabase = appDatabase;
  syncPackagePricesFromCards();
  await renderProjects();
  setupVideoFallback();
  setupModal();
  setupReveal();
  setupLab();
  setupAdmin();
});
