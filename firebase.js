
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

  let cached = null;

  
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
      return auth.signInWithEmailAndPassword(email, pass);
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
