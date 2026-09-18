
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

  const checkbox = (path, label, value) =>
    `<label class="af-field af-field-toggle">
       <span class="af-label">${label}</span>
       <input type="checkbox" data-path="${path}" ${
      value ? "checked" : ""
    }>
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
          <button type="button" class="admin-tab" data-tab="certs">Certs & CV</button>
          <button type="button" class="admin-tab" data-tab="settings">Settings</button>
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
            <span class="af-input-wrap">
              <input type="password" id="adminLoginPass" autocomplete="current-password" required>
              <button type="button" class="af-input-toggle" id="adminTogglePass" aria-pressed="false" aria-label="Show password">
                <svg class="admin-key-icon" id="adminToggleIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="m21 2-9.6 9.6"></path>
                  <path d="m15.5 7.5 3 3L22 7l-3-3"></path>
                  <path d="m7.5 15.5 3 3L15 14l-3-3"></path>
                  <path d="M7.5 11.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9z"></path>
                  <path class="admin-key-slash" d="M3 21 21 3"></path>
                </svg>
              </button>
            </span>
          </label>
          <div class="admin-lock-row">
            <button type="button" class="admin-lock-link" id="adminForgot">Forgot password?</button>
          </div>
          <div class="admin-lock-actions">
            <button type="button" class="admin-btn" id="adminLockCancel">Cancel</button>
            <button type="submit" class="admin-btn admin-btn-primary admin-btn-block" id="adminLoginBtn">Sign in</button>
          </div>
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

  function buildSettingsPane() {
    const s = C.settings;
    return `
      ${paneHeading("Settings", "Site behavior and appearance. Save All applies the changes to the live site.")}
      <div class="af-section">
        <h3>Appearance</h3>
        ${select(
          "settings.defaultTheme",
          "Default theme (for visitors who haven't chosen)",
          s.defaultTheme,
          ["system", "light", "dark"]
        )}
        <p class="af-note">Visitors can still override this with the sun/moon button in the nav. "system" follows each visitor's device preference.</p>
      </div>
      <div class="af-section">
        <h3>Effects</h3>
        <div class="af-grid">
          ${checkbox("settings.particles", "Floating particles", s.particles)}
          ${checkbox("settings.cursorGlow", "Cursor glow", s.cursorGlow)}
          ${checkbox("settings.cardTilt", "Card tilt", s.cardTilt)}
          ${checkbox("settings.magneticButtons", "Magnetic buttons", s.magneticButtons)}
        </div>
      </div>
      <div class="af-section">
        <h3>Motion & timing</h3>
        <div class="af-grid">
          ${checkbox("settings.testimonialsAutoplay", "Testimonial autoplay", s.testimonialsAutoplay)}
          ${field("settings.testimonialsIntervalMs", "Autoplay interval (ms)", s.testimonialsIntervalMs, "number")}
          ${field("settings.typewriterSpeed", "Typewriter speed (ms)", s.typewriterSpeed, "number")}
        </div>
      </div>
      <div class="af-section">
        <h3>Form messages</h3>
        ${textarea("settings.contactSuccessMessage", "Contact form — success message", s.contactSuccessMessage, 2)}
        ${textarea("settings.contactErrorMessage", "Contact form — error message", s.contactErrorMessage, 2)}
        ${textarea("settings.contactNetworkMessage", "Contact form — network error message", s.contactNetworkMessage, 2)}
        ${textarea("settings.newsletterMessage", "Newsletter — success message", s.newsletterMessage, 2)}
      </div>
      <div class="af-section">
        <h3>Admin</h3>
        <div class="af-actions">
          <button type="button" class="admin-btn" id="adminCopyLink">Copy admin login link</button>
        </div>
        <p class="af-note">Copies the direct admin URL (your-domain.com/add/bliss) to your clipboard. The hidden trigger (5 clicks on the footer copyright or Ctrl+Shift+A) still works as usual.</p>
      </div>
    `;
  }

  function buildCertsPane() {
    const certs = Array.isArray(C.certificates) ? C.certificates : [];
    const cvs = Array.isArray(C.cvs) ? C.cvs : [];

    const certCards = certs
      .map(
        (cert, i) => `
        <div class="af-card">
          <div class="af-card-head">
            <strong>${esc(cert.title || "Certificate " + (i + 1))}</strong>
            <div class="af-card-actions">
              <a href="${esc(cert.url)}" class="admin-btn admin-btn-small" target="_blank" rel="noopener noreferrer">View</a>
              <button type="button" class="admin-btn admin-btn-small admin-btn-danger" data-list-action="remove-cert" data-index="${i}">Remove</button>
            </div>
          </div>
          <div class="af-grid">
            ${field(`certificates.${i}.title`, "Title", cert.title)}
            ${field(`certificates.${i}.issuer`, "Issued by", cert.issuer)}
            ${field(`certificates.${i}.year`, "Year", cert.year)}
          </div>
          <p class="af-note">File: ${esc(cert.name || "")}</p>
        </div>`
      )
      .join("");

    const cvCards = cvs
      .map(
        (cv, i) => `
        <div class="af-card">
          <div class="af-card-head">
            <strong>${esc(cv.label || "CV " + (i + 1))}</strong>
            <div class="af-card-actions">
              <a href="${esc(cv.url)}" class="admin-btn admin-btn-small" target="_blank" rel="noopener noreferrer">Download</a>
              <button type="button" class="admin-btn admin-btn-small admin-btn-danger" data-list-action="remove-cv" data-index="${i}">Remove</button>
            </div>
          </div>
          <div class="af-grid">
            ${field(`cvs.${i}.label`, "Label", cv.label)}
          </div>
          <p class="af-note">File: ${esc(cv.name || "")}</p>
        </div>`
      )
      .join("");

    return `
      ${paneHeading("Certificates & CV", "Upload certificate images/PDFs and CV files. Files go to Firebase Storage; the details publish with Save All.")}
      <div class="af-section">
        <h3>Certificates</h3>
        ${certs.length ? `<div class="af-list">${certCards}</div>` : `<p class="af-note">No certificates uploaded yet.</p>`}
        <div class="af-actions">
          <button type="button" class="admin-btn" data-upload="adminCertFile">+ Upload certificate</button>
        </div>
        <input type="file" id="adminCertFile" accept="image/*,application/pdf" multiple hidden>
        <p class="af-note" id="adminCertNote"></p>
      </div>
      <div class="af-section">
        <h3>CVs</h3>
        ${cvs.length ? `<div class="af-list">${cvCards}</div>` : `<p class="af-note">No CVs uploaded yet.</p>`}
        <div class="af-actions">
          <button type="button" class="admin-btn" data-upload="adminCvFile">+ Upload CV</button>
        </div>
        <input type="file" id="adminCvFile" accept="application/pdf" hidden>
        <p class="af-note" id="adminCvNote"></p>
      </div>
    `;
  }

  const PANE_BUILDERS = {
    home: buildHomePane,
    services: buildServicesPane,
    projects: buildProjectsPane,
    blog: buildBlogPane,
    testimonials: buildTestimonialsPane,
    certs: buildCertsPane,
    settings: buildSettingsPane,
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
    } else if (action === "remove-cert" || action === "remove-cv") {
      const key = action === "remove-cert" ? "certificates" : "cvs";
      const list = Array.isArray(C[key]) ? C[key] : [];
      list.splice(Number(index), 1);
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
    certificates: "array",
    cvs: "array",
    settings: "object",
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
    const lockCancel = $("#adminLockCancel");
    if (lockCancel) lockCancel.addEventListener("click", close);
    $("#adminExport").addEventListener("click", exportData);
    $("#adminImport").addEventListener("click", () => $("#adminFile").click());
    $("#adminFile").addEventListener("change", (e) => {
      if (e.target.files[0]) importData(e.target.files[0]);
      e.target.value = "";
    });

    $("#adminMain").addEventListener("click", (event) => {
      const copyBtn = event.target.closest("#adminCopyLink");
      if (copyBtn) {
        const url = location.origin + "/add/bliss";
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard
            .writeText(url)
            .then(() => showStatus("Admin login link copied to clipboard."))
            .catch(() => showStatus("Could not copy — your admin link is: " + url, false));
        } else {
          showStatus("Could not copy — your admin link is: " + url, false);
        }
        return;
      }
      const actionBtn = event.target.closest("[data-list-action]");
      if (actionBtn) {
        event.preventDefault();
        applyListAction(actionBtn.dataset.listAction, actionBtn.dataset.index);
        showPane($$(".admin-tab", dash).find((t) => t.classList.contains("active")).dataset.tab);
        return;
      }
      const uploadBtn = event.target.closest("[data-upload]");
      if (uploadBtn) {
        event.preventDefault();
        const input = $("#" + uploadBtn.dataset.upload);
        if (input) input.click();
        return;
      }
      if (event.target.closest("#adminCancelUpload")) {
        uploadSequenceCancelled = true;
      }
    });

    $("#adminMain").addEventListener("change", (event) => {
      const input = event.target;
      if (input.id === "adminCertFile" || input.id === "adminCvFile") {
        const kind = input.id === "adminCertFile" ? "cert" : "cv";
        const files = Array.from(input.files || []);
        input.value = "";
        if (files.length) uploadSequence(kind, files);
      }
    });

    let uploadSequenceCancelled = false;

    async function uploadSequence(kind, files) {
      uploadSequenceCancelled = false;
      for (let i = 0; i < files.length; i++) {
        if (uploadSequenceCancelled) break;
        const ok = await startUpload(kind, files[i], i + 1, files.length);
        const activeTab = $$(".admin-tab", dash).find((t) => t.classList.contains("active"));
        if (ok && activeTab) showPane(activeTab.dataset.tab);
      }
    }

    function fileToDataUrl(file) {
      return new Promise((resolve, reject) => {
        if (!(file instanceof File) && !(file instanceof Blob)) {
          reject(new Error("No file."));
          return;
        }
        if (!/^image\//i.test(file.type)) {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error("Could not read file."));
          reader.readAsDataURL(file);
          return;
        }
        const objectUrl = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          URL.revokeObjectURL(objectUrl);
          const maxDim = 1000;
          let { width, height } = img;
          const scale = Math.min(1, maxDim / Math.max(width, height));
          width = Math.max(1, Math.round(width * scale));
          height = Math.max(1, Math.round(height * scale));
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.75));
        };
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Could not read image."));
        };
        img.src = objectUrl;
      });
    }

    const FIRESTORE_DOC_LIMIT = 900000;

    function projectedSize() {
      return JSON.stringify({
        certificates: C.certificates,
        cvs: C.cvs,
      }).length;
    }

    async function startUpload(kind, file, seqIndex, seqTotal) {
      const noteEl = $(kind === "cert" ? "#adminCertNote" : "#adminCvNote");
      const seqText = seqTotal && seqTotal > 1 ? "(" + seqIndex + " of " + seqTotal + ") " : "";
      if (noteEl) {
        noteEl.innerHTML =
          `<span class="admin-upload-progress">Processing ${seqText}${esc(file.name)}… compressed and saved directly in your free Firestore plan — no Storage needed</span>` +
          `<button type="button" class="admin-btn admin-btn-small" id="adminCancelUpload">Cancel</button>`;
      }
      try {
        const dataUrl = await fileToDataUrl(file);
        if (uploadSequenceCancelled) {
          if (noteEl) noteEl.textContent = "Batch cancelled.";
          return false;
        }
        const baseName = file.name.replace(/\.[^.]+$/, "");
        if (kind === "cert") {
          C.certificates.push({
            title: baseName,
            issuer: "",
            year: "",
            name: file.name,
            url: dataUrl,
          });
        } else {
          C.cvs.push({
            label: baseName,
            name: file.name,
            url: dataUrl,
          });
        }
        const size = projectedSize();
        if (size > FIRESTORE_DOC_LIMIT) {
          if (kind === "cert") C.certificates.pop();
          else C.cvs.pop();
          const mb = Math.round((FIRESTORE_DOC_LIMIT / 1000000) * 100) / 100;
          const used = Math.round((size / 1000000) * 10) / 10;
          if (noteEl) noteEl.textContent = `Skipped "${file.name}" — too large. Firestore's free tier keeps one project doc to ~1MB (now ~${used}MB projected). Use smaller/resized images.`;
          return false;
        }
        showStatus(kind === "cert" ? "Certificate added — click Save All to publish." : "CV added — click Save All to publish.");
        return true;
      } catch (e) {
        uploadSequenceCancelled = false;
        if (noteEl) noteEl.textContent = "Could not process " + esc(file.name) + " — make sure it is an image (JPG/PNG) or a PDF.";
        return false;
      }
    }

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

    const togglePass = $("#adminTogglePass");
    const passInput = $("#adminLoginPass");
    if (togglePass && passInput) {
      togglePass.addEventListener("click", () => {
        const saw = passInput.type === "text";
        passInput.type = saw ? "password" : "text";
        togglePass.setAttribute("aria-pressed", String(!saw));
        togglePass.setAttribute(
          "aria-label",
          saw ? "Show password" : "Hide password"
        );
        passInput.focus();
      });
    }

    const forgot = $("#adminForgot");
    if (forgot) {
      forgot.addEventListener("click", async () => {
        const msg = $("#adminLockMsg");
        const emailInput = $("#adminLoginEmail");
        const email = emailInput.value.trim();
        if (!email) {
          emailInput.focus();
          msg.textContent = "Enter your email above to send a reset link.";
          msg.className = "admin-lock-msg admin-lock-err";
          return;
        }
        if (!FB || !FB.authAvailable || !FB.sendPasswordReset) {
          msg.textContent = "Password reset is unavailable right now. Check your connection.";
          msg.className = "admin-lock-msg admin-lock-err";
          return;
        }
        forgot.disabled = true;
        msg.textContent = "Sending reset link…";
        msg.className = "admin-lock-msg admin-lock-ok";
        try {
          await FB.sendPasswordReset(email);
          msg.textContent = "Password reset email sent. Check your inbox.";
          msg.className = "admin-lock-msg admin-lock-ok";
        } catch (err) {
          const code = err && err.code;
          if (code === "auth/user-not-found") {
            msg.textContent = "No account found for that email.";
          } else if (code === "auth/invalid-email") {
            msg.textContent = "That email address is not valid.";
          } else {
            msg.textContent = "Could not send the reset email. Try again shortly.";
          }
          msg.className = "admin-lock-msg admin-lock-err";
        } finally {
          forgot.disabled = false;
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
