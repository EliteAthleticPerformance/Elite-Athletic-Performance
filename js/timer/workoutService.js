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


async function loadWorkout() {
    console.log(
    "🚀 loadWorkout started",
    new Date().toLocaleTimeString()
);

     debugger;

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
        console.log("CSV preview:", text.slice(0,200));
        console.log("First rows:", rows.slice(0,10));
        }
        console.log("Rows parsed:", rows.length);
        

        console.log("First 10 rows:", rows.slice(0, 10));

        /* =============================
           RESET GLOBALS
        ============================= */
        workoutData.length = 0;
        autoStartEnabled = false;
        monTimes = [];
tueTimes = [];
wedTimes = [];
thurTimes = [];
friTimes = [];

        const clean = v =>
            String(v || "")
                .replace(/\u00A0/g, "")
                .replace(/\r/g, "")
                .trim();

      
       /* =============================
   PROCESS ROWS
============================= */
for (const r of rows) {

    // ---------- TRUE EMPTY ROW ----------
    if (!r || r.length === 0) {
        workoutData.push({
            type: "break",
            breakSec: breakDuration
        });
        console.log("📥 Empty CSV row → break inserted");
        continue;
    }

    const firstRaw = clean(r[0] ?? "");
    const firstCell = firstRaw.toLowerCase();

    // ---------- SERVER TIME ----------

if (firstCell === "server_time") {

    window.serverTime = clean(r[1]);

    console.log("🕒 Server time:", window.serverTime);

    continue;
}

    // ---------- BULLETPROOF BLANK ROW ----------
    if (isEffectivelyBlankRow(r)) {
        workoutData.push({
            type: "break",
            breakSec: breakDuration
        });
        continue;
    }

    // ---------- EXPLICIT BREAK ----------
    if (firstCell.replace(/\s+/g, "") === "break") {
        const breakSec = parseSheetNumber(r[10], breakDuration);

        workoutData.push({
            type: "break",
            breakSec
        });

        console.log("📥 Explicit break parsed:", breakSec);
        continue;
    }

    // ---------- HEADER SKIP ----------
    if (firstCell === "set" || firstCell === "sets") continue;

    /* =================================================
       CONFIG FLAGS
    ================================================= */

    if (firstCell === "auto_start") {
        autoStartEnabled = clean(r[1]).toLowerCase() === "true";
        continue;
    }

    if (firstCell === "today_only") {
        todayOnlyMode = clean(r[1]).toLowerCase() === "true";
        continue;
    }

    if (firstCell === "force_date") {
        forceDateString = clean(r[1]) || null;
        continue;
    }

    /* ---------- CLASS LENGTH BY DAY ---------- */

    if (firstCell === "monday_minutes") {
        const v = parseSheetNumber(r[1]);
        if (v !== null) mondayMinutes = v;
        continue;
    }

    if (firstCell === "tuewed_minutes") {
        const v = parseSheetNumber(r[1]);
        if (v !== null) tueWedMinutes = v;
        continue;
    }

    if (firstCell === "thufri_minutes") {
        const v = parseSheetNumber(r[1]);
        if (v !== null) thuFriMinutes = v;
        continue;
    }

    /* ---------- SCHEDULE TIMES ---------- */

    if (firstCell === "monday_times") {
        monTimes = clean(r[1] || "")
            .split(",")
            .map(s => s.trim())
            .filter(Boolean);
        continue;
    }

    if (firstCell === "tuesday_times") {
        tueTimes = clean(r[1] || "")
            .split(",")
            .map(s => s.trim())
            .filter(Boolean);
        continue;
    }

   if (firstCell === "wednesday_times") {
        wedTimes = clean(r[1] || "")
            .split(",")
            .map(s => s.trim())
            .filter(Boolean);
        continue;
    }

    if (firstCell === "thursday_times") {
        thurTimes = clean(r[1] || "")
            .split(",")
            .map(s => s.trim())
            .filter(Boolean);
        continue;
    }

   if (firstCell === "friday_times") {
        friTimes = clean(r[1] || "")
            .split(",")
            .map(s => s.trim())
            .filter(Boolean);
        continue;
    }

    /* ---------- GLOBAL TIMINGS ---------- */

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
        continue;
    }

    if (firstCell === "stretch_seconds") {
        const v = parseSheetNumber(r[1]);
        if (v !== null) {
            dynamicStretchDuration = v;
            console.log("📥 Stretch time:", dynamicStretchDuration);
        }
        continue;
    }

    if (firstCell === "break_seconds") {
        const v = parseSheetNumber(r[1]);
        if (v !== null) breakDuration = v;
        continue;
    }
        
    
    const looksLikeSetNumber =
    /^\d+$/.test(firstCell) ||
    /^\d+\.$/.test(firstCell) ||
    /^set\s*\d*$/i.test(firstRaw);

if (looksLikeSetNumber) {

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

    continue;
}
        }

        console.log("✅ Workout rows:", workoutData.length);
        console.log("✅ Auto start:", autoStartEnabled);

preloadFirstSet();

applyDaySpecificClassLength();

syncClockOffset();

startAutoScheduler();

const planned = calculateTotalTime();
const finalTotal = Math.min(planned, classBlockLength);

totalSeconds = finalTotal;
originalTotalSeconds = finalTotal;

updateTotalDisplay();

    } catch (err) {
        console.error("❌ Failed to load workout:", err);
    }
}

function preloadFirstSet() {
    if (!workoutData.length) return;
    loadSetData(1);
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

    const work = parseInt(document.getElementById("workTime").value, 10) || 0;
    const rest = parseInt(document.getElementById("restTime").value, 10) || 0;

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




