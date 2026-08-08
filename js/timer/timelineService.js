// ========================================
// TIMELINE SERVICE
// ========================================

window.TimelineService = window.TimelineService || {};
const TimelineService = window.TimelineService;

const S = window.TimerState;

// ========================================
// CACHED UI ELEMENTS
// ========================================

const UI = {};


// ========================================
// TIMELINE HELPERS
// ========================================

function addTimelineSegment(
    phase,
    duration,
    rowIndex,
    displaySet,
    rotation = 0
) {

    S.timelineData.push({

        phase,
        duration,

        rowIndex,
        displaySet,
        rotation

    });

}


// ========================================
// CACHE UI ELEMENTS
// ========================================

function cacheElements() {

    UI.container =
        document.getElementById("timelineSegments");

}


// ========================================
// BUILD TIMELINE
// ========================================

function buildTimeline() {

    if (!S.workoutData?.length) return;

    S.timelineData = [];

    // ------------------------------------
    // Dress
    // ------------------------------------

    addTimelineSegment(
        TIMER_PHASES.DRESS,
        WorkoutService.getDressDuration(),
        0,
        1,
        0
    );

    // ------------------------------------
    // Stretch
    // ------------------------------------

    const stretchDuration =
        WorkoutService.getStretchDuration();

    if (stretchDuration > 0) {

        addTimelineSegment(
            TIMER_PHASES.STRETCH,
            stretchDuration,
            0,
            1,
            0
        );

    }

    let displaySet = 1;

    S.workoutData.forEach((item, rowIndex) => {

        if (item.type === "set") {

            for (

                let rotation = 0;

                rotation < WorkoutService.config.maxRotations;

                rotation++

            ) {

                addTimelineSegment(

                    TIMER_PHASES.WORK,

                    WorkoutService.getWorkDuration(item),

                    rowIndex,

                    displaySet,

                    rotation

                );

                if (
                    rotation <
                    WorkoutService.config.maxRotations - 1
                ) {

                    addTimelineSegment(

                        TIMER_PHASES.ROTATE,

                        WorkoutService.getRotateDuration(item),

                        rowIndex,

                        displaySet,

                        rotation + 1

                    );

                }

            }

            displaySet++;

        }

        else if (item.type === "break") {

            addTimelineSegment(

                TIMER_PHASES.BREAK,

                item.breakSec ??
                WorkoutService.getBreakDuration(),

                rowIndex,

                displaySet,

                0

            );

        }

    });

    renderTimeline();

}


// ========================================
// RESTORE WORKOUT STATE
// ========================================

function getWorkoutState(elapsedSeconds) {

    let elapsed = elapsedSeconds;

    for (let i = 0; i < S.timelineData.length; i++) {

        const segment = S.timelineData[i];

        if (elapsed < segment.duration) {

            return {

                phase: segment.phase,

                timeLeft:
                    segment.duration - elapsed,

                currentSet:
                    segment.rowIndex,

                displaySetNumber:
                    segment.displaySet,

                rotationCount:
                    segment.rotation,

                segmentIndex:
                    i,

                elapsedInSegment:
                    elapsed,

                segment

            };

        }

        elapsed -= segment.duration;

    }

    return {

        phase: TIMER_PHASES.COOLDOWN,

        timeLeft: 0,

        currentSet:
            S.workoutData.length,

        displaySetNumber:
            WorkoutService.getTotalSets(),

        rotationCount: 0,

        segmentIndex:
            S.timelineData.length - 1,

        elapsedInSegment: 0

    };

}


// ========================================
// RENDER TIMELINE
// ========================================

function renderTimeline() {

    const container = UI.container;

if (!container) return;

    container.innerHTML = "";

    const totalDuration =
        S.timelineData.reduce(
            (sum, segment) => sum + segment.duration,
            0
        );

    if (!totalDuration) return;

    S.timelineData.forEach((segment, index) => {

        const div =
            document.createElement("div");

        div.classList.add(
            "timeline-segment",
            `seg-${segment.phase}`
        );

        const fill =
            document.createElement("div");

        fill.classList.add(
            "segment-fill"
        );

        const label =
            document.createElement("div");

        label.classList.add(
            "segment-label"
        );

        switch (segment.phase) {

            case TIMER_PHASES.WORK:
                label.textContent = "SET";
                break;

            case TIMER_PHASES.ROTATE:
                label.textContent = "ROTATE";
                break;

            case TIMER_PHASES.BREAK:
                label.textContent = "BREAK";
                break;

            case TIMER_PHASES.STRETCH:
                label.textContent = "STRETCH";
                break;

            case TIMER_PHASES.DRESS:
                label.textContent = "DRESS";
                break;

            case TIMER_PHASES.COOLDOWN:
                label.textContent = "COOLDOWN";
                break;

            default:
                label.textContent =
                    segment.phase.toUpperCase();

        }

        div.appendChild(fill);
        div.appendChild(label);

        div.style.width =
            (segment.duration / totalDuration) * 100 + "%";

        div.dataset.index = index;

        container.appendChild(div);

    });

}


// ========================================
// UPDATE ACTIVE SEGMENT
// ========================================



function updateSegmentHighlight() {

    console.log({
    classStartTime: S.classStartTime,
    totalSeconds: S.totalSeconds,
    currentPhase: S.currentPhase
});

    if (!S.timelineData.length) return;

    let elapsed =
    S.originalTotalSeconds -
    S.totalSeconds;

elapsed = Math.max(0, elapsed);

    let currentIndex = 0;
    let elapsedInSegment = 0;

    for (let i = 0; i < S.timelineData.length; i++) {

        if (elapsed < S.timelineData[i].duration) {

            currentIndex = i;
            elapsedInSegment = elapsed;
            break;

        }

        elapsed -= S.timelineData[i].duration;

    }

    document
        .querySelectorAll(".timeline-segment")
        .forEach((element, index) => {

            const fill =
                element.querySelector(".segment-fill");

            if (!fill) return;

            element.classList.toggle(
                "active",
                index === currentIndex
            );

            if (index < currentIndex) {

                fill.style.width = "100%";

            }

            else if (index > currentIndex) {

                fill.style.width = "0%";

            }

            else {

                const percent =

                    (
                        elapsedInSegment /
                        S.timelineData[index].duration
                    ) * 100;

                fill.style.width =
                    Math.min(percent, 100) + "%";

            }

        });

}



// ========================================
// PUBLIC API
// ========================================

TimelineService.build = buildTimeline;
TimelineService.render = renderTimeline;
TimelineService.cacheElements = cacheElements;
TimelineService.updateHighlight = updateSegmentHighlight;
TimelineService.getWorkoutState = getWorkoutState;