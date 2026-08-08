(() => {


// ========================================
// TIMER ENGINE
// ========================================

window.TimerEngine = window.TimerEngine || {};
const TimerEngine = window.TimerEngine;

const S = window.TimerState;


// ========================================
// PHASE TRANSITION HELPER
// ========================================

function transitionToPhase(phase, duration) {

    
    S.currentPhase = phase;
    S.timeLeft = duration;
    S.lastCountdownSpoken = null;
}


function startTimer(isResume = false) {

  stopAllTimers();
  
    // Safety: require workout
    if (!S.workoutData.length) {

    console.warn("Workout not loaded.");

    return;

}

    // Initialize audio once
    if (!S.audioCtx) {
        S.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    
/* ---------- START STATE ---------- */
    S.isRunning = true;
    

const totalTime =
    WorkoutService.calculateTotalTime();

S.totalSeconds = totalTime;
S.originalTotalSeconds = totalTime;

TimerUI.setStartButton("STOP");

 if (!isResume) {

    WorkoutService.prepareSession();

}

    // Shared code (runs for BOTH new and resumed workouts)
    TimerUI.refresh();

    S.nextTickTime = Date.now() + 1000;
    S.timer = setTimeout(preciseTick, 1000);
}



// ========================================
// RESUME WORKOUT
// ========================================

function resumeWorkout(elapsedSeconds) {

    const state =
        TimelineService.getWorkoutState(elapsedSeconds);

    if (!state) {
        console.warn("Unable to restore workout state.");
        return;
    }

    WorkoutService.restoreWorkoutState(state);

    S.totalSeconds = Math.max(
        S.classBlockLength - elapsedSeconds,
        1
    );

    S.originalTotalSeconds = S.classBlockLength;

    TimelineService.updateHighlight();
    
    TimerUI.refresh();

    }


 function stopAllTimers() {

    if (S.timer) {
    clearTimeout(S.timer);
    S.timer = null;
}

    S.nextTickTime = null; // prevents drift on restart

    S.isRunning = false;

    TimerUI.setStartButton("START");
}


function preciseTick() {

    if (!S.isRunning) return;

    const now = Date.now();

    if (!S.nextTickTime) {
        S.nextTickTime = now + 1000;
    }

    // catch up if browser slept
    while (S.nextTickTime <= now) {
        tick();
        S.nextTickTime += 1000;
    }

    const delay = Math.max(0, S.nextTickTime - now);
    S.timer = setTimeout(preciseTick, delay);

 }


function tick() {

    console.log(
    "Tick",
    {
        phase: S.currentPhase,
        timeLeft: S.timeLeft,
        rotation: S.rotationCount,
        total: S.totalSeconds
    }
);

    if (!S.isRunning) return;

    if (!updateMasterClock()) return;

    updatePhaseClock();

    handleCountdownSpeech();

    if (S.timeLeft <= 0) {

        console.log(
            "Set:",
            S.currentSet,
            "Rotation:",
            S.rotationCount
        );

        PhaseService.handleCurrentPhase();

    }

    // Always update visuals after state changes
    TimelineService.updateHighlight();
    TimerUI.refresh();

}

   
function updateMasterClock() {

    if (S.totalSeconds <= 0) {
        TimerEngine.finishWorkout();
        return false;
    }

    S.totalSeconds = Math.max(
        0,
        S.totalSeconds - 1
    );

    return true;

}


function updatePhaseClock() {

    S.timeLeft = Math.max(
        0,
        S.timeLeft - 1
    );

}


function handleCountdownSpeech() {

    // Dress warning

    if (
        S.currentPhase === TIMER_PHASES.DRESS &&
        S.timeLeft === COUNTDOWN.DRESS_WARNING &&
        !S.dressWarningSpoken
    ) {

        AudioService.speakDressWarning();

        S.dressWarningSpoken = true;

    }

    // Final countdown

    if (
        S.timeLeft >= 1 &&
        S.timeLeft <= COUNTDOWN.FINAL_SECONDS &&
        S.lastCountdownSpoken !== S.timeLeft
    ) {

        AudioService.speakNumber(S.timeLeft);

        S.lastCountdownSpoken = S.timeLeft;

    }

}


function startCooldown() {

    if (S.currentPhase === TIMER_PHASES.COOLDOWN) return;

    const cooldown =
        WorkoutService.getPhaseDuration(TIMER_PHASES.COOLDOWN);

    if (cooldown <= 0) {
        TimerEngine.finishWorkout();
        return;
    }

    TimerEngine.transition(
        TIMER_PHASES.COOLDOWN,
        cooldown
    );

    AudioService.speakCooldown();

    TimerUI.refresh();

    }


function workoutFinishScreen() {

    TimerEngine.stop();

    S.currentPhase = TIMER_PHASES.COOLDOWN;

    S.timeLeft = 0;
    S.totalSeconds = 0;

    TimerUI.refresh();

}


// ========================================
// PUBLIC API
// ========================================

TimerEngine.start = startTimer;
TimerEngine.resumeWorkout = resumeWorkout;
TimerEngine.stop = stopAllTimers;
TimerEngine.startCooldown = startCooldown;
TimerEngine.transition = transitionToPhase;
TimerEngine.finishWorkout = workoutFinishScreen;


})();