(() => {


// ========================================
// TIMER UI SERVICE
// ========================================

window.TimerUI = window.TimerUI || {};
const TimerUI = window.TimerUI;

const S = window.TimerState;


// ========================================
// CACHED UI ELEMENTS
// ========================================

const UI = {};


// ========================================
// CACHE UI ELEMENTS
// ========================================

function cacheElements() {

    UI.clock =
        document.getElementById("clock");

    UI.phase =
        document.getElementById("phase");

    UI.center =
        document.getElementById("centerInner");

    UI.totalTime =
        document.getElementById("totalTime");

    UI.workTime =
        document.getElementById("workTime");

    UI.startButton =
        document.getElementById("startBtn");

    // Quadrants
    UI.q1 =
        document.getElementById("q1");

    UI.q2 =
        document.getElementById("q2");

    UI.q3 =
        document.getElementById("q3");

    UI.q4 =
        document.getElementById("q4");

}


// ========================================
// TIME HELPERS
// ========================================

function updateClock() {

    if (!UI.clock) return;

    UI.clock.textContent =
        TimerUtils.formatTime(S.timeLeft);

}


function updateTotalDisplay() {

    if (!UI.totalTime) return;

    UI.totalTime.textContent =
        TimerUtils.formatTime(S.totalSeconds);

}


// ========================================
// CENTER HELPERS
// ========================================

function resetCenterModes(center) {

    center.classList.remove(
        "phase-dress",
        "phase-stretch",
        "phase-work",
        "phase-rotate",
        "phase-break",
        "phase-cooldown"
    );

}


function setCenterMode(center, phaseClass) {

    resetCenterModes(center);

    center.classList.add(phaseClass);

}


// ========================================
// PHASE DISPLAY
// ========================================

function updatePhaseDisplay() {

    if (!UI.center || !UI.phase) return;

    const center = UI.center;
    const phaseEl = UI.phase;

    switch (S.currentPhase) {

        case TIMER_PHASES.WORK: {

            
            // rotationCount is zero-based.
            // Display rotations as 1-4.
            const displayRotation = Math.min(
    S.rotationCount + (
        S.currentPhase === TIMER_PHASES.WORK ? 0 : 1
    ),
    WorkoutService.config.maxRotations
);

            phaseEl.innerHTML = `
                <div>WORK</div>
                <div>Set ${S.displaySetNumber} of ${WorkoutService.getTotalSets()}</div>
                <div>Rotation ${displayRotation} of ${WorkoutService.config.maxRotations}</div>
            `;

            break;
        }

        case TIMER_PHASES.ROTATE:

            phaseEl.innerHTML = `
                <div>ROTATE</div>
            `;

            break;

        case TIMER_PHASES.BREAK:

            phaseEl.innerHTML = `
                <div>BREAK</div>
                <div>PREP NEXT LIFT</div>
            `;

            break;

        case TIMER_PHASES.DRESS:

            phaseEl.innerHTML = `
                <div>DRESS OUT & ATTENDANCE</div>
            `;

            break;

        case TIMER_PHASES.STRETCH:

            phaseEl.innerHTML = `
                <div>DYNAMIC STRETCH</div>
            `;

            break;

        case TIMER_PHASES.COOLDOWN:

            phaseEl.innerHTML = `
                <div>COOL DOWN</div>
                <div>CLEAN-UP / DRESS</div>
            `;

            break;

        default:

            resetCenterModes(center);

            phaseEl.innerHTML = `
                <div>${S.currentPhase}</div>
            `;

            break;

    }

}


// ========================================
// RESET DISPLAY
// ========================================

function resetCenterClock() {

    if (!UI.center) return;

        setCenterMode(UI.center, "phase-work");

    if (UI.clock && UI.workTime) {

        UI.clock.textContent =
            UI.workTime.value;

    }

    if (UI.phase) {

        UI.phase.textContent = "WORK";

    }

}


// ========================================
// START BUTTON
// ========================================

function setStartButton(text) {

    if (!UI.startButton) return;

    UI.startButton.textContent = text;

}


// ========================================
// CENTER VISUALS
// ========================================

function updateCenterVisuals() {

    if (!UI.center) return;

    setCenterMode(
        UI.center,
        `phase-${S.currentPhase}`
    );

}


/* ======================================================
   DETERMINISTIC QUADRANT ROTATION
====================================================== */

function applyRotationState(rotation) {

    const {
    q1,
    q2,
    q3,
    q4
} = UI;

if (!q1 || !q2 || !q3 || !q4) return;

    const base = {

        q1: {
            bg: "#000",
            color: "#fff"
        },

        q2: {
            bg: "#f4f4f4",
            color: "#000"
        },

        q3: {
            bg: "var(--primary)",
            color: "#fff"
        },

        q4: {
            bg: "#555",
            color: "#fff"
        }
    };

    const layouts = [

        // ROTATION 0
        {
            q1: base.q1,
            q2: base.q2,
            q3: base.q3,
            q4: base.q4
        },

        // ROTATION 1
        {
            q1: base.q3,
            q2: base.q1,
            q3: base.q4,
            q4: base.q2
        },

        // ROTATION 2
        {
            q1: base.q4,
            q2: base.q3,
            q3: base.q2,
            q4: base.q1
        },

        // ROTATION 3
        {
            q1: base.q2,
            q2: base.q4,
            q3: base.q1,
            q4: base.q3
        }
    ];

    const layout = layouts[rotation % 4];

    console.group(`🔄 Rotation ${rotation}`);

console.log("Set:", S.displaySetNumber);
console.log("Current Phase:", S.currentPhase);
console.log("Rotation Count:", S.rotationCount);

console.log("Expected Layout:");

console.groupEnd();


q1.style.background = layout.q1.bg;
q1.style.color = layout.q1.color;

q2.style.background = layout.q2.bg;
q2.style.color = layout.q2.color;

q3.style.background = layout.q3.bg;
q3.style.color = layout.q3.color;

q4.style.background = layout.q4.bg;
q4.style.color = layout.q4.color;

console.log("Applied rotation", rotation);
console.log("Actual q1 background:", q1.style.background);

}


// ========================================
// URGENCY EFFECTS
// ========================================

function updateUrgencyEffects() {

    if (!UI.center) return;

    UI.center.classList.remove("urgent");

    if (
        S.currentPhase === TIMER_PHASES.WORK &&
        S.timeLeft <= 5
    ) {
        UI.center.classList.add("urgent");
    }

}


// ========================================
// CLOCK PULSE
// ========================================

function updateClockPulse() {

    if (!UI.center) return;

    UI.center.classList.remove("pulse");

    if (
        S.currentPhase === TIMER_PHASES.WORK &&
        S.timeLeft <= 5
    ) {
        UI.center.classList.add("pulse");
    }

}


// ========================================
// REFRESH UI
// ========================================

function refresh() {

    updateClock();

    updateTotalDisplay();

    updatePhaseDisplay();

    updateCenterVisuals();

    updateUrgencyEffects();

    updateClockPulse();

    if (
        typeof updatePhaseGlow === "function"
    ) {

        updatePhaseGlow(S.globalTheme);

    }

}


// ========================================
// PUBLIC API
// ========================================

TimerUI.cacheElements = cacheElements;

TimerUI.setStartButton = setStartButton;

TimerUI.applyRotationState = applyRotationState;

TimerUI.updateClock = updateClock;
TimerUI.updateTotalDisplay = updateTotalDisplay;
TimerUI.updatePhaseDisplay = updatePhaseDisplay;
TimerUI.updateCenterVisuals = updateCenterVisuals;
TimerUI.updateUrgencyEffects = updateUrgencyEffects;
TimerUI.updateClockPulse = updateClockPulse;
TimerUI.resetCenterClock = resetCenterClock;
TimerUI.refresh = refresh;


// ========================================
// LEGACY COMPATIBILITY
// Remove after all services call TimerUI.*
// ========================================

window.updateClock = updateClock;
window.updateTotalDisplay = updateTotalDisplay;
window.updatePhaseDisplay = updatePhaseDisplay;
window.refreshTimerUI = refresh;


})();