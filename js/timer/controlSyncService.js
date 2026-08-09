(() => {

    window.ControlSyncService =
        window.ControlSyncService || {};

    const ControlSyncService =
        window.ControlSyncService;


    // ========================================
    // CONFIG
    // ========================================

    const POLL_INTERVAL = 2000;

    let pollTimer = null;


    // ========================================
    // POLL
    // ========================================

    async function poll() {

    try {

        console.log(
            "🔄 Control poll:",
            new Date().toLocaleTimeString()
        );

        await WorkoutService.refreshControlState();

        CoachService.applyControl();

    }

        catch (error) {

            console.error(
                "ControlSyncService:",
                error
            );

        }

    }


    // ========================================
    // START
    // ========================================

    function start() {

        if (pollTimer) return;

        console.log(
            "🔄 ControlSyncService started"
        );

        // Immediate first check
        poll();

        // Continue polling
        pollTimer =
            setInterval(
                poll,
                POLL_INTERVAL
            );

    }


    // ========================================
    // STOP
    // ========================================

    function stop() {

        if (!pollTimer) return;

        clearInterval(pollTimer);

        pollTimer = null;

        console.log(
            "⏹ ControlSyncService stopped"
        );

    }


    // ========================================
    // PUBLIC API
    // ========================================

    ControlSyncService.start = start;

    ControlSyncService.stop = stop;

    ControlSyncService.poll = poll;


})();