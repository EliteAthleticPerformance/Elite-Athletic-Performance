/*
========================================================
MAIN.JS

Application bootstrap for the Training Timer.

Responsibilities:
- Initialize application
- Load header
- Wire services together
- Register page event listeners

Timer logic lives in:
- timerEngine.js
- timerUI.js
- workoutService.js
- timelineService.js
- scheduleService.js
- coachService.js
========================================================
*/


function trackEvent(eventName, params = {}) {
  if (typeof gtag !== "undefined") {
    gtag("event", eventName, params);
  }
}

   
/* ===================== STATE ===================== */
console.log("STEP 2");
let timer = null;
let timeLeft = 0;
let totalSeconds = 0;
let originalTotalSeconds = 0;
let isRunning = false;
let currentPhase = "idle";
let audioCtx = null;
let lastCountdownSpoken = null;
let phaseJustChanged = false;
let nextTickTime = null;
let workoutData = [];
let timeOffset = 0;
let lastControlSignature = null;



/* ✅ safer global access (no desync risk) */
Object.defineProperty(window, "workoutData", {
    get: () => workoutData
});

/* ===================== SETS ===================== */

let currentSet = 1;
let maxSets = 1;
let rotationCount = 0;
const maxRotations = 4;



/* ===================== PERIOD AUTO START ===================== */

let autoStartEnabled = true;
let monTimes = [];
let tueTimes = [];
let wedTimes = [];
let thurTimes = [];
let friTimes = [];
let autoStartTimer = null;
let lastAutoStartMinute = null;
let todayOnlyMode = false;
let forceDateString = null;
let sheetWorkDuration = null;
let sheetRotateDuration = null;
let manualWorkoutOverride = null;


/* ===================== DURATIONS ===================== */


let classBlockLength = 45 * 60;
let dressOutDuration = 0;
let dynamicStretchDuration = 0;
let breakDuration = 0;
let cooldownDuration = 0;

/* ===================== FLAGS ===================== */

let dressWarningSpoken = false;
let onBreak = false;
let selectedVoice = null;
let displaySetNumber = 1;

function goFullscreen() {
    document.documentElement.requestFullscreen();
}



let timelineData = [];



async function loadHeader() {
    const res = await fetch("components/header.html");
    const html = await res.text();

    const container = document.getElementById("headerContainer");
    if (!container) return;

    container.innerHTML = html;

    // ✅ ONLY modify AFTER it's inserted
    const timer = document.getElementById("headerTimer");
    const menu = document.getElementById("headerMenu");

    // 🔥 Only switch to timer mode IF we're on timer page
    if (window.location.pathname.includes("timer")) {
        if (timer) timer.style.display = "block";
        // ✅ KEEP MENU VISIBLE
if (menu) menu.style.display = "flex";

// 🔥 OPTIONAL: hide only logout button on timer page
const logoutBtn = document.querySelector(".logout-btn");
if (logoutBtn) logoutBtn.style.display = "none";
    }

    // 🔥 Ensure header styling applies correctly
    const header = document.getElementById("schoolHeader");
    if (header) {
        header.classList.add("loaded");
    }
}


function applyQuadrantColors() {
    const config = window.SCHOOL_CONFIG;
    if (!config || !config.theme) return;

    const primary = config.theme.primary;
    const secondary = config.theme.secondary;

       const q3 = document.getElementById("q3");

    
    if (q3) {
        q3.style.backgroundColor = primary;
        q3.style.color = "#fff";
    }
}


function rotateQuadrantColors() {
    const q1 = document.getElementById("q1");
    const q2 = document.getElementById("q2");
    const q3 = document.getElementById("q3");
    const q4 = document.getElementById("q4");

    if (!q1 || !q2 || !q3 || !q4) return;

    const getColor = (el) => {
        if (el.classList.contains("blackQuad")) return "blackQuad";
        if (el.classList.contains("whiteQuad")) return "whiteQuad";
        if (el.classList.contains("blueQuad")) return "blueQuad";
        if (el.classList.contains("greyQuad")) return "greyQuad";
    };

    const c1 = getColor(q1);
    const c2 = getColor(q2);
    const c3 = getColor(q3);
    const c4 = getColor(q4);

    // remove all
    [q1, q2, q3, q4].forEach(q =>
        q.classList.remove("blackQuad","whiteQuad","blueQuad","greyQuad")
    );

    // 🔥 YOUR ROTATION RULE
    q2.classList.add(c1); // q1 → q2
    q4.classList.add(c2); // q2 → q4
    q3.classList.add(c4); // q4 → q3
    q1.classList.add(c3); // q3 → q1
}


  
/* ======================================================
   WORK DURATION (seconds)
====================================================== */

  function getWorkDuration() {

    const currentItem = workoutData[currentSet - 1] || {};

    // 1️⃣ per-set override
    if (currentItem?.workSec) {
        console.log("⏱ Work time (set override):", {
            set: currentSet,
            value: currentItem.workSec
        });
        return currentItem.workSec;
    }

    // 2️⃣ sheet global override
    if (sheetWorkDuration) {
        console.log("⏱ Work time (sheet global):", sheetWorkDuration);
        return sheetWorkDuration;
    }

    // 3️⃣ UI fallback
    const val = parseInt(document.getElementById("workTime").value, 10);
    const safeVal = isNaN(val) || val <= 0 ? 1 : val;

    console.log("⏱ Work time (UI fallback):", safeVal);

    return safeVal;
}

  


/* ======================================================
   REST DURATION (seconds)
====================================================== */

function getRestDuration() {

    // 1️⃣ per-set override
    const currentItem = workoutData[currentSet - 1] || {}; // ✅ safer
    if (currentItem.rotateSec) {
        console.log("⏱ Using per-set rotate:", currentItem.rotateSec);
        return currentItem.rotateSec;
    }

    // 2️⃣ sheet override
    if (sheetRotateDuration) {
        console.log("⏱ Using sheet rotate:", sheetRotateDuration);
        return sheetRotateDuration;
    }

    // 3️⃣ UI fallback
    const val = parseInt(document.getElementById("restTime").value, 10);
    const safe = isNaN(val) || val <= 0 ? 1 : val;

    console.log("⏱ Using UI rotate:", safe);
    return safe;
}


/* ======================================================
   LOAD SET INTO QUADRANTS
====================================================== */

function loadSetData(setNumber) {

    const workout = workoutData[setNumber - 1];

    if (!workout || workout.type !== "set") return;

    /* ---------- CORE ---------- */
    const q1Texts = document.querySelectorAll("#q1 .quad-text");
    if (q1Texts.length >= 3) {
        q1Texts[0].innerText = workout.core;
        q1Texts[1].innerText = "Reps: " + workout.reps;
        q1Texts[2].innerText =
            "Percentage: " + (workout.percent ? workout.percent + "%" : "");
    }

    /* ---------- AUX ---------- */
    const q2Texts = document.querySelectorAll("#q2 .quad-text");
    if (q2Texts.length >= 2) {
        q2Texts[0].innerText = workout.aux;
        q2Texts[1].innerText = "Reps: " + workout.auxReps;
    }

    /* ---------- MOVEMENT ---------- */
    const q4Texts = document.querySelectorAll("#q4 .quad-text");
    if (q4Texts.length >= 2) {
        q4Texts[0].innerText = workout.move;
        q4Texts[1].innerText = "Reps/Time: " + workout.moveReps;
    }
}


/* ======================================================
   INITIAL PAGE LOAD
====================================================== */

window.addEventListener("unhandledrejection", e => {
    console.warn("Unhandled promise:", e.reason);
});




/* ======================================================
   SPACEBAR CONTROL
====================================================== */

window.addEventListener("keydown", (e) => {

    const tag = document.activeElement?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;

    if (e.repeat) return;

    if (e.code === "Space") {
        e.preventDefault();
        startTimer();
    }
});

document.addEventListener("click", function (e) {
    const toggle = document.getElementById("menuToggle");
    const menu = document.getElementById("dropdownMenu");

    if (!toggle || !menu) return;

    if (toggle.contains(e.target)) {
        menu.classList.toggle("show");
    } else {
        menu.classList.remove("show");
    }
});


window.addEventListener("DOMContentLoaded", async () => {

    await loadHeader(); // 🔥 MUST BE FIRST
  
    NavigationService.init();

    try {

        if (!window.APP_READY) {
            console.error("❌ APP_READY missing — themeLoader not loaded");
            return;
        }

        const config = await window.APP_READY;
        

        if (!config) {
            console.error("❌ Config failed to load");
            return;
        }

        console.log("✅ SCHOOL CONFIG READY:", config);

      document.documentElement.style.setProperty('--secondary', config.theme.secondary);

        applyQuadrantColors();

        let isPolling = false;

        setInterval(async () => {
            if (isPolling) return;

            isPolling = true;

            try {
    applyCoachControl();
} catch (e) {
                console.error("Polling error:", e);
            }

            isPolling = false;
        }, 3000);

        await loadWorkout();

        buildSegmentTimeline();

        updateTotalDisplay();

        if (typeof loadWorkout !== "function") {
            console.error("❌ loadWorkout is NOT defined");
            return;
        }

        applyCoachControl();

        startAutoScheduler();

        setTimeout(autoDetectActiveClass, 2000);

    } catch (err) {
        console.error("🔥 CRITICAL INIT ERROR:", err);
    }

});
