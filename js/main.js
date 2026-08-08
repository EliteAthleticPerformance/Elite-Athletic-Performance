/*
========================================================
MAIN.JS

Application bootstrap.

Responsibilities
----------------
- Load shared header
- Initialize navigation
- Wait for APP_READY
- Initialize workout
- Initialize timeline
- Start scheduler
- Register global UI events

Business logic belongs in:
- TimerEngine
- WorkoutService
- TimelineService
- ScheduleService
- CoachService
========================================================
*/


// ========================================
// FULLSCREEN
// ========================================

function goFullscreen() {

    document.documentElement.requestFullscreen();

}





// ========================================
// HEADER
// ========================================

async function loadHeader() {

    const res = await fetch("components/header.html");

    const html = await res.text();

    const container =
        document.getElementById("headerContainer");

    if (!container) return;

    container.innerHTML = html;

    const timer =
        document.getElementById("headerTimer");

    const menu =
        document.getElementById("headerMenu");

    if (window.location.pathname.includes("timer")) {

        if (timer) timer.style.display = "block";

        if (menu) menu.style.display = "flex";

        const logout =
            document.querySelector(".logout-btn");

        if (logout) {
            logout.style.display = "none";
        }

    }

    document
        .getElementById("schoolHeader")
        ?.classList.add("loaded");

}


function registerTimerEvents() {

    document.getElementById("startBtn")
        ?.addEventListener(
            "click",
            TimerEngine.start
        );

    const nav =
        document.getElementById("navDropdown");

    if (nav) {

        nav.addEventListener("change", e => {

            const value = e.target.value;

            if (!value) return;

            const school =
                new URLSearchParams(location.search)
                    .get("school") ||
                sessionStorage.getItem("school") ||
                "harrisonville";

            location.href =
                `${value}?school=${school}`;

        });

    }

}


// ========================================
// QUADRANT COLORS
// ========================================

function applyQuadrantColors() {

    const theme = window.APP_CONFIG?.theme;

    if (!theme) return;

    const q3 =
        document.getElementById("q3");

    if (!q3) return;

    q3.style.backgroundColor = theme.primary;

    q3.style.color = "#fff";

}


// ========================================
// GLOBAL EVENTS
// ========================================

window.addEventListener("unhandledrejection", e => {

    });


window.addEventListener("keydown", e => {

    const tag =
        document.activeElement?.tagName;

    if (
        tag === "INPUT" ||
        tag === "TEXTAREA"
    ) {
        return;
    }

    if (e.repeat) return;

    if (e.code === "Space") {

        e.preventDefault();

        TimerEngine.start();

    }

});


document.addEventListener("click", e => {

    const toggle =
        document.getElementById("menuToggle");

    const menu =
        document.getElementById("dropdownMenu");

    if (!toggle || !menu) return;

    if (toggle.contains(e.target)) {

        menu.classList.toggle("show");

    } else {

        menu.classList.remove("show");

    }

});


// ========================================
// TIMER INITIALIZATION
// ========================================

async function initializeTimer() {

    if (!window.location.pathname.includes("timer")) {
        return;
    }

    TimerUI.cacheElements();

    document
        .getElementById("schoolLogo")
        ?.classList.add("logoDefault");

    TimelineService.cacheElements();

    await WorkoutService.load();

    TimelineService.build();

    TimerUI.refresh();

    ScheduleService.startAutoScheduler();

    setInterval(
    ScheduleService.autoDetectActiveClass,
    5000
);

}


// ========================================
// APPLICATION STARTUP
// ========================================

window.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            await loadHeader();

            NavigationService.init();

            registerTimerEvents();

            const config =
                await window.APP_READY;

            
            document.documentElement
                .style.setProperty(
                    "--secondary",
                    config.theme.secondary
                );

            applyQuadrantColors();

            let polling = false;

            setInterval(async () => {

            if (polling) return;

            polling = true;

            try {

            CoachService.applyControl();

            } catch (err) {

            }

            polling = false;

            }, 3000);

            await initializeTimer();

            CoachService.applyControl();

            } catch (err) {

            }

    }
);