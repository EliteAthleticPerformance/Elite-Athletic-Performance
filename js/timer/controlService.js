(() => {

window.ControlService = window.ControlService || {};
const ControlService = window.ControlService;

// ========================================
// CONFIG
// ========================================

function getScriptUrl() {

    if (!window.APP_CONFIG?.dataURL) {

        throw new Error(
            "APP_CONFIG.dataURL is not available."
        );

    }

    return window.APP_CONFIG.dataURL;

}


// ========================================
// SEND COMMAND
// ========================================

async function send(action, data = {}) {

    try {

        const body = new URLSearchParams({

    action: "control",

    school: window.APP_CONFIG.key,

    controlAction: action,

    ...data

});

    console.log([...body.entries()]);

        const response = await fetch(getScriptUrl(), {

        method: "POST",
        body

    });

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }

        return await response.json();

    }

    catch (error) {

        console.error(
            "ControlService:",
            error
        );

        return null;

    }

}


// ========================================
// PUBLIC METHODS
// ========================================

function sendStart() {

    return send("START");

}

function sendPause() {

    // Pause coach browser immediately
    TimerEngine.pause();

    // Broadcast pause to receiving browsers
    return send("PAUSE");
}

function sendResume() {

    return send("RESUME");

}

function sendStop() {

    return send("STOP");

}

function sendJump(phase, set, rotation) {

    return send("JUMP", {

        phase,
        set,
        rotation

    });

}


// ========================================
// PUBLIC API
// ========================================

ControlService.sendStart = sendStart;
ControlService.sendPause = sendPause;
ControlService.sendResume = sendResume;
ControlService.sendStop = sendStop;
ControlService.sendJump = sendJump;

})();