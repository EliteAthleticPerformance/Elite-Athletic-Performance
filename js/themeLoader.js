// ===============================
// 🔥 ELITE V3 THEME ENGINE (PRODUCTION)
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
   SAFE JSON PARSE
   ======================================== */

function safeJSONParse(val) {
  try {
    return JSON.parse(val);
  } catch {
    return null;
  }
}

/* ========================================
   APPLY CACHED THEME (INSTANT)
   ======================================== */

(function applyCachedTheme() {
  const school = normalize(getSchool());
  const cached = safeJSONParse(sessionStorage.getItem("theme-" + school));

  if (!cached) return;

  const root = document.documentElement;

  root.style.setProperty("--primary", cached.primary || "#000");
  root.style.setProperty("--primaryLight", cached.primaryLight || "#333");
  root.style.setProperty("--primaryDark", cached.primaryDark || "#000");
  root.style.setProperty("--secondary", cached.secondary || "#666");
  root.style.setProperty("--secondaryLight", cached.secondaryLight || "#999");
  root.style.setProperty("--background", cached.background || "#111");
})();

/* ========================================
   APPLY LOGO + FAVICON (INSTANT)
   ======================================== */

(function applyCachedLogo() {
  const school = normalize(getSchool());
  const logo = sessionStorage.getItem("logo-" + school);

  if (!logo) return;

  const img = new Image();
  img.src = logo;

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
   ROBUST CSV PARSER
   ======================================== */

function parseCSV(text) {
  const rows = [];
  let current = "";
  let insideQuotes = false;
  let row = [];

  for (let char of text) {
    if (char === '"') insideQuotes = !insideQuotes;
    else if (char === "," && !insideQuotes) {
      row.push(current);
      current = "";
    }
    else if (char === "\n" && !insideQuotes) {
      row.push(current);
      rows.push(row);
      row = [];
      current = "";
    }
    else {
      current += char;
    }
  }

  if (current) {
    row.push(current);
    rows.push(row);
  }

  return rows;
}

/* ========================================
   LOAD CSV
   ======================================== */

async function loadCSV(url) {
  const res = await fetch(url);
  const text = await res.text();

  const parsed = parseCSV(text);
  const headers = parsed.shift().map(h => h.trim());

  return parsed.map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = (row[i] || "").trim();
    });
    return obj;
  });
}

/* ========================================
   LOAD THEME FROM SHEETS
   ======================================== */

let themeLoaded = false;

async function loadTheme() {
  if (themeLoaded) return;
  themeLoaded = true;

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

    if (!schoolRow || !themeRow) {
      console.warn("⚠️ Theme not found for:", schoolKey);
      return;
    }

    applyBranding(schoolRow, themeRow);

  } catch (err) {
    console.error("❌ Theme load error:", err);
  }
}

/* ========================================
   APPLY BRANDING
   ======================================== */

function applyBranding(school, theme) {

  const root = document.documentElement;

  root.style.setProperty("--primary", theme.primary);
  root.style.setProperty("--primaryLight", theme.primaryLight);
  root.style.setProperty("--primaryDark", theme.primaryDark);
  root.style.setProperty("--secondary", theme.secondary);
  root.style.setProperty("--secondaryLight", theme.secondaryLight);
  root.style.setProperty("--background", theme.background);

  const schoolKey = normalize(getSchool());

  // cache theme safely
  sessionStorage.setItem("theme-" + schoolKey, JSON.stringify(theme));

  const logoEl = document.getElementById("schoolLogo");

  if (school.logo) {
    const versionedLogo = school.logo + "?v=" + Date.now();

    sessionStorage.setItem("logo-" + schoolKey, versionedLogo);

    if (logoEl) {
      logoEl.classList.remove("loaded");

      logoEl.onload = () => {
        logoEl.classList.add("loaded");
      };

      logoEl.src = versionedLogo;
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

  // update school name text
  document.querySelectorAll(".school-name").forEach(el => {
    el.textContent = school.name || "";
  });
}

/* ========================================
   INIT (MULTI-TRIGGER SAFE)
   ======================================== */

document.addEventListener("headerLoaded", loadTheme);
window.addEventListener("DOMContentLoaded", loadTheme);

// fallback trigger
setTimeout(loadTheme, 100);
