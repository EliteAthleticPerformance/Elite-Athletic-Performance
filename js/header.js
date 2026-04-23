🔥 ELITE V5 HEADER ENGINE (GITHUB SAFE)
======================================== */

document.addEventListener("DOMContentLoaded", loadHeader);

/* ========================================
   🧱 HEADER LOAD
======================================== */

async function loadHeader() {
  const container = document.getElementById("header-placeholder");
  if (!container) return;

  try {
    const res = await fetch("components/header.html");
    const res = await fetch(getBasePath() + "components/header.html");
    if (!res.ok) throw new Error("Header fetch failed");

    const html = await res.text();
    container.innerHTML = html;

    initHeaderUI();

  } catch (err) {
    console.error("❌ HEADER LOAD ERROR:", err);
  }
}

/* ========================================
   🎯 INIT
======================================== */

function initHeaderUI() {
  setupMenu();
  highlightActiveLink();
  injectSchoolIntoLinks();
  setPageTitle();

  document.dispatchEvent(new Event("headerLoaded"));
}

/* ========================================
   🏫 SCHOOL HANDLING (FIXED)
   🌐 BASE PATH (🔥 CRITICAL FIX)
======================================== */

function getBasePath() {
  const path = window.location.pathname;

  // Detect GitHub repo path
  if (path.includes("/Elite-Athletic-Performance/")) {
    return "/Elite-Athletic-Performance/";
  }

  // Local or root fallback
  return "/";
}

/* ========================================
   🏫 SCHOOL HANDLING
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
   🔗 LINK INJECTION (SAFE)
   🔗 LINK INJECTION (SAFE + BASE PATH)
======================================== */

function injectSchoolIntoLinks() {
  const school = getSchoolParam();
  if (!school) return;
  const base = getBasePath();

  document.querySelectorAll("#dropdownMenu a").forEach(link => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("http")) return; // skip external
    let href = link.getAttribute("href");
    if (!href || href.startsWith("http")) return;

    // remove existing params
    href = href.split("?")[0];

    const url = new URL(href, window.location.origin);
    // rebuild full path with base
    const fullPath = base + href;

    url.searchParams.set("school", school);
    const url = new URL(fullPath, window.location.origin);

    if (school) {
      url.searchParams.set("school", school);
    }

    link.setAttribute("href", url.pathname + url.search);
  });
}

/* ========================================
   🏷️ TITLE
======================================== */

function setPageTitle() {
  const el = document.getElementById("pageTitle");
  if (el) el.textContent = "Elite Athletic Performance";
}

/* ========================================
   🔗 ACTIVE LINK
======================================== */

function highlightActiveLink() {
  const links = document.querySelectorAll("#dropdownMenu a");
  const current = window.location.pathname.split("/").pop();

  links.forEach(link => {
    const href = link.getAttribute("href");
    if (!href) return;

    const clean = href.split("?")[0];
    const clean = href.split("?")[0].split("/").pop();

    if (clean === current) {
      link.style.color = "var(--primary)";
      link.style.fontWeight = "700";
    }
  });
}

/* ========================================
   ☰ MENU (SAFE)
======================================== */

let menuInitialized = false;

function setupMenu() {
  if (menuInitialized) return;
  menuInitialized = true;

  const toggle = document.getElementById("menuToggle");
  const dropdown = document.getElementById("dropdownMenu");

  if (!toggle || !dropdown) return;

  toggle.onclick = (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("show");
  };

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target) && !toggle.contains(e.target)) {
      dropdown.classList.remove("show");
    }
  });
}

/* ========================================
   🚀 NAVIGATION HELPERS
   🚀 NAVIGATION HELPERS (🔥 FIXED)
======================================== */

function goToPage(page) {
  const school = getSchoolParam();
  const base = getBasePath();

  const url = school
    ? `${base}${page}?school=${school}`
    : `${base}${page}`;

  window.location.href = school
    ? `${page}?school=${school}`
    : page;
  window.location.href = url;
}

function goToEnterTest() { goToPage("enter.html"); }
function goToLeaderboard() { goToPage("leaderboard.html"); }
function goToTesting() { goToPage("testing.html"); }
function goToAthletes() { goToPage("athletes.html"); }
