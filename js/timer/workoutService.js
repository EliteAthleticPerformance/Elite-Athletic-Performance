(() => {

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


function loadSetData(rowIndex) {

    const workout = S.workoutData[rowIndex];

    if (!workout || workout.type !== "set") {
        return;
    }

    PreviewService.renderSetData(workout);

}


/* ======================================================
   WORK DURATION (seconds)
====================================================== */

function getWorkDuration(item = null) {

    // Default to current workout item
    if (!item) {
        item = S.workoutData[S.currentSet];
    }

    // Per-set override
    if (item?.workSec != null) {
        return item.workSec;
    }

    // Sheet/global configuration
    if (S.sheetWorkDuration != null) {
        return S.sheetWorkDuration;
    }

    // Final fallback
    return WorkoutService.config.workSeconds;

}


function getRotateDuration(item = null) {

    if (!item) {
        item = S.workoutData[S.currentSet];
    }

    if (item?.rotateSec != null) {
        return item.rotateSec;
    }

    if (S.sheetRotateDuration != null) {
        return S.sheetRotateDuration;
    }

    return WorkoutService.config.rotateSeconds;

}





/* ======================================================
   RESET WORKOUT POSITION
====================================================== */

function resetWorkoutPosition() {

    S.currentSet = 0;
    S.displaySetNumber = 1;
    S.rotationCount = 0;
}


function refreshWorkoutPosition() {

    TimerUI.applyRotationState(S.rotationCount);

    if (S.workoutData[S.currentSet]?.type === "set") {
    WorkoutService.loadSetData(S.currentSet);
}
}


/* ======================================================
   START TIMER (INITIAL RESET DEFAULTS)
====================================================== */

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


// ========================================
// PROCESS CONTROL ROWS
// ========================================

function processControlRows(rows) {

    for (const row of rows) {

        const firstCell =
            cleanCell(row[0]).toLowerCase();

        if (!firstCell.startsWith("control_")) {
            continue;
        }

        handleControlRow(
            firstCell,
            row
        );

     }

}


// ========================================
// REFRESH CONTROL STATE
// ========================================

async function refreshControlState() {

    if (!window.APP_CONFIG?.dataURL) {

        console.warn(
            "WorkoutService: dataURL unavailable."
        );

        return;

    }

    try {

        const url =
            window.APP_CONFIG.dataURL +
            "?type=workout&school=" +
            window.APP_CONFIG.key +
            "&_=" +
            Date.now();

        const response =
            await fetch(url, {
            cache: "no-store"
            });

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }

        const csv =
            await response.text();

        const rows =
            parseCSV(csv);

        processControlRows(rows);

    }

    catch (error) {

        console.error(
            "WorkoutService.refreshControlState:",
            error
        );

    }

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

    const DEBUG = true;

    if (DEBUG) {
        console.log("CSV preview:", text.slice(0, 200));
        console.log("First rows:", rows.slice(0, 10));
    }

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

    return true;
}


function handleControlRow(firstCell, r) {

    const value = cleanCell(r[1]);

    switch (firstCell) {

        case "control_action":

            S.controlAction = value;
            return true;

        case "control_timestamp":

            S.controlTimestamp = value;
            return true;

        case "control_phase":

            S.controlPhase = value;
            return true;

        case "control_set":

            S.controlSet =
                parseSheetNumber(value, 0);

            return true;

        case "control_rotation":

            S.controlRotation =
                parseSheetNumber(value, 0);

            return true;

    }

    return false;

}


function handleBreakRow(firstCell, r) {

    if (firstCell.replace(/\s+/g, "") !== "break") {
        return false;
    }

    const breakSec =
        parseSheetNumber(r[10], getBreakDuration());

    S.workoutData.push({
        type: "break",
        breakSec
    });

    return true;
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

        }

    return true;
}

    if (firstCell === "stretch_seconds") {
        const v = parseSheetNumber(r[1]);

        if (v !== null) {
            S.dynamicStretchDuration = v;
            WorkoutService.config.stretchSeconds = v;
            }

        return true;
    }

    if (firstCell === "work_seconds") {
        const v = parseSheetNumber(r[1]);

        if (v !== null) {
            S.sheetWorkDuration = v;
            WorkoutService.config.workSeconds = v;
            }

        return true;
    }

    if (firstCell === "rotate_seconds") {
        const v = parseSheetNumber(r[1]);

        if (v !== null) {
            S.sheetRotateDuration = v;
            WorkoutService.config.rotateSeconds = v;
            }

        return true;
    }

    if (firstCell === "break_seconds") {
        const v = parseSheetNumber(r[1]);

        if (v !== null) {
            S.breakDuration = v;
            WorkoutService.config.breakSeconds = v;
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


function getNextSetRow() {

    for (
        let i = S.currentSet + 1;
        i < S.workoutData.length;
        i++
    ) {

        if (S.workoutData[i].type === "set") {
            return i;
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

    (firstRaw, firstCell, row) => handleControlRow(firstCell, row),

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

    WorkoutService.loadSetData(0);

}


function finishWorkoutLoad() {

    resetWorkoutPosition();

    refreshWorkoutPosition();

    if (window.CoachService?.buildButtons) {
        CoachService.buildButtons();
    }

    console.table(
        S.workoutData.map((row, i) => ({
            index: i,
            type: row.type,
            core: row.core,
            breakSec: row.breakSec
        }))
    );

    ScheduleService.applyDaySpecificClassLength();
    
if (typeof syncClockOffset === "function") {
    syncClockOffset();
}

    const planned = calculateTotalTime();
    const finalTotal = Math.min(planned, S.classBlockLength);

    S.totalSeconds = finalTotal;
    S.originalTotalSeconds = finalTotal;

    if (window.CoachService?.applyControl) {

    CoachService.applyControl();

}

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
    S.currentSet = 0;
    S.displaySetNumber = 1;

    WorkoutService.loadSetData(S.currentSet);

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

   /* ---------- FINAL TOTAL (ALWAYS CLASS LENGTH) ---------- */
    return S.classBlockLength;
}


function resetState() {

    S.currentSet = 0;
    S.displaySetNumber = 1;
    S.rotationCount = 0;

    S.currentPhase = TIMER_PHASES.DRESS;

    S.timeLeft = WorkoutService.getDressDuration();

    S.dressWarningSpoken = false;
    S.lastCountdownSpoken = null;
}


function prepareWorkoutSession() {

    WorkoutService.resetState();

WorkoutService.preloadFirstSet();

}


function getTotalSets() {

    return S.workoutData.filter(
        item => item.type === "set"
    ).length;

}


function getPhaseDuration(phase) {

    switch (phase) {

        case TIMER_PHASES.DRESS:
            return WorkoutService.getDressDuration();

        case TIMER_PHASES.STRETCH:
            return WorkoutService.getStretchDuration();

        case TIMER_PHASES.WORK:
            return WorkoutService.getWorkDuration();

        case TIMER_PHASES.ROTATE:
            return WorkoutService.getRotateDuration();

        case TIMER_PHASES.BREAK:
            return WorkoutService.getBreakDuration();

        case TIMER_PHASES.COOLDOWN:
            return WorkoutService.getCooldownDuration();

        default:
            console.warn("Unknown phase:", phase);
            return 0;
    }
}


function advanceToNextRow() {

    S.currentSet++;

    return S.workoutData[S.currentSet] ?? null;

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

WorkoutService.getNextSetRow = getNextSetRow;

WorkoutService.preloadFirstSet = preloadFirstSet;

WorkoutService.logWorkoutLoad = logWorkoutLoad;

WorkoutService.logWorkoutSummary = logWorkoutSummary;

WorkoutService.isEffectivelyBlankRow = isEffectivelyBlankRow;

WorkoutService.resetState = resetState;

WorkoutService.restoreWorkoutState = restoreWorkoutState;

WorkoutService.refreshControlState = refreshControlState;

WorkoutService.getTotalSets = getTotalSets;

WorkoutService.refreshWorkoutPosition = refreshWorkoutPosition;

WorkoutService.loadSetData = loadSetData;

WorkoutService.advanceToNextRow = advanceToNextRow;

})();