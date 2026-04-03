/**
 * Main JS — Site-brede functionaliteit
 */

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initSmoothScroll();
});

/**
 * Mobile hamburger menu
 */
function initMobileMenu() {
  const toggle = document.querySelector(".site-header__menu-toggle");
  const nav = document.querySelector(".site-nav");

  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", !isOpen);
    nav.classList.toggle("is-open");

    // Voorkom scrollen als menu open is
    document.body.style.overflow = isOpen ? "" : "hidden";
  });

  // Sluit menu bij klik op link
  nav.querySelectorAll(".site-nav__link").forEach((link) => {
    link.addEventListener("click", () => {
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
      document.body.style.overflow = "";
    });
  });
}

/**
 * Smooth scroll voor anker-links
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
}
