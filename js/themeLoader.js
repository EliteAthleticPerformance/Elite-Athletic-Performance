/* ========================================
   🔥 ELITE V8 THEME + CONFIG LOADER (LOCKED + HEADER SAFE)
======================================== */

/* ========================================
   🌐 GLOBAL BOOT PROMISE (CRITICAL)
======================================== */

window.APP_READY = new Promise(async (resolve, reject) => {
  try {

    const params = new URLSearchParams(window.location.search);
    let school = params.get("school") || sessionStorage.getItem("school");

    if (!school) {
      throw new Error("No school provided in URL or session");
    }

    // persist school
    sessionStorage.setItem("school", school);

    /* ========================================
       🏫 SCHOOL CONFIG MAP
    ======================================== */

    const SCHOOL_MAP = {

      pleasanthill: {
        key: "pleasanthill",
        name: "Pleasant Hill Roosters",
        logo: "https://eliteathleticperformance.github.io/Elite-Athletic-Performance/images/roosters-logo.png",

        dataURL: "https://script.google.com/macros/s/AKfycbxyBta6YQTkJsfd1uInNAsv1DJofq22D365FgGSUa6ZTLXCaYu29KAuJp1_vgH56zfk/exec",
        submitURL: "https://script.google.com/macros/s/AKfycbxyBta6YQTkJsfd1uInNAsv1DJofq22D365FgGSUa6ZTLXCaYu29KAuJp1_vgH56zfk/exec"
      }

    };

    const config = SCHOOL_MAP[school.toLowerCase()];

    if (!config) {
      throw new Error("School config not found: " + school);
    }

    // ✅ GLOBAL CONFIG
    window.SCHOOL_CONFIG = config;

    console.log("🏫 SCHOOL CONFIG LOADED:", config);

    // ✅ APPLY BASE THEME (safe, no DOM dependency)
    applyBaseTheme(config);

    // ✅ WAIT FOR HEADER → THEN APPLY BRANDING
    waitForHeader().then(() => {
      applyHeaderBranding(config);
    });

    resolve(config);

  } catch (err) {
    console.error("❌ CONFIG LOAD FAILED:", err);
    reject(err);
  }
});

/* ========================================
   🎨 BASE THEME (SAFE EARLY APPLY)
======================================== */

function applyBaseTheme(config) {

  // 🔖 FAVICON (safe immediately)
  const favicon = document.getElementById("dynamicFavicon");
  if (favicon && config.logo) {
    favicon.href = config.logo;
  }

  // 🧠 cache for later use
  sessionStorage.setItem("schoolName", config.name || "");
  sessionStorage.setItem("schoolLogo", config.logo || "");
}

/* ========================================
   🧠 WAIT FOR HEADER (CRITICAL FIX)
======================================== */

function waitForHeader() {
  return new Promise(resolve => {

    // If header already exists → resolve immediately
    if (document.getElementById("schoolLogo")) {
      return resolve();
    }

    // Otherwise wait for header.js event
    document.addEventListener("headerLoaded", resolve, { once: true });
  });
}

/* ========================================
   🏫 APPLY HEADER BRANDING (SAFE)
======================================== */

function applyHeaderBranding(config) {

  const logo = document.getElementById("schoolLogo");
  const name = document.getElementById("schoolName");

  if (logo && config.logo) {
    logo.src = config.logo;
  }

  if (name && config.name) {
    name.textContent = config.name;
  }

  console.log("🎨 HEADER BRANDING APPLIED");
}

/* ========================================
   🚨 GLOBAL FAIL SAFE UI
======================================== */

window.APP_READY.catch(() => {
  document.body.innerHTML = `
    <div style="
      display:flex;
      flex-direction:column;
      justify-content:center;
      align-items:center;
      height:100vh;
      font-family:sans-serif;
      text-align:center;
    ">
      <h1>⚠️ System Error</h1>
      <p>Unable to load school configuration</p>
    </div>
  `;
});
