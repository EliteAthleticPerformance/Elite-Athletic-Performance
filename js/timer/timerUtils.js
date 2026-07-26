function getTotalSets() {
    return window.workoutData.filter(item => item.type === "set").length;
}


function resetWorkoutState() {
    displaySetNumber = 1;
    rotationCount = 0;
    currentSet = 1;
}


 function getNextSetIndex() {

    // Start searching AFTER currentSet
    for (let i = currentSet; i < workoutData.length; i++) {
        if (workoutData[i].type === "set") {
            return i + 1; // convert to 1-based index
        }
    }

    // No more sets found
    return null;
}


function getSyncedNow() {
    return new Date(Date.now() + timeOffset);
}


function syncClockOffset() {

    if (!window.serverTime) {
        console.warn("⚠️ No server time found");
        return;
    }

    const serverNow = new Date(window.serverTime);

    if (isNaN(serverNow.getTime())) {
        console.warn("⚠️ Invalid server time:", window.serverTime);
        return;
    }

    timeOffset = serverNow.getTime() - Date.now();

    console.log("🕒 Server time:", window.serverTime);
    console.log("⏱ Clock offset (ms):", timeOffset);
}