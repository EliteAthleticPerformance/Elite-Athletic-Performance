// ========================================
// 🔥 ELITE V10 THEME + CONFIG ENGINE (PLEASANT HILL LOCKED)
// ========================================

window.SCHOOL_CONFIG = null;

/* ========================================
   🌐 BASE PATH
======================================== */

function getBasePath() {
  const path = window.location.pathname;

  if (path.includes("/Elite-Athletic-Performance/")) {
    return "/Elite-Athletic-Performance/";
  }

  return "/";
}

/* ========================================
   🌐 GLOBAL APP READY
======================================== */

window.APP_READY = new Promise(async (resolve, reject) => {
  try {

    const base = getBasePath();

    // 🔥 HARD-CODED CONFIG (PLEASANT HILL ONLY)
    const config = {
      key: "pleasanthill",
      name: "Pleasant Hill Roosters",

      logo: base + "images/roosters-logo.png",

      dataURL: "https://script.google.com/macros/s/AKfycbyZPnii9Qf3VdDiTRn1tPt_BOnIv22m2r5n5afnEQ6pNGO2sWO-jQa6MBtJBNfYGyA/exec",
      submitURL: "https://script.google.com/macros/s/AKfycbyZPnii9Qf3VdDiTRn1tPt_BOnIv22m2r5n5afnEQ6pNGO2sWO-jQa6MBtJBNfYGyA/exec"
    };

    window.SCHOOL_CONFIG = config;

    console.log("🏫 CONFIG LOADED (HARDCODED):", config);

    // ✅ APPLY BASE
    applyBaseTheme(config);

    // ✅ HEADER SYNC
    await waitForHeader();
    applyHeaderBranding(config);

    resolve(config);

  } catch (err) {
    console.error("❌ CONFIG LOAD FAILED:", err);
    reject(err);
  }
});

/* ========================================
   🎨 BASE THEME
======================================== */

function applyBaseTheme(config) {

  let favicon = document.getElementById("dynamicFavicon");

  if (!favicon) {
    favicon = document.createElement("link");
    favicon.id = "dynamicFavicon";
    favicon.rel = "icon";
    document.head.appendChild(favicon);
  }

  favicon.href = config.logo + "?v=" + Date.now();

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
      const logo = document.getElementById("schoolLogo");

      if (logo) {
        resolve();
      } else if (attempts < 50) {
        attempts++;
        setTimeout(check, 50);
      } else {
        console.warn("⚠️ Header not detected, forcing branding anyway");
        resolve();
      }
    };

    check();
  });
}

/* ========================================
   🏫 APPLY HEADER BRANDING
======================================== */

function applyHeaderBranding(config) {

  const logo = document.getElementById("schoolLogo");
  const name = document.getElementById("schoolName");

  if (logo) {

    const logoURL = config.logo + "?v=" + Date.now();

    logo.src = logoURL;

    logo.onload = () => {
      logo.classList.add("loaded");
    };

    logo.onerror = () => {
      console.warn("⚠️ Logo failed to load, using fallback");
      logo.src = getBasePath() + "images/default-logo.png";
      logo.classList.add("loaded");
    };

    if (logo.complete) {
      logo.classList.add("loaded");
    }
  }

  if (name) {
    name.textContent = config.name;
  }

  console.log("🎨 HEADER BRANDING APPLIED");
}

/* ========================================
   🚨 FAIL SAFE
======================================== */

window.APP_READY.catch(() => {
  document.body.innerHTML = `
    <div style="
      display:flex;
      justify-content:center;
      align-items:center;
      height:100vh;
      font-family:sans-serif;
      text-align:center;
    ">
      <div>
        <h1>⚠️ System Error</h1>
        <p>Unable to load configuration</p>
      </div>
    </div>
  `;
});
