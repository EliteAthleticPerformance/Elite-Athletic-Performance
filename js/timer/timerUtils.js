function getTotalSets() {
    return window.workoutData.filter(item => item.type === "set").length;
}


function resetWorkoutState() {

    /* ---------- SET TRACKING ---------- */

    displaySetNumber = 1;
    currentSet = 1;
    rotationCount = 0;

    /* ---------- PHASE STATE ---------- */

    currentPhase = TIMER_PHASES.DRESS;
    phaseJustChanged = false;

    /* ---------- AUDIO / WARNINGS ---------- */

    dressWarningSpoken = false;
    lastCountdownSpoken = null;

}


 function getNextSetIndex() {

    // Start searching AFTER currentSet
    for (let i = currentSet; i < workoutData.length; i++) {

        const item = workoutData[i];

        if (item?.type === "set") {
            return i + 1; // Convert to 1-based index
        }

    }

    // No more sets found
    return null;

}


/* ======================================================
   TIME HELPERS
====================================================== */

function formatTime(seconds) {

    const minutes = Math.floor(seconds / 60);

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds % 60).padStart(2, "0")
    );

}

function getSyncedNow() {
    return new Date(Date.now() + timeOffset);
}

function syncClockOffset() {

    if (DEBUG_TIMER) {
        console.trace("⏱ syncClockOffset called");
    }

    if (!window.serverTime) {
        console.warn("⚠️ No server time found");
        return;
    }

    const serverNow = new Date(window.serverTime);

    if (isNaN(serverNow.getTime())) {
        console.warn("⚠️ Invalid server time:", window.serverTime);
        return;
    }

    timeOffset = serverNow.getTime() - Date.now();

    if (DEBUG_TIMER) {
        console.log("🕒 Server time:", window.serverTime);
        console.log("⏱ Clock offset (ms):", timeOffset);
    }

}