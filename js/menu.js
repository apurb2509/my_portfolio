// menu.js — Dark theme nav with ESC key close

import gsap from "gsap";

document.addEventListener("DOMContentLoaded", () => {
  const menuToggleBtn = document.querySelector(".menu-toggle-btn");
  const navOverlay    = document.querySelector(".nav-overlay");
  const openLabel     = document.querySelector(".open-label");
  const closeLabel    = document.querySelector(".close-label");
  const navItems      = document.querySelectorAll(".nav-item");

  if (!menuToggleBtn || !navOverlay) return;

  let isMenuOpen  = false;
  let isAnimating = false;
  let scrollY     = 0;

  function openMenu() {
    if (isAnimating || isMenuOpen) return;
    isAnimating = true;

    navOverlay.style.pointerEvents = "all";
    menuToggleBtn.classList.add("menu-open");

    // Lock scroll
    scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top      = `-${scrollY}px`;
    document.body.style.width    = "100%";

    // Toggle label
    gsap.to(openLabel,  { y: "-1rem", duration: 0.28, ease: "power2.inOut" });
    gsap.to(closeLabel, { y: "-1rem", duration: 0.28, ease: "power2.inOut" });

    // Fade overlay in
    gsap.to(navOverlay, {
      opacity: 1,
      duration: 0.35,
      ease: "power2.out",
      onComplete: () => { isAnimating = false; },
    });

    // Stagger nav items up
    gsap.to(
      [navItems, ".nav-footer-item-header", ".nav-footer-item-copy"],
      {
        opacity: 1,
        y: "0%",
        duration: 0.6,
        stagger: 0.06,
        ease: "power4.out",
      }
    );

    isMenuOpen = true;
  }

  function closeMenu() {
    if (isAnimating || !isMenuOpen) return;
    isAnimating = true;

    navOverlay.style.pointerEvents = "none";
    menuToggleBtn.classList.remove("menu-open");

    // Restore scroll
    document.body.style.position = "";
    document.body.style.top      = "";
    document.body.style.width    = "";
    window.scrollTo(0, scrollY);

    // Toggle label
    gsap.to(openLabel,  { y: "0rem", duration: 0.28, ease: "power2.inOut" });
    gsap.to(closeLabel, { y: "0rem", duration: 0.28, ease: "power2.inOut" });

    // Fade overlay out
    gsap.to(navOverlay, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        gsap.set(
          [navItems, ".nav-footer-item-header", ".nav-footer-item-copy"],
          { opacity: 0, y: "100%" }
        );
        isAnimating = false;
      },
    });

    isMenuOpen = false;
  }

  menuToggleBtn.addEventListener("click", () => {
    if (isMenuOpen) closeMenu();
    else            openMenu();
  });

  // Close on ESC key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isMenuOpen) closeMenu();
  });

  // Close when clicking a nav link (that isn't same page)
  navOverlay.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => closeMenu());
  });
});