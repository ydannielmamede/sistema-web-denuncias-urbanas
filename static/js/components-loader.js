function initHamburgerMenu() {
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  if (!hamburger || !navLinks) {
    return;
  }

  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("mobile-open");
    hamburger.classList.toggle("active");
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHamburgerMenu);
} else {
  initHamburgerMenu();
}
