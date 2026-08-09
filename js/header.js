// ========================================
// 🔥 ELITE V7 HEADER ENGINE (LOCKED + SYNCED)
// ========================================

const Header = {};

document.addEventListener("DOMContentLoaded", loadHeader);

/* ========================================
   🧱 HEADER LOAD
======================================== */

async function loadHeader() {
  const container = document.getElementById("header-placeholder");
  if (!container) return;

  try {
    const base = getBasePath();
    const res = await fetch(base + "components/header.html");

    if (!res.ok) throw new Error("Header fetch failed");

    const html = await res.text();
    container.innerHTML = html;

    // 🔥 WAIT FOR CONFIG BEFORE INIT (CRITICAL)
    await waitForConfig();

    initHeaderUI();

  } catch (err) {
    console.error("❌ HEADER LOAD ERROR:", err);
  }
}

/* ========================================
   🧠 WAIT FOR CONFIG
======================================== */

async function waitForConfig() {
  try {
    if (window.APP_READY) {
      await window.APP_READY;
    }
  } catch (err) {
    console.warn("⚠️ Config not ready before header init");
  }
}



// ========================================
// 🔥 DEMO-ONLY SALES ELEMENTS
// ========================================

function updateSalesVisibility() {

    const school = SchoolService.getSchoolKey();

    const isDemo =
        school.toLowerCase() === "demo";


    // ------------------------------------
    // FREE TRIAL CTA
    // ------------------------------------

    const cta =
        document.querySelector(".generic-header-cta");

    if (cta) {

        cta.style.setProperty(
            "display",
            isDemo ? "inline-flex" : "none",
            "important"
        );

    }


    // ------------------------------------
    // PRICING NAV LINK
    // ------------------------------------

    const pricingLink =
        document.getElementById("pricingNavLink");

    if (pricingLink) {

        pricingLink.style.setProperty(
            "display",
            isDemo ? "flex" : "none",
            "important"
        );

    }

}


// ========================================
// 💰 PRICING LINK VISIBILITY
// ========================================

function updatePricingLink() {

    const pricingLink =
        document.getElementById("pricingNavLink");

    if (!pricingLink) return;

    const school =
        SchoolService.getSchoolKey();

    const isDemo =
        school === "Demo";

    pricingLink.classList.toggle(
        "hidden",
        !isDemo
    );
}


function updateSchoolBrandingMode() {

    const header =
        document.getElementById("schoolHeader");

    if (!header) return;

    const school =
        SchoolService.getSchoolKey();

    header.classList.toggle(
        "custom-school",
        school.toLowerCase() !== "demo"
    );
}


/* ========================================
   🎯 INIT
======================================== */

function initHeaderUI() {

    setupMenu();
    setupLogout();

    ThemeService.applyHeaderBranding(
        window.APP_CONFIG
    );

    updateSalesVisibility();
    updateSchoolBrandingMode();
    
    injectSchoolIntoLinks();
    highlightActiveLink();

    document.dispatchEvent(
        new Event("headerLoaded")
    );
}

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
   🏫 SCHOOL PARAM
======================================== */

function getSchoolParam() {
  const params = new URLSearchParams(window.location.search);
  let school = params.get("school");

  if (school) {
    sessionStorage.setItem("school", school);
  } else {
    school = sessionStorage.getItem("school");
  }

  return school || "";
}

/* ========================================
   🔗 LINK INJECTION (ROBUST)
======================================== */

function injectSchoolIntoLinks() {
  const school = SchoolService.getSchoolKey();
  const base = getBasePath();

  document.querySelectorAll("#dropdownMenu a").forEach(link => {
    let href = link.getAttribute("href");

    if (!href || href.startsWith("http")) return;

    href = href.split("?")[0];

    const url = new URL(base + href, window.location.origin);

    if (school) {
      url.searchParams.set("school", school);
    }

    link.setAttribute("href", url.pathname + url.search);
  });
}


// ========================================
// 🏫 HEADER BRANDING
// ========================================

function applyHeaderBranding() {

    const branding =
        window.APP_CONFIG?.branding;

    if (!branding) {
        console.warn(
            "⚠️ Header branding unavailable"
        );
        return;
    }

    const schoolNameEl =
        document.getElementById("schoolName");

    const pageTitleEl =
        document.getElementById("pageTitle");

    if (!schoolNameEl || !pageTitleEl) {
        return;
    }

    schoolNameEl.textContent =
        branding.displayName ||
        branding.schoolName ||
        "";

    pageTitleEl.textContent =
        branding.slogan ||
        "Elite Athletic Performance";
}


/* ========================================
   🏷️ TITLE
======================================== */

function setPageTitle(title = "Elite Athletic Performance") {

    const el = document.getElementById("pageTitle");

    if (!el) return;

    el.textContent = title;

}

Header.setTitle = setPageTitle;


/* ========================================
   ⏱ HEADER TIMER
======================================== */

function showHeaderTimer(show = true) {

    const timer = document.getElementById("headerTimer");

    if (!timer) return;

    timer.style.display = show ? "" : "none";

}

function updateHeaderTimer(value) {

    const timer = document.getElementById("headerTimer");

    if (!timer) return;

    timer.textContent = value;

}

Header.showTimer = showHeaderTimer;
Header.updateTimer = updateHeaderTimer;
Header.hideTimer = () => showHeaderTimer(false);

/* ========================================
   🔗 ACTIVE LINK (FIXED)
======================================== */

function highlightActiveLink() {
  const links = document.querySelectorAll("#dropdownMenu a");

  const current = window.location.pathname
    .split("/")
    .pop()
    .split("?")[0];

  links.forEach(link => {
    const href = link.getAttribute("href");
    if (!href) return;

    const clean = href.split("?")[0].split("/").pop();

    if (clean === current) {
      link.classList.add("active-link");
    }
  });
}

// ========================================
// ☰ MENU
// ========================================

let menuInitialized = false;
let outsideClickBound = false;

function setupMenu() {

    if (menuInitialized) return;

    const toggle =
        document.getElementById("menuToggle");

    const dropdown =
        document.getElementById("dropdownMenu");

    // Header not ready yet
    if (!toggle || !dropdown) {

        console.warn(
            "⚠️ Header menu elements not found"
        );

        return;
    }

    // Only mark initialized AFTER elements exist
    menuInitialized = true;

    toggle.addEventListener("click", (e) => {

        e.preventDefault();
        e.stopPropagation();

        const isOpen =
            dropdown.classList.toggle("show");

        toggle.classList.toggle(
            "open",
            isOpen
        );

    });

    if (!outsideClickBound) {

        document.addEventListener("click", (e) => {

            if (
                !dropdown.contains(e.target) &&
                !toggle.contains(e.target)
            ) {

                dropdown.classList.remove("show");

                toggle.classList.remove("open");

            }

        });

        outsideClickBound = true;
    }

}

/* ========================================
   🚀 NAV HELPERS
======================================== */

function goToPage(page) {
  const school = getSchoolParam();
  const base = getBasePath();

  const url = school
    ? `${base}${page}?school=${school}`
    : `${base}${page}`;

  window.location.href = url;
}

function goToEnterTest() { goToPage("enter.html"); }
function goToLeaderboard() { goToPage("leaderboard.html"); }
function goToTesting() { goToPage("testing.html"); }
function goToAthletes() { goToPage("athletes.html"); }

/* ========================================
   🔐 LOGOUT
======================================== */

function setupLogout() {

    const logoutBtn = document.querySelector(".logout-btn");

    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", (e) => {

        e.preventDefault();

        if (typeof window.logout === "function") {
            window.logout();
        }

    });

}

window.Header = Header;
