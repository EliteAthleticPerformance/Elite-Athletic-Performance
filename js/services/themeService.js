// ========================================
// THEME SERVICE
// ========================================

window.ThemeService = window.ThemeService || {};
const ThemeService = window.ThemeService;


// ========================================
// RESOLVE BRANDING ASSET PATH
// ========================================

function resolveBrandingAsset(path) {

    if (!path) {
        return "";
    }

    // Branding paths in schoolConfig.js
    // are defined relative to the project root.
    const cleanPath =
        String(path)
            .replace(/^\.\/+/, "");

    return "/" + cleanPath;
}

// ========================================
// APPLY COMPLETE THEME
// ========================================

async function apply(config) {

    applyTheme(config);

    applyBaseTheme(config);

    await waitForHeader();

    applyHeaderBranding(config);

}


// ========================================
// APPLY CSS VARIABLES
// ========================================

function applyTheme(config) {

    const theme = config.theme;

    if (!theme) return;

    const root = document.documentElement;

    root.style.setProperty("--primary", theme.primary);
    root.style.setProperty("--primaryLight", theme.primaryLight);
    root.style.setProperty("--primaryDark", theme.primaryDark);
    root.style.setProperty("--secondary", theme.secondary);
    root.style.setProperty("--secondaryLight", theme.secondaryLight);

    sessionStorage.setItem(
        "theme-" + SchoolService.getSchoolKey(),
        JSON.stringify(config)
    );

    console.log("🎨 Theme Applied:", theme);

}


// ========================================
// APPLY BASE BRANDING
// ========================================

function applyBaseTheme(config) {

    const branding = config.branding;

    const logo =
    resolveBrandingAsset(branding.logo) +
    "?v=" + Date.now();

    let favicon =
        document.getElementById("dynamicFavicon");

    if (!favicon) {

        favicon = document.createElement("link");

        favicon.id = "dynamicFavicon";
        favicon.rel = "icon";

        document.head.appendChild(favicon);

    }

    favicon.href = logo;

    sessionStorage.setItem(
        "schoolName",
        branding.displayName
    );

    sessionStorage.setItem(
        "schoolLogo",
        branding.logo
    );

}


// ========================================
// WAIT FOR HEADER
// ========================================

function waitForHeader() {

    const MAX_ATTEMPTS = 50;
    const POLL_INTERVAL = 50;

    return new Promise(resolve => {

        let attempts = 0;

        const check = () => {

            if (document.getElementById("schoolLogo")) {
                resolve();
                return;
            }

            if (attempts++ >= MAX_ATTEMPTS) {
                resolve();
                return;
            }

            setTimeout(check, POLL_INTERVAL);

        };

        check();

    });

}


// ========================================
// APPLY HEADER BRANDING
// ========================================

function applyHeaderBranding(config) {

    const branding = config.branding;

    const logo =
    resolveBrandingAsset(branding.logo) +
    "?v=" + Date.now();

    const headerLogo =
        document.getElementById("schoolLogo");

    const timerLogo =
        document.getElementById("teamLogo");

    const schoolName =
        document.getElementById("schoolName");

    if (headerLogo) {

        headerLogo.src = logo;

        headerLogo.onload = () =>
            headerLogo.classList.add("loaded");

    }

    if (timerLogo) {

        timerLogo.src = logo;

        timerLogo.onload = () =>
            timerLogo.classList.add("loaded");

    }

    if (schoolName) {

        schoolName.textContent =
            branding.displayName;

    }

}


// ========================================
// PHASE GLOW
// ========================================

function updatePhaseGlow() {

    const el =
        document.getElementById("schoolName");

    if (!el) return;

    const theme =
        window.APP_CONFIG?.theme;

    if (!theme) return;

    switch (window.TimerState.currentPhase) {

        case TIMER_PHASES.DRESS:

            el.style.textShadow = `
                0 0 4px #aaa,
                0 0 8px #666
            `;
            break;

        case TIMER_PHASES.STRETCH:

            el.style.textShadow = `
                0 0 6px #4fc3f7,
                0 0 14px #4fc3f7
            `;
            break;

        case TIMER_PHASES.WORK:

            el.style.textShadow = `
                0 0 8px ${theme.primary},
                0 0 18px ${theme.primaryLight},
                0 0 28px ${theme.primary}
            `;
            break;

        case TIMER_PHASES.ROTATE:

            el.style.textShadow = `
                0 0 6px orange,
                0 0 14px gold
            `;
            break;

        case TIMER_PHASES.BREAK:

            el.style.textShadow = `
                0 0 6px red,
                0 0 16px crimson
            `;
            break;

        case TIMER_PHASES.COOLDOWN:

            el.style.textShadow = `
                0 0 4px #888,
                0 0 10px #555
            `;
            break;

        default:

            el.style.textShadow = "";

    }

}


// ========================================
// PUBLIC API
// ========================================

ThemeService.apply = apply;
ThemeService.applyTheme = applyTheme;
ThemeService.applyBaseTheme = applyBaseTheme;
ThemeService.waitForHeader = waitForHeader;
ThemeService.applyHeaderBranding = applyHeaderBranding;
ThemeService.updatePhaseGlow = updatePhaseGlow;