(() => {


// ========================================
// SCHEDULE SERVICE
// ========================================

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
// CONFIGURATION
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
// HELPERS
// ========================================

function getTodaySchedule(day) {

    return (
        ScheduleService.config.schedules[
            DAY_KEYS[day]
        ] ?? []
    );

}


function parseTimeToToday(timeStr) {

    const [hour, minute] =
        timeStr.split(":").map(Number);

    const now =
        ScheduleService.getEffectiveNow();

    return new Date(

        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hour,
        minute,
        0

    );

}


function getEffectiveNow() {

    if (S.forceDateString) {

        const parts =
            S.forceDateString.split(/[T:\-]/);

        if (parts.length >= 6) {

            const forced = new Date(

                Number(parts[0]),
                Number(parts[1]) - 1,
                Number(parts[2]),
                Number(parts[3]),
                Number(parts[4]),
                Number(parts[5])

            );

            if (!isNaN(forced.getTime())) {
                return forced;
            }

        }

    }

    return new Date();

}


function getClassLength(day) {

    return (

        ScheduleService.config.classLength[
            DAY_KEYS[day]
        ] ?? 45

    );

}


// ========================================
// CURRENT CLASS
// ========================================

function getCurrentClass() {

    const now =
        ScheduleService.getEffectiveNow();

    const schedule =
        getTodaySchedule(now.getDay());

    for (const timeStr of schedule) {

        const start =
            parseTimeToToday(timeStr);

        const end = new Date(

            start.getTime() +
            (S.classBlockLength * 1000)

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


function getElapsedClassSeconds() {

    const current =
        getCurrentClass();

    if (!current) return 0;

    return Math.floor(

        (
            ScheduleService.getEffectiveNow() -
            current.start
        ) / 1000

    );

}


// ========================================
// AUTO START
// ========================================

function isAutoStartEnabled() {

    return ScheduleService.config.autoStart;

}


function isTodayOnly() {

    return ScheduleService.config.todayOnly;

}


function canRunToday() {

    const day =
        ScheduleService.getEffectiveNow().getDay();

    if (isTodayOnly()) {

        return day >= 1 && day <= 5;

    }

    return true;

}


function shouldAutoStart() {

    return (

        isAutoStartEnabled() &&
        canRunToday() &&
        !S.isRunning

    );

}


function findNextScheduledClass() {

    const now =
        ScheduleService.getEffectiveNow();

    const schedule =
        getTodaySchedule(now.getDay());

    let next = null;

    for (const timeStr of schedule) {

        const start =
            parseTimeToToday(timeStr);

        if (start < now) continue;

        if (!next || start < next) {

            next = start;

        }

    }

    return next;

}


function beginScheduledWorkout(nextClass) {

    if (!nextClass) return false;

    const now =
        ScheduleService.getEffectiveNow();

    if (

        Math.abs(
            now.getTime() -
            nextClass.getTime()
        ) > 5000

    ) {

        return false;

    }

    if (

        S.lastAutoStartMinute ===
        nextClass.toISOString()

    ) {

        return false;

    }

    if (

        S.lastStartTime &&
        Math.abs(
            S.lastStartTime -
            nextClass.getTime()
        ) < 60000

    ) {

        return false;

    }

    S.lastAutoStartMinute =
        nextClass.toISOString();

    S.classStartTime =
        nextClass.getTime();

    S.lastStartTime =
        nextClass.getTime();

    return true;

}


function tryStartWorkout() {

    const nextClass =
        findNextScheduledClass();

    if (!beginScheduledWorkout(nextClass)) {
        return false;
    }

    TimerEngine.start();

    return true;

}


function autoDetectActiveClass() {

    if (!isAutoStartEnabled()) return;

    if (!isClassInProgress()) return;

    TimerEngine.start(true);

    TimerEngine.resumeWorkout(

        getElapsedClassSeconds()

    );

}


function applyDaySpecificClassLength() {

    const day =
        ScheduleService.getEffectiveNow().getDay();

    S.classBlockLength =
        getClassLength(day) * 60;

}


function startAutoScheduler() {

    if (S.autoStartTimer) {

        clearInterval(S.autoStartTimer);

    }

    S.autoStartTimer = setInterval(() => {

        if (!shouldAutoStart()) return;

        tryStartWorkout();

    }, 1000);

}


function checkAutoStart() {

    applyDaySpecificClassLength();

    if (!shouldAutoStart()) return;

    tryStartWorkout();

}


function resetAutoStart() {

    S.lastAutoStartMinute = null;

}


// ========================================
// PUBLIC API
// ========================================

ScheduleService.getTodaySchedule = getTodaySchedule;
ScheduleService.getCurrentClass = getCurrentClass;
ScheduleService.getElapsedClassSeconds = getElapsedClassSeconds;

ScheduleService.getEffectiveNow = getEffectiveNow;

ScheduleService.getClassLength = getClassLength;

ScheduleService.applyDaySpecificClassLength =
    applyDaySpecificClassLength;

ScheduleService.autoDetectActiveClass =
    autoDetectActiveClass;

ScheduleService.startAutoScheduler =
    startAutoScheduler;

ScheduleService.checkAutoStart =
    checkAutoStart;

ScheduleService.resetAutoStart =
    resetAutoStart;

ScheduleService.isAutoStartEnabled =
    isAutoStartEnabled;

ScheduleService.isTodayOnly =
    isTodayOnly;

ScheduleService.canRunToday =
    canRunToday;

ScheduleService.shouldAutoStart =
    shouldAutoStart;

ScheduleService.findNextScheduledClass =
    findNextScheduledClass;

ScheduleService.beginScheduledWorkout =
    beginScheduledWorkout;

ScheduleService.parseTimeToToday =
    parseTimeToToday;


})();