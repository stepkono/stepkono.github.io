"use strict";

(function initSite() {
  const header = document.querySelector(".site-header");
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  const yearNode = document.querySelector("[data-year]");

  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  }

  function updateHeaderState() {
    if (!header) {
      return;
    }
    if (window.scrollY > 12) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  updateHeaderState();
  window.addEventListener("scroll", updateHeaderState, { passive: true });

  if (menuButton && header && nav) {
    menuButton.addEventListener("click", () => {
      const expanded = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", expanded ? "false" : "true");
      header.setAttribute("data-menu-open", expanded ? "false" : "true");
    });

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      if (!header.contains(target)) {
        menuButton.setAttribute("aria-expanded", "false");
        header.setAttribute("data-menu-open", "false");
      }
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menuButton.setAttribute("aria-expanded", "false");
        header.setAttribute("data-menu-open", "false");
      });
    });
  }

  function setActiveNavLink() {
    const links = document.querySelectorAll(".nav a[href]");
    const current = window.location.pathname.split("/").pop() || "index.html";

    links.forEach((link) => {
      const href = link.getAttribute("href");
      if (!href) {
        return;
      }
      const normalized = href === "./" ? "index.html" : href;
      if (normalized === current) {
        link.classList.add("is-active");
      }
    });
  }

  setActiveNavLink();

  function attachPressFeedback(node) {
    let clearTimer = null;

    function press() {
      if (clearTimer) {
        window.clearTimeout(clearTimer);
        clearTimer = null;
      }
      node.classList.add("is-pressed");
    }

    function release() {
      clearTimer = window.setTimeout(() => {
        node.classList.remove("is-pressed");
      }, 120);
    }

    node.addEventListener("pointerdown", press);
    node.addEventListener("pointerup", release);
    node.addEventListener("pointerleave", release);
    node.addEventListener("pointercancel", release);
    node.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        press();
      }
    });
    node.addEventListener("keyup", release);
  }

  document.querySelectorAll(".btn, .nav a, .faq-trigger, .menu-toggle").forEach((node) => {
    if (node instanceof HTMLElement) {
      attachPressFeedback(node);
    }
  });

  const revealNodes = document.querySelectorAll(".reveal");
  const chartBars = document.querySelectorAll(".bar-fill[data-fill]");
  const countNodes = document.querySelectorAll("[data-count]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = Boolean(window.gsap && window.ScrollTrigger);

  function animateCount(node) {
    const target = Number(node.getAttribute("data-count") || "0");
    if (!Number.isFinite(target) || target <= 0) {
      return;
    }

    const duration = 1000;
    const start = performance.now();

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.round(target * progress);
      node.textContent = String(value);

      if (progress < 1) {
        window.requestAnimationFrame(frame);
      }
    }

    window.requestAnimationFrame(frame);
  }

  function revealNow(node) {
    node.classList.add("is-visible");
  }

  if (prefersReducedMotion) {
    revealNodes.forEach(revealNow);
    chartBars.forEach((bar) => {
      bar.style.setProperty("--fill", bar.getAttribute("data-fill") || "0");
    });
    countNodes.forEach(animateCount);
  } else if (hasGsap) {
    window.gsap.registerPlugin(window.ScrollTrigger);

    revealNodes.forEach((node) => {
      let delay = 0;
      if (node.classList.contains("reveal-delay-1")) {
        delay = 0.12;
      } else if (node.classList.contains("reveal-delay-2")) {
        delay = 0.2;
      } else if (node.classList.contains("reveal-delay-3")) {
        delay = 0.28;
      }

      window.gsap.fromTo(
        node,
        { autoAlpha: 0, y: 30, scale: 0.986 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          delay,
          duration: 0.95,
          ease: "power3.out",
          onStart: () => revealNow(node),
          scrollTrigger: {
            trigger: node,
            start: "top 88%",
            once: true
          }
        }
      );
    });

    chartBars.forEach((bar) => {
      window.ScrollTrigger.create({
        trigger: bar,
        start: "top 92%",
        once: true,
        onEnter: () => {
          bar.style.setProperty("--fill", bar.getAttribute("data-fill") || "0");
        }
      });
    });

    countNodes.forEach((node) => {
      window.ScrollTrigger.create({
        trigger: node,
        start: "top 92%",
        once: true,
        onEnter: () => animateCount(node)
      });
    });
  } else if (!("IntersectionObserver" in window)) {
    revealNodes.forEach(revealNow);
    chartBars.forEach((bar) => {
      bar.style.setProperty("--fill", bar.getAttribute("data-fill") || "0");
    });
    countNodes.forEach(animateCount);
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          revealNow(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -40px" }
    );

    revealNodes.forEach((node) => revealObserver.observe(node));

    if (chartBars.length || countNodes.length) {
      const statsObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            if (entry.target instanceof HTMLElement && entry.target.classList.contains("bar-fill")) {
              const fill = entry.target.getAttribute("data-fill") || "0";
              entry.target.style.setProperty("--fill", fill);
            }

            if (entry.target instanceof HTMLElement && entry.target.hasAttribute("data-count")) {
              animateCount(entry.target);
            }

            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.3 }
      );

      chartBars.forEach((bar) => statsObserver.observe(bar));
      countNodes.forEach((node) => statsObserver.observe(node));
    }
  }

  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    const trigger = item.querySelector(".faq-trigger");
    if (!(trigger instanceof HTMLButtonElement)) {
      return;
    }

    trigger.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");
      faqItems.forEach((other) => {
        other.classList.remove("is-open");
        const otherTrigger = other.querySelector(".faq-trigger");
        if (otherTrigger instanceof HTMLButtonElement) {
          otherTrigger.setAttribute("aria-expanded", "false");
        }
      });

      if (!isOpen) {
        item.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
      }
    });
  });
})();
