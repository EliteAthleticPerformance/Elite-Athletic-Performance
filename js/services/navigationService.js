// ========================================
// NAVIGATION SERVICE
// ========================================

window.NavigationService = window.NavigationService || {};
const NavigationService = window.NavigationService;


// ========================================
// INITIALIZATION
// ========================================

function init() {

    console.log("✅ NavigationService Initialized");

    initializeDropdown();

    initializeLogout();

}


// ========================================
// DROPDOWN
// ========================================

function initializeDropdown() {

    const nav =
        document.getElementById("navDropdown");

    if (!nav) return;

    nav.addEventListener("change", event => {

        const page = event.target.value;

        if (!page) return;

        navigate(page);

    });

}


// ========================================
// LOGOUT BUTTON
// ========================================

function initializeLogout() {

    const logoutBtn =
        document.querySelector(".logout-btn");

    logoutBtn?.addEventListener(
        "click",
        logout
    );

}


// ========================================
// NAVIGATION
// ========================================

function navigate(page) {

    const school =
        SchoolService.getSchoolKey();

    const separator =
        page.includes("?") ? "&" : "?";

    window.location.href =
        `${page}${separator}school=${school}`;

}


// ========================================
// LOGOUT
// ========================================

function logout() {

    sessionStorage.clear();

    localStorage.clear();

    const base =
        window.location.pathname.includes(
            "/Elite-Athletic-Performance/"
        )
            ? "/Elite-Athletic-Performance/"
            : "/";

    window.location.href =
        `${base}index.html`;

}


// ========================================
// PUBLIC API
// ========================================

NavigationService.init = init;
NavigationService.navigate = navigate;
NavigationService.logout = logout;