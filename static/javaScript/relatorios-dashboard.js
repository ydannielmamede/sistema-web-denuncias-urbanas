// ═══════════════════════════════════════════════════
//                   NAVIGATION
// ═══════════════════════════════════════════════════
function resizeVisibleCharts() {
  [areaChartInstance, window.statusDonutInstance, window.monthlyBarChartInstance, window.categoriesChartInstance]
    .filter(Boolean)
    .forEach((chart) => chart.resize());
}

document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", () => {
    const page = document.getElementById("page-" + item.dataset.page);
    if (!page) return;
    document.querySelectorAll(".nav-item").forEach((n) => n.classList.remove("active"));
    document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
    item.classList.add("active");
    page.classList.add("active");
    // Chart.js mede o canvas no momento do render; ao trocar de aba
    // (display:none → display:flex) precisamos refazer essa medição.
    requestAnimationFrame(resizeVisibleCharts);
  });
});

const sidebarToggle = document.getElementById("sidebarToggle");
if (sidebarToggle) {
  sidebarToggle.addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("collapsed");
  });
}

// ═══════════════════════════════════════════════════
//              FETCH HELPERS
// ═══════════════════════════════════════════════════
function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[2]) : "";
}

function fetchJSON(url, options = {}) {
  const opts = {
    credentials: "same-origin",
    headers: {
      "X-Requested-With": "fetch",
      "X-CSRFToken": getCookie("csrftoken"),
      ...(options.headers || {}),
    },
    ...options,
  };
  return fetch(url, opts).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r} em ${url}`);
    return r.json();
  });
}

// Página atual da tabela de denúncias (para refresh e mudança de status).
let currentPage = 1;
let activeDashStatus = "";

// ═══════════════════════════════════════════════════
//          REFRESH / PAGINATION / STATUS (SPA)
// ═══════════════════════════════════════════════════
function updateStatCards(counts) {
  const totalEl = document.querySelector('.stats-grid .stat-card:nth-child(1) .stat-value');
  const pendentesEl = document.querySelector('.stats-grid .stat-card:nth-child(2) .stat-value');
  const resolvidasEl = document.querySelector('.stats-grid .stat-card:nth-child(3) .stat-value');
  const emAnaliseEl = document.querySelector('.stats-grid .stat-card:nth-child(4) .stat-value');
  if (totalEl) totalEl.textContent = counts.total;
  if (pendentesEl) pendentesEl.textContent = counts.pendentes;
  if (resolvidasEl) resolvidasEl.textContent = counts.resolvidas;
  if (emAnaliseEl) emAnaliseEl.textContent = counts.em_analise;
}

function updateChartsFromDashboardData(dados) {
  if (areaChartInstance && dados.mensal) {
    areaChartInstance.data.labels = dados.mensal.map((p) => p.mes.slice(5));
    areaChartInstance.data.datasets[0].data = dados.mensal.map((p) => p.abertas);
    areaChartInstance.data.datasets[1].data = dados.mensal.map((p) => p.resolvidas);
    areaChartInstance.update();
  }
  if (window.statusDonutInstance && dados.status) {
    window.statusDonutInstance.data.datasets[0].data = [dados.status.R || 0, dados.status.P || 0, dados.status.A || 0];
    window.statusDonutInstance.update();
    const totalEl = document.getElementById("statusDonutTotal");
    if (totalEl) {
      const t = (dados.status.R || 0) + (dados.status.P || 0) + (dados.status.A || 0);
      totalEl.textContent = t;
    }
    // Atualiza os valores ao lado do donut (Status Geral)
    const pieVals = document.querySelectorAll("#statusDonutTotal").length
      ? document.querySelectorAll(".pie-val")
      : [];
    if (pieVals.length === 3) {
      pieVals[0].textContent = dados.status.R || 0;
      pieVals[1].textContent = dados.status.P || 0;
      pieVals[2].textContent = dados.status.A || 0;
    }
  }
  if (window.monthlyBarChartInstance && dados.mensal) {
    window.monthlyBarChartInstance.data.labels = dados.mensal.map((p) => p.mes.slice(5));
    window.monthlyBarChartInstance.data.datasets[0].data = dados.mensal.map((p) => p.abertas);
    window.monthlyBarChartInstance.data.datasets[1].data = dados.mensal.map((p) => p.resolvidas);
    window.monthlyBarChartInstance.update();
  }
}

function refreshDashboardData() {
  return fetchJSON("/denuncia/dashboard/dados/").then((dados) => {
    if (dados.counts) updateStatCards(dados.counts);
    if (dados.mensal) updateChartsFromDashboardData(dados);
  });
}

function buildTableRow(row) {
  const tr = document.createElement("tr");
  const statusLabel = row.status === "P" ? "Pendente" : row.status === "A" ? "Em andamento" : "Resolvido";
  tr.setAttribute("data-status", statusLabel);
  tr.innerHTML = `
    <td class="td-id">#${row.id}</td>
    <td class="td-title">${escapeHtml(row.mensagem).slice(0, 40)}</td>
    <td class="td-muted">${escapeHtml(row.categoria)}</td>
    <td class="td-muted">${escapeHtml(row.localizacao)}</td>
    <td class="td-muted">${row.data}</td>
    <td>
      <form method="post" class="status-form">
        <select class="badge status-select ${row.status === "P" ? "badge-yellow" : row.status === "A" ? "badge-blue" : "badge-green"}">
          <option value="${row.urls.pendente}" ${row.status === "P" ? "selected" : ""}>Pendente</option>
          <option value="${row.urls.em_analise}" ${row.status === "A" ? "selected" : ""}>Em andamento</option>
          <option value="${row.urls.resolvida}" ${row.status === "R" ? "selected" : ""}>Resolvido</option>
        </select>
      </form>
    </td>
    <td></td>
  `;
  return tr;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function renderTableRows(payload) {
  if (typeof payload.current === "number") currentPage = payload.current;
  const tbody = document.getElementById("dashTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";
  payload.rows.forEach((row) => tbody.appendChild(buildTableRow(row)));
  // Completa até 5 linhas com placeholders para manter a altura estável
  const emptySlots = 5 - payload.rows.length;
  for (let i = 0; i < emptySlots; i++) {
    const tr = document.createElement("tr");
    tr.className = "tr-empty";
    tr.setAttribute("aria-hidden", "true");
    tr.innerHTML = `<td colspan="7"></td>`;
    tbody.appendChild(tr);
  }
  const info = document.getElementById("dashTableInfo");
  if (info) info.textContent = `Mostrando ${payload.showing} de ${payload.total} resultados`;

  // Paginação sem reload
  const pagination = document.querySelector(".pagination");
  if (pagination && payload.pagination) {
    pagination.innerHTML = "";
    payload.pagination.forEach((p) => {
      const a = document.createElement("a");
      a.className = "page-btn" + (p.active ? " active" : "");
      a.textContent = p.num;
      a.href = "javascript:void(0)";
      a.dataset.page = p.num;
      pagination.appendChild(a);
    });
  }
}

function loadTablePage(page) {
  const params = new URLSearchParams({ page });
  if (activeDashStatus) params.set("status", activeDashStatus);
  return fetchJSON(`/denuncia/dashboard/denuncias/?${params}`).then(renderTableRows);
}

// Botão "Atualizar" do topo: refaz só os dados, sem reload
document.getElementById("refreshDashboard")?.addEventListener("click", () => {
  Promise.all([refreshDashboardData(), loadTablePage(1)]).catch((err) => {
    console.error("Falha ao atualizar dashboard:", err);
  });
});

// Paginação sem reload: intercepta cliques em .page-btn
document.querySelector(".pagination")?.addEventListener("click", (e) => {
  const btn = e.target.closest(".page-btn");
  if (!btn) return;
  e.preventDefault();
  loadTablePage(btn.dataset.page);
});

// Mudança de status sem reload
document.getElementById("dashTableBody")?.addEventListener("change", (e) => {
  const select = e.target.closest(".status-select");
  if (!select) return;
  const form = select.closest("form");
  if (!form) return;
  e.preventDefault();
  const url = select.value;
  fetchJSON(url, { method: "POST" })
    .then(() => Promise.all([refreshDashboardData(), loadTablePage(currentPage)]))
    .catch((err) => console.error("Falha ao atualizar status:", err));
});

// ═══════════════════════════════════════════════════
//                   THEME
// ═══════════════════════════════════════════════════
let isDark = true;
function applyTheme(dark) {
  isDark = dark;
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  const icon = document.getElementById("themeIcon");
  if (icon) {
    icon.innerHTML = dark
      ? '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'
      : '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>';
  }
  document.getElementById("settingsThemeToggle")?.classList.toggle("on", dark);
}
document.getElementById("themeToggle")?.addEventListener("click", () => applyTheme(!isDark));
document.getElementById("settingsThemeToggle")?.addEventListener("click", () => applyTheme(!isDark));

// ═══════════════════════════════════════════════════
//            DASHBOARD TABLE + FILTER
// ═══════════════════════════════════════════════════
document.getElementById("dashFilterTabs")?.addEventListener("click", (e) => {
  const tab = e.target.closest(".filter-tab");
  if (!tab) return;
  activeDashStatus = tab.dataset.filter || "";
  document.querySelectorAll("#dashFilterTabs .filter-tab").forEach((t) => t.classList.toggle("active", t === tab));
  loadTablePage(1).catch((err) => console.error("Falha ao filtrar denúncias:", err));
});

// ═══════════════════════════════════════════════════
//              SVG CHARTS
// ═══════════════════════════════════════════════════
const AREA_CHART_COLORS = { abertas: "#ffc300", resolvidas: "#22c55e" };
let areaChartInstance = null;

function renderAreaChart(data) {
  const canvas = document.getElementById("areaChart");
  if (!canvas || !data.length || typeof Chart === "undefined") return;

  if (areaChartInstance) {
    areaChartInstance.destroy();
  }

  const labels = data.map((p) => p.mes.slice(5));
  const abertas = data.map((p) => p.abertas);
  const resolvidas = data.map((p) => p.resolvidas);

  const gradient = (ctx, color) => {
    const g = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    g.addColorStop(0, `${color}55`);
    g.addColorStop(1, `${color}00`);
    return g;
  };

  areaChartInstance = new Chart(canvas.getContext("2d"), {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Denúncias",
          data: abertas,
          borderColor: AREA_CHART_COLORS.abertas,
          backgroundColor: (ctx) => gradient(ctx.chart.ctx, AREA_CHART_COLORS.abertas),
          borderWidth: 2,
          tension: 0.35,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 4,
        },
        {
          label: "Resolvidos",
          data: resolvidas,
          borderColor: AREA_CHART_COLORS.resolvidas,
          backgroundColor: (ctx) => gradient(ctx.chart.ctx, AREA_CHART_COLORS.resolvidas),
          borderWidth: 2,
          tension: 0.35,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#0f172a",
          borderColor: "rgba(255,255,255,.08)",
          borderWidth: 1,
          titleColor: "#e2e8f0",
          bodyColor: "#cbd5e1",
          padding: 10,
          displayColors: true,
        },
      },
      scales: {
        x: {
          grid: { color: "rgba(255,255,255,.04)" },
          ticks: { color: "rgba(255,255,255,.4)", font: { size: 10 } },
        },
        y: {
          beginAtZero: true,
          grid: { color: "rgba(255,255,255,.04)" },
          ticks: { color: "rgba(255,255,255,.4)", font: { size: 10 }, precision: 0 },
        },
      },
    },
  });
}

function renderDonut(status) {
  const canvas = document.getElementById("statusDonut");
  if (!canvas || typeof Chart === "undefined") return;
  const total = (status.R || 0) + (status.P || 0) + (status.A || 0);

  if (window.statusDonutInstance) {
    window.statusDonutInstance.destroy();
  }

  const ctx = canvas.getContext("2d");
  window.statusDonutInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Resolvidos", "Pendentes", "Em andamento"],
      datasets: [
        {
          data: [status.R || 0, status.P || 0, status.A || 0],
          backgroundColor: ["#22c55e", "#ffc300", "#3b82f6"],
          borderColor: getComputedStyle(document.documentElement).getPropertyValue("--bg-card").trim() || "transparent",
          borderWidth: 2,
          spacing: 2,
        },
      ],
    },
    options: {
      responsive: false,
      cutout: "70%",
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#0f172a",
          borderColor: "rgba(255,255,255,.08)",
          borderWidth: 1,
          titleColor: "#e2e8f0",
          bodyColor: "#cbd5e1",
          padding: 10,
          callbacks: {
            label: (ctx) => {
              const v = ctx.parsed;
              const pct = total ? Math.round((v / total) * 100) : 0;
              return ` ${v} (${pct}%)`;
            },
          },
        },
      },
    },
  });

  const totalEl = document.getElementById("statusDonutTotal");
  if (totalEl) totalEl.textContent = total;
}

function renderCategorias(items) {
  const canvas = document.getElementById("categoriesChart");
  if (!canvas || typeof Chart === "undefined") return;
  const labels = items.map((it) => it.id_categoria__nome_categoria || "Sem categoria");
  const data = items.map((it) => it.total);

  if (window.categoriesChartInstance) {
    window.categoriesChartInstance.destroy();
  }

  window.categoriesChartInstance = new Chart(canvas.getContext("2d"), {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Denúncias",
          data,
          backgroundColor: "#3b82f6",
          borderRadius: 4,
          maxBarThickness: 18,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#0f172a",
          borderColor: "rgba(255,255,255,.08)",
          borderWidth: 1,
          titleColor: "#e2e8f0",
          bodyColor: "#cbd5e1",
          padding: 10,
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: "rgba(255,255,255,.04)" },
          ticks: { color: "rgba(255,255,255,.4)", font: { size: 10 }, precision: 0 },
        },
        y: {
          grid: { display: false },
          ticks: { color: "rgba(255,255,255,.7)", font: { size: 11 } },
        },
      },
    },
  });
}

function renderMonthlyBarChart(data) {
  const canvas = document.getElementById("monthlyBarChart");
  if (!canvas || !data.length || typeof Chart === "undefined") return;

  if (window.monthlyBarChartInstance) {
    window.monthlyBarChartInstance.destroy();
  }

  const labels = data.map((p) => p.mes.slice(5));

  window.monthlyBarChartInstance = new Chart(canvas.getContext("2d"), {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Denúncias",
          data: data.map((p) => p.abertas),
          backgroundColor: "#ffc300",
          borderRadius: 4,
          maxBarThickness: 14,
        },
        {
          label: "Resolvidos",
          data: data.map((p) => p.resolvidas),
          backgroundColor: "#22c55e",
          borderRadius: 4,
          maxBarThickness: 14,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#0f172a",
          borderColor: "rgba(255,255,255,.08)",
          borderWidth: 1,
          titleColor: "#e2e8f0",
          bodyColor: "#cbd5e1",
          padding: 10,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "rgba(255,255,255,.4)", font: { size: 10 } },
        },
        y: {
          beginAtZero: true,
          grid: { color: "rgba(255,255,255,.04)" },
          ticks: { color: "rgba(255,255,255,.4)", font: { size: 10 }, precision: 0 },
        },
      },
    },
  });
}

fetch("/denuncia/dashboard/dados/", { credentials: "same-origin" })
  .then((response) => response.json())
  .then((dados) => {
    renderAreaChart(dados.mensal);
    renderDonut(dados.status);
    renderCategorias(dados.por_categoria);
    renderMonthlyBarChart(dados.mensal);
  });
