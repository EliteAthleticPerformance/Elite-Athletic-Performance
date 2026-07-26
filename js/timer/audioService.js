/* ======================================================
   SPEECH ENGINE (shared helper)
====================================================== */

function speak(text, rate = 1, pitch = 1) {

    // Prevent queue pile-up
    speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);

    if (selectedVoice) utter.voice = selectedVoice;

    utter.volume = 1;
    utter.rate = rate;
    utter.pitch = pitch;

    // ✅ slight delay prevents overlap glitches
    setTimeout(() => speechSynthesis.speak(utter), 50);
}


/* ---------- COUNTDOWN ---------- */
function speakNumber(num) {
    speak(num.toString(), 1, 1);
}


/* ---------- ROTATE ---------- */
function speakRotate() {
    speak("Rotate!", 1.6, 1.5);
}


/* ---------- DRESS WARNING ---------- */
function speakDressWarning() {
    speak("Two minute warning", 1, 1);
}


/* ---------- LIFT ---------- */
function speakLift() {
    speak("Lift!", 1.6, 1.3);
}


/* ---------- STRETCH ---------- */
function speakStretch() {
    speak("Dynamic Stretch!", 1.3, 1.2);
}


/* ---------- BREAK PREP ---------- */
function speakBreakPrep() {
    speak("Break! Prep next lift!", 1.2, 1.1);
}