// ========================================
// 🔥 ELITE V11 THEME ENGINE (MULTI-TENANT)
// ========================================

window.SCHOOL_CONFIG = null;

const CONFIG_API =
  "https://script.google.com/macros/s/YOUR_CONFIG_ENDPOINT/exec";

/* ========================================
   🌐 BASE PATH
======================================== */

function getBasePath() {
  return window.location.pathname.includes("/Elite-Athletic-Performance/")
    ? "/Elite-Athletic-Performance/"
    : "/";
}

/* ========================================
   🧠 GET SCHOOL FROM URL
======================================== */

function getSchoolKey() {
  const params = new URLSearchParams(window.location.search);
  const school = params.get("school") || "pleasanthill";

  return school.toLowerCase().replace(/\s+/g, "");
}

/* ========================================
   🌐 GLOBAL APP READY
======================================== */

window.APP_READY = new Promise(async (resolve, reject) => {
  try {
    const base = getBasePath();
    const schoolKey = getSchoolKey();

    let config = null;

    // 🔥 TRY FETCH CONFIG (MULTI-TENANT)
    try {
      const res = await fetch(CONFIG_API + "?t=" + Date.now());
      const list = await res.json();

      if (Array.isArray(list)) {
        config = list.find(
          s => String(s.school).toLowerCase() === schoolKey
        );
      }
    } catch (err) {
      console.warn("⚠️ Config API failed, using fallback");
    }

    // 🔥 FALLBACK (PLEASANT HILL SAFE MODE)
    if (!config) {
      config = {
        school: "pleasanthill",
        fullName: "Pleasant Hill Roosters",

        logo: base + "images/roosters-logo.png",

        primary: "#7c3aed",
        primaryLight: "#a78bfa",
        accent: "#f59e0b",

        dataURL:
          "https://script.google.com/macros/s/AKfycbx4PyTeFkNyFE_LpovykeiFXiLgPwcB3shbjwDIyFMARi496yZ2wHq_G5jwXJsqV_3o/exec",

        submitURL:
          "https://script.google.com/macros/s/AKfycbx4PyTeFkNyFE_LpovykeiFXiLgPwcB3shbjwDIyFMARi496yZ2wHq_G5jwXJsqV_3o/exec"
      };

      console.warn("⚠️ Using fallback config");
    }

    window.SCHOOL_CONFIG = {
      key: config.school,
      name: config.fullName || config.name,
      logo: config.logo,
      primary: config.primary || "#7c3aed",
      primaryLight: config.primaryLight || "#a78bfa",
      accent: config.accent || "#f59e0b",
      dataURL: config.dataURL,
      submitURL: config.submitURL
    };

    console.log("🏫 CONFIG LOADED:", window.SCHOOL_CONFIG);

    applyTheme(window.SCHOOL_CONFIG);

    await waitForHeader();
    applyHeaderBranding(window.SCHOOL_CONFIG);

    resolve(window.SCHOOL_CONFIG);
  } catch (err) {
    console.error("❌ CONFIG LOAD FAILED:", err);
    reject(err);
  }
});

/* ========================================
   🎨 APPLY GLOBAL THEME
======================================== */

function applyTheme(config) {
  const root = document.documentElement;

  root.style.setProperty("--primary", config.primary);
  root.style.setProperty("--primaryLight", config.primaryLight);
  root.style.setProperty("--accent", config.accent);

  // 🔥 TIMER PAGE SUPPORT
  document.body.style.setProperty("--primary", config.primary);

  // favicon
  let favicon = document.getElementById("dynamicFavicon");
  if (!favicon) {
    favicon = document.createElement("link");
    favicon.id = "dynamicFavicon";
    favicon.rel = "icon";
    document.head.appendChild(favicon);
  }

  favicon.href = config.logo + "?v=" + Date.now();

  sessionStorage.setItem("school", config.key);
  sessionStorage.setItem("schoolName", config.name);
  sessionStorage.setItem("schoolLogo", config.logo);
}

/* ========================================
   🧠 WAIT FOR HEADER
======================================== */

function waitForHeader() {
  return new Promise(resolve => {
    let attempts = 0;

    const check = () => {
      if (document.getElementById("schoolLogo")) {
        resolve();
      } else if (attempts < 50) {
        attempts++;
        setTimeout(check, 50);
      } else {
        resolve();
      }
    };

    check();
  });
}

/* ========================================
   🏫 HEADER BRANDING
======================================== */

function applyHeaderBranding(config) {
  const logo = document.getElementById("schoolLogo");
  const name = document.getElementById("schoolName");

  if (logo) {
    logo.src = config.logo + "?v=" + Date.now();
    logo.classList.add("loaded");
  }

  if (name) {
    name.textContent = config.name;
  }

  // 🔥 APPLY HEADER COLOR GLOW
  const headerTitle = document.querySelector("h1");
  if (headerTitle) {
    headerTitle.style.textShadow = `
      0 0 10px ${config.primary},
      0 0 20px ${config.primaryLight}
    `;
  }
}
