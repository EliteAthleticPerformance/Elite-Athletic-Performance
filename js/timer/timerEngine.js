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

    console.log(
        "Transition:",
        S.currentPhase,
        "→",
        phase,
        "duration:",
        duration
    );

    S.currentPhase = phase;
    S.timeLeft = duration;
    S.phaseJustChanged = true;

    S.lastCountdownSpoken = null;
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

 // ========================================
// UI REFRESH
// ========================================

function refreshUI() {

    updatePhaseDisplay();
    updateClock();
    updateTotalDisplay();

}


function startTimer(isResume = false) {

  stopAllTimers();
  
    // Safety: require workout
    if (!S.workoutData.length) {
        console.warn("Workout not loaded yet.");
        return;
    }

    // Initialize audio once
    if (!S.audioCtx) {
        S.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Toggle stop if already running
    if (S.isRunning) {
        stopAllTimers();
        return;
    }

/* ---------- START STATE ---------- */
    S.isRunning = true;
    

const totalTime =
    WorkoutService.calculateTotalTime();

S.totalSeconds = totalTime;
S.originalTotalSeconds = totalTime;

document.getElementById("startBtn").innerText = "STOP";

 if (!isResume) {

        console.log("🟢 Starting New Workout");

    // FULL RESET
WorkoutService.prepareSession();

     
 } else {

        console.log("🔄 Resume Mode");

 }

    // Shared code (runs for BOTH new and resumed workouts)
    refreshUI();

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

    console.log("🔄 Restoring Workout", state);

    WorkoutService.restoreWorkoutState(state);

    S.totalSeconds = Math.max(
        S.classBlockLength - elapsedSeconds,
        1
    );

    S.originalTotalSeconds = S.classBlockLength;

    refreshUI();

    TimelineService.updateHighlight();

    console.log(
        "✅ Resume:",
        S.currentPhase,
        "Set:",
        S.currentSet,
        "Rotation:",
        S.rotationCount,
        "Time Left:",
        S.timeLeft
    );
}



 function stopAllTimers() {

    if (S.timer) {
    clearTimeout(S.timer);
    S.timer = null;
}

    S.nextTickTime = null; // prevents drift on restart

    S.isRunning = false;
    document.getElementById("startBtn").innerText = "START";
}


function tick() {

    if (!S.isRunning) return;

    S.phaseJustChanged = false;

    // ========================================
    // MASTER CLASS TIMER
    // ========================================

    if (!updateMasterClock()) return;

    // ========================================
    // PHASE TIMER
    // ========================================

    updatePhaseClock();

    // ========================================
    // COUNTDOWN ANNOUNCEMENTS
    // ========================================

    handleCountdownSpeech();

    // ========================================
    // UPDATE CLOCK
    // ========================================

    updateClock();

    // ========================================
    // WAIT FOR PHASE TO END
    // ========================================

    if (S.timeLeft > 0) return;

    console.log(
        "Set:",
        S.currentSet,
        "Rotation:",
        S.rotationCount
    );

    // ========================================
    // PHASE TRANSITION
    // ========================================

    PhaseService.handleCurrentPhase();

    // ========================================
    // REFRESH UI
    // ========================================

    if (S.phaseJustChanged) {
        refreshUI();
    }

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

    updateTotalDisplay();

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

        speakDressWarning();

        S.dressWarningSpoken = true;

    }

    // Final countdown

    if (
        S.timeLeft >= 1 &&
        S.timeLeft <= COUNTDOWN.FINAL_SECONDS &&
        S.lastCountdownSpoken !== S.timeLeft
    ) {

        speakNumber(S.timeLeft);

        S.lastCountdownSpoken = S.timeLeft;

    }

}


function syncTime() {

    if (S.isRunning) return;

    
    S.timeLeft = WorkoutService.getPhaseDuration(S.currentPhase);

S.totalSeconds = S.classBlockLength;
S.originalTotalSeconds = S.classBlockLength;

refreshUI();
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

    speakCooldown?.();

    refreshUI();

    console.log("🧘 Starting Cooldown:", cooldown);

}


function workoutFinishScreen() {

    TimerEngine.stop();

    document.getElementById("phase").innerText =
        "WORKOUT COMPLETE";

}


// ========================================
// PUBLIC API
// ========================================

TimerEngine.start = startTimer;
TimerEngine.resumeWorkout = resumeWorkout;
TimerEngine.stop = stopAllTimers;
TimerEngine.syncTime = syncTime;
TimerEngine.startCooldown = startCooldown;
TimerEngine.transition = transitionToPhase;
TimerEngine.finishWorkout = workoutFinishScreen;