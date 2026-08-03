window.ScheduleService = window.ScheduleService || {};
const ScheduleService = window.ScheduleService;

const S = window.TimerState;


const DAY_KEYS = Object.freeze([
    null,
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday"
]);

// ========================================
// SCHEDULE CONFIGURATION
// ========================================


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

    return ScheduleService.config.schedules[
        DAY_KEYS[day]
    ] ?? [];

}


function findNextScheduledClass() {

    const now = ScheduleService.getEffectiveNow();

    const today = ScheduleService.getTodaySchedule(now.getDay());

    let next = null;

    for (const timeStr of today) {

        const start =
    ScheduleService.parseTimeToToday(timeStr);

        if (start < now) continue;

        if (!next || start < next) {
            next = start;
        }

    }

    return next;

}


function resetAutoStart() {
    S.lastAutoStartMinute = null;
}


function getCurrentClass() {

    const now = ScheduleService.getEffectiveNow();

    const todaySchedule = ScheduleService.getTodaySchedule(now.getDay());

    for (const timeStr of todaySchedule) {

        const start =
    ScheduleService.parseTimeToToday(timeStr);

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

    return ScheduleService.getCurrentClass() !== null;

}


function shouldAutoStart() {

    return (
    ScheduleService.isAutoStartEnabled() &&
    ScheduleService.canRunToday() &&
    !S.isRunning
);

}


function beginScheduledWorkout(nextClass) {

    if (!nextClass) return false;

    const now = ScheduleService.getEffectiveNow();

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

    const currentClass = ScheduleService.getCurrentClass();

    if (!currentClass) {

        return 0;

    }

    return Math.floor(

        (ScheduleService.getEffectiveNow() - currentClass.start) / 1000

    );

}


function isAutoStartEnabled() {

    return ScheduleService.config.autoStart;

}


function isTodayOnly() {

    return ScheduleService.config.todayOnly;

}


function canRunToday() {

    const day = ScheduleService.getEffectiveNow().getDay();

    if (ScheduleService.isTodayOnly()) {
        return day >= 1 && day <= 5;
    }

    return true;

}


function getClassLength(day) {

    return ScheduleService.config.classLength[
        DAY_KEYS[day]
    ] ?? 45;

}


function tryStartWorkout() {

    const nextClass =
        ScheduleService.findNextScheduledClass();

    if (!ScheduleService.beginScheduledWorkout(nextClass))
        return false;

    TimerEngine.start();

    return true;

}


function autoDetectActiveClass() {

    if (!ScheduleService.isAutoStartEnabled()) return;

    if (!ScheduleService.isClassInProgress()) return;

    console.log("⚡ Class already in progress. Auto syncing timer.");

    TimerEngine.start(true);

    TimerEngine.resumeWorkout(
    ScheduleService.getElapsedClassSeconds()
);

}


function applyDaySpecificClassLength() {

    const day = ScheduleService.getEffectiveNow().getDay();

    S.classBlockLength =
    ScheduleService.getClassLength(day) * 60;

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

        if (!ScheduleService.shouldAutoStart()) return;

        tryStartWorkout();

    }, 1000);

}


function checkAutoStart() {

    ScheduleService.applyDaySpecificClassLength();

if (!ScheduleService.shouldAutoStart()) return;

tryStartWorkout();

}


function parseTimeToToday(timeStr) {
    const [h, m] = timeStr.split(":").map(Number);

    const now = ScheduleService.getEffectiveNow();

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

ScheduleService.resetAutoStart = resetAutoStart;
ScheduleService.getElapsedClassSeconds = getElapsedClassSeconds;
ScheduleService.applyDaySpecificClassLength = applyDaySpecificClassLength;
ScheduleService.startAutoScheduler = startAutoScheduler;
ScheduleService.checkAutoStart = checkAutoStart;
ScheduleService.autoDetectActiveClass = autoDetectActiveClass;
ScheduleService.getEffectiveNow = getEffectiveNow;