(() => {


// ========================================
// PREVIEW SERVICE
// ========================================

window.PreviewService = window.PreviewService || {};
const PreviewService = window.PreviewService;

const S = window.TimerState;


// ========================================
// PREVIEW NEXT SET
// ========================================

function previewNextSet() {

    if (!S.workoutData.length) return;

    const nextRow =
    WorkoutService.getNextSetRow();

    if (nextRow === null) return;

    previewSetData(nextRow);

}


// ========================================
// QUADRANT ELEMENTS
// ========================================

function getQuadrantElements() {

    return {

        q1: document.querySelectorAll("#q1 .quad-text"),

        q2: document.querySelectorAll("#q2 .quad-text"),

        q4: document.querySelectorAll("#q4 .quad-text")

    };

}


// ========================================
// RENDER SET DATA
// Shared by loadSetData() and previewSetData()
// ========================================

function renderSetData(workout, options = {}) {

    if (!workout || workout.type !== "set") return;

    const prefix = options.preview ? "🔥 NEXT: " : "";

    const {
        q1,
        q2,
        q4
    } = getQuadrantElements();

    /* ---------- CORE ---------- */

    if (q1.length >= 3) {

        q1[0].innerText = prefix + workout.core;
        q1[1].innerText = "Reps: " + workout.reps;
        q1[2].innerText =
            "Percentage: " +
            (workout.percent ? workout.percent + "%" : "");

    }

    /* ---------- AUX ---------- */

    if (q2.length >= 2) {

        q2[0].innerText = prefix + workout.aux;
        q2[1].innerText = "Reps: " + workout.auxReps;

    }

    /* ---------- MOVEMENT ---------- */

    if (q4.length >= 2) {

        q4[0].innerText = prefix + workout.move;
        q4[1].innerText =
            "Reps/Time: " + workout.moveReps;

    }

}


function previewSetData(rowIndex) {

    const workout =
        S.workoutData[rowIndex];

    if (!workout) return;

    renderSetData(workout, {
        preview: true
    });

}



// ========================================
// EXIT PREVIEW MODE
// ========================================

function exitPreviewMode() {

    document.body.classList.remove("preview-mode");

    const workout =
    S.workoutData[S.currentSet];

    renderSetData(workout);

}


// ========================================
// PUBLIC API
// ========================================

PreviewService.previewSetData = previewSetData;
PreviewService.previewNextSet = previewNextSet;
PreviewService.exitPreviewMode = exitPreviewMode;
PreviewService.renderSetData = renderSetData;

})();