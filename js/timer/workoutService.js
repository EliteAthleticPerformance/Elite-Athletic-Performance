const S = window.TimerState;


// ========================================
// WORKOUT CONFIGURATION
// Loaded from Google Sheets
// ========================================

window.WorkoutService = window.WorkoutService || {};

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

    ScheduleService.config.autoStart = false;

    ScheduleService.config.schedules.monday = [];
    ScheduleService.config.schedules.tuesday = [];
    ScheduleService.config.schedules.wednesday = [];
    ScheduleService.config.schedules.thursday = [];
    ScheduleService.config.schedules.friday = [];

}


async function fetchWorkoutRows() {

    const school = window.APP_CONFIG.key;

    const response = await fetch(
        `${window.APP_CONFIG.dataURL}?type=workout&school=${school}`
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

    console.log(
        "✅ Auto Start:",
        ScheduleService.config.autoStart
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
    }

    if (firstCell === "force_date") {
        S.forceDateString = cleanCell(r[1]) || null;
        return true;
    }

    return false;
}


function handleClassLengthRow(firstCell, r) {

    if (firstCell === "monday_minutes") {
        const v = parseSheetNumber(r[1]);
        if (v !== null) ScheduleService.config.classLength.monday = v;

        return true;
    }

    if (firstCell === "tuesday_minutes") {
        const v = parseSheetNumber(r[1]);
        if (v !== null) ScheduleService.config.classLength.tuesday = v;

        return true;
    }

    if (firstCell === "wednesday_minutes") {
        const v = parseSheetNumber(r[1]);
        if (v !== null) ScheduleService.config.classLength.wednesday = v;

        return true;
    }

    if (firstCell === "thursday_minutes") {
        const v = parseSheetNumber(r[1]);
        if (v !== null) ScheduleService.config.classLength.thursday = v;

        return true;
    }

    if (firstCell === "friday_minutes") {
        const v = parseSheetNumber(r[1]);
        if (v !== null) ScheduleService.config.classLength.friday = v;

        return true;
    }

    return false;
}


function handleScheduleRow(firstCell, r) {

    if (firstCell === "monday_times") {
        ScheduleService.config.schedules.monday =
        r.slice(1)
        .map(cleanCell)
        .filter(Boolean);
        console.log(
    "📅 Monday Schedule:",
    ScheduleService.config.schedules.monday
);
        return true;
    }

    if (firstCell === "tuesday_times") {
        ScheduleService.config.schedules.tuesday =
        r.slice(1)
        .map(cleanCell)
        .filter(Boolean);
        console.log(
    "📅 Tuesday Schedule:",
    ScheduleService.config.schedules.tuesday
);
        return true;
    }

    if (firstCell === "wednesday_times") {
        ScheduleService.config.schedules.wednesday =
        r.slice(1)
        .map(cleanCell)
        .filter(Boolean);
        console.log(
    "📅 Wednesday Schedule:",
    ScheduleService.config.schedules.wednesday
);
        return true;
    }

    if (firstCell === "thursday_times") {
        ScheduleService.config.schedules.thursday =
        r.slice(1)
        .map(cleanCell)
        .filter(Boolean);
        console.log(
    "📅 Thursday Schedule:",
    ScheduleService.config.schedules.thursday
);
        return true;
    }

    if (firstCell === "friday_times") {
        ScheduleService.config.schedules.friday =
        r.slice(1)
        .map(cleanCell)
        .filter(Boolean);
        console.log(
    "📅 Friday Schedule:",
    ScheduleService.config.schedules.friday
);
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

function getWorkDuration() {
    return WorkoutService.config.workSeconds;
}

function getRotateDuration() {
    return WorkoutService.config.rotateSeconds;
}

function getBreakDuration() {
    return WorkoutService.config.breakSeconds;
}

function getCooldownDuration() {
    return WorkoutService.config.cooldownSeconds;
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

    applyDaySpecificClassLength();

    syncClockOffset();

    startAutoScheduler();

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

    const work = getWorkDuration();
    const rotate = getRotateDuration();

    let workoutTotal = 0;
    let breakTotal = 0;

    S.workoutData.forEach(item => {

        if (item.type === "set") {

            for (let i = 0; i < WorkoutService.config.maxRotations; i++) {

                workoutTotal += work;

                if (i < WorkoutService.config.maxRotations - 1) {
                    workoutTotal += rotate;
                }

            }

        }

        if (item.type === "break") {

            breakTotal +=
                item.breakSec ||
                getBreakDuration();

        }

    });

    return workoutTotal + breakTotal;

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


function prepareWorkoutSession() {

    resetWorkoutState();

     S.lastAutoStartMinute = null;

     preloadFirstSet();

     transitionToPhase(
    TIMER_PHASES.DRESS,
    getPhaseDuration(TIMER_PHASES.DRESS)
);

}


const PhaseDurationGetters = {

    [TIMER_PHASES.DRESS]: getDressDuration,

    [TIMER_PHASES.STRETCH]: getStretchDuration,

    [TIMER_PHASES.WORK]: getWorkDuration,

    [TIMER_PHASES.ROTATE]: getRotateDuration,

    [TIMER_PHASES.BREAK]: getBreakDuration,

    [TIMER_PHASES.COOLDOWN]: getCooldownDuration

};


function getPhaseDuration(phase) {

    const getter = PhaseDurationGetters[phase];

    if (!getter) {

        console.warn("Unknown phase:", phase);

        return 0;

    }

    return getter();

}



window.getDressDuration = getDressDuration;
window.getStretchDuration = getStretchDuration;
window.getWorkDuration = getWorkDuration;
window.getRotateDuration = getRotateDuration;
window.getBreakDuration = getBreakDuration;
window.getCooldownDuration = getCooldownDuration;
window.prepareWorkoutSession = prepareWorkoutSession;
window.getPhaseDuration = getPhaseDuration;




