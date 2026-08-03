window.TimelineService = window.TimelineService || {};
const TimelineService = window.TimelineService;

const S = window.TimerState;



// ========================================
// TIMELINE HELPERS
// ========================================

function addTimelineSegment(
    phase,
    duration,
    set = 0,
    displaySet = 0,
    rotation = 0,
    workoutIndex = 0
) {

    S.timelineData.push({

        phase,
        duration,

        set,
        displaySet,
        rotation,

        workoutIndex
    });

}


function buildTimeline() {

    if (!S.workoutData?.length) return;

    S.timelineData = [];

    addTimelineSegment(
    "dress",
    WorkoutService.getDressDuration(),
    1,
    1,
    0,
    1
);

const stretchDuration = WorkoutService.getStretchDuration();

if (stretchDuration > 0) {
    addTimelineSegment(
        "stretch",
        stretchDuration,
        1,
        1,
        0,
        1
    );
}

   
let displaySet = 1;
let workoutIndex = 0;

S.workoutData.forEach((item) => {

    if (item.type === "set") {

        workoutIndex++;

        for (let r = 0; r < WorkoutService.config.maxRotations; r++) {

            addTimelineSegment(

                "work",

                WorkoutService.getWorkDuration(item),

                workoutIndex,
                displaySet,
                r,
                workoutIndex
            );

            if (r < WorkoutService.config.maxRotations - 1) {

                addTimelineSegment(

                    "rotate",

                    WorkoutService.getRotateDuration(item),

                    workoutIndex,
                    displaySet,
                    r,
                    workoutIndex
                );
            }
        }

        displaySet++;
    }

    else if (item.type === "break") {

        addTimelineSegment(

            "break",

            item.breakSec ?? WorkoutService.getBreakDuration(),

            workoutIndex,
            displaySet,
            0,
            workoutIndex
        );
    }

});

    TimelineService.render();// ✅ correct place
}


function getWorkoutState(elapsedSeconds) {

    let elapsed = elapsedSeconds;

    for (let i = 0; i < S.timelineData.length; i++) {

    const segment = S.timelineData[i];

        if (elapsed < segment.duration) {

            return {

                phase: segment.phase,
                timeLeft: segment.duration - elapsed,

                currentSet: segment.set,
                displaySetNumber: segment.displaySet,
                rotationCount: segment.rotation,
                workoutIndex: segment.workoutIndex,

                segmentIndex: i,
                elapsedInSegment: elapsed,

                segment
            };
        }

        elapsed -= segment.duration;
    }

    return {

        phase: "cooldown",

        timeLeft: 0,

        currentSet: S.workoutData.length,

        displaySetNumber: WorkoutService.getTotalSets(),

        rotationCount: 0,

        workoutIndex: S.workoutData.length,

        segmentIndex: S.timelineData.length - 1,

        elapsedInSegment: 0
    };
}

    


function renderTimeline() {
    const container = document.getElementById("timelineSegments");
    if (!container) return;

    container.innerHTML = "";

    const total = S.timelineData.reduce((sum, seg) => sum + seg.duration, 0);

    if (!total) return;

    S.timelineData.forEach((seg, index) => {
        
        const div = document.createElement("div");

        div.classList.add("timeline-segment", `seg-${seg.phase}`);

        const percent = (seg.duration / total) * 100;
        div.style.width = percent + "%";

        div.dataset.index = index;

        container.appendChild(div);
    });
}


function updateSegmentHighlight() {
    if (!S.classStartTime) return;

    const now =
    ScheduleService.getEffectiveNow().getTime();
    let elapsed =
    (now - S.classStartTime) / 1000;

    let currentIndex = -1;

    for (let i = 0; i < S.timelineData.length; i++) {
        if (elapsed < S.timelineData[i].duration) {
            currentIndex = i;
            break;
        }
        elapsed -= S.timelineData[i].duration;
    }

    if (currentIndex === -1) {
    document.querySelectorAll(".timeline-segment").forEach(el => {
        el.classList.remove("active");
    });
    return;
}

    document.querySelectorAll(".timeline-segment").forEach((el, i) => {
        el.classList.toggle("active", i === currentIndex);
    });
}


TimelineService.build = buildTimeline;
TimelineService.getWorkoutState = getWorkoutState;
TimelineService.render = renderTimeline;
TimelineService.updateHighlight = updateSegmentHighlight;
