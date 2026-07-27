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

function addTimelineSegment(phase, duration) {
    timelineData.push({
        phase,
        duration
    });
}


function buildSegmentTimeline() {
    if (!window.workoutData?.length) return;

    timelineData = [];

    // DRESS
    addTimelineSegment("dress", dressOutDuration);

    // STRETCH
    if (dynamicStretchDuration > 0) {
        addTimelineSegment("stretch", dynamicStretchDuration);
    }

    
    // WORKOUT
window.workoutData.forEach((item) => {

    if (item.type === "set") {

        for (let r = 0; r < maxRotations; r++) {

        
            // Work segment
addTimelineSegment("work", getWorkDuration(item));

// Rotate between stations (not after the last station)
if (r < maxRotations - 1) {
    addTimelineSegment("rotate", getRotateDuration(item));
}
        }
    }

    if (item.type === "break") {
    addTimelineSegment("break", item.breakSec ?? breakDuration);
}

});

    renderTimeline(); // ✅ correct place
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