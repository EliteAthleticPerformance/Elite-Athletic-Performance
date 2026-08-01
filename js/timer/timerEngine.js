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
    

const total = WorkoutService.calculateTotalTime();

S.totalSeconds = total;
S.originalTotalSeconds = total;

document.getElementById("startBtn").innerText = "STOP";

 if (!isResume) {

        console.log("🟢 Starting New Workout");

    // FULL RESET
prepareWorkoutSession();

     
 } else {

        console.log("🔄 Resume Mode");

 }

    // Shared code (runs for BOTH new and resumed workouts)
    updatePhaseDisplay();
    updateClock();
    updateTotalDisplay();

    S.nextTickTime = Date.now() + 1000;
    S.timer = setTimeout(preciseTick, 1000);
}



// ========================================
// RESUME WORKOUT
// ========================================

function resumeWorkout(elapsedSeconds) {

    const state = getWorkoutState(elapsedSeconds);

    if (!state) {
        console.warn("Unable to restore workout state.");
        return;
    }

    console.log("🔄 Restoring Workout", state);

    // Restore phase
    S.currentPhase = state.phase;
    S.timeLeft = state.timeLeft;

    // Restore workout position
    S.currentSet = state.currentSet;
    S.displaySetNumber = state.displaySetNumber;
    S.rotationCount = state.rotationCount;

    // Restore total timer
    S.totalSeconds = Math.max(
    S.classBlockLength - elapsedSeconds,
    1
);

// keep the original class length
S.originalTotalSeconds = S.classBlockLength;
    

    // Restore workout cards
    if (
    S.currentPhase === TIMER_PHASES.WORK ||
    S.currentPhase === TIMER_PHASES.ROTATE ||
    S.currentPhase === TIMER_PHASES.BREAK
){
        loadSetData(S.currentSet);
    }

    // Refresh UI
    updatePhaseDisplay();
    updateClock();
    updateTotalDisplay();

    // Highlight current timeline segment
    updateSegmentHighlight();

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

  
    /* ======================================================
       1️⃣ MASTER CLASS TIMER (authoritative)
    ====================================================== */
    if (S.totalSeconds <= 0) {
        workoutFinishScreen();
        return;
    }

    S.totalSeconds = Math.max(0, S.totalSeconds - 1);
    updateTotalDisplay();

  
    /* ======================================================
       2️⃣ PHASE TIMER
    ====================================================== */
   
  S.timeLeft = Math.max(0, S.timeLeft - 1);

  
    /* ======================================================
       3️⃣ DRESS WARNING (exact trigger)
    ====================================================== */
  
  if (
    S.currentPhase === TIMER_PHASES.DRESS &&
    S.timeLeft === COUNTDOWN.DRESS_WARNING &&
    !S.dressWarningSpoken
) {
    speakDressWarning();
    S.dressWarningSpoken = true;
}

    
    /* ======================================================
       4️⃣ FINAL COUNTDOWN (no repeats)
    ====================================================== */
    
  if (S.timeLeft >= 1 && S.timeLeft <= COUNTDOWN.FINAL_SECONDS) {
        if (S.lastCountdownSpoken !== S.timeLeft) {
            speakNumber(S.timeLeft);
            S.lastCountdownSpoken = S.timeLeft;
        }
    }

    
    /* ======================================================
       5️⃣ UPDATE CLOCK
    ====================================================== */
    
  updateClock();

  
    /* ======================================================
       6️⃣ EXIT IF TIME REMAINS
    ====================================================== */
    
  if (S.timeLeft > 0) return;

    

    console.log("Set:", S.currentSet, "Rotation:", S.rotationCount);

  
    /* ======================================================
       PHASE TRANSITIONS (STATE MACHINE)
    ====================================================== */
   
  handleCurrentPhase();

  
    /* ======================================================
       FINAL UI UPDATE
    ====================================================== */
    
  if (S.phaseJustChanged) {
        updatePhaseDisplay();
}
}


function syncTime() {

    if (S.isRunning) return;

    
    S.timeLeft = getPhaseDuration(S.currentPhase);

    updateClock();

    S.totalSeconds = S.classBlockLength;
    S.originalTotalSeconds = S.classBlockLength;

    updateTotalDisplay();
}


function startCooldown() {

    if (S.currentPhase === TIMER_PHASES.COOLDOWN) return;

    // No cooldown needed
   if (getPhaseDuration(TIMER_PHASES.COOLDOWN) <= 0) {
    workoutFinishScreen();
    return;
}

    transitionToPhase(
    TIMER_PHASES.COOLDOWN,
    getPhaseDuration(TIMER_PHASES.COOLDOWN)
);

speakCooldown?.();

    updatePhaseDisplay();
    updateClock();

    console.log(
    "🧘 Starting Cooldown:",
    getPhaseDuration(TIMER_PHASES.COOLDOWN)
);
}


function workoutFinishScreen() {
    stopAllTimers();
    document.getElementById("phase").innerText = "WORKOUT COMPLETE";
}