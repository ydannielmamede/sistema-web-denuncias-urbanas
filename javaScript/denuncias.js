// Hamburger menu toggle
document.addEventListener("DOMContentLoaded", function() {
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", function() {
      navLinks.classList.toggle("mobile-open");
      hamburger.classList.toggle("active");
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
