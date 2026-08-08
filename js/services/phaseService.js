(() => {

// ========================================
// PHASE SERVICE
// ========================================

window.PhaseService = window.PhaseService || {};
const PhaseService = window.PhaseService;

const S = window.TimerState;

const TIMER_PHASES = window.TIMER_PHASES;


// ========================================
// PHASE TRANSITION
// ========================================

function gotoPhase(phase, duration = null) {

    console.log({
    from: S.currentPhase,
    to: phase,
    row: S.currentSet,
    display: S.displaySetNumber,
    rotation: S.rotationCount
});

    TimerEngine.transition(
        phase,
        duration ?? WorkoutService.getPhaseDuration(phase)
    );

}


function logAdvance(label, nextItem = null) {

    console.group(`➡️ ${label}`);

    console.log("currentSet:", S.currentSet);
    console.log("displaySetNumber:", S.displaySetNumber);
    console.log("rotationCount:", S.rotationCount);
    console.log("phase:", S.currentPhase);

    if (nextItem) {
        console.log("nextItem:", {
            type: nextItem.type,
            core: nextItem.core,
            breakSec: nextItem.breakSec
        });
    }

    console.groupEnd();

}


// ========================================
// DRESS PHASE
// ========================================

function handleDressPhase() {

    gotoPhase(TIMER_PHASES.STRETCH);

    S.dressWarningSpoken = false;

    AudioService.speakStretch();

}


// ========================================
// STRETCH PHASE
// ========================================

function handleStretchPhase() {

    WorkoutService.beginWorkout();

    gotoPhase(TIMER_PHASES.WORK);

    AudioService.speakLift();

}


// ========================================
// WORK PHASE
// ========================================

function handleWorkPhase() {

    // ========================================
    // ADVANCE TO THE NEXT ROTATION
    // ========================================

    const nextRotation =
    S.rotationCount + 1;

console.log("Before:", S.rotationCount);
console.log("Next:", nextRotation);

TimerUI.applyRotationState(nextRotation);

S.rotationCount = nextRotation;

console.log("After:", S.rotationCount);

    const isFinalRotation =
        S.rotationCount >=
        WorkoutService.config.maxRotations;

    // ========================================
    // PREVIEW NEXT SET
    // ========================================

    if (isFinalRotation) {

    const nextRow =
    WorkoutService.getNextSetRow();

    if (nextRow !== null) {
    PreviewService.previewSetData(nextRow);
}

    }

    // ========================================
    // ENTER ROTATE PHASE
    // ========================================

    gotoPhase(TIMER_PHASES.ROTATE);

    AudioService.speakRotate();

}

   
// ========================================
// ADVANCE TO NEXT SECTION
// ========================================

function advanceToNextSection() {


    console.log("========== ADVANCE ==========");
console.log("currentSet =", S.currentSet);
console.log("displaySetNumber =", S.displaySetNumber);


    S.rotationCount = 0;
        logAdvance("Before advance");
    const nextItem = WorkoutService.advanceToNextRow();
        logAdvance("After advance", nextItem);
    


console.log("nextItem =", nextItem);
console.log("========== ADVANCE ==========");
console.log("currentSet =", S.currentSet);
console.log("nextItem =", nextItem);
console.table(
    S.workoutData.map((item, i) => ({
        index: i,
        type: item.type,
        core: item.core
    }))
);

    // ------------------------------------
    // Workout Complete
    // ------------------------------------

    if (!nextItem) {

        TimerEngine.startCooldown();

        return true;

    }

    if (nextItem.type === "break") {

    const breakDuration = Math.max(
        1,
        nextItem.breakSec ??
        WorkoutService.getBreakDuration()
    );

    gotoPhase(
        TIMER_PHASES.BREAK,
        breakDuration
    );

    AudioService.speakBreakPrep();

    PreviewService.previewNextSet();

    return true;

}

        
    // ------------------------------------
    // Next Set
    // ------------------------------------

    if (nextItem.type === "set") {

    S.displaySetNumber++;

    WorkoutService.loadSetData(S.currentSet);

    return false;

}

console.warn(
    "Unexpected workout row:",
    nextItem
);

return true;

}


// ========================================
// ROTATE PHASE
// ========================================

function handleRotatePhase() {

    const completedAllRotations =
        S.rotationCount >=
        WorkoutService.config.maxRotations;

    if (completedAllRotations) {

        console.log("----------------");
        console.log("Entering Rotate");
        console.log("rotationCount =", S.rotationCount);
        console.log("maxRotations =", WorkoutService.config.maxRotations);

        if (advanceToNextSection()) {
            return;
        }

    }

    gotoPhase(TIMER_PHASES.WORK);

    AudioService.speakLift();

}


// ========================================
// BREAK PHASE
// ========================================

function handleBreakPhase() {

            logAdvance("Leaving break");
    // Leave the break row and move to the first workout row.
    const nextItem = WorkoutService.advanceToNextRow();
            logAdvance("Entered first workout row", nextItem);


    if (!nextItem) {
        TimerEngine.startCooldown();
        return;
    }

    if (nextItem.type !== "set") {

        console.warn(
            "Expected first workout after break, got:",
            nextItem
        );

        return;
    }

    S.displaySetNumber++;

    WorkoutService.loadSetData(S.currentSet);

    gotoPhase(TIMER_PHASES.WORK);

    AudioService.speakLift();

}


// ========================================
// PHASE DISPATCH TABLE
// ========================================

const PhaseHandlers = {

    [TIMER_PHASES.DRESS]: handleDressPhase,

    [TIMER_PHASES.STRETCH]: handleStretchPhase,

    [TIMER_PHASES.WORK]: handleWorkPhase,

    [TIMER_PHASES.ROTATE]: handleRotatePhase,

    [TIMER_PHASES.BREAK]: handleBreakPhase,

    [TIMER_PHASES.COOLDOWN]: () =>
        TimerEngine.finishWorkout()

};


// ========================================
// HANDLE CURRENT PHASE
// ========================================

function handleCurrentPhase() {

    const handler =
        PhaseHandlers[S.currentPhase];

    if (!handler) {

        console.warn(
            "Unknown phase:",
            S.currentPhase
        );

        return;

    }

    handler();

}


// ========================================
// PUBLIC API
// ========================================

PhaseService.gotoPhase = gotoPhase;

PhaseService.handleDress = handleDressPhase;
PhaseService.handleStretch = handleStretchPhase;
PhaseService.handleWork = handleWorkPhase;
PhaseService.handleRotate = handleRotatePhase;
PhaseService.handleBreak = handleBreakPhase;

PhaseService.handleCurrentPhase = handleCurrentPhase;


})();