window.PhaseService = window.PhaseService || {};
const PhaseService = window.PhaseService;

const S = window.TimerState;


// ========================================
// DRESS PHASE
// ========================================

function handleDressPhase() {

    gotoPhase(TIMER_PHASES.STRETCH);

    S.dressWarningSpoken = false;

    speakStretch();

}


function gotoPhase(phase, duration = null) {

    TimerEngine.transition(
        phase,
        duration ?? WorkoutService.getPhaseDuration(phase)
    );

}


// ========================================
// STRETCH PHASE
// ========================================

function handleStretchPhase() {

    WorkoutService.beginWorkout();

    gotoPhase(TIMER_PHASES.WORK);

    speakLift();

}


// ========================================
// WORK PHASE
// ========================================

function handleWorkPhase() {

    rotateQuadrantColors();

    S.rotationCount++;

    // SHOW PREVIEW ON FINAL ROTATION
    if (S.rotationCount === WorkoutService.config.maxRotations) {

    const nextSet = WorkoutService.getNextSetIndex();

    if (nextSet) {
        previewSetData(nextSet);
    }

} 

    gotoPhase(TIMER_PHASES.ROTATE);

    speakRotate();

}


// ========================================
// ROTATE PHASE
// ========================================

function handleRotatePhase() {

    const finishedRotations =
    S.rotationCount >= WorkoutService.config.maxRotations;

    if (finishedRotations) {

        S.rotationCount = 0;

        const nextItem = S.workoutData[S.currentSet] ?? null;

        // 🔴 no more items
        if (!nextItem) {
            TimerEngine.startCooldown();
            return;
        }

        // 🟡 break row
        if (nextItem.type === "break") {

            S.currentSet++;

        const breakDuration = Math.max(
        1,
        nextItem.breakSec || WorkoutService.getPhaseDuration(TIMER_PHASES.BREAK)
);

            gotoPhase(
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
        WorkoutService.loadSetData(S.currentSet);
    }

    gotoPhase(TIMER_PHASES.WORK);

    speakLift();

}


// ========================================
// BREAK PHASE
// ========================================

function handleBreakPhase() {

    const nextItem = S.workoutData[S.currentSet] ?? null;

    if (!nextItem) {
        TimerEngine.startCooldown();
        return;
    }

    // ✅ ONLY advance when next is a set
    if (nextItem.type === "set") {
        S.currentSet++;
        S.displaySetNumber++;
        WorkoutService.loadSetData(S.currentSet);
    }

    gotoPhase(TIMER_PHASES.WORK);

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

    [TIMER_PHASES.COOLDOWN]: () => TimerEngine.finishWorkout()

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



PhaseService.handleDress = handleDressPhase;
PhaseService.handleStretch = handleStretchPhase;
PhaseService.handleWork = handleWorkPhase;
PhaseService.handleRotate = handleRotatePhase;
PhaseService.handleBreak = handleBreakPhase;
PhaseService.handleCurrentPhase = handleCurrentPhase;