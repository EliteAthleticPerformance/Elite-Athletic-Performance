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


function startTimer() {

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
updateTotalDisplay();

document.getElementById("startBtn").innerText = "STOP";

    // FULL RESET
    displaySetNumber = 1;
    rotationCount = 0;
    currentSet = 1;
    dressWarningSpoken = false;
    lastAutoStartMinute = null;

    preloadFirstSet();

    /* ---------- START WITH DRESS PHASE ---------- */
    currentPhase = "dress";
    timeLeft = dressOutDuration;
      
    updatePhaseDisplay();
    updateClock();
    updateTotalDisplay();

    nextTickTime = Date.now() + 1000;
    timer = setTimeout(preciseTick, 1000);
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

    lastCountdownSpoken = null;

    console.log("Set:", currentSet, "Rotation:", rotationCount);

  
    /* ======================================================
       PHASE TRANSITIONS (STATE MACHINE)
    ====================================================== */
   
  switch (currentPhase) {

        case "dress":
            currentPhase = "stretch";
            timeLeft = dynamicStretchDuration;
            dressWarningSpoken = false;
            phaseJustChanged = true;
            speakStretch();
            break;

        case "stretch":
            currentPhase = "work";
            rotationCount = 0;
            currentSet = 1;
            displaySetNumber = 1;

            loadSetData(1);

            timeLeft = getWorkDuration();
            phaseJustChanged = true;
            speakLift();
            break;

        case "work": {

    rotateQuadrantColors();
    rotationCount++;

    // SHOW PREVIEW ON FINAL ROTATION
    if (rotationCount === maxRotations) {

        const nextSet = getNextSetIndex();

        if (nextSet) {
            previewSetData(nextSet);
        }
    }

    currentPhase = "rotate";
    timeLeft = getRestDuration();
    phaseJustChanged = true;
    speakRotate();
    break;
}

      
        /* ---------- ROTATE → NEXT ---------- */
      
    case "rotate": {

    const finishedRotations = rotationCount >= maxRotations;

    if (finishedRotations) {

        rotationCount = 0;

        const nextItem = workoutData[currentSet] ?? null;

        // 🔴 no more items
        if (!nextItem) {
            workoutFinishScreen();
            return;
        }


        // 🟡 break row
        if (nextItem.type === "break") {

            // advance pointer onto the break row
            currentSet++;

            currentPhase = "break";

            timeLeft = Math.max(
                1,
                nextItem.breakSec || breakDuration
            );

            phaseJustChanged = true;
            speakBreakPrep();

            previewNextSet();
            break;
        }


        // ✅ next is real set
        currentSet++;
        displaySetNumber++;
        loadSetData(currentSet);
    }

    currentPhase = "work";
    timeLeft = getWorkDuration();
    phaseJustChanged = true;
    speakLift();
    break;
}

        case "break": {

            const nextItem = workoutData[currentSet] ?? null;

            if (!nextItem) {
                workoutFinishScreen();
                return;
            }

          
            // ✅ ONLY advance when next is a set
            if (nextItem.type === "set") {
                currentSet++;
                displaySetNumber++;
                loadSetData(currentSet);
            }

            currentPhase = "work";
            timeLeft = getWorkDuration();
            phaseJustChanged = true;
            speakLift();
            break;
        }

    } // ✅ CLOSES switch(currentPhase)

  
    /* ======================================================
       FINAL UI UPDATE
    ====================================================== */
    
  if (phaseJustChanged) {
    lastCountdownSpoken = null;
    updatePhaseDisplay();
}
}


function syncTime() {

    if (!isRunning) {

        const workVal = getWorkDuration();
        const restVal = getRestDuration();

        timeLeft = (currentPhase === "work") ? workVal : restVal;

        updateClock();

        // Always show full class block
        totalSeconds = classBlockLength;
        originalTotalSeconds = classBlockLength;

        updateTotalDisplay();
    }
}


function workoutFinishScreen() {
    stopAllTimers();
    document.getElementById("phase").innerText = "WORKOUT COMPLETE";
}