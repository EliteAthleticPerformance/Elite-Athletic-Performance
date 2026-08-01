const S = window.TimerState;


// ========================================
// DRESS PHASE
// ========================================

function handleDressPhase() {

    transitionToPhase(
    TIMER_PHASES.STRETCH,
    getPhaseDuration(TIMER_PHASES.STRETCH)
);

    S.dressWarningSpoken = false;

    speakStretch();

}


// ========================================
// STRETCH PHASE
// ========================================

function handleStretchPhase() {

    beginWorkout();

    transitionToPhase(
    TIMER_PHASES.WORK,
    getPhaseDuration(TIMER_PHASES.WORK)
);

    speakLift();

}


function beginWorkout() {

    S.rotationCount = 0;
    S.currentSet = 1;
    S.displaySetNumber = 1;

    loadSetData(S.currentSet);

}


// ========================================
// WORK PHASE
// ========================================

function handleWorkPhase() {

    rotateQuadrantColors();

    S.rotationCount++;

    // SHOW PREVIEW ON FINAL ROTATION
    if (S.rotationCount === maxRotations) {

        const nextSet = getNextSetIndex();

        if (nextSet) {
            previewSetData(nextSet);
        }
    }

    transitionToPhase(
    TIMER_PHASES.ROTATE,
    getPhaseDuration(TIMER_PHASES.ROTATE)
);

    speakRotate();

}


// ========================================
// ROTATE PHASE
// ========================================

function handleRotatePhase() {

    const finishedRotations = S.rotationCount >= maxRotations;

    if (finishedRotations) {

        S.rotationCount = 0;

        const nextItem = S.workoutData[S.currentSet] ?? null;

        // 🔴 no more items
        if (!nextItem) {
            startCooldown();
            return;
        }

        // 🟡 break row
        if (nextItem.type === "break") {

            S.currentSet++;

        const breakDuration = Math.max(
        1,
        nextItem.breakSec || getPhaseDuration(TIMER_PHASES.BREAK)
);

    transitionToPhase(
        TIMER_PHASES.BREAK,
        breakDuration
);

            speakBreakPrep();

            previewNextSet();

            return;
        }

        // ✅ next is real set
        S.currentSet++;
        S.displaySetNumber++;
        loadSetData(S.currentSet);
    }

    transitionToPhase(
    TIMER_PHASES.WORK,
    getPhaseDuration(TIMER_PHASES.WORK)
);

    speakLift();

}


// ========================================
// BREAK PHASE
// ========================================

function handleBreakPhase() {

    const nextItem = S.workoutData[S.currentSet] ?? null;

    if (!nextItem) {
        startCooldown();
        return;
    }

    // ✅ ONLY advance when next is a set
    if (nextItem.type === "set") {
        S.currentSet++;
        S.displaySetNumber++;
        loadSetData(S.currentSet);
    }

    transitionToPhase(
    TIMER_PHASES.WORK,
    getPhaseDuration(TIMER_PHASES.WORK)
);

speakLift();

}


// ========================================
// PHASE HANDLERS
// ========================================

const PhaseHandlers = {

    [TIMER_PHASES.DRESS]: handleDressPhase,

    [TIMER_PHASES.STRETCH]: handleStretchPhase,

    [TIMER_PHASES.WORK]: handleWorkPhase,

    [TIMER_PHASES.ROTATE]: handleRotatePhase,

    [TIMER_PHASES.BREAK]: handleBreakPhase,

    [TIMER_PHASES.COOLDOWN]: workoutFinishScreen

}


function handleCurrentPhase() {

    const handler = PhaseHandlers[S.currentPhase];

    if (!handler) {

        console.warn(
            "Unknown phase:",
            S.currentPhase
        );

        return;

    }

    handler();

}







window.handleDressPhase = handleDressPhase;
window.handleStretchPhase = handleStretchPhase;
window.beginWorkout = beginWorkout;
window.handleWorkPhase = handleWorkPhase;
window.handleRotatePhase = handleRotatePhase;
window.handleBreakPhase = handleBreakPhase;
window.handleCurrentPhase = handleCurrentPhase;