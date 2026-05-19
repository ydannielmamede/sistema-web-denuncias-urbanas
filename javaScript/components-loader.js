const components = [
  { selector: "#global-header", path: "header.html", onLoad: initHeaderInteractions },
  { selector: "#global-footer", path: "footer.html", className: "footer" },
];

async function loadComponent({ selector, path, className, onLoad }) {
  const target = document.querySelector(selector);

  if (!target) {
    return;
  }

  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Não foi possível carregar ${path}`);
  }

  if (className) {
    target.className = className;
  }

  target.innerHTML = await response.text();

  if (typeof onLoad === "function") {
    onLoad(target);
  }
}

function initHeaderInteractions(header) {
  const hamburger = header.querySelector(".hamburger");
  const navLinks = header.querySelector(".nav-links");

  if (!hamburger || !navLinks) {
    return;
  }

  hamburger.addEventListener("click", function() {
    navLinks.classList.toggle("mobile-open");
    hamburger.classList.toggle("active");
  });
}

components.forEach((component) => {
  loadComponent(component).catch((error) => {
    console.error(error);
  });
});
