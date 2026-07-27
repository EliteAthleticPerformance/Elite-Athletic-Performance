/* ======================================================
   PHASE DISPLAY + CENTER MODES
====================================================== */


function updateClock() {
    const el = document.getElementById("clock");
    if (!el) return;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    el.textContent =
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0");
}


function updateTotalDisplay() {
    const el = document.getElementById("headerTimer"); // 🔥 NEW TARGET
    if (!el) return;

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    el.textContent =
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0");
} 


function updatePhaseDisplay() {

    const logo = document.getElementById("teamLogo");
    const center = document.getElementById("center");
    const phaseEl = document.getElementById("phase");

    if (!center || !logo || !phaseEl) return;

    // RESET
    center.classList.remove(
    "workMode",
    "rotateMode",
    "breakMode",
    "dressMode",
    "stretchMode",
    "cooldownMode"
);

    logo.classList.remove(
        "logoDefault",
        "logoWork",
        "logoRotate",
        "logoBreak"
    );

    /* ===================== PHASES ===================== */

    if (currentPhase === "work") {

    center.classList.add("workMode");
    logo.classList.add("logoWork");

    const displayRotation = rotationCount + 1;

    phaseEl.innerHTML = `
        <div>WORK</div>
        <div>Set ${displaySetNumber} of ${getTotalSets()}</div>
        <div>Rotation ${displayRotation} of ${maxRotations}</div>
    `;

    return;
}

    if (currentPhase === "rotate") {
        center.classList.add("rotateMode");
        logo.classList.add("logoRotate");

        phaseEl.innerHTML = `<div>ROTATE</div>`;
        return;
    }

    if (currentPhase === "break") {
        center.classList.add("breakMode");
        logo.classList.add("logoBreak");

        phaseEl.innerHTML = `
            <div>BREAK</div>
            <div>PREP NEXT LIFT</div>
        `;
        return;
    }

    if (currentPhase === "dress") {
        center.classList.add("dressMode");
        logo.classList.add("logoDefault");

        phaseEl.innerHTML = `<div>DRESS OUT & ATTENDANCE</div>`;
        return;
    }

    if (currentPhase === "stretch") {
        center.classList.add("stretchMode");
        logo.classList.add("logoDefault");

        phaseEl.innerHTML = `<div>DYNAMIC STRETCH</div>`;
        return;
    }

    if (currentPhase === "cooldown") {

    center.classList.add("cooldownMode");
    logo.classList.add("logoDefault");

    phaseEl.innerHTML = `
        <div>COOL DOWN</div>
        <div>CLEAN-UP / DRESS</div>
    `;

    return;

}

    phaseEl.innerHTML = `<div>${currentPhase}</div>`;
}


function resetCenterClock() {

    const center = document.getElementById("center");

    center.classList.remove(
    "workMode",
    "rotateMode",
    "breakMode",
    "dressMode",
    "stretchMode",
    "cooldownMode"
);

    center.classList.add("workMode");

    document.getElementById("clock").innerText =
        document.getElementById("workTime").value;

    document.getElementById("phase").innerText = "WORK";
}