// services.js

// Import GSAP and ScrollTrigger plugin
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Wait for DOM to fully load before executing
document.addEventListener("DOMContentLoaded", () => {
  // Check if current page is the homepage; exit if not
  const isHomePage = document.querySelector(".page.home-page");
  if (!isHomePage) return;

  // Register ScrollTrigger plugin with GSAP
  gsap.registerPlugin(ScrollTrigger);

  let scrollTriggerInstances = []; // Store ScrollTrigger instances for cleanup

  // Initialize animations
  const initAnimations = () => {
    // Disable animations on small screens (width <= 1000px)
    if (window.innerWidth <= 1000) {
      scrollTriggerInstances.forEach((instance) => {
        if (instance) instance.kill(); // Clean up existing instances
      });
      scrollTriggerInstances = []; // Reset array
      return;
    }

    // Clean up existing ScrollTrigger instances
    scrollTriggerInstances.forEach((instance) => {
      if (instance) instance.kill();
    });
    scrollTriggerInstances = [];

    // Get all service card elements
    const services = gsap.utils.toArray(".service-card");

    // Create main ScrollTrigger to track entire service section
    const mainTrigger = ScrollTrigger.create({
      trigger: services[0],
      start: "top 50%",
      endTrigger: services[services.length - 1],
      end: "top 150%",
    });
    scrollTriggerInstances.push(mainTrigger);

    // Animate each service card
    services.forEach((service, index) => {
      const isLastServiceCard = index === services.length - 1;
      const serviceCardInner = service.querySelector(".service-card-inner");

      if (!isLastServiceCard) {
        // Pin service card during scroll — end is tied to the contact-cta
        const pinTrigger = ScrollTrigger.create({
          trigger: service,
          start: "top 45%",
          endTrigger: ".contact-cta",
          end: "top 100%", // was 90%, extended so last card doesn't overlap
          pin: true,
          pinSpacing: false,
        });
        scrollTriggerInstances.push(pinTrigger);

        // Each card slides up by a smaller, fixed amount to prevent overlap
        // Using a fixed 10vh per card instead of a multiplier-based formula
        const yShift = (services.length - 1 - index) * 10;
        const scrollAnimation = gsap.to(serviceCardInner, {
          y: `-${yShift}vh`,
          ease: "none",
          scrollTrigger: {
            trigger: service,
            start: "top 45%",
            endTrigger: ".contact-cta",
            end: "top 100%",
            scrub: true,
          },
        });
        scrollTriggerInstances.push(scrollAnimation.scrollTrigger);
      }
    });
  };

  // Run animations on page load
  initAnimations();

  // Re-run animations on window resize to recalculate trigger points
  window.addEventListener("resize", () => {
    initAnimations();
  });
});