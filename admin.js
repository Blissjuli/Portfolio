
(() => {
  "use strict";

  const C = window.BLISS_CONTENT;
  const STORE = window.BLISS_CONTENT_STORE;
  const FB = window.BLISS_FIREBASE;

  if (!C || !STORE) return;

  let authed = false;

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const { esc } = window.BLISS_UTIL || { esc: (value) => String(value ?? "") };

  

  function getByPath(path, source) {
    return path.split(".").reduce((acc, part) => (acc == null ? acc : acc[part]), source);
  }

  function setByPath(path, value, source) {
    const parts = path.split(".");
    let node = source;
    for (let i = 0; i < parts.length - 1; i++) {
      const key = parts[i];
      if (!node[key] || typeof node[key] !== "object") node[key] = {};
      node = node[key];
    }
    node[parts[parts.length - 1]] = value;
  }

  

  const field = (path, label, value, type = "text", placeholder = "") =>
    `<label class="af-field">
       <span class="af-label">${label}</span>
       <input type="${type}" data-path="${path}" value="${esc(value)}" placeholder="${esc(
      placeholder
    )}">
     </label>`;

  const textarea = (path, label, value, rows = 3) =>
    `<label class="af-field af-field-wide">
       <span class="af-label">${label}</span>
       <textarea data-path="${path}" rows="${rows}">${esc(value)}</textarea>
     </label>`;

  const listTextarea = (path, label, value, rows = 4) =>
    `<label class="af-field af-field-wide">
       <span class="af-label">${label} <em>(one per line)</em></span>
       <textarea data-list-path="${path}" rows="${rows}">${esc(
      Array.isArray(value) ? value.join("\n") : ""
    )}</textarea>
     </label>`;

  const select = (path, label, value, options) =>
    `<label class="af-field">
       <span class="af-label">${label}</span>
       <select data-path="${path}">
         ${options
           .map(
             (opt) =>
               `<option value="${esc(opt)}" ${
                 String(opt) === String(value) ? "selected" : ""
               }>${esc(opt)}</option>`
           )
           .join("")}
       </select>
     </label>`;

  

  const SHELL = `
  <div class="admin-dash" id="adminDash" hidden>
    <div class="admin-shell">
      <aside class="admin-side">
        <div class="admin-brand">
          <span class="admin-brand-dot"></span>
          <div><strong>Bliss Juli</strong><small>Content Admin</small></div>
        </div>
        <nav class="admin-tabs">
          <button type="button" class="admin-tab active" data-tab="home">Site & Contact</button>
          <button type="button" class="admin-tab" data-tab="services">Services</button>
          <button type="button" class="admin-tab" data-tab="projects">Projects</button>
          <button type="button" class="admin-tab" data-tab="blog">Blog</button>
          <button type="button" class="admin-tab" data-tab="testimonials">Testimonials</button>
        </nav>
        <div class="admin-side-foot">
          <div class="admin-user" id="adminUser" hidden>
            <span id="adminUserEmail"></span>
            <button type="button" class="admin-btn admin-btn-ghost" id="adminSignOut">Sign out</button>
          </div>
          <button type="button" class="admin-btn admin-btn-primary" id="adminSave">Save All</button>
          <button type="button" class="admin-btn" id="adminReset">Reset to defaults</button>
          <div class="admin-btn-row">
            <button type="button" class="admin-btn" id="adminExport">Export</button>
            <button type="button" class="admin-btn" id="adminImport">Import</button>
            <button type="button" class="admin-btn admin-btn-ghost" id="adminClose">Close</button>
          </div>
          <input type="file" id="adminFile" accept="application/json" hidden>
        </div>
      </aside>
      <main class="admin-main" id="adminMain"></main>
    </div>
    <div class="admin-lock" id="adminLock" hidden>
      <div class="admin-lock-box">
        <div class="admin-brand">
          <span class="admin-brand-dot"></span>
          <div><strong>Bliss Juli</strong><small>Admin login</small></div>
        </div>
        <p class="admin-lock-note">
          Sign in to edit the site. If you cannot get in, make sure your
          account exists in Firebase Console (Authentication &rarr; Users)
          and you enabled Email/Password sign-in.
        </p>
        <form id="adminLoginForm" novalidate>
          <label class="af-field">
            <span class="af-label">Email</span>
            <input type="email" id="adminLoginEmail" autocomplete="username" required>
          </label>
          <label class="af-field">
            <span class="af-label">Password</span>
            <input type="password" id="adminLoginPass" autocomplete="current-password" required>
          </label>
          <button type="submit" class="admin-btn admin-btn-primary admin-btn-block" id="adminLoginBtn">Sign in</button>
          <p class="admin-lock-msg" id="adminLockMsg" role="status"></p>
        </form>
      </div>
    </div>
  </div>`;

  

  function paneHeading(title, note) {
    return `<div class="af-heading"><h2>${title}</h2><p>${note}</p></div>`;
  }

  function paneButtons(ids) {
    return `<div class="af-actions">${ids
      .map(
        (b) =>
          `<button type="button" class="admin-btn" data-list-action="${b.id}">${b.label}</button>`
      )
      .join("")}</div>`;
  }

  function buildHomePane() {
    const s = C.site;
    return `
      ${paneHeading("Site & Contact", "Your name, tagline, contact details and social links.")}
      <div class="af-section">
        <h3>Hero</h3>
        <div class="af-grid">
          ${field("site.greeting", "Greeting", s.greeting)}
          ${field("site.firstName", "First name", s.firstName)}
          ${field("site.lastName", "Last name", s.lastName)}
        </div>
        ${textarea("site.tagline", "Tagline (hero intro)", s.tagline, 2)}
      </div>
      <div class="af-section">
        <h3>Contact</h3>
        <div class="af-grid">
          ${field("site.email", "Email", s.email, "email")}
          ${field("site.phone", "Phone (display)", s.phone)}
          ${field("site.whatsapp", "WhatsApp number (digits only)", s.whatsapp)}
        </div>
        ${field("site.location", "Location", s.location)}
        ${field("site.formSubject", "Contact form email subject", s.formSubject)}
      </div>
      <div class="af-section">
        <h3>Social links</h3>
        <div class="af-grid">
          ${field("site.socials.facebook", "Facebook URL", s.socials.facebook)}
          ${field("site.socials.instagram", "Instagram URL", s.socials.instagram)}
          ${field("site.socials.x", "X (Twitter) URL", s.socials.x)}
          ${field("site.socials.tiktok", "TikTok URL (optional)", s.socials.tiktok)}
          ${field("site.socials.whatsapp", "WhatsApp URL", s.socials.whatsapp)}
        </div>
      </div>
      <div class="af-section">
        <h3>Footer</h3>
        ${textarea("site.footerBio", "Footer short bio", s.footerBio, 2)}
        ${field("site.newsletterNote", "Newsletter note", s.newsletterNote)}
        ${field("site.copyright", "Copyright line", s.copyright)}
      </div>
    `;
  }

  function buildServicesPane() {
    const cards = C.services
      .map(
        (service, i) => `
        <div class="af-card">
          <div class="af-card-head">
            <strong>Service ${i + 1}</strong>
            <button type="button" class="admin-btn admin-btn-small admin-btn-danger"
              data-list-action="remove-service" data-index="${i}">Remove</button>
          </div>
          <div class="af-grid">
            ${field(`services.${i}.title`, "Title", service.title)}
            ${select(`services.${i}.filter`, "Category filter", service.filter, [
              "Full Stack",
              "Frontend",
              "Fashion",
              "Bakery",
            ])}
            ${select(`services.${i}.icon`, "Icon", service.icon, [0, 1, 2, 3, 4])}
          </div>
          ${textarea(`services.${i}.desc`, "Description", service.desc, 2)}
        </div>`
      )
      .join("");
    return `
      ${paneHeading("Services", "The cards in the 'My Specialties' section.")}
      <div class="af-list">${cards}</div>
      ${paneButtons([{ id: "add-service", label: "+ Add service" }])}
    `;
  }

  function buildProjectsPane() {
    const cards = Object.entries(C.projects)
      .map(([key, p]) => {
        const grid = `
          <div class="af-grid">
            ${field(`projects.${key}.title`, "Title", p.title)}
            ${select(`projects.${key}.category`, "Category", p.category, [
              "Full Stack",
              "Frontend",
              "Fashion",
              "Bakery",
              "Business",
            ])}
          </div>
          <div class="af-grid">
            ${field(`projects.${key}.client`, "Client", p.client)}
            ${field(`projects.${key}.date`, "Date", p.date)}
          </div>
          <div class="af-grid">
            ${field(`projects.${key}.image`, "Image path / URL", p.image)}
            ${field(`projects.${key}.video`, "Video path / URL (optional)", p.video)}
            ${field(`projects.${key}.live`, "Live URL (leave '#' if none)", p.live)}
            ${field(`projects.${key}.github`, "GitHub URL (leave '#' if none)", p.github)}
          </div>
          ${textarea(`projects.${key}.description`, "Card description", p.description, 2)}
          ${listTextarea(`projects.${key}.tech`, "Technologies", p.tech)}
          <details class="af-details">
            <summary>Case-study details</summary>
            ${textarea(`projects.${key}.overview`, "Overview", p.overview)}
            ${textarea(`projects.${key}.problem`, "Problem", p.problem)}
            ${textarea(`projects.${key}.solution`, "Solution", p.solution)}
            ${listTextarea(`projects.${key}.features`, "Features", p.features)}
            ${listTextarea(`projects.${key}.shots`, "Screenshot paths / URLs", p.shots)}
            ${field(`projects.${key}.role`, "Role", p.role)}
            ${textarea(`projects.${key}.challenges`, "Challenges", p.challenges)}
            ${textarea(`projects.${key}.outcome`, "Outcome", p.outcome)}
            ${textarea(`projects.${key}.feedback`, "Client feedback", p.feedback, 2)}
          </details>`;
        return `
          <div class="af-card">
            <div class="af-card-head">
              <strong>${esc(p.title) || key}</strong>
              <button type="button" class="admin-btn admin-btn-small admin-btn-danger"
                data-list-action="remove-project" data-index="${key}">Remove</button>
            </div>
            ${grid}
          </div>`;
      })
      .join("");
    return `
      ${paneHeading("Projects", "Edit cards and the full case study behind each one.")}
      <div class="af-list">${cards}</div>
      ${paneButtons([{ id: "add-project", label: "+ Add project" }])}
    `;
  }

  function buildBlogPane() {
    const cards = C.articles
      .map(
        (a, i) => `
        <div class="af-card">
          <div class="af-card-head">
            <strong>Article ${i + 1}</strong>
            <button type="button" class="admin-btn admin-btn-small admin-btn-danger"
              data-list-action="remove-article" data-index="${i}">Remove</button>
          </div>
          <div class="af-grid">
            ${field(`articles.${i}.title`, "Title", a.title)}
            ${field(`articles.${i}.tag`, "Tag", a.tag)}
          </div>
          <div class="af-grid">
            ${field(`articles.${i}.date`, "Date", a.date)}
            ${field(`articles.${i}.readTime`, "Read time", a.readTime)}
            ${select(`articles.${i}.icon`, "Icon", a.icon, [0, 1, 2])}
          </div>
          ${textarea(`articles.${i}.excerpt`, "Card excerpt", a.excerpt, 2)}
          ${listTextarea(`articles.${i}.paragraphs`, "Article paragraphs", a.paragraphs)}
          ${listTextarea(`articles.${i}.takeaways`, "Key takeaways", a.takeaways)}
        </div>`
      )
      .join("");
    return `
      ${paneHeading("Blog", "The articles behind each 'Read More' link.")}
      <div class="af-list">${cards}</div>
      ${paneButtons([{ id: "add-article", label: "+ Add article" }])}
    `;
  }

  function buildTestimonialsPane() {
    const cards = C.testimonials
      .map(
        (t, i) => `
        <div class="af-card">
          <div class="af-card-head">
            <strong>Testimonial ${i + 1}</strong>
            <button type="button" class="admin-btn admin-btn-small admin-btn-danger"
              data-list-action="remove-testimonial" data-index="${i}">Remove</button>
          </div>
          ${textarea(`testimonials.${i}.quote`, "Quote", t.quote, 3)}
          <div class="af-grid">
            ${field(`testimonials.${i}.name`, "Name", t.name)}
            ${field(`testimonials.${i}.company`, "Company / role", t.company)}
          </div>
        </div>`
      )
      .join("");
    return `
      ${paneHeading("Testimonials", "The sliding client reviews.")}
      <div class="af-list">${cards}</div>
      ${paneButtons([{ id: "add-testimonial", label: "+ Add testimonial" }])}
    `;
  }

  const PANE_BUILDERS = {
    home: buildHomePane,
    services: buildServicesPane,
    projects: buildProjectsPane,
    blog: buildBlogPane,
    testimonials: buildTestimonialsPane,
  };

  

  function collectListValue(el) {
    return el.value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }

  function syncFromForms() {
    $$("#adminDash input[data-path], #adminDash textarea[data-path], #adminDash select[data-path]").forEach(
      (el) => {
        const value =
          el.tagName === "TEXTAREA"
            ? el.value
            : el.type === "checkbox"
              ? el.checked
              : el.value;
        setByPath(el.dataset.path, value, C);
      }
    );
    $$("#adminDash textarea[data-list-path]").forEach((el) => {
      setByPath(el.dataset.listPath, collectListValue(el), C);
    });
    C.site.phoneRaw = String(C.site.phone).replace(/[^+\d]/g, "");
  }

  

  function nextProjectKey() {
    let n = 1;
    while (C.projects[`p${n}`]) n++;
    return `p${n}`;
  }

  function applyListAction(action, index) {
    if (action === "add-service") {
      C.services.push({ icon: 0, title: "New service", desc: "", filter: "Frontend" });
    } else if (action === "remove-service") {
      C.services.splice(Number(index), 1);
    } else if (action === "add-project") {
      const key = nextProjectKey();
      C.projects[key] = {
        title: "New Project",
        category: "Frontend",
        description: "Describe your project here.",
        client: "Personal Project",
        date: "2026",
        image: "image/portfolio-hero.jpg",
        video: "",
        live: "#",
        github: "#",
        overview: "",
        problem: "",
        solution: "",
        features: [],
        shots: [],
        tech: [],
        role: "",
        challenges: "",
        outcome: "",
        feedback: "",
      };
    } else if (action === "remove-project") {
      delete C.projects[index];
    } else if (action === "add-article") {
      C.articles.push({
        title: "New Article",
        tag: "Tips",
        date: "2026",
        readTime: "3 min read",
        excerpt: "",
        icon: 0,
        paragraphs: [],
        takeaways: [],
      });
    } else if (action === "remove-article") {
      C.articles.splice(Number(index), 1);
    } else if (action === "add-testimonial") {
      C.testimonials.push({ quote: "", name: "Client Name", company: "" });
    } else if (action === "remove-testimonial") {
      C.testimonials.splice(Number(index), 1);
    }
  }

  

  function showPane(name) {
    const builder = PANE_BUILDERS[name] || buildHomePane;
    $("#adminMain").innerHTML = builder();
    $$("#adminDash .admin-tab").forEach((tab) =>
      tab.classList.toggle("active", tab.dataset.tab === name)
    );
    $("#adminDash").scrollTop = 0;
    $("#adminMain").scrollTop = 0;
  }

  

  function setLock(locked) {
    const lock = $("#adminLock");
    if (!lock) return;
    lock.hidden = !locked;
    if (locked) {
      const email = $("#adminLoginEmail");
      if (email) setTimeout(() => email.focus(), 60);
    }
  }

  function updateUserBadge() {
    const box = $("#adminUser");
    if (!box) return;
    if (!authed) {
      box.hidden = true;
      return;
    }
    const user = FB ? FB.currentUser() : null;
    const email = $("#adminUserEmail");
    if (email) email.textContent = user && user.email ? user.email : "";
    box.hidden = false;
  }

  function showAuthError() {
    const msg = $("#adminLockMsg");
    if (!msg) return;
    if (!FB) {
      msg.textContent =
        "Admin sign-in is unavailable — Firebase is not connected. Check your internet connection and refresh the page.";
      msg.className = "admin-lock-msg admin-lock-err";
    } else if (!FB.authAvailable) {
      msg.textContent =
        "Authentication could not be loaded — sign-in is unavailable right now. Check your connection and refresh the page.";
      msg.className = "admin-lock-msg admin-lock-err";
    } else {
      msg.textContent = "";
      msg.className = "admin-lock-msg";
    }
  }

  function open() {
    const dash = $("#adminDash");
    if (!dash) return;
    dash.hidden = false;
    document.body.classList.add("admin-open");
    setLock(true);
    updateUserBadge();
    showAuthError();
  }

  function close() {
    const dash = $("#adminDash");
    if (!dash) return;
    dash.hidden = true;
    document.body.classList.remove("admin-open");
  }

  function toggle() {
    $("#adminDash").hidden ? open() : close();
  }

  

  function showStatus(message, ok = true) {
    const existing = $("#adminToast");
    if (existing) existing.remove();
    const toast = document.createElement("div");
    toast.id = "adminToast";
    toast.className = ok ? "admin-toast admin-toast-ok" : "admin-toast admin-toast-err";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2600);
  }

  function refreshSite() {
    if (window.BLISS_APP && window.BLISS_APP.refresh) {
      try {
        window.BLISS_APP.refresh();
      } catch (e) {}
    }
  }

  async function save() {
    syncFromForms();
    let res = { ok: false, remote: { ok: true, permissionDenied: false, offline: false } };
    try {
      res = await STORE.save();
    } catch (e) {
      showStatus("Could not save.", false);
      return;
    }
    if (!res.ok) {
      showStatus("Could not save — storage may be full.", false);
      return;
    }
    const remote =
      res.remote && typeof res.remote === "object"
        ? res.remote
        : { ok: !!res.remote, permissionDenied: false, offline: !res.remote };
    if (remote.permissionDenied) {
      showStatus("Permission denied — sign in as the admin account.", false);
    } else {
      showStatus(
        remote.ok ? "Saved to web!" : "Saved locally (Firebase offline).",
        remote.ok
      );
    }
    refreshSite();
  }

  async function reset() {
    STORE.restoreDefaults();
    if (FB && FB.available) {
      try {
        await FB.save(STORE.read());
      } catch (e) {}
    }
    showStatus("Defaults restored.");
    refreshSite();
  }

  function exportData() {
    syncFromForms();
    const blob = new Blob([JSON.stringify(C, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "blissjuli-content.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showStatus("Backup downloaded.");
  }

  const CONTENT_KEYS = {
    site: "object",
    services: "array",
    projects: "object",
    articles: "array",
    testimonials: "array",
  };

  function importData(file) {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data || typeof data !== "object" || Array.isArray(data)) {
          throw new Error("bad-shape");
        }
        const entries = Object.entries(data);
        if (!entries.some(([key]) => key in CONTENT_KEYS)) {
          throw new Error("no-known-keys");
        }

        
        
        const clean = {};
        for (const [key, value] of entries) {
          const kind = CONTENT_KEYS[key];
          if (!kind) throw new Error("unknown-key");
          if (kind === "array" && !Array.isArray(value)) throw new Error("bad-array");
          if (
            kind === "object" &&
            (!value || typeof value !== "object" || Array.isArray(value))
          ) {
            throw new Error("bad-object");
          }
          clean[key] = value;
        }

        Object.assign(C, clean);
        await STORE.save();
        showStatus("Imported!");
        refreshSite();
      } catch (e) {
        showStatus("That file is not a valid backup.", false);
      }
    };
    reader.readAsText(file);
  }

  

  function bindShell() {
    const dash = $("#adminDash");

    $$(".admin-tab", dash).forEach((tab) => {
      tab.addEventListener("click", () => showPane(tab.dataset.tab));
    });

    $("#adminSave").addEventListener("click", save);
    $("#adminReset").addEventListener("click", reset);
    $("#adminClose").addEventListener("click", close);
    $("#adminExport").addEventListener("click", exportData);
    $("#adminImport").addEventListener("click", () => $("#adminFile").click());
    $("#adminFile").addEventListener("change", (e) => {
      if (e.target.files[0]) importData(e.target.files[0]);
      e.target.value = "";
    });

    $("#adminMain").addEventListener("click", (event) => {
      const actionBtn = event.target.closest("[data-list-action]");
      if (!actionBtn) return;
      event.preventDefault();
      applyListAction(actionBtn.dataset.listAction, actionBtn.dataset.index);
      showPane($$(".admin-tab", dash).find((t) => t.classList.contains("active")).dataset.tab);
    });

    const signOutBtn = $("#adminSignOut");
    if (signOutBtn) {
      signOutBtn.addEventListener("click", async () => {
        if (FB) {
          try {
            await FB.signOut();
          } catch (e) {}
        }
        authed = false;
        setLock(true);
      });
    }

    const loginForm = $("#adminLoginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const msg = $("#adminLockMsg");
        const btn = $("#adminLoginBtn");
        const email = $("#adminLoginEmail").value.trim();
        const pass = $("#adminLoginPass").value;
        if (!email || !pass) {
          msg.textContent = "Enter your email and password.";
          msg.className = "admin-lock-msg admin-lock-err";
          return;
        }
        if (!FB) {
          msg.textContent =
            "Admin sign-in is unavailable — Firebase is not connected. Check your internet connection and refresh the page.";
          msg.className = "admin-lock-msg admin-lock-err";
          return;
        }
        btn.disabled = true;
        btn.textContent = "Signing in…";
        msg.textContent = "";
        msg.className = "admin-lock-msg";
        try {
          await FB.signIn(email, pass);
          authed = true;
          setLock(false);
          updateUserBadge();
          showPane($$(".admin-tab", dash).find((t) => t.classList.contains("active"))?.dataset.tab || "home");
        } catch (err) {
          let text = "Sign-in failed. Check your email and password.";
          if (FB && !FB.authAvailable) {
            text =
              "Authentication is unavailable right now. Check your connection and refresh the page.";
          } else {
            const code = err && err.code;
            if (
              code === "auth/user-not-found" ||
              code === "auth/wrong-password" ||
              code === "auth/invalid-credential"
            ) {
              text = "Wrong email or password.";
            } else if (code === "auth/invalid-email") {
              text = "That email address is not valid.";
            } else if (code === "auth/too-many-requests") {
              text = "Too many attempts. Try again in a minute.";
            } else if (code && String(code).indexOf("auth/") === 0) {
              text = "Sign-in failed (" + code + ").";
            }
          }
          msg.textContent = text;
          msg.className = "admin-lock-msg admin-lock-err";
        } finally {
          btn.disabled = false;
          btn.textContent = "Sign in";
        }
      });
    }

    if (FB && FB.onAuth) {
      FB.onAuth(() => {
        updateUserBadge();
      });
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !dash.hidden) {
        const details = $("#adminMain details[open]");
        if (details) details.open = false;
        else close();
      }
    });
  }

  

  function bindTriggers() {
    let clicks = 0;
    let timer = null;
    const copyright = document.querySelector(".footer-bottom p");
    if (copyright) {
      copyright.addEventListener("click", () => {
        clicks++;
        clearTimeout(timer);
        timer = setTimeout(() => (clicks = 0), 3000);
        if (clicks >= 5) {
          clicks = 0;
          toggle();
        }
      });
    }

    document.addEventListener("keydown", (event) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "a") {
        event.preventDefault();
        toggle();
      }
    });
  }

  

  document.body.insertAdjacentHTML("beforeend", SHELL);
  bindShell();
  bindTriggers();
  if (/\/add\/bliss\/?$/.test(location.pathname)) open();
})();
