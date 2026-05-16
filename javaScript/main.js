(function() {
  const THEME_KEY = "theme";
  const DARK_ICON = '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />';
  const LIGHT_ICON = '<circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />';

  function getPreferredTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);

    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function syncThemeIcon(theme) {
    const themeIcon = document.getElementById("themeIcon");
    const themeToggle = document.getElementById("themeToggle");

    if (themeIcon) {
      themeIcon.innerHTML = theme === "dark" ? DARK_ICON : LIGHT_ICON;
    }

    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", theme === "dark");
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
    syncThemeIcon(theme);
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme") === "dark"
      ? "dark"
      : "light";
    applyTheme(currentTheme === "dark" ? "light" : "dark");
  }

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

  applyTheme(getPreferredTheme());

  document.addEventListener("click", function(event) {
    if (event.target.closest("#themeToggle") && !event.target.closest("#dashboardThemeToggle")) {
      toggleTheme();
    }
  });

  document.addEventListener("DOMContentLoaded", async function() {
    await Promise.all([
      loadComponent("header-component", "header.html"),
      loadComponent("footer-component", "footer.html", "footer"),
    ]);

    syncThemeIcon(document.documentElement.getAttribute("data-theme") || getPreferredTheme());
    document.dispatchEvent(new CustomEvent("componentsLoaded"));
  });

  window.syncThemeIcon = syncThemeIcon;
  window.applyTheme = applyTheme;
})();
