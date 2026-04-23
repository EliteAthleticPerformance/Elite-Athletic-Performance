// ========================================
// 🔥 ELITE V9 THEME + CONFIG ENGINE (LOCKED)
// ========================================

window.SCHOOL_CONFIG = null;

/* ========================================
   🌐 GLOBAL APP READY (SINGLE SOURCE OF TRUTH)
======================================== */

window.APP_READY = new Promise(async (resolve, reject) => {
  try {
    const params = new URLSearchParams(window.location.search);
    let school = params.get("school") || sessionStorage.getItem("school");

    if (!school) {
      throw new Error("No school provided");
    }

    school = school.toLowerCase();
    sessionStorage.setItem("school", school);

    /* ========================================
       🏫 CONFIG (FAST + RELIABLE)
    ======================================== */

    const SCHOOL_MAP = {
      pleasanthill: {
        key: "pleasanthill",
        name: "Pleasant Hill Roosters",
        logo: "/Elite-Athletic-Performance/images/roosters-logo.png",

        dataURL: "https://script.google.com/macros/s/AKfycbxyBta6YQTkJsfd1uInNAsv1DJofq22D365FgGSUa6ZTLXCaYu29KAuJp1_vgH56zfk/exec",
        submitURL: "https://script.google.com/macros/s/AKfycbxyBta6YQTkJsfd1uInNAsv1DJofq22D365FgGSUa6ZTLXCaYu29KAuJp1_vgH56zfk/exec"
      }
    };

    const config = SCHOOL_MAP[school];

    if (!config) {
      throw new Error("School config not found: " + school);
    }

    window.SCHOOL_CONFIG = config;

    console.log("🏫 CONFIG LOADED:", config);

    // ✅ Apply base (safe immediately)
    applyBaseTheme(config);

    // ✅ Wait for header → then apply logo + name
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
  // favicon
  let favicon = document.getElementById("dynamicFavicon");

  if (!favicon) {
    favicon = document.createElement("link");
    favicon.id = "dynamicFavicon";
    favicon.rel = "icon";
    document.head.appendChild(favicon);
  }

  favicon.href = config.logo;

  // cache
  sessionStorage.setItem("schoolName", config.name);
  sessionStorage.setItem("schoolLogo", config.logo);
}

/* ========================================
   🧠 WAIT FOR HEADER (NO RACE CONDITIONS)
======================================== */

function waitForHeader() {
  return new Promise(resolve => {
    if (document.getElementById("schoolLogo")) {
      resolve();
    } else {
      document.addEventListener("headerLoaded", resolve, { once: true });
    }
  });
}

/* ========================================
   🏫 APPLY HEADER BRANDING (SAFE)
======================================== */

function applyHeaderBranding(config) {
  const logo = document.getElementById("schoolLogo");
  const name = document.getElementById("schoolName");

  if (logo) {
    logo.src = config.logo;

    // ✅ FIX: force visible
    logo.onload = () => {
      logo.classList.add("loaded");
    };

    // fallback if cached
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
