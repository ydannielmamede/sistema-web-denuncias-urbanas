// ═══════════════════════════════════════════════════
// MÓDULO: Formulário de Denúncia
// Responsável por gerenciar o modal de denúncias urbanas
// ═══════════════════════════════════════════════════

(function(global) {
  // Extrai as configurações iniciais do trigger que abriu o modal
  // Retorna objeto com categoria e modo (anônimo/identificado)
  function resolveModalPreset(triggerData = {}) {
    return {
      categoria:
        typeof triggerData.categoria === "string"
          ? triggerData.categoria.trim().toLowerCase()
          : "",
      modo: triggerData.modo === "anonima" ? "anonima" : "identificada",
    };
  }

  // Constrói o objeto de localização a partir de coordenadas GPS ou entrada manual
  // Prioridade: GPS > localização manual
  // Retorna objeto com tipo e valor da localização
  function buildLocationPayload(coords, localManual) {
    // Verifica se as coordenadas GPS são válidas
    if (
      coords &&
      Number.isFinite(coords.latitude) &&
      Number.isFinite(coords.longitude)
    ) {
      return {
        type: "geo",
        value: `Lat: ${coords.latitude.toFixed(6)}, Lng: ${coords.longitude.toFixed(6)}`,
      };
    }

    // Tenta usar localização manual se GPS não estiver disponível
    const manual = typeof localManual === "string" ? localManual.trim() : "";

    if (manual) {
      return {
        type: "manual",
        value: manual,
      };
    }

    // Retorna vazio se nenhuma localização foi fornecida
    return {
      type: null,
      value: "",
    };
  }

  // Valida os campos do formulário de denúncia
  // Verifica: categoria, mensagem e localização
  // Retorna objeto com validação, erros encontrados e localização construída
  function validateFormulario({ categoria, mensagem, coords, localManual }) {
    const errors = {};
    const location = buildLocationPayload(coords, localManual);
    const categoriaNormalizada =
      typeof categoria === "string" ? categoria.trim().toLowerCase() : "";
    const mensagemNormalizada =
      typeof mensagem === "string" ? mensagem.trim() : "";

    // Valida categoria
    if (!categoriaNormalizada) {
      errors.categoria = "Selecione uma categoria.";
    }

    // Valida mensagem/descrição
    if (!mensagemNormalizada) {
      errors.mensagem = "Descreva a denúncia.";
    }

    // Valida localização
    if (!location.value) {
      errors.localizacao =
        "Informe a localização atual ou preencha o local manual.";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      location,
    };
  }

  // Constrói mensagem de sucesso diferenciada conforme modo (anônimo/identificado)
  function buildSuccessMessage(modo) {
    return modo === "anonima"
      ? "Denúncia anônima enviada com sucesso!"
      : "Denúncia enviada com sucesso!";
  }

  // Inicializa o formulário de denúncia
  // Conecta handlers de eventos e gerencia estado do modal
  function initFormularioDenuncia() {
    // Busca todos os elementos do DOM necessários
    const modal = document.getElementById("modalFormulario");
    const formulario = document.getElementById("formularioDenuncia");
    const fecharModalFormulario = document.getElementById(
      "fecharModalFormulario",
    );
    const categoriaDenuncia = document.getElementById("categoriaDenuncia");
    const botaoTipoDenuncia = document.getElementById("botaoTipoDenuncia");
    const tipoDenunciaInput = document.getElementById("tipoDenunciaInput");
    const mensagemDenuncia = document.getElementById("mensagemDenuncia");
    const localManual = document.getElementById("localManual");
    const usarLocalizacaoAtual = document.getElementById(
      "usarLocalizacaoAtual",
    );
    const statusLocalizacao = document.getElementById("statusLocalizacao");
    const tipoDenunciaStatus = document.getElementById("tipoDenunciaStatus");
    const mensagemSucesso = document.getElementById("mensagemSucesso");
    const triggers = document.querySelectorAll("[data-modal-trigger]");

    // Valida se todos os elementos foram encontrados
    if (
      !modal ||
      !formulario ||
      !fecharModalFormulario ||
      !categoriaDenuncia ||
      !botaoTipoDenuncia ||
      !tipoDenunciaInput ||
      !mensagemDenuncia ||
      !localManual ||
      !usarLocalizacaoAtual ||
      !statusLocalizacao ||
      !mensagemSucesso ||
      !tipoDenunciaStatus
    ) {
      return null;
    }

    // Estado do módulo
    let currentCoords = null;
    let isAnonima = false;

    // Limpa mensagens de feedback anterior
    function clearFeedback() {
      mensagemSucesso.textContent = "";
      mensagemSucesso.className = "";
    }

    // Atualiza a exibição do status do modo de denúncia (anônimo/identificado)
    function updateTipoDenunciaStatus() {
      tipoDenunciaStatus.textContent = isAnonima
        ? "Modo anônimo ativado"
        : "Modo anônimo desativado";
      botaoTipoDenuncia.setAttribute("aria-pressed", String(isAnonima));
      tipoDenunciaInput.value = isAnonima ? "anonima" : "identificada";
    }

    // Reseta o formulário ao estado inicial
    function resetFormulario() {
      formulario.reset();
      isAnonima = false;
      updateTipoDenunciaStatus();
      currentCoords = null;
      statusLocalizacao.textContent = "Nenhuma localização capturada.";
      clearFeedback();
    }

    // Fecha o modal e reseta o estado
    function closeModal() {
      modal.style.display = "none";
      modal.setAttribute("aria-hidden", "true");
      resetFormulario();
    }

    // Aplica as configurações iniciais do trigger (categoria e modo)
    function applyPreset(trigger) {
      const preset = resolveModalPreset(trigger.dataset);
      isAnonima = preset.modo === "anonima";
      updateTipoDenunciaStatus();
      categoriaDenuncia.value = preset.categoria;
    }

    // Abre o modal e aplica as configurações iniciais
    function openModal(trigger) {
      resetFormulario();
      applyPreset(trigger);
      modal.style.display = "flex";
      modal.setAttribute("aria-hidden", "false");
      mensagemDenuncia.focus();
    }

    // ═══════════════════════════════════════════════════
    // EVENT LISTENERS - Abre o modal
    // ═══════════════════════════════════════════════════
    triggers.forEach((trigger) => {
      trigger.addEventListener("click", (event) => {
        event.preventDefault();
        openModal(trigger);
      });
    });

    // Fecha o modal ao clicar no botão fechar
    fecharModalFormulario.addEventListener("click", closeModal);

    // Fecha o modal ao clicar fora dele (no fundo semi-transparente)
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });

    // Fecha o modal ao pressionar a tecla ESC
    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        modal.getAttribute("aria-hidden") === "false"
      ) {
        closeModal();
      }
    });

    // Alterna entre modo anônimo e identificado
    botaoTipoDenuncia.addEventListener("click", () => {
      isAnonima = !isAnonima;
      updateTipoDenunciaStatus();
    });

    // ═══════════════════════════════════════════════════
    // EVENT LISTENER - Botão de localização GPS
    // Captura coordenadas do navegador ou orienta para preenchimento manual
    // ═══════════════════════════════════════════════════
    usarLocalizacaoAtual.addEventListener("click", () => {
      if (!navigator.geolocation) {
        currentCoords = null;
        statusLocalizacao.textContent =
          "Geolocalização não suportada. Preencha o local manualmente.";
        return;
      }

      statusLocalizacao.textContent = "Capturando localização...";

      navigator.geolocation.getCurrentPosition(
        (position) => {
          currentCoords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          statusLocalizacao.textContent = buildLocationPayload(
            currentCoords,
            "",
          ).value;
        },
        () => {
          currentCoords = null;
          statusLocalizacao.textContent =
            "Não foi possível capturar a localização. Preencha o local manualmente.";
        },
      );
    });

    // ═══════════════════════════════════════════════════
    // EVENT LISTENER - Submissão do formulário
    // Valida dados e exibe mensagem de sucesso/erro
    // ═══════════════════════════════════════════════════
    formulario.addEventListener("submit", (event) => {
      event.preventDefault();

      const modo = tipoDenunciaInput.value;
      const validation = validateFormulario({
        categoria: categoriaDenuncia.value,
        mensagem: mensagemDenuncia.value,
        coords: currentCoords,
        localManual: localManual.value,
      });

      // Se há erros, exibe a primeira mensagem de erro
      if (!validation.isValid) {
        mensagemSucesso.textContent = Object.values(validation.errors)[0];
        mensagemSucesso.className = "error";
        return;
      }

      // Exibe mensagem de sucesso e fecha o modal após 1.8s
      mensagemSucesso.textContent = buildSuccessMessage(modo);
      mensagemSucesso.className = "success";

      setTimeout(() => {
        closeModal();
      }, 1800);
    });

    // Retorna interface pública do módulo
    return {
      openModal,
      closeModal,
    };
  }

  // ═══════════════════════════════════════════════════
  // EXPORTAÇÃO DA API
  // Disponibiliza as funções públicas para acesso externo
  // ═══════════════════════════════════════════════════
  const api = {
    resolveModalPreset,
    buildLocationPayload,
    validateFormulario,
    buildSuccessMessage,
    initFormularioDenuncia,
  };

  // Exporta para ambiente CommonJS (Node.js/Webpack)
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  // Exporta para ambiente global (browser)
  global.FormularioDenuncia = api;

  // Inicializa automaticamente quando o DOM está pronto
  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", initFormularioDenuncia);
  }
})(typeof window !== "undefined" ? window : globalThis);
