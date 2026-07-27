// ========================================
// TIME HELPERS
// ========================================

function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0")
    );
}

function updateClock() {
    const el = document.getElementById("clock");
    if (!el) return;

    el.textContent = formatTime(timeLeft);
}


function updateTotalDisplay() {
    const el = document.getElementById("headerTimer"); // 🔥 NEW TARGET
    if (!el) return;

    el.textContent = formatTime(totalSeconds);
} 


// ========================================
// CENTER HELPERS
// ========================================

function resetCenterModes(center) {
    center.classList.remove(
        "workMode",
        "rotateMode",
        "breakMode",
        "dressMode",
        "stretchMode",
        "cooldownMode"
    );
}


function setCenterMode(center, logo, centerMode, logoMode) {

    resetCenterModes(center);

    logo.classList.remove(
        "logoDefault",
        "logoWork",
        "logoRotate",
        "logoBreak"
    );

    center.classList.add(centerMode);
    logo.classList.add(logoMode);
}


function updatePhaseDisplay() {

    const logo = document.getElementById("teamLogo");
    const center = document.getElementById("center");
    const phaseEl = document.getElementById("phase");

    if (!center || !logo || !phaseEl) return;

        /* ===================== PHASES ===================== */

    switch (currentPhase) {

    case "work": {

        setCenterMode(center, logo, "workMode", "logoWork");

        const displayRotation = rotationCount + 1;

        phaseEl.innerHTML = `
            <div>WORK</div>
            <div>Set ${displaySetNumber} of ${getTotalSets()}</div>
            <div>Rotation ${displayRotation} of ${maxRotations}</div>
        `;

        break;
    }

    case "rotate":

        setCenterMode(center, logo, "rotateMode", "logoRotate");

        phaseEl.innerHTML = `<div>ROTATE</div>`;
        break;

    case "break":

        setCenterMode(center, logo, "breakMode", "logoBreak");

        phaseEl.innerHTML = `
            <div>BREAK</div>
            <div>PREP NEXT LIFT</div>
        `;
        break;

    case "dress":

        setCenterMode(center, logo, "dressMode", "logoDefault");

        phaseEl.innerHTML = `<div>DRESS OUT & ATTENDANCE</div>`;
        break;

    case "stretch":

        setCenterMode(center, logo, "stretchMode", "logoDefault");

        phaseEl.innerHTML = `<div>DYNAMIC STRETCH</div>`;
        break;

    case "cooldown":

        setCenterMode(center, logo, "cooldownMode", "logoDefault");

        phaseEl.innerHTML = `
            <div>COOL DOWN</div>
            <div>CLEAN-UP / DRESS</div>
        `;
        break;

    default:

        phaseEl.innerHTML = `<div>${currentPhase}</div>`;
        break;
}

}


function resetCenterClock() {

    const center = document.getElementById("center");

    resetCenterModes(center);

    center.classList.add("workMode");

    document.getElementById("clock").innerText =
        document.getElementById("workTime").value;

    document.getElementById("phase").innerText = "WORK";
}