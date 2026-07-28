// ========================================
// PHASE TRANSITION HELPER
// ========================================

function transitionToPhase(phase, duration) {

    console.log(
        "Transition:",
        currentPhase,
        "→",
        phase,
        "duration:",
        duration
    );

    currentPhase = phase;
    timeLeft = duration;
    phaseJustChanged = true;

    lastCountdownSpoken = null;
}


// ========================================
// DRESS PHASE
// ========================================

function handleDressPhase() {

    transitionToPhase("stretch", dynamicStretchDuration);

    dressWarningSpoken = false;

    speakStretch();

}


// ========================================
// STRETCH PHASE
// ========================================

function handleStretchPhase() {

    beginWorkout();

    transitionToPhase("work", getWorkDuration());

    speakLift();

}



function beginWorkout() {

    rotationCount = 0;
    currentSet = 1;
    displaySetNumber = 1;

    loadSetData(currentSet);

}


// ========================================
// WORK PHASE
// ========================================

function handleWorkPhase() {

    rotateQuadrantColors();

    rotationCount++;

    // SHOW PREVIEW ON FINAL ROTATION
    if (rotationCount === maxRotations) {

        const nextSet = getNextSetIndex();

        if (nextSet) {
            previewSetData(nextSet);
        }
    }

    transitionToPhase("rotate", getRestDuration());

    speakRotate();

}


// ========================================
// ROTATE PHASE
// ========================================

function handleRotatePhase() {

    const finishedRotations = rotationCount >= maxRotations;

    if (finishedRotations) {

        rotationCount = 0;

        const nextItem = workoutData[currentSet] ?? null;

        // 🔴 no more items
        if (!nextItem) {
            startCooldown();
            return;
        }

        // 🟡 break row
        if (nextItem.type === "break") {

            currentSet++;

            transitionToPhase(
                "break",
                Math.max(1, nextItem.breakSec || breakDuration)
            );

            speakBreakPrep();

            previewNextSet();

            return;
        }

        // ✅ next is real set
        currentSet++;
        displaySetNumber++;
        loadSetData(currentSet);
    }

    transitionToPhase("work", getWorkDuration());

    speakLift();

}


// ========================================
// BREAK PHASE
// ========================================

function handleBreakPhase() {

    const nextItem = workoutData[currentSet] ?? null;

    if (!nextItem) {
        startCooldown();
        return;
    }

    // ✅ ONLY advance when next is a set
    if (nextItem.type === "set") {
        currentSet++;
        displaySetNumber++;
        loadSetData(currentSet);
    }

    transitionToPhase("work", getWorkDuration());

    speakLift();

}


function preciseTick() {

    if (!isRunning) return;

    const now = Date.now();

    if (!nextTickTime) {
        nextTickTime = now + 1000;
    }

    // catch up if browser slept
    while (nextTickTime <= now) {
        tick();
        nextTickTime += 1000;
    }

    const delay = Math.max(0, nextTickTime - now);
    timer = setTimeout(preciseTick, delay);

 }


function startTimer(isResume = false) {

  stopAllTimers();
  
    // Safety: require workout
    if (!workoutData.length) {
        console.warn("Workout not loaded yet.");
        return;
    }

    // Initialize audio once
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Toggle stop if already running
    if (isRunning) {
        stopAllTimers();
        return;
    }

/* ---------- START STATE ---------- */
    isRunning = true;
    

classBlockLength = calculateTotalTime(); // 🔥 NOW DYNAMIC

totalSeconds = classBlockLength;
originalTotalSeconds = classBlockLength;

document.getElementById("startBtn").innerText = "STOP";

 if (!isResume) {

        console.log("🟢 Starting New Workout");

    // FULL RESET
resetWorkoutState();

lastAutoStartMinute = null;

preloadFirstSet();

transitionToPhase("dress", dressOutDuration);
     
 } else {

        console.log("🔄 Resume Mode");

 }

    // Shared code (runs for BOTH new and resumed workouts)
    updatePhaseDisplay();
    updateClock();
    updateTotalDisplay();

    nextTickTime = Date.now() + 1000;
    timer = setTimeout(preciseTick, 1000);
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
    currentPhase = state.phase;
    timeLeft = state.timeLeft;

    // Restore workout position
    currentSet = state.currentSet;
    displaySetNumber = state.displaySetNumber;
    rotationCount = state.rotationCount;

    // Restore total timer
    totalSeconds = Math.max(classBlockLength - elapsedSeconds, 1);
    originalTotalSeconds = totalSeconds;

    // Restore workout cards
    if (
        currentPhase === "work" ||
        currentPhase === "rotate" ||
        currentPhase === "break"
    ) {
        loadSetData(currentSet);
    }

    // Refresh UI
    updatePhaseDisplay();
    updateClock();
    updateTotalDisplay();

    // Highlight current timeline segment
    updateSegmentHighlight();

    console.log(
        "✅ Resume:",
        currentPhase,
        "Set:",
        currentSet,
        "Rotation:",
        rotationCount,
        "Time Left:",
        timeLeft
    );
}



 function stopAllTimers() {

    if (timer) {
        clearTimeout(timer); // ✅ CORRECT for setTimeout loop
        timer = null;
    }

    nextTickTime = null; // prevents drift on restart

    isRunning = false;
    document.getElementById("startBtn").innerText = "START";
}


function tick() {

    if (!isRunning) return;

    phaseJustChanged = false;

  
    /* ======================================================
       1️⃣ MASTER CLASS TIMER (authoritative)
    ====================================================== */
    if (totalSeconds <= 0) {
        workoutFinishScreen();
        return;
    }

    totalSeconds = Math.max(0, totalSeconds - 1);
    updateTotalDisplay();

  
    /* ======================================================
       2️⃣ PHASE TIMER
    ====================================================== */
   
  timeLeft = Math.max(0, timeLeft - 1);

  
    /* ======================================================
       3️⃣ DRESS WARNING (exact trigger)
    ====================================================== */
  
  if (
        currentPhase === "dress" &&
        timeLeft === 120 &&
        !dressWarningSpoken
    ) {
        speakDressWarning();
        dressWarningSpoken = true;
    }

    
    /* ======================================================
       4️⃣ FINAL COUNTDOWN (no repeats)
    ====================================================== */
    
  if (timeLeft >= 1 && timeLeft <= 5) {
        if (lastCountdownSpoken !== timeLeft) {
            speakNumber(timeLeft);
            lastCountdownSpoken = timeLeft;
        }
    }

    
    /* ======================================================
       5️⃣ UPDATE CLOCK
    ====================================================== */
    
  updateClock();

  
    /* ======================================================
       6️⃣ EXIT IF TIME REMAINS
    ====================================================== */
    
  if (timeLeft > 0) return;

    

    console.log("Set:", currentSet, "Rotation:", rotationCount);

  
    /* ======================================================
       PHASE TRANSITIONS (STATE MACHINE)
    ====================================================== */
   
  switch (currentPhase) {

    case "dress":

        handleDressPhase();

        break;

    case "stretch":

        handleStretchPhase();

        break;

    case "work":

        handleWorkPhase();

        break;

    case "rotate":

        handleRotatePhase();

        break;

    case "break":

        handleBreakPhase();

        break;

    case "cooldown":

        workoutFinishScreen();
        return;
} // ✅ CLOSES switch(currentPhase)

  
    /* ======================================================
       FINAL UI UPDATE
    ====================================================== */
    
  if (phaseJustChanged) {
        updatePhaseDisplay();
}
}


function syncTime() {

    if (isRunning) return;

    const workVal = getWorkDuration();
    const restVal = getRestDuration();

    switch (currentPhase) {

        case "work":
            timeLeft = workVal;
            break;

        case "rotate":
        case "break":
            timeLeft = restVal;
            break;

        case "cooldown":
            timeLeft = cooldownDuration;
            break;

        case "dress":
            timeLeft = dressOutDuration;
            break;

        case "stretch":
            timeLeft = dynamicStretchDuration;
            break;

        default:
            timeLeft = workVal;
    }

    updateClock();

    totalSeconds = classBlockLength;
    originalTotalSeconds = classBlockLength;

    updateTotalDisplay();
}


function workoutFinishScreen() {
    stopAllTimers();
    document.getElementById("phase").innerText = "WORKOUT COMPLETE";
}

function startCooldown() {

    if (currentPhase === "cooldown") return;

    // No cooldown needed
    if (cooldownDuration <= 0) {
        workoutFinishScreen();
        return;
    }

    transitionToPhase("cooldown", cooldownDuration);

speakCooldown?.();

    updatePhaseDisplay();
    updateClock();

    console.log("🧘 Starting Cooldown:", cooldownDuration);
}