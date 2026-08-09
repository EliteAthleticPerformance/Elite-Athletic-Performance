(() => {


// ========================================
// COACH SERVICE
// ========================================

window.CoachService = window.CoachService || {};
const CoachService = window.CoachService;

const S = window.TimerState;


function getElapsedSeconds() {

    if (!S.classStartTime) {
        return 0;
    }

    return Math.floor(
        (
            ScheduleService.getEffectiveNow().getTime() -
            S.classStartTime
        ) / 1000
    );

}


function calculateOffsetForTarget(targetPhase, targetSet, targetRotation) {

    let offset = 0;

    for (const segment of S.timelineData) {

        const phaseMatch =
            segment.phase === targetPhase;

        const setMatch =
            segment.displaySet === targetSet;

        const rotationMatch =
            segment.rotation === targetRotation;

        if (phaseMatch && setMatch && rotationMatch) {
            return offset;
        }

        offset += segment.duration;
    }

    return 0;

}


// ========================================
// APPLY COACH COMMAND
// ========================================

function applyCoachControl() {

    // Restore class start time
    if (!S.classStartTime && S.controlTimestamp) {

    const parsedTimestamp =
        new Date(S.controlTimestamp).getTime();

    if (!Number.isNaN(parsedTimestamp)) {

        S.classStartTime = parsedTimestamp;

    }

}

    // Keep late joiners synchronized
    if (S.classStartTime && S.isRunning) {

        const elapsed = getElapsedSeconds();

        const state =
            TimelineService.getWorkoutState(elapsed);

        if (state) {

            WorkoutService.restoreWorkoutState(state);

            TimerUI.refresh();
            
        }

    }

    if (!S.controlAction) return;

    const signature = [

        S.controlAction,
        S.controlTimestamp,
        S.controlPhase,
        S.controlSet,
        S.controlRotation

    ].join("|");

    if (signature === S.lastControlSignature) return;

    S.lastControlSignature = signature;

    switch (S.controlAction) {

        case "START": {

            S.classStartTime =
                new Date(S.controlTimestamp).getTime();

            const elapsed = getElapsedSeconds();

            TimerEngine.start(true);
            TimerEngine.resumeWorkout(elapsed);

            break;
        }

        case "STOP":

            TimerEngine.stop();

            S.classStartTime = null;

            TimerUI.refresh();
            

            break;

        case "PAUSE":

            TimerEngine.pause();

            TimerUI.refresh();

            break;

        case "RESUME": {

            const elapsed =
            getElapsedSeconds();

            TimerEngine.resumeWorkout(elapsed);

            break;

        }       

        case "JUMP": {

            const offset = calculateOffsetForTarget(

                S.controlPhase,
                S.controlSet,
                S.controlRotation

            );

            S.classStartTime =
                ScheduleService.getEffectiveNow().getTime() -
                (offset * 1000);

            TimerEngine.resumeWorkout(offset);

            break;
        }

    }

}



// ========================================
// JUMP TO PHASE
// ========================================

function jumpToSection(targetPhase) {

    const now =
        ScheduleService.getEffectiveNow().getTime();

    let offset = 0;

    for (const segment of S.timelineData) {

        if (segment.phase === targetPhase) {
            break;
        }

        offset += segment.duration;

    }

    S.classStartTime =
        now - (offset * 1000);

    TimerEngine.resumeWorkout(offset);

    }


// ========================================
// JUMP TO SET
// ========================================

function jumpToSet(setNumber) {

    const now =
        ScheduleService.getEffectiveNow().getTime();

    let offset = 0;

    for (const segment of S.timelineData) {

        if (
            segment.phase === TIMER_PHASES.WORK &&
            segment.displaySet === setNumber
        ) {
            break;
        }

        offset += segment.duration;

    }

    S.classStartTime =
        now - (offset * 1000);

    TimerEngine.resumeWorkout(offset);

    }


// ========================================
// BUILD COACH BUTTONS
// ========================================

function buildCoachButtons() {

console.log("Building coach buttons");

    const container =
        document.getElementById("coachSetButtons");

console.log("container =", container);

    if (!container) return;

    container.innerHTML = "";

    const sets = S.workoutData.filter(

        item => item.type === "set"

    );

console.log("sets =", sets);

    sets.forEach((set, index) => {

console.log("Creating button", index + 1);

        const button =
            document.createElement("button");

        const setNumber = index + 1;

        button.textContent =
            `Set ${setNumber}`;

        button.onclick = () =>
            jumpToSet(setNumber);

        container.appendChild(button);

    });

    console.log(
        "children =",
        container.children.length
    );

}


// ========================================
// PUBLIC API
// ========================================

CoachService.applyControl = applyCoachControl;
CoachService.jumpToSection = jumpToSection;
CoachService.jumpToSet = jumpToSet;
CoachService.buildButtons = buildCoachButtons;

// UI functions now live in coachUI.js
CoachService.togglePanel = CoachUI.toggle;


})();

