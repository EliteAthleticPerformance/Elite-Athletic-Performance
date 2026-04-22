// ===============================
// 🔥 ELITE V5 THEME + DATA ENGINE (PRODUCTION)
// ===============================

/* ========================================
   GET SCHOOL (URL → SESSION → DEFAULT)
======================================== */

function getSchool() {
  const params = new URLSearchParams(window.location.search);
  let school = params.get("school");

  if (school) {
    sessionStorage.setItem("school", school);
  } else {
    school = sessionStorage.getItem("school");
  }

  return school || "harrisonville";
}

/* ========================================
   NORMALIZE
======================================== */

function normalize(str) {
  return (str || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^\w]/g, "");
}

/* ========================================
   CLEAN OBJECT KEYS (🔥 FIXES CSV ISSUES)
======================================== */

function cleanRow(row) {
  const cleaned = {};
  for (let key in row) {
    cleaned[key.trim()] = (row[key] || "").trim();
  }
  return cleaned;
}

/* ========================================
   APPLY CACHED THEME (INSTANT LOAD)
======================================== */

(function applyCachedTheme() {
  const school = normalize(getSchool());
  const cached = sessionStorage.getItem("theme-" + school);

  if (!cached) return;

  const theme = JSON.parse(cached);
  const root = document.documentElement;

  root.style.setProperty("--primary", theme.primary || "#000");
  root.style.setProperty("--primaryLight", theme.primaryLight || "#333");
  root.style.setProperty("--primaryDark", theme.primaryDark || "#000");
  root.style.setProperty("--secondary", theme.secondary || "#666");
  root.style.setProperty("--secondaryLight", theme.secondaryLight || "#999");
  root.style.setProperty("--background", theme.background || "#111");
})();

/* ========================================
   APPLY CACHED LOGO (INSTANT)
======================================== */

(function applyCachedLogo() {
  const school = normalize(getSchool());
  const logo = sessionStorage.getItem("logo-" + school);

  if (!logo) return;

  document.addEventListener("DOMContentLoaded", () => {
    const el = document.getElementById("schoolLogo");
    if (el) {
      el.src = logo;
      el.onload = () => el.classList.add("loaded");
    }

    let favicon = document.getElementById("dynamicFavicon");

    if (!favicon) {
      favicon = document.createElement("link");
      favicon.id = "dynamicFavicon";
      favicon.rel = "icon";
      document.head.appendChild(favicon);
    }

    favicon.href = logo;
  });
})();

/* ========================================
   SIMPLE CSV PARSER
======================================== */

function parseCSV(text) {
  const rows = text.split("\n").map(r => r.split(","));
  const headers = rows.shift().map(h => h.trim());

  return rows.map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = (row[i] || "").trim();
    });
    return cleanRow(obj); // 🔥 CLEAN HEADERS
  });
}

/* ========================================
   LOAD CSV
======================================== */

async function loadCSV(url) {
  const res = await fetch(url);
  const text = await res.text();
  return parseCSV(text);
}

/* ========================================
   GLOBAL CONFIG (🔥 FIXED SCOPE)
======================================== */

window.SCHOOL_CONFIG = null;

/* ========================================
   LOAD THEME + SCHOOL CONFIG
======================================== */

let loaded = false;

async function loadTheme() {
  if (loaded) return;
  loaded = true;

  try {
    const schoolKey = normalize(getSchool());

    const schoolDBUrl =
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vRXJVxlKWqu-JbdJp9S0_lNzbetCfbhXGSgny11mq7uKYUJh-PdB0zQGonz56iA0tjJtJrMu2EF2Xoa/pub?gid=0&single=true&output=csv";

    const themeUrl =
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vRXJVxlKWqu-JbdJp9S0_lNzbetCfbhXGSgny11mq7uKYUJh-PdB0zQGonz56iA0tjJtJrMu2EF2Xoa/pub?gid=2096720635&single=true&output=csv";

    const [schools, themes] = await Promise.all([
      loadCSV(schoolDBUrl),
      loadCSV(themeUrl)
    ]);

    const schoolRow = schools.find(s => normalize(s.school) === schoolKey);
    const themeRow = themes.find(t => normalize(t.school) === schoolKey);

    if (!schoolRow) {
      console.warn("❌ School not found:", schoolKey);
      return;
    }

    // 🔥 GLOBAL CONFIG (FIXED)
    window.SCHOOL_CONFIG = {
      key: schoolKey,
      name: schoolRow.name || "",
      logo: schoolRow.logo || "",
      dataURL: schoolRow.dataURL || "",
      submitURL: schoolRow.submitURL || "",
      theme: themeRow || {}
    };

    console.log("🏫 SCHOOL CONFIG LOADED:", window.SCHOOL_CONFIG);

    applyBranding(window.SCHOOL_CONFIG);

  } catch (err) {
    console.error("❌ Theme load error:", err);
  }
}

/* ========================================
   APPLY BRANDING
======================================== */

function applyBranding(config) {
  const root = document.documentElement;
  const theme = config.theme;

  root.style.setProperty("--primary", theme.primary || "#000");
  root.style.setProperty("--primaryLight", theme.primaryLight || "#333");
  root.style.setProperty("--primaryDark", theme.primaryDark || "#000");
  root.style.setProperty("--secondary", theme.secondary || "#666");
  root.style.setProperty("--secondaryLight", theme.secondaryLight || "#999");
  root.style.setProperty("--background", theme.background || "#111");

  sessionStorage.setItem("theme-" + config.key, JSON.stringify(theme));

  if (config.logo) {
    const versionedLogo = config.logo + "?v=" + Date.now();
    sessionStorage.setItem("logo-" + config.key, versionedLogo);

    const logoEl = document.getElementById("schoolLogo");
    if (logoEl) {
      logoEl.src = versionedLogo;
      logoEl.onload = () => logoEl.classList.add("loaded");
    }

    let favicon = document.getElementById("dynamicFavicon");
    if (!favicon) {
      favicon = document.createElement("link");
      favicon.id = "dynamicFavicon";
      favicon.rel = "icon";
      document.head.appendChild(favicon);
    }

    favicon.href = versionedLogo;
  }

  document.querySelectorAll(".school-name").forEach(el => {
    el.textContent = config.name;
  });
}

/* ========================================
   WAIT FOR CONFIG (USED BY PAGES)
======================================== */

async function waitForConfig() {
  let tries = 0;

  while (
    (!window.SCHOOL_CONFIG || !window.SCHOOL_CONFIG.submitURL) &&
    tries < 100
  ) {
    await new Promise(r => setTimeout(r, 50));
    tries++;
  }

  console.log("✅ CONFIG READY:", window.SCHOOL_CONFIG);
}

/* ========================================
   INIT
======================================== */

document.addEventListener("headerLoaded", loadTheme);
window.addEventListener("DOMContentLoaded", loadTheme);
setTimeout(loadTheme, 100);
