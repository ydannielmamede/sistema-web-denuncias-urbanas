document.addEventListener("DOMContentLoaded", async function() {
  await Promise.all([
    loadComponent("header-component", "header.html"),
    loadComponent("footer-component", "footer.html", "footer"),
  ]);

  document.dispatchEvent(new CustomEvent("componentsLoaded"));
});

async function loadComponent(elementId, path, className) {
  const container = document.getElementById(elementId);

  if (!container) {
    return;
  }

  const response = await fetch(path);
  container.innerHTML = await response.text();

  if (className) {
    container.classList.add(className);
  }
}
