function previewSetData(setNumber) {

    const workout = workoutData[setNumber - 1];

    if (!workout || workout.type !== "set") return;

    const q1Texts = document.querySelectorAll("#q1 .quad-text");
    const q2Texts = document.querySelectorAll("#q2 .quad-text");
    const q4Texts = document.querySelectorAll("#q4 .quad-text");

    if (q1Texts.length >= 3) {
        q1Texts[0].innerText = "🔥 NEXT: " + workout.core;
        q1Texts[1].innerText = "Reps: " + workout.reps;
        q1Texts[2].innerText = "Percentage: " + workout.percent + "%";
    }

    if (q2Texts.length >= 2) {
        q2Texts[0].innerText = "🔥 NEXT: " + workout.aux;
        q2Texts[1].innerText = "Reps: " + workout.auxReps;
    }

    if (q4Texts.length >= 2) {
        q4Texts[0].innerText = "🔥 NEXT: " + workout.move;
        q4Texts[1].innerText = "Reps/Time: " + workout.moveReps;
    }
}


function previewNextSet() {
    if (!workoutData.length) return;

    const nextItem = workoutData[currentSet] ?? null;

    if (nextItem && nextItem.type === "set") {
        loadSetData(currentSet + 1);
    }
}