(() => {


// ========================================
// AUDIO SERVICE
// ========================================

window.AudioService = window.AudioService || {};
const AudioService = window.AudioService;

const S = window.TimerState;


// ========================================
// AUDIO CONTEXT
// ========================================

function ensureAudio() {

    if (!S.audioCtx) {

        S.audioCtx =
            new (window.AudioContext ||
                 window.webkitAudioContext)();

    }

    if (S.audioCtx.state === "suspended") {
        S.audioCtx.resume();
    }

}


// ========================================
// SPEECH ENGINE
// ========================================

function speak(text, rate = 1, pitch = 1) {

    speechSynthesis.cancel();

    const utter =
        new SpeechSynthesisUtterance(text);

    if (S.selectedVoice) {
        utter.voice = S.selectedVoice;
    }

    utter.volume = 1;
    utter.rate = rate;
    utter.pitch = pitch;

    // Small delay prevents overlapping speech
    setTimeout(() => {
        speechSynthesis.speak(utter);
    }, 50);

}


// ========================================
// SPEECH HELPERS
// ========================================

function speakNumber(number) {

    speak(number.toString());

}


function speakRotate() {

    speak("Rotate!", 1.6, 1.5);

}


function speakDressWarning() {

    speak("Two minute warning");

}


function speakLift() {

    speak("Lift!", 1.6, 1.3);

}


function speakStretch() {

    speak("Dynamic Stretch!", 1.3, 1.2);

}


function speakBreakPrep() {

    speak("Break! Prep next lift!", 1.2, 1.1);

}


function speakCooldown() {

    speak("Cooldown!", 1.2, 1.1);

}


// ========================================
// SOUND EFFECTS
// ========================================

function playTone(frequency, duration) {

    ensureAudio();

    const osc =
        S.audioCtx.createOscillator();

    const gain =
        S.audioCtx.createGain();

    osc.type = "sawtooth";
    osc.frequency.value = frequency;

    gain.gain.setValueAtTime(
        0.6,
        S.audioCtx.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
        0.001,
        S.audioCtx.currentTime + duration
    );

    osc.connect(gain);
    gain.connect(S.audioCtx.destination);

    osc.start();
    osc.stop(
        S.audioCtx.currentTime + duration
    );

}


function playHorn() {

    ensureAudio();

    const duration = 2.5;

    const osc1 =
        S.audioCtx.createOscillator();

    const osc2 =
        S.audioCtx.createOscillator();

    const gain =
        S.audioCtx.createGain();

    osc1.type = "sawtooth";
    osc2.type = "square";

    osc1.frequency.value = 180;
    osc2.frequency.value = 220;

    gain.gain.setValueAtTime(
        0.0001,
        S.audioCtx.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
        0.9,
        S.audioCtx.currentTime + 0.05
    );

    gain.gain.exponentialRampToValueAtTime(
        0.001,
        S.audioCtx.currentTime + duration
    );

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(S.audioCtx.destination);

    osc1.start();
    osc2.start();

    osc1.stop(
        S.audioCtx.currentTime + duration
    );

    osc2.stop(
        S.audioCtx.currentTime + duration
    );

}


// ========================================
// PUBLIC API
// ========================================

AudioService.ensureAudio = ensureAudio;

AudioService.speak = speak;

AudioService.speakNumber = speakNumber;
AudioService.speakRotate = speakRotate;
AudioService.speakDressWarning = speakDressWarning;
AudioService.speakLift = speakLift;
AudioService.speakStretch = speakStretch;
AudioService.speakBreakPrep = speakBreakPrep;
AudioService.speakCooldown = speakCooldown;

AudioService.playTone = playTone;
AudioService.playHorn = playHorn;


})();