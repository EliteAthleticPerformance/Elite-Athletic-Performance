// ========================================
// SCHEDULE HELPERS
// ========================================

function getTodaySchedule(day) {
    switch (day) {
        case 1: return monTimes;
        case 2: return tueTimes;
        case 3: return wedTimes;
        case 4: return thurTimes;
        case 5: return friTimes;
        default: return [];
    }
}


function autoDetectActiveClass() {

    // ✅ FIXED (allow sync even if already running)
    if (!autoStartEnabled) return;

    const now = getEffectiveNow();
    const day = now.getDay();
    const todaySchedule = getTodaySchedule(day);

    for (const timeStr of todaySchedule) {

        if (!timeStr || !timeStr.includes(":")) continue;

        const [h, m] = timeStr.split(":").map(Number);

        const start = new Date(now);
        start.setHours(h, m, 0, 0);

        const end = new Date(start.getTime() + classBlockLength * 1000);

        if (now >= start && now < end) {

            console.log("⚡ Class already in progress. Auto syncing timer.");

startTimer();

const elapsed = Math.floor((now - start) / 1000);

startTimer(true);

resumeWorkout(elapsed);

break;
        }
    }
}


function applyDaySpecificClassLength() {

    const day = getEffectiveNow().getDay();

    switch (day) {

        case 1:
            classBlockLength = mondayMinutes * 60;
            break;

        case 2:
            classBlockLength = tuesdayMinutes * 60;
            break;

        case 3:
            classBlockLength = wednesdayMinutes * 60;
            break;

        case 4:
            classBlockLength = thursdayMinutes * 60;
            break;

        case 5:
            classBlockLength = fridayMinutes * 60;
            break;

        default:
            classBlockLength = 45 * 60;
    }

    console.log("📏 Class length:", classBlockLength);
}


function startAutoScheduler() {

    if (autoStartTimer) {
        clearInterval(autoStartTimer);
    }

    autoStartTimer = setInterval(() => {

        if (!autoStartEnabled) return;

        const now = getEffectiveNow();
const day = now.getDay(); // 0=Sun, 1=Mon...

if (todayOnlyMode && (day === 0 || day === 6)) {
    return;
}

if (isRunning) return;

const todaySchedule = getTodaySchedule(day);

        classBlockLength = calculateTotalTime();

        for (const timeStr of todaySchedule) {

            const parts = timeStr.split(":");
            if (parts.length !== 2) continue;

            const targetHour = parseInt(parts[0], 10);
            const targetMinute = parseInt(parts[1], 10);

            if (isNaN(targetHour) || isNaN(targetMinute)) continue;

            // start within first 5 seconds of the minute
            const currentMinuteStamp =
                String(now.getHours()).padStart(2, "0") + ":" +
                String(now.getMinutes()).padStart(2, "0");

            const currentTotalSeconds =
                now.getHours() * 3600 +
                now.getMinutes() * 60 +
                now.getSeconds();

            const targetTotalSeconds =
                targetHour * 3600 +
                targetMinute * 60;

            if (
                currentTotalSeconds >= targetTotalSeconds &&
                currentTotalSeconds < targetTotalSeconds + 5 &&
                lastAutoStartMinute !== currentMinuteStamp
            ) {
                lastAutoStartMinute = currentMinuteStamp;

                console.log("🔔 Auto starting:", timeStr);
                startTimer();
                break;
            }
        }

    }, 1000);
}


function checkAutoStart() {

  if (window.workoutData?.length) {
    classBlockLength = calculateTotalTime();
}

    if (!autoStartEnabled) return;
    if (isRunning) return;

   const now = getEffectiveNow();
    const day = now.getDay();

    if (todayOnlyMode && (day === 0 || day === 6)) {
    return;
}

    if (!bestStart) return;

    // 🔥 prevent restarting same session
    if (window.lastStartTime &&
        Math.abs(window.lastStartTime - bestStart.getTime()) < 60000) {
        return;
    }

    console.log("🔥 AUTO START (ABSOLUTE):", bestStart);

    window.classStartTime = bestStart.getTime();
    window.lastStartTime = bestStart.getTime();

    startTimer();
}


function parseTimeToToday(timeStr) {
    const [h, m] = timeStr.split(":").map(Number);

    const now = getEffectiveNow();

    return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        h,
        m,
        0
    );
}


function getEffectiveNow() {

    // ⭐ FORCE_DATE override (LOCAL TIME SAFE)
    if (forceDateString) {
        const parts = forceDateString.split(/[T:\-]/);

        if (parts.length >= 6) {
            const forced = new Date(
                Number(parts[0]),     // year
                Number(parts[1]) - 1, // month
                Number(parts[2]),     // day
                Number(parts[3]),     // hour
                Number(parts[4]),     // minute
                Number(parts[5])      // second
            );

            // ✅ FIXED (proper Date validation)
            if (!isNaN(forced.getTime())) return forced;
        }
    }

    return new Date();
}


// ========================================
// GLOBAL EXPORTS
// ========================================

window.applyDaySpecificClassLength = applyDaySpecificClassLength;
window.checkAutoStart = checkAutoStart;
window.startAutoScheduler = startAutoScheduler;
window.autoDetectActiveClass = autoDetectActiveClass;
window.parseTimeToToday = parseTimeToToday;
window.getEffectiveNow = getEffectiveNow;
window.getWorkoutState = getWorkoutState;
window.resumeWorkout = resumeWorkout;