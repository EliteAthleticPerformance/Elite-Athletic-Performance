function applyCoachControl() {

  if (!window.classStartTime && window.controlTimestamp) {
    window.classStartTime = new Date(window.controlTimestamp).getTime();
}

  // 🔥 FORCE SYNC FOR LATE JOIN (even without new START command)
if (window.classStartTime && isRunning) {
    const now = getEffectiveNow().getTime();
    const state = computeWorkoutState(now);

    if (state) {
        currentPhase = state.phase;
        timeLeft = state.timeLeft;

        if (state.setIndex !== undefined) {
            currentSet = state.setIndex;
            displaySetNumber = state.setNumber;
            loadSetData(currentSet);
        }

        rotationCount = state.rotation || 0;

        updateClock();
        updatePhaseDisplay();
        updateTotalDisplay();
    }
}

    if (!window.controlAction) return;

    const signature = [
        window.controlAction,
        window.controlTimestamp,
        window.controlPhase,
        window.controlSet,
        window.controlRotation
    ].join("|");

    // 🚫 prevent re-running same command
    if (signature === lastControlSignature) return;

    lastControlSignature = signature;

    const now = getEffectiveNow().getTime();

    console.log("🎮 Applying control:", signature);

    switch (window.controlAction) {

       case "START":
    window.classStartTime = new Date(window.controlTimestamp).getTime();
    isRunning = true;

    // 🔥 FIXED — DEFINE nowMs FIRST
    const nowMs = getEffectiveNow().getTime();
    const state = computeWorkoutState(nowMs);

    if (!state) return;

    // 🔥 ROTATE CHECK (optional but good)
    if (
        state.phase === "rotate" &&
        state.rotation !== rotationCount
    ) {
        console.log("🔁 ROTATING QUADRANTS (COACH SYNC)");
        rotateQuadrantColors();
    }

    currentPhase = state.phase;
    timeLeft = state.timeLeft;

    rotationCount = state.rotation || 0;

    updateClock();
    updatePhaseDisplay();
    updateTotalDisplay();
break;

        case "STOP":
    stopAllTimers();
    window.classStartTime = null;
        updatePhaseDisplay();
updateClock();
updateTotalDisplay();
    break;

        case "PAUSE":
            isRunning = false;
        updatePhaseDisplay();
updateClock();
updateTotalDisplay();
            break;

        case "RESUME":
            isRunning = true;
        updatePhaseDisplay();
updateClock();
updateTotalDisplay();
            break;

        case "JUMP":

            const offset = calculateOffsetForTarget(
                window.controlPhase,
                window.controlSet,
                window.controlRotation
            );

            window.classStartTime = now - (offset * 1000);
        updatePhaseDisplay();
updateClock();
updateTotalDisplay();
            break;
    }
} 


function computeWorkoutState(nowMs) {

    if (!window.classStartTime) return null;

    let elapsed = Math.floor((nowMs - window.classStartTime) / 1000);
    let cursor = 0;

    // 1️⃣ DRESS
    if (elapsed < cursor + dressOutDuration) {
        return {
            phase: "dress",
            timeLeft: (cursor + dressOutDuration) - elapsed
        };
    }
    cursor += dressOutDuration;

    // 2️⃣ STRETCH
    if (elapsed < cursor + dynamicStretchDuration) {
        return {
            phase: "stretch",
            timeLeft: (cursor + dynamicStretchDuration) - elapsed
        };
    }
    cursor += dynamicStretchDuration;

    // 3️⃣ WORKOUT LOOP
    for (let i = 0; i < window.workoutData.length; i++) {

        const item = window.workoutData[i];

        if (item.type === "set") {

            for (let r = 0; r < maxRotations; r++) {

                const work = item.workSec || getWorkDuration();

                // WORK
                if (elapsed < cursor + work) {
                    return {
                        phase: "work",
                        setIndex: i,
                        setNumber: window.workoutData
                            .slice(0, i + 1)
                            .filter(x => x.type === "set").length,
                        rotation: r,
                        timeLeft: (cursor + work) - elapsed
                    };
                }
                cursor += work;

                // ROTATE (always exists)
                const rest = Math.max(1, item.rotateSec || getRestDuration());

                if (elapsed < cursor + rest) {
                    return {
                        phase: "rotate",
                        setIndex: i,
                        rotation: r,
                        timeLeft: (cursor + rest) - elapsed
                    };
                }
                cursor += rest;
            }
        }

        if (item.type === "break") {
            const b = item.breakSec || breakDuration;

            if (elapsed < cursor + b) {
                return {
                    phase: "break",
                    setIndex: i,
                    timeLeft: (cursor + b) - elapsed
                };
            }
            cursor += b;
        }
    }

    return { phase: "done", timeLeft: 0 };
}