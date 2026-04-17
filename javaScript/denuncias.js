// Função para abrir o modal
function abrirModal() {
  document.getElementById("modalFormulario").style.display = "flex";
}

// Função para fechar o modal
function fecharModal() {
  document.getElementById("modalFormulario").style.display = "none";
}

// Fechar modal ao clicar fora dele
window.onclick = function(event) {
  const modal = document.getElementById("modalFormulario");
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

// Inicializar contador ao carregar a página
function inicializarContador() {
  if (!localStorage.getItem("formulariosEnviados")) {
    localStorage.setItem("formulariosEnviados", "0");
  }
  atualizarContador();
}

// Função para atualizar o contador
function atualizarContador() {
  const contador = localStorage.getItem("formulariosEnviados") || "0";
  document.getElementById("contador").textContent = contador;
}

// Escutar o envio do formulário
document
  .getElementById("meuFormulario")
  .addEventListener("submit", function(e) {
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
    const mensagem = document.getElementById("mensagemSucesso");
    mensagem.textContent = `✓ Denúncia registrada com sucesso! (Total: ${contador})`;
    mensagem.className = "success";

    // Limpar mensagem após 3 segundos
    setTimeout(() => {
      mensagem.textContent = "";
      fecharModal();
    }, 3000);
  });

// Inicializar ao carregar
inicializarContador();

// Atualizar em tempo real (a cada 500ms) se estiver em abas diferentes
setInterval(atualizarContador, 500);

// Função para atualizar o contador
function atualizarContador() {
  const contador = localStorage.getItem("formulariosEnviados") || "0";
  document.getElementById("contador").textContent = contador;
}

// Função para resetar o contador
function resetarContador() {
  if (confirm("Deseja realmente resetar o contador?")) {
    localStorage.setItem("formulariosEnviados", "0");
    atualizarContador();
    alert("Contador resetado com sucesso!");
  }
}

// Atualizar o contador ao carregar a página
atualizarContador();
