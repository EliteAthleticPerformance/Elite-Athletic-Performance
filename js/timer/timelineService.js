function buildSegmentTimeline() {
    if (!window.workoutData?.length) return;

    timelineData = [];

    // DRESS
    timelineData.push({ phase: "dress", duration: dressOutDuration });

    // STRETCH
    if (dynamicStretchDuration > 0) {
        timelineData.push({ phase: "stretch", duration: dynamicStretchDuration });
    }

    // WORKOUT
    window.workoutData.forEach((item, index) => {

        if (item.type === "set") {
            for (let r = 0; r < maxRotations; r++) {

                timelineData.push({
                    phase: "work",
                    duration: item.workSec || parseInt(document.getElementById("workTime").value, 10) || 0
                });

                if (r < maxRotations - 1) {
                    timelineData.push({
                        phase: "rotate",
                        duration: item.rotateSec || parseInt(document.getElementById("restTime").value, 10) || 0
                    });
                }
            }
        }

        if (item.type === "break") {
            timelineData.push({
                phase: "break",
                duration: item.breakSec || breakDuration
            });
        }

    });

    renderTimeline(); // ✅ correct place
}


function renderTimeline() {
    const container = document.getElementById("timelineSegments");
    if (!container) return;

    container.innerHTML = "";

    const total = timelineData.reduce((sum, seg) => sum + seg.duration, 0);

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

    let currentIndex = 0;

    for (let i = 0; i < timelineData.length; i++) {
        if (elapsed < timelineData[i].duration) {
            currentIndex = i;
            break;
        }
        elapsed -= timelineData[i].duration;
    }

    document.querySelectorAll(".timeline-segment").forEach((el, i) => {
        el.classList.toggle("active", i === currentIndex);
    });
}