// ========================================
// TIME HELPERS
// ========================================

function updateClock() {
    const el = document.getElementById("clock");
    if (!el) return;

    el.textContent = formatTime(timeLeft);
}


function updateTotalDisplay() {
    const el = document.getElementById("totalTime");

    if (!el) return;

    el.textContent = formatTime(totalSeconds);
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


switch (currentPhase) {

    case TIMER_PHASES.WORK: {

        setCenterMode(center, "phase-work");

        const displayRotation = rotationCount + 1;

        phaseEl.innerHTML = `
            <div>WORK</div>
            <div>Set ${displaySetNumber} of ${getTotalSets()}</div>
            <div>Rotation ${displayRotation} of ${maxRotations}</div>
        `;

        break;
    }

    case TIMER_PHASES.ROTATE:

        setCenterMode(center, "phase-rotate");

        phaseEl.innerHTML = `<div>ROTATE</div>`;
        break;

    case TIMER_PHASES.BREAK:

        setCenterMode(center, "phase-break");

        phaseEl.innerHTML = `
            <div>BREAK</div>
            <div>PREP NEXT LIFT</div>
        `;
        break;

    case TIMER_PHASES.DRESS:

        setCenterMode(center, "phase-dress");

        phaseEl.innerHTML = `<div>DRESS OUT & ATTENDANCE</div>`;
        break;

    case TIMER_PHASES.STRETCH:

        setCenterMode(center, "phase-stretch");

        phaseEl.innerHTML = `<div>DYNAMIC STRETCH</div>`;
        break;

    case TIMER_PHASES.COOLDOWN:

        setCenterMode(center, "phase-cooldown");

        phaseEl.innerHTML = `
            <div>COOL DOWN</div>
            <div>CLEAN-UP / DRESS</div>
        `;
        break;

    default:

        phaseEl.innerHTML = `<div>${currentPhase}</div>`;
        break;
}



function resetCenterClock() {

    const center = document.getElementById("centerInner");

    if (!center) return;

    resetCenterModes(center);

    center.classList.add("phase-work");

    document.getElementById("clock").textContent =
        document.getElementById("workTime").value;

    document.getElementById("phase").textContent = "WORK";
}