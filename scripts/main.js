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
    const current = window.location.pathname;

    function normalizePath(pathname) {
      let normalized = pathname;
      if (!normalized || normalized === "/") {
        return "/";
      }
      normalized = normalized.replace(/index\.html$/i, "");
      normalized = normalized.replace(/\.html$/i, "/");
      if (!normalized.endsWith("/")) {
        normalized += "/";
      }
      return normalized;
    }

    const normalizedCurrent = normalizePath(current);

    links.forEach((link) => {
      if (!(link instanceof HTMLAnchorElement)) {
        return;
      }

      const linkPath = new URL(link.href, window.location.origin).pathname;
      const normalizedLink = normalizePath(linkPath);

      if (normalizedLink === normalizedCurrent) {
        link.classList.add("is-active");
      }
    });
  }

  setActiveNavLink();

  function initHeaderGlow() {
    if (!header || !nav) {
      return;
    }

    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!canHover) {
      return;
    }

    const links = Array.from(nav.querySelectorAll("a"));
    if (!links.length) {
      return;
    }

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let targetTabX = 0;
    let targetTabY = 0;
    let currentTabX = 0;
    let currentTabY = 0;
    let targetGlowOpacity = 0;
    let currentGlowOpacity = 0;
    let targetTabOpacity = 0;
    let currentTabOpacity = 0;
    let currentWobbleX = 0;
    let currentWobbleY = 0;
    let currentMorphSize = 0;
    let currentFlowPulse = 0.5;

    function refreshCenter() {
      const rect = header.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      targetX = centerX;
      targetY = centerY;
      currentX = centerX;
      currentY = centerY;
      targetTabX = centerX;
      targetTabY = centerY;
      currentTabX = centerX;
      currentTabY = centerY;
    }

    function setCursorTarget(clientX, clientY) {
      const rect = header.getBoundingClientRect();
      targetX = clientX - rect.left;
      targetY = clientY - rect.top;
      targetGlowOpacity = 1;
    }

    function setTabTarget(link) {
      const headerRect = header.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();
      targetTabX = linkRect.left - headerRect.left + linkRect.width / 2;
      targetTabY = linkRect.top - headerRect.top + linkRect.height / 2;
      targetTabOpacity = 1;
    }

    function lerp(from, to, amount) {
      return from + (to - from) * amount;
    }

    refreshCenter();

    header.addEventListener("pointerenter", (event) => {
      setCursorTarget(event.clientX, event.clientY);
    });

    header.addEventListener("pointermove", (event) => {
      setCursorTarget(event.clientX, event.clientY);
    });

    header.addEventListener("pointerleave", () => {
      targetGlowOpacity = 0;
      targetTabOpacity = 0;
    });

    links.forEach((link) => {
      link.addEventListener("pointerenter", () => {
        setTabTarget(link);
      });

      link.addEventListener("pointermove", (event) => {
        setCursorTarget(event.clientX, event.clientY);
        setTabTarget(link);
      });

      link.addEventListener("pointerleave", () => {
        targetTabOpacity = 0;
      });
    });

    window.addEventListener("resize", refreshCenter);

    function animateGlow() {
      const time = performance.now() * 0.001;
      const wobbleTargetX = Math.sin(time * 1.7) * 7 + Math.sin(time * 0.86) * 3.2;
      const wobbleTargetY = Math.cos(time * 1.45) * 6 + Math.cos(time * 0.7) * 2.6;
      const morphTarget = Math.sin(time * 1.95) * 11 + Math.cos(time * 1.1) * 4;
      const pulseTarget = (Math.sin(time * 1.8) + 1) * 0.5;

      currentX = lerp(currentX, targetX, 0.14);
      currentY = lerp(currentY, targetY, 0.14);
      currentTabX = lerp(currentTabX, targetTabX, 0.16);
      currentTabY = lerp(currentTabY, targetTabY, 0.16);
      currentGlowOpacity = lerp(currentGlowOpacity, targetGlowOpacity, 0.075);
      currentTabOpacity = lerp(currentTabOpacity, targetTabOpacity, 0.09);
      currentWobbleX = lerp(currentWobbleX, wobbleTargetX, 0.08);
      currentWobbleY = lerp(currentWobbleY, wobbleTargetY, 0.08);
      currentMorphSize = lerp(currentMorphSize, morphTarget, 0.065);
      currentFlowPulse = lerp(currentFlowPulse, pulseTarget, 0.05);

      header.style.setProperty("--cursor-x", `${currentX.toFixed(2)}px`);
      header.style.setProperty("--cursor-y", `${currentY.toFixed(2)}px`);
      header.style.setProperty("--tab-x", `${currentTabX.toFixed(2)}px`);
      header.style.setProperty("--tab-y", `${currentTabY.toFixed(2)}px`);
      header.style.setProperty("--glow-opacity", currentGlowOpacity.toFixed(3));
      header.style.setProperty("--tab-opacity", currentTabOpacity.toFixed(3));
      header.style.setProperty("--wobble-x", `${currentWobbleX.toFixed(2)}px`);
      header.style.setProperty("--wobble-y", `${currentWobbleY.toFixed(2)}px`);
      header.style.setProperty("--morph-size", `${currentMorphSize.toFixed(2)}px`);
      header.style.setProperty("--flow-pulse", currentFlowPulse.toFixed(3));

      window.requestAnimationFrame(animateGlow);
    }

    window.requestAnimationFrame(animateGlow);
  }

  initHeaderGlow();

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
        delay = 0.08;
      } else if (node.classList.contains("reveal-delay-2")) {
        delay = 0.14;
      } else if (node.classList.contains("reveal-delay-3")) {
        delay = 0.2;
      }

      window.gsap.fromTo(
        node,
        { autoAlpha: 0, y: 30, scale: 0.986 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          delay,
          duration: 0.6,
          ease: "power3.out",
          onStart: () => revealNow(node),
          scrollTrigger: {
            trigger: node,
            start: "top 90%",
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
