const S = window.TimerState;

// ========================================
// SCHEDULE CONFIGURATION
// Loaded from Google Sheets
// ========================================

window.ScheduleService = window.ScheduleService || {};


ScheduleService.config = {

    autoStart: false,

    todayOnly: false,

    schedules: {

        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: []

    },

    classLength: {

        monday: 45,
        tuesday: 45,
        wednesday: 45,
        thursday: 45,
        friday: 45

    }

};



// ========================================
// SCHEDULE HELPERS
// ========================================

function getTodaySchedule(day) {

    switch (day) {

        case 1:
            return ScheduleService.config.schedules.monday;

        case 2:
            return ScheduleService.config.schedules.tuesday;

        case 3:
            return ScheduleService.config.schedules.wednesday;

        case 4:
            return ScheduleService.config.schedules.thursday;

        case 5:
            return ScheduleService.config.schedules.friday;

        default:
            return [];

    }

}


function findNextScheduledClass() {

    const now = getEffectiveNow();

    const today = getTodaySchedule(now.getDay());

    let next = null;

    for (const timeStr of today) {

        const start = parseTimeToToday(timeStr);

        if (start < now) continue;

        if (!next || start < next) {
            next = start;
        }

    }

    return next;

}


function getCurrentClass() {

    const now = getEffectiveNow();

    const todaySchedule = getTodaySchedule(now.getDay());

    for (const timeStr of todaySchedule) {

        const start = parseTimeToToday(timeStr);

        const end = new Date(
            start.getTime() + S.classBlockLength * 1000
        );

        if (now >= start && now < end) {

            return {

                start,

                end,

                startTime: timeStr

            };

        }

    }

    return null;

}


function isClassInProgress() {

    return getCurrentClass() !== null;

}


function shouldAutoStart() {

    return (
        isAutoStartEnabled() &&
        canRunToday() &&
        !S.isRunning
    );

}


function beginScheduledWorkout(nextClass) {

    if (!nextClass) return false;

    const now = getEffectiveNow();

    if (Math.abs(now.getTime() - nextClass.getTime()) > 5000) {
        return false;
    }

    if (S.lastAutoStartMinute === nextClass.toISOString()) {
        return false;
    }

    if (
        S.lastStartTime &&
        Math.abs(S.lastStartTime - nextClass.getTime()) < 60000
    ) {
        return false;
    }

    S.lastAutoStartMinute = nextClass.toISOString();

    S.classStartTime = nextClass.getTime();
    S.lastStartTime = nextClass.getTime();

    return true;
}


function getElapsedClassSeconds() {

    const currentClass = getCurrentClass();

    if (!currentClass) {

        return 0;

    }

    return Math.floor(

        (getEffectiveNow() - currentClass.start) / 1000

    );

}


function isAutoStartEnabled() {

    return ScheduleService.config.autoStart;

}


function isTodayOnly() {

    return ScheduleService.config.todayOnly;

}


function canRunToday() {

    const day = getEffectiveNow().getDay();

    if (isTodayOnly()) {
        return day >= 1 && day <= 5;
    }

    return true;

}


function getClassLength(day) {

    switch (day) {

        case 1:
            return ScheduleService.config.classLength.monday;

        case 2:
            return ScheduleService.config.classLength.tuesday;

        case 3:
            return ScheduleService.config.classLength.wednesday;

        case 4:
            return ScheduleService.config.classLength.thursday;

        case 5:
            return ScheduleService.config.classLength.friday;

        default:
            return 45;

    }

}


function autoDetectActiveClass() {

    if (!isAutoStartEnabled()) return;

    if (!isClassInProgress()) return;

    console.log("⚡ Class already in progress. Auto syncing timer.");

    startTimer(true);

    resumeWorkout(getElapsedClassSeconds());

}


function applyDaySpecificClassLength() {

    const day = getEffectiveNow().getDay();

    S.classBlockLength =
        getClassLength(day) * 60;

    console.log(
        "📏 Class length:",
        S.classBlockLength
    );
}

    

function startAutoScheduler() {

    if (S.autoStartTimer) {
        clearInterval(S.autoStartTimer);
    }

    S.autoStartTimer = setInterval(() => {

        if (!shouldAutoStart()) return;

        const nextClass = findNextScheduledClass();

        if (!nextClass) return;

        if (!beginScheduledWorkout(nextClass)) return;

    startTimer();

    }, 1000);

}


function checkAutoStart() {

    applyDaySpecificClassLength();
    calculateTotalTime();

    if (!shouldAutoStart()) return;

    const nextClass = findNextScheduledClass();

    if (!nextClass) return;

    if (!beginScheduledWorkout(nextClass)) {
    return;
}

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
    if (S.forceDateString) {
        const parts = S.forceDateString.split(/[T:\-]/);

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

window.getTodaySchedule = getTodaySchedule;
window.isAutoStartEnabled = isAutoStartEnabled;
window.isTodayOnly = isTodayOnly;
window.canRunToday = canRunToday;
window.getClassLength = getClassLength;
window.applyDaySpecificClassLength = applyDaySpecificClassLength;
window.checkAutoStart = checkAutoStart;
window.startAutoScheduler = startAutoScheduler;
window.autoDetectActiveClass = autoDetectActiveClass;
window.parseTimeToToday = parseTimeToToday;
window.getEffectiveNow = getEffectiveNow;
window.getWorkoutState = getWorkoutState;
window.resumeWorkout = resumeWorkout;
window.findNextScheduledClass = findNextScheduledClass;
window.getCurrentClass = getCurrentClass;
window.isClassInProgress = isClassInProgress;
window.getElapsedClassSeconds = getElapsedClassSeconds;
window.shouldAutoStart = shouldAutoStart;
window.beginScheduledWorkout = beginScheduledWorkout;