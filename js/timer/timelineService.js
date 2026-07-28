// ========================================
// DURATION HELPERS
// ========================================

function getWorkDuration(item) {
    if (item.workSec != null) return item.workSec;

    const fallback = parseInt(document.getElementById("workTime").value, 10);
    return Number.isNaN(fallback) ? 0 : fallback;
}

function getRotateDuration(item) {
    if (item.rotateSec != null) return item.rotateSec;

    const fallback = parseInt(document.getElementById("restTime").value, 10);
    return Number.isNaN(fallback) ? 0 : fallback;
}


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

    timelineData.push({

        phase,
        duration,

        set,
        displaySet,
        rotation,

        workoutIndex
    });

}


function buildSegmentTimeline() {
    if (!window.workoutData?.length) return;

    timelineData = [];

    addTimelineSegment(
    "dress",
    dressOutDuration,
    1,
    1,
    0,
    1
);

if (dynamicStretchDuration > 0) {
    addTimelineSegment(
        "stretch",
        dynamicStretchDuration,
        1,
        1,
        0,
        1
    );
}

   
let displaySet = 1;

window.workoutData.forEach((item) => {

    if (item.type === "set") {

        workoutIndex++;

        for (let r = 0; r < maxRotations; r++) {

            addTimelineSegment(

                "work",

                getWorkDuration(item),

                workoutIndex,
                displaySet,
                r,
                workoutIndex
            );

            if (r < maxRotations - 1) {

                addTimelineSegment(

                    "rotate",

                    getRotateDuration(item),

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

            item.breakSec ?? breakDuration,

            workoutIndex,
            displaySet,
            0,
            workoutIndex
        );
    }

});

    renderTimeline(); // ✅ correct place
}


function getWorkoutState(elapsedSeconds) {

    let elapsed = elapsedSeconds;

    for (let i = 0; i < timelineData.length; i++) {

        const segment = timelineData[i];

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

        currentSet: workoutData.length,

        displaySetNumber: getTotalSets(),

        rotationCount: 0,

        workoutIndex: workoutData.length,

        segmentIndex: timelineData.length - 1,

        elapsedInSegment: 0
    };
}

    


function renderTimeline() {
    const container = document.getElementById("timelineSegments");
    if (!container) return;

    container.innerHTML = "";

    const total = timelineData.reduce((sum, seg) => sum + seg.duration, 0);

    if (!total) return;

    timelineData.forEach((seg, index) => {
        
        const div = document.createElement("div");

        div.classList.add("timeline-segment", `seg-${seg.phase}`);

        const percent = (seg.duration / total) * 100;
        div.style.width = percent + "%";

        div.dataset.index = index;

        container.appendChild(div);
    });
}


function updateSegmentHighlight() {
    if (!window.classStartTime) return;

    const now = getEffectiveNow().getTime();
    let elapsed = (now - window.classStartTime) / 1000;

    let currentIndex = -1;

    for (let i = 0; i < timelineData.length; i++) {
        if (elapsed < timelineData[i].duration) {
            currentIndex = i;
            break;
        }
        elapsed -= timelineData[i].duration;
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