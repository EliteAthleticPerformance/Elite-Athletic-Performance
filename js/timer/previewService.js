// ========================================
// PREVIEW HELPERS
// ========================================

function updateQuadPreview(elements, lines) {
    lines.forEach((text, index) => {
        if (elements[index]) {
            elements[index].innerText = text;
        }
    });
}



function previewSetData(setNumber) {

    const workout = workoutData[setNumber - 1];

    if (workout?.type !== "set") return;

    updateQuadPreview(
        document.querySelectorAll("#q1 .quad-text"),
        [
            `🔥 NEXT: ${workout.core}`,
            `Reps: ${workout.reps}`,
            `Percentage: ${workout.percent}%`
        ]
    );

    updateQuadPreview(
        document.querySelectorAll("#q2 .quad-text"),
        [
            `🔥 NEXT: ${workout.aux}`,
            `Reps: ${workout.auxReps}`
        ]
    );

    updateQuadPreview(
        document.querySelectorAll("#q4 .quad-text"),
        [
            `🔥 NEXT: ${workout.move}`,
            `Reps/Time: ${workout.moveReps}`
        ]
    );
}


function previewNextSet() {
    if (!workoutData.length) return;

    const nextItem = workoutData[currentSet];

    if (nextItem?.type === "set") {
        loadSetData(currentSet + 1);
    }
}