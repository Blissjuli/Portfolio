
(() => {
  "use strict";

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  
  const CONFIG = {
    
    NAV_SCROLL_OFFSET: 40,
    ACTIVE_NAV_MARGIN: "-45% 0px -50% 0px",

    
    BACK_TO_TOP_THRESHOLD: 600,
    PARALLAX_FACTORS: [-0.05, 0.04],
    PARALLAX_MAX_TRANSLATE: 800,

    
    REVEAL_THRESHOLD: 0.15,
    REVEAL_MARGIN: "0px 0px -40px 0px",
    WILL_CHANGE_RELEASE_MS: 2200,

    
    COUNTER_DURATION: 1600,
    COUNTER_OBSERVER_THRESHOLD: 0.4,

    
    PARTICLE_MOBILE_COUNT: 14,
    PARTICLE_DESKTOP_COUNT: 30,
    PARTICLE_MOBILE_WIDTH: 640,
    PARTICLE_COLORS: [
      "var(--primary)",
      "var(--gold)",
      "var(--olive-light)",
      "var(--beige)",
    ],

    
    CURSOR_GLOW_LERP: 0.1,
    CURSOR_GLOW_OFFSET: 210,
    CURSOR_GLOW_STOP_THRESHOLD: 1,

    
    TILT_PERSPECTIVE: 900,
    TILT_MAX_DEGREES: 8,
    TILT_LIFT_PX: -4,

    
    MAGNETIC_FACTOR: 0.25,
    RIPPLE_DURATION_MS: 650,

    
    MODAL_FOCUS_DELAY_MS: 50,
    FOCUSABLE_SELECTOR:
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',

    
    AUTO_SLIDE_INTERVAL_MS: 5000,

    
    TYPING_DEFAULTS: {
      sound: false,
      speed: 100,
      deleteSpeed: 50,
      pause: 1500,
      keepLast: false,
    },
    TYPING_SOUND_EVERY_NTH_CHAR: 3,

    
    FORM_SUCCESS_DELAY_MS: 900,
    FORM_RESET_LABEL_MS: 3000,
  };

  
  const DOM = {
    navbar: document.getElementById("navbar"),
    hamburger: document.getElementById("hamburger"),
    mobileMenu: document.getElementById("mobileMenu"),
    navLinks: Array.from(document.querySelectorAll(".nav-link")),
    mobileLinks: Array.from(document.querySelectorAll(".m-link")),
    sections: Array.from(document.querySelectorAll("section[id]")),

    scrollProgress: document.getElementById("scrollProgress"),
    backToTop: document.getElementById("backToTop"),

    particles: document.getElementById("particles"),
    cursorGlow: document.getElementById("cursorGlow"),

    modal: document.getElementById("projectModal"),
    modalCard: document
      .getElementById("projectModal")
      ?.querySelector(".modal-card"),

    testiSlider: document.getElementById("testiSlider"),
    testiTrack: document.getElementById("testiTrack"),
    testiDots: document.getElementById("testiDots"),
    testiPrev: document.getElementById("testiPrev"),
    testiNext: document.getElementById("testiNext"),

    contactForm: document.getElementById("contactForm"),
    formNote: document.getElementById("formNote"),
    newsletterForm: document.getElementById("newsletterForm"),
    newsletterNote: document.getElementById("nlNote"),

    year: document.getElementById("year"),
    typingSound: document.getElementById("typingSound"),
    footerTypewriter: document.getElementById("typewriter"),
    roleTypewriter: document.getElementById("roleTypewriter"),
    aboutTypewriter: document.getElementById("about-typewriter"),
  };

  

  
  const select = (selector, scope = document) => scope.querySelector(selector);

  
  const selectAll = (selector, scope = document) =>
    Array.from(scope.querySelectorAll(selector));

  
  const on = (element, event, handler, options) => {
    if (element) element.addEventListener(event, handler, options);
    return element;
  };

  
  const createElement = (tag, className) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    return element;
  };

  
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  
  const setText = (element, value) => {
    if (element) element.textContent = value;
  };

  
  let scrollLockCount = 0;

  const lockScroll = () => {
    if (scrollLockCount === 0) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    }
    scrollLockCount += 1;
  };

  const unlockScroll = () => {
    scrollLockCount = Math.max(0, scrollLockCount - 1);
    if (scrollLockCount === 0) {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
  };

  
  const safePlayAudio = (audio) => {
    if (!audio) return;
    try {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } catch {
      
    }
  };

  
  const rafThrottle = (callback) => {
    let frame = null;
    return (...args) => {
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        callback(...args);
      });
    };
  };

  
  const observeOnce = (elements, onIntersect, options) => {
    if (!("IntersectionObserver" in window)) {
      elements.forEach(onIntersect);
      return null;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        onIntersect(entry.target);
      });
    }, options);
    elements.forEach((element) => observer.observe(element));
    return observer;
  };

  
  let PROJECTS = {};
  let ARTICLES = [];
  let roleTexts, footerTexts, aboutTexts;
  let textsSignature = "";
  let SETTINGS = {};
  let appliedTypingSpeed = CONFIG.TYPING_DEFAULTS.speed;

  function refreshData() {
    const c = window.BLISS_CONTENT || {};
    PROJECTS = c.projects || {};
    ARTICLES = c.articles || [];
    SETTINGS = Object.assign({}, c.settings || {});
    ({ roles: roleTexts, footer: footerTexts, about: aboutTexts } =
      c.texts || {});
    textsSignature = JSON.stringify([roleTexts, footerTexts, aboutTexts]);
  }
  refreshData();

  
  const THEME_KEY = "blissjuli.theme";
  let themeTransitionTimer = null;

  const themeToggle = document.getElementById("themeToggle");

  const systemPrefersDark = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const readThemePreference = () => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === "light" || saved === "dark") return saved;
    } catch (e) {}
    return null;
  };

  const resolveDefaultTheme = () => {
    const setting = SETTINGS.defaultTheme || "system";
    if (setting === "dark") return "dark";
    if (setting === "light") return "light";
    return systemPrefersDark() ? "dark" : "light";
  };

  const currentTheme = () =>
    document.documentElement.dataset.theme === "dark" ? "dark" : "light";

  const applyTheme = (theme, animate = false) => {
    const root = document.documentElement;
    if (animate) {
      root.classList.add("theme-transition");
      clearTimeout(themeTransitionTimer);
      themeTransitionTimer = setTimeout(
        () => root.classList.remove("theme-transition"),
        500
      );
    }
    root.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", theme === "dark" ? "#0F0F0F" : "#FFFFFF");
    }
    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
      themeToggle.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );
    }
  };

  const syncThemeFromSettings = (animate = false) => {
    if (readThemePreference()) return;
    applyTheme(resolveDefaultTheme(), animate);
  };

  function initializeTheme() {
    if (themeToggle) {
      on(themeToggle, "click", () => {
        const next = currentTheme() === "dark" ? "light" : "dark";
        try {
          localStorage.setItem(THEME_KEY, next);
        } catch (e) {}
        applyTheme(next, true);
      });
    }

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => {
      if ((SETTINGS.defaultTheme || "system") === "system") {
        applyTheme(resolveDefaultTheme(), true);
      }
    };
    if (mq.addEventListener) mq.addEventListener("change", onSystemChange);
    else if (mq.addListener) mq.addListener(onSystemChange);

    applyTheme(currentTheme());
  }

  
  const SERVICE_CATEGORIES = ["Fashion", "Bakery", "Business"];

  
  const boundTilt = new WeakSet();
  const boundMagnetic = new WeakSet();
  const boundRipple = new WeakSet();
  const boundServiceLinks = new WeakSet();

  let activeTypewriters = [];
  let typewriterSignature = null;
  let footerTypewriterRevealed = false;

  

  class Typewriter {
    constructor(element, texts, options) {
      this.element = element;
      this.texts = texts;
      this.options = { ...CONFIG.TYPING_DEFAULTS, ...options };

      this.textIndex = 0;
      this.charIndex = 0;
      this.deleting = false;
      this.timeoutId = null;
      this.isDestroyed = false;
    }

    start() {
      this.tick();
      return this;
    }

    pause() {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    resume() {
      if (!this.isDestroyed && this.timeoutId === null) this.tick();
    }

    restart() {
      this.pause();
      this.textIndex = 0;
      this.charIndex = 0;
      this.deleting = false;
      this.tick();
    }

    destroy() {
      this.isDestroyed = true;
      this.pause();
    }

    tick() {
      if (this.isDestroyed) return;

      const currentText = this.texts[this.textIndex];

      if (!this.deleting) {
        this.element.textContent = currentText.substring(0, this.charIndex++);

        if (
          this.options.sound &&
          this.charIndex % CONFIG.TYPING_SOUND_EVERY_NTH_CHAR === 0
        ) {
          safePlayAudio(DOM.typingSound);
        }

        if (this.charIndex > currentText.length) {
          if (this.options.keepLast && this.textIndex === this.texts.length - 1) {
            return; 
          }
          this.deleting = true;
          this.timeoutId = setTimeout(() => this.tick(), this.options.pause);
          return;
        }
      } else {
        this.element.textContent = currentText.substring(0, this.charIndex--);

        if (this.charIndex === 0) {
          this.deleting = false;
          this.textIndex = (this.textIndex + 1) % this.texts.length;
        }
      }

      this.timeoutId = setTimeout(
        () => this.tick(),
        this.deleting ? this.options.deleteSpeed : this.options.speed
      );
    }
  }

  
  const buildTypewriter = (element, texts, options) => {
    if (!element) return null;
    const instance = new Typewriter(element, texts, options).start();
    activeTypewriters.push(instance);
    return instance;
  };

  

  function initializeNavigation() {
    const toggleMenu = (force) => {
      const shouldOpen =
        force !== undefined ? force : !DOM.mobileMenu.classList.contains("open");
      DOM.mobileMenu.classList.toggle("open", shouldOpen);
      DOM.hamburger.classList.toggle("open", shouldOpen);
      DOM.hamburger.setAttribute("aria-expanded", String(shouldOpen));
      DOM.hamburger.setAttribute("aria-label", shouldOpen ? "Close menu" : "Open menu");
      if (shouldOpen) lockScroll();
      else unlockScroll();
    };

    on(DOM.hamburger, "click", () => toggleMenu());
    DOM.mobileLinks.forEach((link) =>
      on(link, "click", () => toggleMenu(false))
    );

    
    if (!("IntersectionObserver" in window)) return;
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const sectionId = `#${entry.target.id}`;
          DOM.navLinks.forEach((link) => {
            link.classList.toggle(
              "active",
              link.getAttribute("href") === sectionId
            );
          });
        });
      },
      { rootMargin: CONFIG.ACTIVE_NAV_MARGIN }
    );
    DOM.sections.forEach((section) => sectionObserver.observe(section));
  }

  

  function initializeScrollEffects() {
    const setNavScrolled = () =>
      DOM.navbar.classList.toggle(
        "scrolled",
        window.scrollY > CONFIG.NAV_SCROLL_OFFSET
      );

    const updateScrollIndicators = () => {
      setNavScrolled();

      const maxScroll = document.body.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
        DOM.scrollProgress.style.transform = `scaleX(${window.scrollY / maxScroll})`;
      }

      DOM.backToTop.classList.toggle(
        "show",
        window.scrollY > CONFIG.BACK_TO_TOP_THRESHOLD
      );
    };

    const throttledScroll = rafThrottle(updateScrollIndicators);
    on(window, "scroll", throttledScroll, { passive: true });
    on(DOM.backToTop, "click", () =>
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" })
    );

    
    if (!reduceMotion) {
      const blobs = selectAll(".blob");
      const parallax = rafThrottle(() => {
        const scrollY = window.scrollY;
        blobs.forEach((blob, index) => {
          const factor =
            CONFIG.PARALLAX_FACTORS[index % CONFIG.PARALLAX_FACTORS.length];
          const offset = factor * scrollY;
          const translate = Math.max(
            -CONFIG.PARALLAX_MAX_TRANSLATE,
            Math.min(CONFIG.PARALLAX_MAX_TRANSLATE, offset)
          );
          blob.style.translate = `0px ${translate}px`;
        });
      });
      on(window, "scroll", parallax, { passive: true });
    }

    updateScrollIndicators();
  }

  

  let revealObserver = null;

  function initializeScrollReveal() {
    const revealElements = selectAll("[data-reveal]");

    if (revealObserver) revealObserver.disconnect();
    revealObserver = observeOnce(
      revealElements,
      (element) => {
        element.style.setProperty("--d", element.dataset.delay || "0s");
        element.style.willChange = "transform, opacity";
        element.classList.add("revealed");

        const releaseWillChange = () => (element.style.willChange = "");
        on(element, "transitionend", releaseWillChange, { once: true });
        setTimeout(releaseWillChange, CONFIG.WILL_CHANGE_RELEASE_MS);
      },
      { threshold: CONFIG.REVEAL_THRESHOLD, rootMargin: CONFIG.REVEAL_MARGIN }
    );
  }

  

  let counterObserver = null;

  function initializeCounters() {
    const animateCount = (element) => {
      const target = parseFloat(element.dataset.target) || 0;
      const duration = Math.max(
        reduceMotion ? 0 : CONFIG.COUNTER_DURATION,
        1
      );
      const startTime = performance.now();

      const frame = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = Math.round(target * eased);
        if (progress < 1) requestAnimationFrame(frame);
      };

      requestAnimationFrame(frame);
    };

    if (counterObserver) counterObserver.disconnect();
    counterObserver = observeOnce(
      selectAll(".count"),
      animateCount,
      { threshold: CONFIG.COUNTER_OBSERVER_THRESHOLD }
    );
  }

  

  function initializeParticles() {
    if (!DOM.particles || reduceMotion) return;
    if (SETTINGS.particles === false) return;

    const isMobile = window.innerWidth < CONFIG.PARTICLE_MOBILE_WIDTH;
    const particleCount = isMobile
      ? CONFIG.PARTICLE_MOBILE_COUNT
      : CONFIG.PARTICLE_DESKTOP_COUNT;

    const createParticle = () => {
      const particle = createElement("span", "particle");
      const size = 2 + Math.random() * 3;

      particle.setAttribute("aria-hidden", "true");
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.bottom = `${-(Math.random() * 20)}px`;
      particle.style.color =
        CONFIG.PARTICLE_COLORS[Math.floor(Math.random() * CONFIG.PARTICLE_COLORS.length)];
      particle.style.setProperty(
        "animation-duration",
        `${12 + Math.random() * 18}s`
      );
      particle.style.setProperty("animation-delay", `${-Math.random() * 20}s`);

      DOM.particles.appendChild(particle);
    };

    for (let i = 0; i < particleCount; i++) createParticle();
  }

  

  function initializeCursorGlow() {
    if (!DOM.cursorGlow || !window.matchMedia("(hover: hover)").matches) return;

    document.body.classList.add("has-mouse");

    let glowX = 0;
    let glowY = 0;
    let targetX = 0;
    let targetY = 0;
    let isRunning = false;

    const loopGlow = () => {
      if (
        document.body.classList.contains("admin-open") ||
        SETTINGS.cursorGlow === false
      ) {
        isRunning = false;
        return;
      }
      glowX += (targetX - glowX) * CONFIG.CURSOR_GLOW_LERP;
      glowY += (targetY - glowY) * CONFIG.CURSOR_GLOW_LERP;
      DOM.cursorGlow.style.transform = `translate(${glowX - CONFIG.CURSOR_GLOW_OFFSET}px, ${glowY - CONFIG.CURSOR_GLOW_OFFSET}px)`;

      const stillMoving =
        Math.abs(targetX - glowX) > CONFIG.CURSOR_GLOW_STOP_THRESHOLD ||
        Math.abs(targetY - glowY) > CONFIG.CURSOR_GLOW_STOP_THRESHOLD;

      if (stillMoving) {
        requestAnimationFrame(loopGlow);
      } else {
        isRunning = false;
      }
    };

    on(window, "mousemove", (event) => {
      if (SETTINGS.cursorGlow === false) return;
      targetX = event.clientX;
      targetY = event.clientY;
      if (!isRunning) {
        isRunning = true;
        loopGlow();
      }
    });
  }

  

  function initializeCardTilt() {
    if (reduceMotion) return;

    selectAll(".tilt").forEach((card) => {
      if (boundTilt.has(card)) return;
      boundTilt.add(card);

      const onMouseMove = rafThrottle((event) => {
        if (SETTINGS.cardTilt === false) return;
        const bounds = card.getBoundingClientRect();
        const rotateX =
          ((event.clientX - bounds.left) / bounds.width - 0.5) *
          CONFIG.TILT_MAX_DEGREES;
        const rotateY =
          -((event.clientY - bounds.top) / bounds.height - 0.5) *
          CONFIG.TILT_MAX_DEGREES;

        card.style.transform =
          `perspective(${CONFIG.TILT_PERSPECTIVE}px) ` +
          `rotateY(${rotateX}deg) rotateX(${rotateY}deg) ` +
          `translateY(${CONFIG.TILT_LIFT_PX}px)`;
        card.style.setProperty("--mx", `${rotateX * 100 + 50}%`);
        card.style.setProperty("--my", `${-rotateY * 100 + 50}%`);
      });

      on(card, "mousemove", onMouseMove);
      on(card, "mouseenter", () => (card.style.willChange = "transform"));
      on(card, "mouseleave", () => {
        card.style.willChange = "";
        card.style.transform = "";
      });
    });
  }

  

  function initializeButtons() {
    if (!reduceMotion) {
      selectAll(".btn-magnetic").forEach((button) => {
        if (boundMagnetic.has(button)) return;
        boundMagnetic.add(button);

        const onMouseMove = rafThrottle((event) => {
          if (SETTINGS.magneticButtons === false) return;
          const bounds = button.getBoundingClientRect();
          const offsetX =
            (event.clientX - bounds.left - bounds.width / 2) *
            CONFIG.MAGNETIC_FACTOR;
          const offsetY =
            (event.clientY - bounds.top - bounds.height / 2) *
            CONFIG.MAGNETIC_FACTOR;
          button.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        });

        on(button, "mousemove", onMouseMove);
        on(button, "mouseleave", () => (button.style.transform = ""));
      });
    }

    selectAll("[data-ripple]").forEach((button) => {
      if (boundRipple.has(button)) return;
      boundRipple.add(button);

      on(button, "click", (event) => {
        const bounds = button.getBoundingClientRect();
        const rippleSize = Math.max(bounds.width, bounds.height);
        const ripple = createElement("span", "ripple");

        ripple.setAttribute("aria-hidden", "true");
        ripple.style.width = `${rippleSize}px`;
        ripple.style.height = `${rippleSize}px`;
        ripple.style.left = `${event.clientX - bounds.left - rippleSize / 2}px`;
        ripple.style.top = `${event.clientY - bounds.top - rippleSize / 2}px`;

        button.appendChild(ripple);
        setTimeout(() => ripple.remove(), CONFIG.RIPPLE_DURATION_MS);
      });
    });
  }

  

  let applyFilter = null;

  function initializeFilters() {
    const filterButtons = selectAll(".filter-btn");

    applyFilter = (filter) => {
      const projectCards = selectAll(".project-card");
      filterButtons.forEach((btn) => {
        const active = btn.dataset.filter === filter;
        btn.classList.toggle("active", active);
        btn.setAttribute("aria-pressed", String(active));
      });
      projectCards.forEach((card) => {
        const matches = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("hidden", !matches);

        if (matches) {
          card.classList.remove("entering");
          void card.offsetWidth; 
          card.classList.add("entering");
        }
      });
    };

    filterButtons.forEach((button) => {
      on(button, "click", () => applyFilter(button.dataset.filter));
    });
  }

  

  function initializeServiceLinks() {
    selectAll(".service-link[data-filter]").forEach((link) => {
      if (boundServiceLinks.has(link)) return;
      boundServiceLinks.add(link);

      on(link, "click", (event) => {
        event.preventDefault();
        const filter = link.dataset.filter;

        const portfolio = document.getElementById("portfolio");
        if (portfolio) {
          portfolio.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "start",
          });
        }

        const filterButton = selectAll(".filter-btn").find(
          (button) => button.dataset.filter === filter
        );
        if (filterButton) filterButton.click();
      });
    });
  }

  

  class ModalBase {
    constructor(modal, card) {
      this.modal = modal;
      this.card = card;
      this.lastFocusedElement = null;

      if (!this.modal) return;
      if (this.card) this.card.setAttribute("tabindex", "-1");

      this.bindBaseEvents();
    }

    
    closeSelector() {
      return ".js-close-modal, .js-close-article";
    }

    bindBaseEvents() {
      on(this.modal, "click", (event) => this.handleModalClick(event));
      on(document, "keydown", (event) => this.handleKeydown(event));
    }

    handleModalClick(event) {
      const backdrop = this.modal.querySelector(".modal-backdrop");
      if (
        event.target === backdrop ||
        event.target.closest(this.closeSelector())
      ) {
        this.close();
      }
    }

    handleKeydown(event) {
      if (this.modal.hidden) return;
      if (event.key === "Escape") {
        event.preventDefault();
        this.close();
      } else if (event.key === "Tab") {
        this.trapFocus(event);
      }
    }

    open() {
      this.lastFocusedElement = document.activeElement;
      this.modal.hidden = false;
      lockScroll();
      setTimeout(() => {
        if (this.card) this.card.focus();
      }, CONFIG.MODAL_FOCUS_DELAY_MS);
    }

    close() {
      if (!this.modal || this.modal.hidden) return;
      this.modal.hidden = true;
      unlockScroll();
      if (this.lastFocusedElement) this.lastFocusedElement.focus();
    }

    
    trapFocus(event) {
      if (!this.card) return;
      const focusable = selectAll(CONFIG.FOCUSABLE_SELECTOR, this.card).filter(
        (element) => !element.hasAttribute("disabled")
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !this.card.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  

  class ProjectModal extends ModalBase {
    constructor() {
      super(DOM.modal, DOM.modalCard);
      if (!this.modal || !this.card) return;

      this.shots = [];
      this.shotIndex = 0;
      this.viewerOpen = false;
      this.viewer = document.getElementById("shotViewer");
      this.viewerImage = this.viewer?.querySelector(".shot-image");
      this.shotCount = this.viewer?.querySelector(".shot-count");
      this.modalMedia = document.getElementById("modalMedia");

      this.bindProjectEvents();
    }

    bindProjectEvents() {
      
      on(document, "click", (event) => {
        const trigger = event.target.closest(".js-open-modal");
        if (!trigger) return;
        event.preventDefault();
        event.stopPropagation();
        const projectCard = trigger.closest(".project-card");
        if (projectCard?.dataset.project) {
          this.open(projectCard.dataset.project);
        }
      });

      
      if (this.viewer) {
        on(this.viewer, "click", (event) => {
          if (
            event.target.classList.contains("shot-viewer-backdrop") ||
            event.target.closest(".shot-close")
          ) {
            this.closeShot();
          }
        });
        on(this.viewer.querySelector(".shot-prev"), "click", (event) => {
          event.stopPropagation();
          this.prevShot();
        });
        on(this.viewer.querySelector(".shot-next"), "click", (event) => {
          event.stopPropagation();
          this.nextShot();
        });
      }
    }

    
    handleModalClick(event) {
      const backdrop = this.modal.querySelector(".modal-backdrop");
      if (
        event.target === backdrop ||
        event.target.closest(".js-close-modal")
      ) {
        this.close();
        return;
      }
      if (event.target.closest(".js-go-shots")) {
        event.preventDefault();
        this.scrollToShots();
        return;
      }
      if (event.target.closest(".js-open-shot")) {
        event.preventDefault();
        this.openShot(0);
        return;
      }
      const shot = event.target.closest(".modal-shot");
      if (shot) {
        this.openShot(
          Array.from(this.card.querySelectorAll(".modal-shot")).indexOf(shot)
        );
      }
    }

    
    handleKeydown(event) {
      if (this.modal.hidden) return;
      if (this.viewerOpen) {
        if (event.key === "Escape") {
          event.preventDefault();
          this.closeShot();
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          this.prevShot();
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          this.nextShot();
        }
        return;
      }
      super.handleKeydown(event);
    }

    open(projectKey) {
      const project = PROJECTS[projectKey];
      if (!project || !this.modal) return;

      this.shots = project.shots || [];
      this.shotIndex = 0;
      if (this.viewerOpen) this.closeShot();

      this.renderContent(project);
      super.open();
    }

    close() {
      if (!this.modal || this.modal.hidden) return;
      if (this.viewerOpen) this.closeShot();
      if (this.modalMedia) {
        stopSlideshow(this.modalMedia);
        const modalVideo = this.modalMedia.querySelector("video.modal-video");
        if (modalVideo) modalVideo.pause();
        unloadLiveFrame(
          this.modalMedia.querySelector("iframe.project-live")
        );
      }
      super.close();
    }

    renderContent(project) {
      const modalMedia =
        this.modalMedia || document.getElementById("modalMedia");
      if (modalMedia) {
        stopSlideshow(modalMedia);
        const video =
          isSafeUrl(project.video) && project.video !== "#" ? project.video : "";
        const shots = (project.shots || []).filter((shot) => isSafeUrl(shot));
        if (video && !reduceMotion) {
          modalMedia.innerHTML = `<video class="modal-video" src="${esc(video)}" poster="${esc(
            project.image
          )}" autoplay muted loop playsinline preload="auto" aria-label="${esc(
            project.title
          )} preview"></video>`;
          on(modalMedia.querySelector("video"), "error", () => {
            if (isLiveUrl(project.live)) {
              modalMedia.innerHTML =
                `<img src="${esc(project.image)}" alt="${esc(
                  project.title
                )}" loading="lazy">` +
                `<iframe class="project-live" src="${esc(
                  project.live
                )}" loading="lazy" scrolling="no" tabindex="-1" aria-hidden="true" title="${esc(
                  project.title
                )} live preview"></iframe>`;
            } else {
              modalMedia.innerHTML = `<img src="${esc(project.image)}" alt="${esc(
                project.title
              )}" loading="lazy">`;
            }
          });
        } else if (isLiveUrl(project.live)) {
          modalMedia.innerHTML =
            `<img src="${esc(project.image)}" alt="${esc(
              project.title
            )}" loading="lazy">` +
            `<iframe class="project-live" src="${esc(
              project.live
            )}" loading="lazy" scrolling="no" tabindex="-1" aria-hidden="true" title="${esc(
              project.title
            )} live preview"></iframe>`;
        } else if (shots.length >= 2) {
          modalMedia.innerHTML = shots
            .map(
              (shot, i) =>
                `<img class="modal-slide${i === 0 ? " is-active" : ""}" src="${esc(
                  shot
                )}" alt="${esc(project.title)} screenshot" loading="lazy">`
            )
            .join("");
          if (!reduceMotion) runSlideshow(modalMedia);
        } else {
          modalMedia.innerHTML = `<img src="${esc(project.image)}" alt="${esc(
            project.title
          )}" loading="lazy" class="js-open-shot" onerror="this.remove()">`;
        }
      }

      setText(document.getElementById("modalCategory"), project.category.toUpperCase());
      setText(document.getElementById("modalTitle"), project.title);
      setText(
        document.getElementById("modalMeta"),
        `${project.client} · ${project.date}`
      );

      document.getElementById("modalFeatures").innerHTML = (project.features || [])
        .map((feature) => `<li>${esc(feature)}</li>`)
        .join("");

      document.getElementById("modalShots").innerHTML = (project.shots || [])
        .map((shot) => {
          const url = isSafeUrl(shot) ? shot : "";
          return `<div class="modal-shot"><img src="${esc(url)}" alt="screenshot" loading="lazy"></div>`;
        })
        .join("");

      const isServiceProject = SERVICE_CATEGORIES.includes(project.category);
      const liveUrl = isSafeUrl(project.live) ? project.live : "";
      const githubUrl = isSafeUrl(project.github) ? project.github : "";
      const hasLive = liveUrl && liveUrl !== "#";
      const hasGithub = githubUrl && githubUrl !== "#";

      let primary;
      if (hasLive) {
        primary = `<a href="${esc(liveUrl)}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">${
          isServiceProject ? "Order Now" : "Live Demo"
        } ↗</a>`;
      } else if (hasGithub) {
        primary = `<a href="${esc(githubUrl)}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">GitHub ↗</a>`;
      } else if (isServiceProject) {
        primary = '<a href="#contact" class="btn btn-primary">Order Now</a>';
      } else {
        primary = '<a href="#contact" class="btn btn-primary">Get in Touch</a>';
      }

      let secondary;
      if (isServiceProject) {
        secondary =
          '<button type="button" class="btn btn-outline js-go-shots">Gallery</button>';
      } else if (hasLive && hasGithub) {
        secondary = `<a href="${esc(githubUrl)}" class="btn btn-outline" target="_blank" rel="noopener noreferrer">GitHub</a>`;
      } else {
        secondary =
          '<button type="button" class="btn btn-outline js-go-shots">Gallery</button>';
      }

      document.getElementById("modalCta").innerHTML =
        primary +
        secondary +
        '<a href="#contact" class="btn btn-ghost js-close-modal">Book a Service</a>';
    }

    scrollToShots() {
      if (!this.card) return;
      const shotsSection = this.card.querySelector("#modalShots");
      if (shotsSection) {
        shotsSection.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "center",
        });
      }
    }

    openShot(index) {
      if (!this.viewer || !this.shots.length) return;
      this.shotIndex = (index + this.shots.length) % this.shots.length;
      this.updateShotView();
      this.viewer.hidden = false;
      this.viewerOpen = true;
      const nextButton = this.viewer.querySelector(".shot-next");
      if (nextButton) nextButton.focus();
    }

    closeShot() {
      if (!this.viewer || !this.viewerOpen) return;
      this.viewer.hidden = true;
      this.viewerOpen = false;
      if (this.card) this.card.focus();
    }

    prevShot() {
      if (!this.viewerOpen) return;
      this.shotIndex =
        (this.shotIndex - 1 + this.shots.length) % this.shots.length;
      this.updateShotView();
    }

    nextShot() {
      if (!this.viewerOpen) return;
      this.shotIndex = (this.shotIndex + 1) % this.shots.length;
      this.updateShotView();
    }

    updateShotView() {
      if (!this.viewerImage || !this.shotCount) return;
      this.viewerImage.src = this.shots[this.shotIndex];
      this.viewerImage.alt = `Gallery image ${this.shotIndex + 1}`;
      this.shotCount.textContent = `${this.shotIndex + 1} / ${this.shots.length}`;
    }
  }

  function initializeModal() {
    if (DOM.modal && DOM.modalCard) new ProjectModal();
  }

  

  class ArticleModal extends ModalBase {
    constructor() {
      const modal = document.getElementById("articleModal");
      super(modal, modal ? modal.querySelector(".modal-card") : null);
      if (!this.modal || !this.card) return;

      this.bindArticleEvents();
    }

    bindArticleEvents() {
      
      on(document, "click", (event) => {
        const trigger = event.target.closest(".js-open-article");
        if (!trigger) return;
        event.preventDefault();
        const article = ARTICLES[Number(trigger.dataset.article)];
        if (article) this.open(article);
      });
    }

    open(article) {
      if (!this.modal) return;
      this.renderContent(article);
      super.open();
    }

    renderContent(article) {
      document.getElementById("articleMedia").innerHTML =
        `<div class="cert-ph">${esc(article.icon)}<span>${esc(article.tag)}</span></div>`;

      setText(document.getElementById("articleTag"), article.tag.toUpperCase());
      setText(document.getElementById("articleTitle"), article.title);
      setText(
        document.getElementById("articleMeta"),
        `${article.date} · ${article.readTime}`
      );

      const takeawayList = (article.takeaways || [])
        .map((point) => `<li>${esc(point)}</li>`)
        .join("");

      document.getElementById("articleBody").innerHTML =
        (article.paragraphs || [])
          .map((paragraph) => `<p>${esc(paragraph)}</p>`)
          .join("") +
        `<h4>Key takeaways</h4>` +
        `<ul>${takeawayList}</ul>`;

      document.getElementById("articleCta").innerHTML =
        '<a href="#contact" class="btn btn-primary js-close-article">Start a Project ↗</a>';
    }
  }

  function initializeArticleModal() {
    const articleModal = document.getElementById("articleModal");
    if (articleModal) new ArticleModal();
  }

  

  class TestimonialCarousel {
    constructor() {
      this.track = DOM.testiTrack;
      this.slides = Array.from(this.track.children);
      this.index = 0;
      this.timer = null;
      this.hovering = false;

      this.buildDots();
      this.bindEvents();
      this.bindVisibility();
      this.startAutoPlay();
    }

    buildDots() {
      this.dots = this.slides.map((_, index) => {
        const dot = createElement("button", `testi-dot${index === 0 ? " active" : ""}`);
        dot.setAttribute("aria-label", `Show testimonial ${index + 1}`);
        dot.setAttribute("aria-pressed", String(index === 0));
        on(dot, "click", () => this.go(index));
        DOM.testiDots.appendChild(dot);
        return dot;
      });
    }

    go(index) {
      this.index = (index + this.slides.length) % this.slides.length;
      this.track.style.transform = `translateX(-${this.index * 100}%)`;
      this.dots.forEach((dot, i) => {
        const active = i === this.index;
        dot.classList.toggle("active", active);
        dot.setAttribute("aria-pressed", String(active));
      });
    }

    next() {
      this.go(this.index + 1);
    }

    prev() {
      this.go(this.index - 1);
    }

    stopAutoPlay() {
      clearInterval(this.timer);
      this.timer = null;
    }

    startAutoPlay() {
      this.stopAutoPlay();
      const interval =
        SETTINGS.testimonialsAutoplay === false
          ? 0
          : Number(SETTINGS.testimonialsIntervalMs) ||
            CONFIG.AUTO_SLIDE_INTERVAL_MS;
      if (reduceMotion || !interval) return;
      this.timer = setInterval(() => this.next(), interval);
    }

    bindEvents() {
      on(DOM.testiPrev, "click", () => this.prev());
      on(DOM.testiNext, "click", () => this.next());
      on(DOM.testiSlider, "mouseenter", () => {
        this.hovering = true;
        this.stopAutoPlay();
      });
      on(DOM.testiSlider, "mouseleave", () => {
        this.hovering = false;
        this.startAutoPlay();
      });
    }

    
    bindVisibility() {
      if (!("IntersectionObserver" in window)) return;
      this.autoplayObserver = new IntersectionObserver(
        (entries) => {
          const visible = entries.some((entry) => entry.isIntersecting);
          if (visible && !this.hovering) this.startAutoPlay();
          else if (!visible) this.stopAutoPlay();
        },
        { rootMargin: "120px 0px" }
      );
      this.autoplayObserver.observe(DOM.testiSlider);
    }

    reload() {
      this.stopAutoPlay();
      this.dots.forEach((dot) => dot.remove());
      this.track.innerHTML = "";
      renderTestimonials();
      this.slides = Array.from(this.track.children);
      this.index = 0;
      this.dots = [];
      this.buildDots();
      this.go(0);
      this.startAutoPlay();
    }
  }

  let carousel = null;

  function initializeCarousel() {
    if (DOM.testiTrack) {
      carousel = new TestimonialCarousel();
    }
  }

  function applyEffectSettings() {
    if (DOM.particles) {
      if (SETTINGS.particles === false) {
        DOM.particles.innerHTML = "";
      } else if (DOM.particles.children.length === 0) {
        initializeParticles();
      }
    }
    if (DOM.cursorGlow) {
      if (SETTINGS.cursorGlow === false) {
        document.body.classList.remove("has-mouse");
        DOM.cursorGlow.style.transform = "";
      } else if (window.matchMedia("(hover: hover)").matches) {
        document.body.classList.add("has-mouse");
      }
    }
  }

  function refreshRenderedContent() {
    refreshData();
    renderSiteInfo();
    renderServices();
    renderProjects();
    renderBlog();

    
    const typingSpeed =
      Number(SETTINGS.typewriterSpeed) || CONFIG.TYPING_DEFAULTS.speed;
    if (
      typewriterSignature !== textsSignature ||
      typingSpeed !== appliedTypingSpeed
    ) {
      activeTypewriters.forEach((tw) => tw.destroy());
      activeTypewriters = [];
      initializeTypewriters();
    }

    
    initializeScrollReveal();
    initializeCounters();
    initializeCardTilt();
    initializeButtons();
    initializeServiceLinks();
    initializeProjectMedia();
    applyEffectSettings();
    syncThemeFromSettings(true);
    if (applyFilter) {
      const activeFilter = select(".filter-btn.active")?.dataset.filter || "all";
      applyFilter(activeFilter);
    }

    if (carousel) carousel.reload();
    else initializeCarousel();
  }

  

  function initializeForms() {
    const message = (key, fallback) =>
      String(SETTINGS[key] ?? fallback);

    if (DOM.contactForm) {
      on(DOM.contactForm, "submit", async (event) => {
        event.preventDefault();
        const submitButton = DOM.contactForm.querySelector('[type="submit"]');
        const buttonLabel = submitButton?.querySelector(".btn-label");
        if (!buttonLabel) return;

        
        if (!DOM.contactForm.checkValidity()) {
          DOM.contactForm.reportValidity();
          return;
        }

        const formNote = DOM.formNote;
        const formData = new FormData(DOM.contactForm);

        submitButton.disabled = true;
        buttonLabel.textContent = "Sending...";
        if (formNote) {
          formNote.hidden = false;
          formNote.textContent = "Sending your message...";
        }

        try {
          const response = await fetch(DOM.contactForm.action, {
            method: "POST",
            body: formData,
            headers: { Accept: "application/json" },
          });

          if (response.ok) {
            buttonLabel.textContent = "Message Sent";
            if (formNote) {
              formNote.textContent = message(
                "contactSuccessMessage",
                "Thanks! Your message is on its way — I'll reply within 24 hours."
              );
            }
            DOM.contactForm.reset();
          } else {
            buttonLabel.textContent = "Send Message";
            if (formNote) {
              formNote.textContent = message(
                "contactErrorMessage",
                "Hmm, something went wrong. Please try again or email me directly at chidiblaise2023@gmail.com."
              );
            }
          }
        } catch (error) {
          buttonLabel.textContent = "Send Message";
          if (formNote) {
            formNote.textContent = message(
              "contactNetworkMessage",
              "Network error — please check your connection and try again."
            );
          }
        }

        submitButton.disabled = false;
        setTimeout(
          () => (buttonLabel.textContent = "Send Message"),
          CONFIG.FORM_RESET_LABEL_MS
        );
      });
    }

    if (DOM.newsletterForm) {
      on(DOM.newsletterForm, "submit", (event) => {
        event.preventDefault();
        const emailInput = DOM.newsletterForm.querySelector("#nlEmail");
        const email = emailInput ? emailInput.value : "";
        if (DOM.newsletterNote) {
          DOM.newsletterNote.hidden = false;
          DOM.newsletterNote.textContent = message(
            "newsletterMessage",
            `Thanks ${email ? "for subscribing" : ""}! Newsletter coming soon. (Add your provider link.)`
          );
        }
        DOM.newsletterForm.reset();
      });
    }
  }

  

  function initializeUtilities() {
    setText(DOM.year, String(new Date().getFullYear()));
  }

  

  function initializeLiveMap() {
    const wrap = select(".map-wrap");
    const container = wrap ? select(".map-canvas", wrap) : null;
    if (!wrap || !container) return;

    const pill = createElement("div", "map-locate");
    pill.setAttribute("role", "status");
    pill.setAttribute("aria-live", "polite");
    wrap.appendChild(pill);

    const status = createElement("span", "map-locate-status");
    status.textContent = "Loading map…";
    pill.appendChild(status);

    const button = createElement("button", "map-locate-btn");
    button.type = "button";
    button.textContent = "Show my location";
    button.hidden = true;
    pill.appendChild(button);

    const setStatus = (message, located = false) => {
      status.textContent = message;
      status.classList.toggle("is-located", located);
    };

    if (!window.L) {
      setStatus("Map could not be loaded.");
      return;
    }

    const DEFAULT_COORDS = [5.1069, 7.3667];
    const DEFAULT_LABEL = "Aba, Abia State, Nigeria";

    const map = L.map(container, {
      center: DEFAULT_COORDS,
      zoom: 14,
      scrollWheelZoom: false,
    });

    const darkLayer = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>',
      }
    ).addTo(map);

    const satelliteLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 19,
        attribution:
          "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
      }
    );

    L.control
      .layers(
        {
          Map: darkLayer,
          Satellite: satelliteLayer,
        },
        null,
        { position: "topright" }
      )
      .addTo(map);

    const pinSvg =
      '<svg width="34" height="42" viewBox="0 0 34 42" fill="none" aria-hidden="true"><defs><linearGradient id="pinGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#16A34A"/><stop offset="100%" stop-color="#22C55E"/></linearGradient></defs><path d="M17 1C8.7 1 2 7.7 2 16c0 11.5 15 25 15 25s15-13.5 15-25C32 7.7 25.3 1 17 1z" fill="url(#pinGrad)" stroke="rgba(0,0,0,0.5)" stroke-width="1"/><circle cx="17" cy="16" r="6.5" fill="#fff"/></svg>';

    const marker = L.marker(DEFAULT_COORDS, {
      icon: L.divIcon({
        className: "map-pin-div",
        html: `<div class="map-pin" aria-hidden="true">${pinSvg}</div>`,
        iconSize: [34, 42],
        iconAnchor: [17, 41],
        popupAnchor: [0, -40],
      }),
    })
      .addTo(map)
      .bindPopup(DEFAULT_LABEL, { closeButton: false });

    const formatCoords = (lat, lng) => `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

    const locationPopup = (coords) => {
      const now = new Date();
      const time = now.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      });
      const date = now.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      return `<strong class="map-popup-title">Your Current Location</strong><br>${esc(
        formatCoords(coords[0], coords[1])
      )}<br><span class="map-popup-meta">Obtained ${esc(date)}, ${esc(
        time
      )}</span>`;
    };

    const applyLocation = (position) => {
      const { latitude, longitude } = position.coords;
      const coords = [latitude, longitude];
      map.setView(coords, 15, { animate: !reduceMotion });
      marker
        .setLatLng(coords)
        .setPopupContent(locationPopup(coords))
        .openPopup();
      setStatus("Map centred on your location", true);
      button.hidden = true;
    };

    const requestLocation = () => {
      setStatus("Locating you…");
      button.hidden = true;
      navigator.geolocation.getCurrentPosition(
        applyLocation,
        (error) => {
          const denied = error && error.code === 1;
          setStatus(
            denied
              ? "Location permission denied — showing default map."
              : "Couldn't reach GPS — showing default map."
          );
          button.hidden = false;
        },
        { timeout: 8000, maximumAge: 5 * 60 * 1000 }
      );
    };

    const locateControl = L.control({ position: "topright" });
    locateControl.onAdd = () => {
      const anchor = createElement("a", "map-locate-box");
      anchor.href = "#";
      anchor.setAttribute("role", "button");
      anchor.title = "Show my location";
      anchor.setAttribute("aria-label", "Show my location");
      anchor.innerHTML =
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="7"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>';
      on(anchor, "click", (event) => {
        event.preventDefault();
        requestLocation();
      });
      return anchor;
    };
    locateControl.addTo(map);

    let wheelEnabled = false;
    map.on("click", () => {
      if (!wheelEnabled) {
        wheelEnabled = true;
        map.scrollWheelZoom.enable();
      }
    });

    on(button, "click", requestLocation);

    setTimeout(() => map.invalidateSize(), 600);

    if (!("geolocation" in navigator)) {
      setStatus("Location not supported by this browser — showing default map.");
      return;
    }
    if (window.isSecureContext === false) {
      setStatus("Location needs a secure (HTTPS) connection — showing default map.");
      button.hidden = false;
      return;
    }
    requestLocation();
  }

  

  function initializeTypewriters() {
    typewriterSignature = textsSignature;
    appliedTypingSpeed =
      Number(SETTINGS.typewriterSpeed) || CONFIG.TYPING_DEFAULTS.speed;
    if (DOM.footerTypewriter) {
      if (footerTypewriterRevealed || reduceMotion) {
        buildTypewriter(DOM.footerTypewriter, footerTexts, {
          sound: true,
          keepLast: true,
          speed: appliedTypingSpeed,
        });
      } else {
        const footerTarget =
          DOM.footerTypewriter.closest(".typewriter-wrapper") ||
          DOM.footerTypewriter;
        observeOnce(
          [footerTarget],
          () => {
            footerTypewriterRevealed = true;
            buildTypewriter(DOM.footerTypewriter, footerTexts, {
              sound: true,
              keepLast: true,
              speed: appliedTypingSpeed,
            });
          },
          { threshold: 0.3 }
        );
      }
    }
    buildTypewriter(DOM.roleTypewriter, roleTexts, {
      keepLast: true,
      speed: appliedTypingSpeed,
    });
    buildTypewriter(DOM.aboutTypewriter, aboutTexts, {
      keepLast: true,
      speed: appliedTypingSpeed,
    });
  }

  

  function initializeMediaFallbacks() {
    on(
      document,
      "error",
      (event) => {
        const video = event.target;
        if (video && video.matches && video.matches("video.project-video")) {
          const media = video.closest(".project-media");
          const key = video.closest(".project-card")?.dataset.project;
          const project = key ? BLISS.projects[key] : null;
          if (media && project && isLiveUrl(project.live)) {
            
            
            media.dataset.media = "live";
            video.remove();
            const fallback = media.querySelector(".project-media-fallback");
            const iframe = document.createElement("iframe");
            iframe.className = "project-live";
            iframe.scrolling = "no";
            iframe.tabIndex = -1;
            iframe.setAttribute("aria-hidden", "true");
            iframe.title = `${project.title} live preview`;
            iframe.dataset.src = project.live;
            iframe.src = "about:blank";
            media.insertBefore(iframe, fallback);
            loadLiveFrame(iframe);
          } else {
            video.style.display = "none";
          }
          return;
        }
        const img = event.target;
        if (img && img.matches && img.matches(".project-media img")) {
          
          
          if (
            img.classList.contains("project-slide") ||
            img.classList.contains("project-video-poster")
          ) {
            img.style.display = "none";
            return;
          }
          img.closest(".project-media")?.classList.add("media-broken");
          img.style.display = "none";
        }
      },
      true
    );
  }

  

  const BLISS = window.BLISS_CONTENT || {};
  const BLISS_ICONS = window.BLISS_ICONS || { service: [], article: [] };

  const { esc } = window.BLISS_UTIL || { esc: (value) => String(value ?? "") };

  
  const isSafeUrl = (value) =>
    !/^(javascript|data|vbscript):/i.test(String(value ?? "").trim());

  
  const iconCalendar = () =>
    '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>';

  
  const sanitizeTagline = (value) => {
    const OPEN = "\uE000";
    const CLOSE = "\uE001";
    const text = String(value ?? "").replace(/<\/?strong(\s[^>]*)?>/gi, (match) =>
      match.startsWith("</") ? CLOSE : OPEN
    );
    return esc(text).split(OPEN).join("<strong>").split(CLOSE).join("</strong>");
  };

  function renderServices() {
    const grid = document.querySelector(".specialties-grid");
    if (!grid) return;
    grid.innerHTML = (BLISS.services || [])
      .map(
        (service, i) => `
          <div class="spec-card glass tilt" data-reveal data-delay="${(i % 2) * 0.2}">
            <div class="service-icon">${
              BLISS_ICONS.service[service.icon] || BLISS_ICONS.service[0]
            }</div>
            <h3>${esc(service.title)}</h3>
            <p>${esc(service.desc)}</p>
            <a href="#portfolio" class="service-link" data-filter="${esc(
              service.filter
            )}">Learn More →</a>
          </div>`
      )
      .join("");
  }

  

  const isLiveUrl = (value) =>
    typeof value === "string" &&
    value.trim() !== "" &&
    value !== "#" &&
    /^https?:\/\//i.test(value.trim()) &&
    isSafeUrl(value);
  const cardMediaHtml = (project) => {
    const poster = esc(project.image);
    const alt = esc(project.title);
    const video =
      isSafeUrl(project.video) && project.video !== "#" ? project.video : "";
    const shots = (project.shots || []).filter((shot) => isSafeUrl(shot));

    if (video) {
      return (
        `<img src="${poster}" alt="${alt} preview" loading="lazy" class="project-video-poster">` +
        `<video class="project-video" muted loop playsinline preload="none" poster="${poster}" data-src="${esc(video)}" aria-label="${alt} preview"></video>`
      );
    }
    if (isLiveUrl(project.live)) {
      return (
        `<img src="${poster}" alt="${alt} preview" loading="lazy" class="project-video-poster">` +
        `<iframe class="project-live" data-src="${esc(
          project.live
        )}" src="about:blank" scrolling="no" tabindex="-1" aria-hidden="true" title="${alt} live preview"></iframe>`
      );
    }
    if (shots.length >= 2) {
      return shots
        .map(
          (shot, i) =>
            `<img src="${esc(shot)}" alt="${alt} preview" loading="lazy" class="project-slide${i === 0 ? " is-active" : ""}">`
        )
        .join("");
    }
    return `<img src="${poster}" alt="${alt} preview" loading="lazy">`;
  };

  const slideTimers = new WeakMap();

  const runSlideshow = (container) => {
    const slides = Array.from(
      container.querySelectorAll(".project-slide, .modal-slide")
    );
    if (slides.length < 2) return;
    stopSlideshow(container);
    let index = 0;
    const show = (i) =>
      slides.forEach((slide, j) => slide.classList.toggle("is-active", j === i));
    show(0);
    slideTimers.set(
      container,
      setInterval(() => {
        index = (index + 1) % slides.length;
        show(index);
      }, 2800)
    );
  };

  const stopSlideshow = (container) => {
    const timer = slideTimers.get(container);
    if (timer) clearInterval(timer);
    slideTimers.delete(container);
    container
      .querySelectorAll(".project-slide, .modal-slide")
      .forEach((slide, i) => slide.classList.toggle("is-active", i === 0));
  };

  const playCardVideo = (media) => {
    const video = media.querySelector("video.project-video");
    if (!video) return;
    if (!video.src) video.src = video.dataset.src;
    const attempt = video.play();
    if (attempt && attempt.catch) attempt.catch(() => {});
  };

  const pauseCardVideo = (media) => {
    const video = media.querySelector("video.project-video");
    if (video && !video.paused) video.pause();
  };

  
  const loadLiveFrame = (frame) => {
    if (!frame || frame.dataset.loaded === "1") return;
    if (!frame.dataset.src) return;
    frame.dataset.loaded = "1";
    frame.src = frame.dataset.src;
  };

  
  const unloadLiveFrame = (frame) => {
    if (!frame || frame.src === "about:blank") return;
    frame.src = "about:blank";
    delete frame.dataset.loaded;
  };

  let mediaObserver = null;
  const observedMedia = new WeakSet();

  const ensureMediaObserver = () => {
    if (mediaObserver) return;
    mediaObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const media = entry.target;
          if (entry.isIntersecting) {
            if (reduceMotion) return;
            if (media.dataset.media === "video") playCardVideo(media);
            else if (media.dataset.media === "slideshow") runSlideshow(media);
            else if (media.dataset.media === "live")
              loadLiveFrame(media.querySelector("iframe.project-live"));
          } else if (media.dataset.media === "video") {
            pauseCardVideo(media);
          } else if (media.dataset.media === "slideshow") {
            stopSlideshow(media);
          } else if (media.dataset.media === "live") {
            unloadLiveFrame(media.querySelector("iframe.project-live"));
          }
        });
      },
      { rootMargin: "200px 0px", threshold: 0.15 }
    );
  };

  const initializeProjectMedia = () => {
    ensureMediaObserver();
    selectAll(
      '.project-media[data-media="video"], .project-media[data-media="slideshow"], .project-media[data-media="live"]'
    ).forEach((media) => {
      if (observedMedia.has(media)) return;
      observedMedia.add(media);
      mediaObserver.observe(media);
    });
  };

  function renderProjects() {
    const grid = document.getElementById("projectsGrid");
    if (!grid) return;
    grid.innerHTML = Object.entries(BLISS.projects || {})
      .map(([key, project], index) => {
        const liveUrl = isSafeUrl(project.live) ? project.live : "";
        const githubUrl = isSafeUrl(project.github) ? project.github : "";
        const hasVideo =
          !!project.video &&
          isSafeUrl(project.video) &&
          project.video !== "#";
        const hasLive = liveUrl && liveUrl !== "#";
        const hasGithub = githubUrl && githubUrl !== "#";

        let primary = "";
        if (hasLive) {
          primary = `<a href="${esc(liveUrl)}" class="btn btn-sm btn-primary" target="_blank" rel="noopener noreferrer">Live Demo</a>`;
        } else if (hasGithub) {
          primary = `<button type="button" class="btn btn-sm btn-primary js-open-modal">Live Demo</button>`;
        } else if (SERVICE_CATEGORIES.includes(project.category)) {
          primary = `<a href="#contact" class="btn btn-sm btn-primary">Order Now</a>`;
        } else {
          primary = `<a href="#contact" class="btn btn-sm btn-primary">Get in Touch</a>`;
        }

        const secondary = hasLive && hasGithub
          ? `<a href="${esc(githubUrl)}" class="btn btn-sm btn-outline" target="_blank" rel="noopener noreferrer">GitHub</a>`
          : "";

        const mediaType = hasVideo
          ? "video"
          : isLiveUrl(project.live)
            ? "live"
            : (project.shots || []).filter((shot) => isSafeUrl(shot)).length >= 2
              ? "slideshow"
              : "image";

        return `
          <article class="project-card glass tilt" data-category="${esc(
            project.category
          )}" data-project="${esc(key)}" data-reveal>
            <div class="project-media" data-media="${mediaType}">
              ${cardMediaHtml(project)}
              <div class="project-media-fallback"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg></div>
            </div>
            <div class="project-body">
              <h3 class="project-title">${esc(project.title)}</h3>
              <p class="project-desc">${esc(project.description)}</p>
              <div class="project-meta">
                <span class="pm-item"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>${esc(
                  project.client
                )}</span>
                <span class="pm-item">${iconCalendar()}${esc(
                  project.date
                )}</span>
              </div>
              <div class="project-links">
                ${primary}
                ${secondary}
                <button class="btn btn-sm btn-ghost js-open-modal">Case Study</button>
              </div>
            </div>
          </article>`;
      })
      .join("");
  }

  function renderBlog() {
    const grid = document.querySelector(".blog-grid");
    if (!grid) return;
    grid.innerHTML = (BLISS.articles || [])
      .map(
        (article, index) => `
          <article class="blog-card glass tilt" data-reveal data-delay="${
            index * 0.1
          }">
            <div class="blog-media"><div class="cert-ph">${
              BLISS_ICONS.article[article.icon] || BLISS_ICONS.article[0]
            }${esc(article.tag)}</div></div>
            <div class="blog-body">
              <span class="blog-date">${iconCalendar()}${esc(article.date)}</span>
              <h3>${esc(article.title)}</h3>
              <p>${esc(article.excerpt || "")}</p>
              <button type="button" class="service-link js-open-article" data-article="${index}">Read More →</button>
            </div>
          </article>`
      )
      .join("");
  }

  function renderTestimonials() {
    const track = document.getElementById("testiTrack");
    if (!track) return;
    track.innerHTML = (BLISS.testimonials || [])
      .map((testimonial) => {
        const initials = (testimonial.name || "?")
          .split(/\s+/)
          .map((part) => part[0] || "")
          .join("")
          .toUpperCase()
          .slice(0, 2);
        return `
          <figure class="testi-slide" role="group" aria-roledescription="slide">
            <div class="testi-avatar">${esc(initials)}</div>
            <figcaption>
              <div class="testi-stars">★★★★★</div>
              <blockquote>${esc(testimonial.quote)}</blockquote>
              <p class="testi-name">${esc(testimonial.name)}</p>
              <p class="testi-company">${esc(testimonial.company)}</p>
            </figcaption>
          </figure>`;
      })
      .join("");
  }

  function renderSiteInfo() {
    const site = BLISS.site || {};
    const heroName = document.querySelector(".hero-name");
    if (heroName) {
      heroName.innerHTML = `${esc(site.firstName)} <span class="gradient-text">${esc(
        site.lastName
      )}</span>`;
    }
    const greeting = document.querySelector(".hero-greeting");
    if (greeting) greeting.textContent = site.greeting;
    const tagline = document.querySelector(".hero-tagline");
    if (tagline) tagline.innerHTML = sanitizeTagline(site.tagline);

    const emailLink = document.querySelector('.contact-list a[href^="mailto:"]');
    if (emailLink) {
      emailLink.href = `mailto:${site.email}`;
      emailLink.textContent = site.email;
    }
    const phoneLink = document.querySelector('.contact-list a[href^="tel:"]');
    if (phoneLink) {
      phoneLink.href = `tel:${site.phoneRaw}`;
      phoneLink.textContent = site.phone;
    }
    const locationText = document.querySelector(".contact-list .cl-icon + div span");
    if (locationText) locationText.textContent = site.location;

    const whatsappButtons = document.querySelectorAll('a[href^="https://wa.me/"]');
    whatsappButtons.forEach((link) => {
      link.href = `https://wa.me/${site.whatsapp}`;
    });

    const socialMap = {
      facebook: "facebook",
      instagram: "instagram",
      x: "twitter / x",
      whatsapp: "whatsapp",
      tiktok: "tiktok",
    };
    const socials = site.socials || {};
    document.querySelectorAll(".social-btn, .footer-socials a").forEach((link) => {
      const label = (link.getAttribute("aria-label") || "").toLowerCase();
      for (const [key, aria] of Object.entries(socialMap)) {
        const matches = label === aria || (key === "x" && label === "x");
        if (matches) {
          const url = socials[key];
          if (url) link.href = url;
          break;
        }
      }
    });

    const subjectInput = document.querySelector('input[name="_subject"]');
    if (subjectInput) subjectInput.value = site.formSubject;

    const footerBio = document.querySelector(".footer-brand p");
    if (footerBio) footerBio.textContent = site.footerBio;
    const newsletterNote = document.querySelector(".footer-col .newsletter + p, .footer-col > p");
    if (newsletterNote) newsletterNote.textContent = site.newsletterNote;
    const copyright = document.querySelector(".footer-bottom p");
    if (copyright) {
      const yearNode = copyright.querySelector("#year");
      const year = yearNode ? yearNode.outerHTML : new Date().getFullYear();
      copyright.innerHTML = `© ${year} ${esc(site.copyright)}`;
    }
  }

  function renderContent() {
    renderSiteInfo();
    renderServices();
    renderProjects();
    renderBlog();
    renderTestimonials();
  }

  const App = {
    async init() {
      refreshData();
      await Promise.race([
        Promise.resolve()
          .then(() =>
            window.BLISS_CONTENT_STORE && window.BLISS_CONTENT_STORE.applyRemote
              ? window.BLISS_CONTENT_STORE.applyRemote()
              : null
          )
          .catch(() => null),
        new Promise((resolve) => setTimeout(resolve, 3000)),
      ]);
      refreshData();
      renderContent();
      syncThemeFromSettings(true);
      window.BLISS_APP = { refresh: refreshRenderedContent };
      initializeNavigation();
      initializeScrollEffects();
      initializeScrollReveal();
      initializeCounters();
      initializeParticles();
      initializeCursorGlow();
      initializeCardTilt();
      initializeButtons();
      initializeFilters();
      initializeServiceLinks();
      initializeModal();
      initializeArticleModal();
      initializeCarousel();
      initializeForms();
      initializeUtilities();
      initializeMediaFallbacks();
      initializeProjectMedia();
      initializeLiveMap();
      initializeTypewriters();
      initializeTheme();
    },
  };

  App.init();
})();
