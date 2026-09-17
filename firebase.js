
(() => {
  "use strict";

  const cfg = window.FIREBASE_CONFIG;

  if (!cfg || !cfg.apiKey || !window.firebase || !window.firebase.app) {
    window.BLISS_FIREBASE = null;
    return;
  }

  let app;
  try {
    app = firebase.initializeApp(cfg);
  } catch (e) {
    if (firebase.app && firebase.app()) app = firebase.app();
    else {
      window.BLISS_FIREBASE = null;
      return;
    }
  }

  try {
    if (firebase.analytics) firebase.analytics();
  } catch (e) {}

  let db = null;
  try {
    db = firebase.firestore();
  } catch (e) {
    window.BLISS_FIREBASE = null;
    return;
  }

  let auth = null;
  let authError = null;
  try {
    auth = firebase.auth();
  } catch (e) {
    authError = e;
  }

  const CONTENT_COLLECTION = "site";
  const CONTENT_DOC = "content";

  const RATE_LIMIT_KEY = "blissjuli.admin.ratelimit";
  const RATE_LIMIT_MAX_ATTEMPTS = 5;
  const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;

  let cached = null;

  function readRateLimit() {
    try {
      const raw = JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || "null");
      if (raw && typeof raw === "object" && Array.isArray(raw.attempts)) return raw;
    } catch (e) {}
    return { attempts: [], lockedUntil: 0 };
  }

  function writeRateLimit(state) {
    try {
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function isRateLimited() {
    const state = readRateLimit();
    if (state.lockedUntil && Date.now() < state.lockedUntil) {
      return state.lockedUntil - Date.now();
    }
    const recent = state.attempts.filter((t) => Date.now() - t < RATE_LIMIT_WINDOW_MS);
    if (recent.length >= RATE_LIMIT_MAX_ATTEMPTS) {
      state.lockedUntil = Date.now() + 60 * 1000;
      writeRateLimit(state);
      return 60 * 1000;
    }
    return 0;
  }

  function recordFailedAttempt() {
    const state = readRateLimit();
    state.attempts.push(Date.now());
    writeRateLimit(state);
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
  }

  function isValidContent(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    try {
      return JSON.stringify(value).length <= 500000;
    } catch (e) {
      return false;
    }
  }

  
  function classifyError(error) {
    const code = String(
      (error && (error.code || error.message)) || ""
    ).toLowerCase();
    const permissionDenied = /permission-denied/.test(code);
    const offline =
      !permissionDenied &&
      (!window.navigator.onLine ||
        /unavailable|network|offline|timeout|failed to fetch|internet/i.test(
          code
        ));
    return { ok: false, permissionDenied, offline };
  }

  async function load() {
    try {
      const snap = await db
        .collection(CONTENT_COLLECTION)
        .doc(CONTENT_DOC)
        .get();
      if (snap.exists) {
        cached = snap.data();
      }
      return {
        ok: true,
        data: snap.exists ? snap.data() : null,
        permissionDenied: false,
        offline: false,
      };
    } catch (e) {
      return classifyError(e);
    }
  }

  async function save(content) {
    if (content == null) {
      return { ok: false, permissionDenied: false, offline: true };
    }
    if (!isValidContent(content)) {
      return { ok: false, permissionDenied: false, offline: false, invalid: true };
    }
    try {
      await db.collection(CONTENT_COLLECTION).doc(CONTENT_DOC).set(content);
      cached = content;
      return { ok: true, permissionDenied: false, offline: false };
    } catch (e) {
      return classifyError(e);
    }
  }

  window.BLISS_FIREBASE = {
    available: true,
    authAvailable: !!auth,
    authError,
    db,
    auth,
    load,
    save,
    signIn(email, pass) {
      if (!auth) {
        return Promise.reject(
          authError || new Error("Authentication is unavailable.")
        );
      }
      if (!isValidEmail(email)) {
        return Promise.reject(new Error("auth/invalid-email"));
      }
      const waitMs = isRateLimited();
      if (waitMs > 0) {
        return Promise.reject(
          new Error("auth/too-many-requests")
        );
      }
      return auth.signInWithEmailAndPassword(email.trim(), pass).catch((err) => {
        recordFailedAttempt();
        throw err;
      });
    },
    signOut() {
      if (!auth) {
        return Promise.reject(
          authError || new Error("Authentication is unavailable.")
        );
      }
      return auth.signOut();
    },
    currentUser() {
      return auth ? auth.currentUser : null;
    },
    onAuth(cb) {
      if (!auth) return () => {};
      return auth.onAuthStateChanged(cb);
    },
  };
})();
