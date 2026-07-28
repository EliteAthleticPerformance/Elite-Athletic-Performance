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

    workoutData.length = 0;

    autoStartEnabled = false;

    monTimes = [];
    tueTimes = [];
    wedTimes = [];
    thurTimes = [];
    friTimes = [];

}


async function loadWorkout() {

    console.log(
        "🚀 loadWorkout started",
        new Date().toLocaleTimeString()
    );

    try {

        const school = window.APP_CONFIG.key;

        const response = await fetch(
            `${window.APP_CONFIG.dataURL}?type=workout&school=${school}`
        );

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const text = await response.text();

        console.log("CSV length:", text.length);

        const rows = parseCSV(text);

        console.log("Row 0:", rows[0]);
        console.log("Row 0 first cell:", rows[0][0]);
        console.log("Row 0 second cell:", rows[0][1]);

        const DEBUG = true;

        if (DEBUG) {
            console.log("CSV preview:", text.slice(0, 200));
            console.log("First rows:", rows.slice(0, 10));
        }

        console.log("Rows parsed:", rows.length);
        console.log("First 10 rows:", rows.slice(0, 10));

        resetWorkoutData();

        processWorkoutRows(rows);

        console.log("✅ Workout rows:", workoutData.length);
        console.log("✅ Auto start:", autoStartEnabled);

        console.log("📅 Monday:", mondayMinutes);
        console.log("📅 Tuesday:", tuesdayMinutes);
        console.log("📅 Wednesday:", wednesdayMinutes);
        console.log("📅 Thursday:", thursdayMinutes);
        console.log("📅 Friday:", fridayMinutes);

        console.log("🕒 Monday Times:", monTimes);
        console.log("🕒 Tuesday Times:", tueTimes);
        console.log("🕒 Wednesday Times:", wedTimes);
        console.log("🕒 Thursday Times:", thurTimes);
        console.log("🕒 Friday Times:", friTimes);

        finishWorkoutLoad();

    } catch (err) {

        console.error("❌ Failed to load workout:", err);

    }

}


function handleServerTimeRow(firstCell, r, clean) {

    if (firstCell !== "server_time") {
        return false;
    }

    window.serverTime = clean(r[1]);

    console.log("🕒 Server time:", window.serverTime);

    return true;
}

function handleBreakRow(firstCell, r) {

    if (!r || r.length === 0) {

        workoutData.push({
            type: "break",
            breakSec: breakDuration
        });

        console.log("📥 Empty CSV row → break inserted");

        return true;
    }

    if (isEffectivelyBlankRow(r)) {

        workoutData.push({
            type: "break",
            breakSec: breakDuration
        });

        return true;
    }

    if (firstCell.replace(/\s+/g, "") === "break") {

        const breakSec =
            parseSheetNumber(r[10], breakDuration);

        workoutData.push({
            type: "break",
            breakSec
        });

        console.log("📥 Explicit break parsed:", breakSec);

        return true;
    }

    return false;
}


function handleConfigRow(firstCell, r, clean) {

    if (firstCell === "auto_start") {
        autoStartEnabled = clean(r[1]).toLowerCase() === "true";
        return true;
    }

    if (firstCell === "today_only") {
        todayOnlyMode = clean(r[1]).toLowerCase() === "true";
        return true;
    }

    if (firstCell === "force_date") {
        forceDateString = clean(r[1]) || null;
        return true;
    }

    return false;
}


function handleClassLengthRow(firstCell, r) {

    if (firstCell === "monday_minutes") {
        const v = parseSheetNumber(r[1]);
        if (v !== null) mondayMinutes = v;
        return true;
    }

    if (firstCell === "tuesday_minutes") {
        const v = parseSheetNumber(r[1]);
        if (v !== null) tuesdayMinutes = v;
        return true;
    }

    if (firstCell === "wednesday_minutes") {
        const v = parseSheetNumber(r[1]);
        if (v !== null) wednesdayMinutes = v;
        return true;
    }

    if (firstCell === "thursday_minutes") {
        const v = parseSheetNumber(r[1]);
        if (v !== null) thursdayMinutes = v;
        return true;
    }

    if (firstCell === "friday_minutes") {
        const v = parseSheetNumber(r[1]);
        if (v !== null) fridayMinutes = v;
        return true;
    }

    return false;
}


function handleScheduleRow(firstCell, r, clean) {

    if (firstCell === "monday_times") {
        monTimes = r.slice(1).map(clean).filter(Boolean);
        console.log("📅 Monday Schedule:", monTimes);
        return true;
    }

    if (firstCell === "tuesday_times") {
        tueTimes = r.slice(1).map(clean).filter(Boolean);
        console.log("📅 Tuesday Schedule:", tueTimes);
        return true;
    }

    if (firstCell === "wednesday_times") {
        wedTimes = r.slice(1).map(clean).filter(Boolean);
        console.log("📅 Wednesday Schedule:", wedTimes);
        return true;
    }

    if (firstCell === "thursday_times") {
        thurTimes = r.slice(1).map(clean).filter(Boolean);
        console.log("📅 Thursday Schedule:", thurTimes);
        return true;
    }

    if (firstCell === "friday_times") {
        friTimes = r.slice(1).map(clean).filter(Boolean);
        console.log("📅 Friday Schedule:", friTimes);
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
            dressOutDuration = v;
            console.log("📥 Dress time:", dressOutDuration);
        }

        return true;
    }

    if (firstCell === "stretch_seconds") {
        const v = parseSheetNumber(r[1]);

        if (v !== null) {
            dynamicStretchDuration = v;
            console.log("📥 Stretch time:", dynamicStretchDuration);
        }

        return true;
    }

    if (firstCell === "work_seconds") {
        const v = parseSheetNumber(r[1]);

        if (v !== null) {
            sheetWorkDuration = v;
            console.log("📥 Work time:", sheetWorkDuration);
        }

        return true;
    }

    if (firstCell === "rotate_seconds") {
        const v = parseSheetNumber(r[1]);

        if (v !== null) {
            sheetRotateDuration = v;
            console.log("📥 Rotate time:", sheetRotateDuration);
        }

        return true;
    }

    if (firstCell === "break_seconds") {
        const v = parseSheetNumber(r[1]);

        if (v !== null) {
            breakDuration = v;
            console.log("📥 Break time:", breakDuration);
        }

        return true;
    }

    return false;
}


function handleWorkoutSetRow(firstRaw, firstCell, r, clean) {

    const looksLikeSetNumber =
        /^\d+$/.test(firstCell) ||
        /^\d+\.$/.test(firstCell) ||
        /^set\s*\d*$/i.test(firstRaw);

    if (!looksLikeSetNumber) {
        return false;
    }

    const workSec = parseSheetNumber(r[8]);
    const rotateSec = parseSheetNumber(r[9]);
    const breakSec = parseSheetNumber(r[10], breakDuration);

    workoutData.push({
        type: "set",
        core: clean(r[1]),
        percent: clean(r[2]),
        reps: clean(r[3]),
        aux: clean(r[4]),
        auxReps: clean(r[5]),
        move: clean(r[6]),
        moveReps: clean(r[7]),
        workSec,
        rotateSec,
        breakSec
    });

    return true;
}

    
function processWorkoutRows(rows) {

    const clean = v =>
        String(v || "")
            .replace(/\u00A0/g, "")
            .replace(/\r/g, "")
            .trim();

    for (const r of rows) {

        const firstRaw = clean(r[0] ?? "");
        const firstCell = firstRaw.toLowerCase();

        if (firstCell === "set" || firstCell === "sets") {
            continue;
        }
        
        if (handleServerTimeRow(firstCell, r, clean)) {
            continue;
        }

        if (handleBreakRow(firstCell, r)) {
            continue;
        }
        

    /* =================================================
       CONFIG FLAGS
    ================================================= */

    if (handleConfigRow(firstCell, r, clean)) {
    continue;
}

    /* ---------- CLASS LENGTH BY DAY ---------- */

    if (handleClassLengthRow(firstCell, r)) {
    continue;
}


    /* ---------- SCHEDULE TIMES ---------- */

if (handleScheduleRow(firstCell, r, clean)) {
    continue;
}

    /* ---------- GLOBAL TIMINGS ---------- */

   if (handleTimingRow(firstCell, r)) {
    continue;
}
        
    
    if (handleWorkoutSetRow(firstRaw, firstCell, r, clean)) {
    continue;
}
        }

}

function preloadFirstSet() {
    if (!workoutData.length) return;
    loadSetData(1);
}


function finishWorkoutLoad() {

    preloadFirstSet();

    applyDaySpecificClassLength();

    syncClockOffset();

    startAutoScheduler();

    const planned = calculateTotalTime();
    const finalTotal = Math.min(planned, classBlockLength);

    totalSeconds = finalTotal;
    originalTotalSeconds = finalTotal;

    updateTotalDisplay();

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


function calculateTotalTime() {

    if (!workoutData.length) {
    console.warn("Workout still loading...");
    return classBlockLength;
}

    const work = getWorkDuration();
const rest = getRestDuration();

    let prepTotal = 0;
    let workoutTotal = 0;
    let breakTotal = 0;

    /* ---------- PREP ---------- */
    prepTotal += Number(dressOutDuration) || 0;
prepTotal += Number(dynamicStretchDuration) || 0;

    /* ---------- WORKOUT ---------- */
    window.workoutData.forEach(item => {

        if (item.type === "set") {

            for (let i = 0; i < maxRotations; i++) {
                workoutTotal += work;

                if (i < maxRotations - 1) {
                    workoutTotal += rest;
                }
            }
        }

        if (item.type === "break") {
            breakTotal += item.breakSec || breakDuration;
        }

    });

   /* ---------- TOTAL WORKOUT BEFORE COOLDOWN ---------- */
    const workoutBlock = prepTotal + workoutTotal + breakTotal;

   /* ---------- COOLDOWN CALCULATION ---------- */
    cooldownDuration = Math.max(
        classBlockLength - workoutBlock,
        0
    );

    console.log("Cooldown calculated:", cooldownDuration);

   /* ---------- FINAL TOTAL (ALWAYS CLASS LENGTH) ---------- */
    return classBlockLength;
}




