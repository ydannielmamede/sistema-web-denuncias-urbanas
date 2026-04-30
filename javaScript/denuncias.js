// Hamburger menu toggle
document.addEventListener("DOMContentLoaded", function() {
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const root = document.documentElement;

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", function() {
      navLinks.classList.toggle("mobile-open");
      hamburger.classList.toggle("active");
    });
  }

  function syncThemeIcon(theme) {
    if (!themeIcon) {
      return;
    }

    themeIcon.innerHTML =
      theme === "dark"
        ? '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />'
        : '<circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />';
  }

  function applyTheme(theme) {
    const isDark = theme === "dark";
    root.setAttribute("data-theme", isDark ? "dark" : "light");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    syncThemeIcon(isDark ? "dark" : "light");

    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", String(!isDark));
    }
  }

  if (themeToggle) {
    const savedTheme = localStorage.getItem("theme");
    const initialTheme =
      savedTheme === "light" || savedTheme === "dark"
        ? savedTheme
        : root.getAttribute("data-theme") || "dark";

    applyTheme(initialTheme);

    themeToggle.addEventListener("click", function() {
      const currentTheme =
        root.getAttribute("data-theme") === "light" ? "light" : "dark";
      applyTheme(currentTheme === "dark" ? "light" : "dark");
    });
  }
});

const formulario = document.getElementById("meuFormulario");
const contadorElement = document.getElementById("contador");
const mensagemSucesso = document.getElementById("mensagemSucesso");

// Inicializar contador ao carregar a página
function inicializarContador() {
  if (!localStorage.getItem("formulariosEnviados")) {
    localStorage.setItem("formulariosEnviados", "0");
  }
  atualizarContador();
}

// Função para atualizar o contador
function atualizarContador() {
  if (!contadorElement) {
    return;
  }

  const contador = localStorage.getItem("formulariosEnviados") || "0";
  contadorElement.textContent = contador;
}

// Escutar o envio do formulário
if (formulario) {
  formulario.addEventListener("submit", function(e) {
    e.preventDefault();

    // Obter o contador atual
    let contador = parseInt(localStorage.getItem("formulariosEnviados")) || 0;

    // Incrementar o contador
    contador++;

    // Salvar no localStorage
    localStorage.setItem("formulariosEnviados", contador);

    // Limpar o formulário
    this.reset();

    // Atualizar contador na página
    atualizarContador();

    // Mostrar mensagem de sucesso
    if (mensagemSucesso) {
      mensagemSucesso.textContent = `✓ Denúncia registrada com sucesso! (Total: ${contador})`;
      mensagemSucesso.className = "success";

      // Limpar mensagem após 3 segundos
      setTimeout(() => {
        mensagemSucesso.textContent = "";

        if (typeof fecharModal === "function") {
          fecharModal();
        }
      }, 3000);
    }
  });
}

if (contadorElement) {
  // Inicializar ao carregar
  inicializarContador();

  // Atualizar em tempo real (a cada 500ms) se estiver em abas diferentes
  setInterval(atualizarContador, 500);

  // Atualizar o contador ao carregar a página
  atualizarContador();
}

// Função para resetar o contador
function resetarContador() {
  if (confirm("Deseja realmente resetar o contador?")) {
    localStorage.setItem("formulariosEnviados", "0");
    atualizarContador();
    alert("Contador resetado com sucesso!");
  }
}
