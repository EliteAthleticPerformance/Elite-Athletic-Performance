console.log("🔥 WORKOUT SERVICE VERSION 2", Math.random());

window.WorkoutService = window.WorkoutService || {};
const WorkoutService = window.WorkoutService;

const S = window.TimerState;



// ========================================
// WORKOUT CONFIGURATION
// Loaded from Google Sheets
// ========================================

WorkoutService.config = {

    dressSeconds: 0,

    stretchSeconds: 0,

    workSeconds: 30,

    rotateSeconds: 30,

    breakSeconds: 120,

    cooldownSeconds: 0,

    maxRotations: 4

};


function parseCSV(text) {
    return text
        .split("\n")
        .map(line =>
            line.split(",").map(cell =>
                cell
                    .replace(/^"|"$/g, "")
                    .replace(/""/g, '"')
                    .trim()
            )
        );
}


function resetWorkoutData() {

    S.workoutData.length = 0;

}


async function fetchWorkoutRows() {

    const school = SchoolService.getSchoolKey();

const data = SchoolService.getData();

const response = await fetch(
    `${data.workoutApiURL}?type=workout&school=${school}`
);

    if (!response.ok) {
        throw new Error("Network response was not ok");
    }

    const text = await response.text();

    return {
        text,
        rows: parseCSV(text)
    };

}


async function loadWorkout() {

    try {

        const { text, rows } = await fetchWorkoutRows();

        logWorkoutLoad(text, rows);

        resetWorkoutData();

        processWorkoutRows(rows);

        logWorkoutSummary();

        finishWorkoutLoad();

    } catch (err) {

        console.error("❌ Failed to load workout:", err);

    }

}


function logWorkoutLoad(text, rows) {

    console.log("CSV length:", text.length);

    console.log("Row 0:", rows[0]);
    console.log("Row 0 first cell:", rows[0]?.[0]);
    console.log("Row 0 second cell:", rows[0]?.[1]);

    const DEBUG = true;

    if (DEBUG) {
        console.log("CSV preview:", text.slice(0, 200));
        console.log("First rows:", rows.slice(0, 10));
    }

    console.log("Rows parsed:", rows.length);
    console.log("First 10 rows:", rows.slice(0, 10));

}


function logWorkoutSummary() {

    console.log(
        "✅ Workout rows:",
        S.workoutData.length
    );

    }


function handleServerTimeRow(firstCell, r) {

    if (firstCell !== "server_time") {
        return false;
    }

    window.serverTime = cleanCell(r[1]);

    console.log("🕒 Server time:", window.serverTime);

    return true;
}

function handleBreakRow(firstCell, r) {

    if (!r || r.length === 0) {

        S.workoutData.push({
            type: "break",
            breakSec: S.breakDuration
        });

        console.log("📥 Empty CSV row → break inserted");

        return true;
    }

    if (isEffectivelyBlankRow(r)) {

        S.workoutData.push({
            type: "break",
            breakSec: S.breakDuration
        });

        return true;
    }

    if (firstCell.replace(/\s+/g, "") === "break") {

        const breakSec =
        parseSheetNumber(r[10], getBreakDuration());

        S.workoutData.push({
            type: "break",
            breakSec
        });

        console.log("📥 Explicit break parsed:", breakSec);

        return true;
    }

    return false;
}


function handleConfigRow(firstCell, r) {

    if (firstCell === "auto_start") {
        const enabled =
    cleanCell(r[1]).toLowerCase() === "true";

        ScheduleService.config.autoStart = enabled;
    }

    if (firstCell === "today_only") {

    const todayOnly =
        cleanCell(r[1]).toLowerCase() === "true";

    ScheduleService.config.todayOnly = todayOnly;

    return true;
}

    return false;
}


function handleClassLengthRow(firstCell, r) {

    if (firstCell === "monday_minutes") {
        const v = parseSheetNumber(r[1]);
        if (v !== null) 

        ScheduleService.config.classLength.monday = v;

        return true;
    }

    if (firstCell === "tuesday_minutes") {
        const v = parseSheetNumber(r[1]);
        if (v !== null) 

        ScheduleService.config.classLength.tuesday = v;

        return true;
    }

    if (firstCell === "wednesday_minutes") {
        const v = parseSheetNumber(r[1]);
        if (v !== null) 

        ScheduleService.config.classLength.wednesday = v;

        return true;
    }

    if (firstCell === "thursday_minutes") {
        const v = parseSheetNumber(r[1]);
        if (v !== null) 

        ScheduleService.config.classLength.thursday = v;

        return true;
    }

    if (firstCell === "friday_minutes") {
        const v = parseSheetNumber(r[1]);
        if (v !== null) 

        ScheduleService.config.classLength.friday = v;

        return true;
    }

}


function handleScheduleRow(firstCell, r) {

    if (firstCell === "monday_times") {
        

        ScheduleService.config.schedules.monday =
        r.slice(1)
        .map(cleanCell)
        .filter(Boolean);
        return true;
    }

    if (firstCell === "tuesday_times") {

        ScheduleService.config.schedules.tuesday =
        r.slice(1)
        .map(cleanCell)
         .filter(Boolean);
        return true;
    }

    if (firstCell === "wednesday_times") {

        ScheduleService.config.schedules.wednesday =
        r.slice(1)
        .map(cleanCell)
         .filter(Boolean);
        return true;
    }
        

    if (firstCell === "thursday_times") {

        ScheduleService.config.schedules.thursday =
        r.slice(1)
        .map(cleanCell)
         .filter(Boolean);
        return true;
    }

    if (firstCell === "friday_times") {

        ScheduleService.config.schedules.friday =
        r.slice(1)
        .map(cleanCell)
         .filter(Boolean);
        return true;
    }

    return false;
}


function handleTimingRow(firstCell, r) {

    if (
        firstCell === "dress_seconds" ||
        firstCell === "dress" ||
        firstCell === "get_dressed" ||
        firstCell === "get_dress"
    ) {
        const v = parseSheetNumber(r[1]);

        if (v !== null) {
            S.dressOutDuration = v;
            WorkoutService.config.dressSeconds = v;
            console.log("📥 Dress time:", S.dressOutDuration);
        }

        return true;
    }

    if (firstCell === "stretch_seconds") {
        const v = parseSheetNumber(r[1]);

        if (v !== null) {
            S.dynamicStretchDuration = v;
            WorkoutService.config.stretchSeconds = v;
            console.log("📥 Stretch time:", S.dynamicStretchDuration);
        }

        return true;
    }

    if (firstCell === "work_seconds") {
        const v = parseSheetNumber(r[1]);

        if (v !== null) {
            S.sheetWorkDuration = v;
            WorkoutService.config.workSeconds = v;
            console.log("📥 Work time:", S.sheetWorkDuration);
        }

        return true;
    }

    if (firstCell === "rotate_seconds") {
        const v = parseSheetNumber(r[1]);

        if (v !== null) {
            S.sheetRotateDuration = v;
            WorkoutService.config.rotateSeconds = v;
            console.log("📥 Rotate time:", S.sheetRotateDuration);
        }

        return true;
    }

    if (firstCell === "break_seconds") {
        const v = parseSheetNumber(r[1]);

        if (v !== null) {
            S.breakDuration = v;
            WorkoutService.config.breakSeconds = v;
            console.log("📥 Break time:", S.breakDuration);
        }

        return true;
    }

    return false;
}


function getDressDuration() {
    return WorkoutService.config.dressSeconds;
}

function getStretchDuration() {
    return WorkoutService.config.stretchSeconds;
}

function getBreakDuration() {
    return WorkoutService.config.breakSeconds;
}

function getCooldownDuration() {
    return WorkoutService.config.cooldownSeconds;
}


function getNextSetIndex() {

    for (
        let i = S.currentSet;
        i < S.workoutData.length;
        i++
    ) {

        if (S.workoutData[i]?.type === "set") {
            return i + 1;
        }

    }

    return null;

}


function handleWorkoutSetRow(firstRaw, firstCell, r) {

    const looksLikeSetNumber =
        /^\d+$/.test(firstCell) ||
        /^\d+\.$/.test(firstCell) ||
        /^set\s*\d*$/i.test(firstRaw);

    if (!looksLikeSetNumber) {
        return false;
    }

    const workSec = parseSheetNumber(r[8]);
    const rotateSec = parseSheetNumber(r[9]);
    const breakSec =
    parseSheetNumber(r[10], getBreakDuration());

    S.workoutData.push({
        type: "set",
        core: cleanCell(r[1]),
        percent: cleanCell(r[2]),
        reps: cleanCell(r[3]),
        aux: cleanCell(r[4]),
        auxReps: cleanCell(r[5]),
        move: cleanCell(r[6]),
        moveReps: cleanCell(r[7]),
        workSec,
        rotateSec,
        breakSec
    });

    return true;
}


const RowParsers = [

    (firstRaw, firstCell, row) => handleServerTimeRow(firstCell, row),

    (firstRaw, firstCell, row) => handleBreakRow(firstCell, row),

    (firstRaw, firstCell, row) => handleConfigRow(firstCell, row),

    (firstRaw, firstCell, row) => handleClassLengthRow(firstCell, row),

    (firstRaw, firstCell, row) => handleScheduleRow(firstCell, row),

    (firstRaw, firstCell, row) => handleTimingRow(firstCell, row),

    (firstRaw, firstCell, row) => handleWorkoutSetRow(firstRaw, firstCell, row)

];

    
function processWorkoutRows(rows) {

    for (const row of rows) {

        const firstRaw = cleanCell(row[0]);
        const firstCell = firstRaw.toLowerCase();

        if (firstCell === "set" || firstCell === "sets") {
            continue;
        }

        for (const parser of RowParsers) {

            if (parser(firstRaw, firstCell, row)) {
                break;
            }

        }

    }

}

function preloadFirstSet() {
    if (!S.workoutData.length) return;
    loadSetData(1);
}


function finishWorkoutLoad() {

    preloadFirstSet();

    TimelineService.build();

    ScheduleService.applyDaySpecificClassLength();
    ScheduleService.startAutoScheduler();

if (typeof syncClockOffset === "function") {
    syncClockOffset();
}

    const planned = calculateTotalTime();
    const finalTotal = Math.min(planned, S.classBlockLength);

    S.totalSeconds = finalTotal;
    S.originalTotalSeconds = finalTotal;

    updateTotalDisplay();

}


function cleanCell(value) {

    return String(value || "")
        .replace(/\u00A0/g, "")
        .replace(/\r/g, "")
        .trim();

}


function parseSheetNumber(val, fallback = null) {
    if (val === undefined || val === null) return fallback;

    const cleaned = String(val)
        .replace(/\r/g, "")
        .trim();

    if (!cleaned) return fallback;

    const num = Number(cleaned);
    return isNaN(num) ? fallback : num;
}

  
function isEffectivelyBlankRow(row) {
    if (!row || row.length === 0) return true;

    return row.every(cell =>
        String(cell || "")
            .replace(/\u00A0/g, "") // non-breaking space
            .replace(/\s/g, "")
            .trim() === ""
    );
}


function calculateWarmupTime() {

    return (
        Number(getDressDuration()) +
        Number(getStretchDuration())
    );

}


function calculateWorkoutTime() {

    let workoutTotal = 0;
    let breakTotal = 0;

    S.workoutData.forEach(item => {

    if (item.type === "set") {

        const work = WorkoutService.getWorkDuration(item);
        const rotate = WorkoutService.getRotateDuration(item);

        const rotations = WorkoutService.config.maxRotations;

for (let i = 0; i < rotations; i++) {

    workoutTotal += work;

    if (i < rotations - 1) {
        workoutTotal += rotate;
    }

}
    }

    if (item.type === "break") {

        breakTotal +=
            item.breakSec ??
            WorkoutService.getBreakDuration();
    }
});

    return workoutTotal + breakTotal;

}


function beginWorkout() {

    S.rotationCount = 0;
    S.currentSet = 1;
    S.displaySetNumber = 1;

    WorkoutService.loadSetData(S.currentSet);

}



// ========================================
// DURATION HELPERS
// ========================================

function getWorkDuration(item = null) {

    if (item?.workSec != null) {
        return item.workSec;
    }

    return WorkoutService.config.workSeconds;
}

function getRotateDuration(item = null) {

    if (item?.rotateSec != null) {
        return item.rotateSec;
    }

    return WorkoutService.config.rotateSeconds;
}


function calculateCooldownTime(workoutBlock) {

    return Math.max(
        S.classBlockLength - workoutBlock,
        0
    );

}


function calculateTotalTime() {

    if (!S.workoutData.length) {
    console.warn("Workout still loading...");
    return S.classBlockLength;
}

    const prepTotal = calculateWarmupTime();

    const workoutTotal = calculateWorkoutTime();

   
    const workoutBlock = prepTotal + workoutTotal;

    const cooldown =
    calculateCooldownTime(workoutBlock);

    WorkoutService.config.cooldownSeconds = cooldown;

console.log("Cooldown calculated:", cooldown);

   /* ---------- FINAL TOTAL (ALWAYS CLASS LENGTH) ---------- */
    return S.classBlockLength;
}


function resetState() {

    S.currentSet = 1;
    S.displaySetNumber = 1;
    S.rotationCount = 0;

    S.currentPhase = TIMER_PHASES.DRESS;

    S.phaseJustChanged = false;
    S.dressWarningSpoken = false;
    S.lastCountdownSpoken = null;
}


function prepareWorkoutSession() {

    WorkoutService.resetState();

WorkoutService.preloadFirstSet();

}


const PhaseDurationGetters = {

    [TIMER_PHASES.DRESS]:
        WorkoutService.getDressDuration,

    [TIMER_PHASES.STRETCH]:
        WorkoutService.getStretchDuration,

    [TIMER_PHASES.WORK]:
        WorkoutService.getWorkDuration,

    [TIMER_PHASES.ROTATE]:
        WorkoutService.getRotateDuration,

    [TIMER_PHASES.BREAK]:
        WorkoutService.getBreakDuration,

    [TIMER_PHASES.COOLDOWN]:
        WorkoutService.getCooldownDuration
};



function getPhaseDuration(phase) {

    const getter = PhaseDurationGetters[phase];

    if (!getter) {

        console.warn("Unknown phase:", phase);

        return 0;

    }

    return getter();

}


/* ======================================================
   LOAD SET INTO QUADRANTS
====================================================== */

function loadSetData(setNumber) {

    const workout = S.workoutData[setNumber - 1];

    if (!workout || workout.type !== "set") return;

    /* ---------- CORE ---------- */
    const q1Texts = document.querySelectorAll("#q1 .quad-text");
    if (q1Texts.length >= 3) {
        q1Texts[0].innerText = workout.core;
        q1Texts[1].innerText = "Reps: " + workout.reps;
        q1Texts[2].innerText =
            "Percentage: " + (workout.percent ? workout.percent + "%" : "");
    }

    /* ---------- AUX ---------- */
    const q2Texts = document.querySelectorAll("#q2 .quad-text");
    if (q2Texts.length >= 2) {
        q2Texts[0].innerText = workout.aux;
        q2Texts[1].innerText = "Reps: " + workout.auxReps;
    }

    /* ---------- MOVEMENT ---------- */
    const q4Texts = document.querySelectorAll("#q4 .quad-text");
    if (q4Texts.length >= 2) {
        q4Texts[0].innerText = workout.move;
        q4Texts[1].innerText = "Reps/Time: " + workout.moveReps;
    }
}


// ========================================
// RESTORE WORKOUT STATE
// ========================================

function restoreWorkoutState(state) {

    S.currentPhase = state.phase;
    S.timeLeft = state.timeLeft;

    S.currentSet = state.currentSet;
    S.displaySetNumber = state.displaySetNumber;
    S.rotationCount = state.rotationCount;

    if (
        state.phase === TIMER_PHASES.WORK ||
        state.phase === TIMER_PHASES.ROTATE ||
        state.phase === TIMER_PHASES.BREAK
    ) {
        WorkoutService.loadSetData(state.currentSet);
    }
}


// ========================================
// PUBLIC API
// ========================================

WorkoutService.beginWorkout = beginWorkout;

WorkoutService.parseCSV = parseCSV;

WorkoutService.parseSheetNumber = parseSheetNumber;

WorkoutService.cleanCell = cleanCell;

WorkoutService.load = loadWorkout;

WorkoutService.fetchRows = fetchWorkoutRows;

WorkoutService.calculateTotalTime = calculateTotalTime;

WorkoutService.prepareSession = prepareWorkoutSession;

WorkoutService.resetWorkoutData = resetWorkoutData;

WorkoutService.processRows = processWorkoutRows;

WorkoutService.finishLoad = finishWorkoutLoad;

WorkoutService.calculateWorkoutTime = calculateWorkoutTime;

WorkoutService.calculateWarmupTime = calculateWarmupTime;

WorkoutService.calculateCooldownTime = calculateCooldownTime;

WorkoutService.getDressDuration = getDressDuration;

WorkoutService.getStretchDuration = getStretchDuration;

WorkoutService.getWorkDuration = getWorkDuration;

WorkoutService.getRotateDuration = getRotateDuration;

WorkoutService.getBreakDuration = getBreakDuration;

WorkoutService.getCooldownDuration = getCooldownDuration;

WorkoutService.getPhaseDuration = getPhaseDuration;

WorkoutService.getNextSetIndex = getNextSetIndex;

WorkoutService.preloadFirstSet = preloadFirstSet;

WorkoutService.logWorkoutLoad = logWorkoutLoad;

WorkoutService.logWorkoutSummary = logWorkoutSummary;

WorkoutService.isEffectivelyBlankRow = isEffectivelyBlankRow;

WorkoutService.resetState = resetState;

WorkoutService.restoreWorkoutState = restoreWorkoutState;

WorkoutService.loadSetData = loadSetData;