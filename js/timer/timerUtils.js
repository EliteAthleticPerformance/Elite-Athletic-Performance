"use strict";

// ========================================
// TIMER UTILITIES
// Shared helper functions used throughout
// the timer application.
// ========================================

window.TimerUtils = {

    // ========================================
    // FORMAT TIME (seconds → MM:SS)
    // ========================================

    formatTime(seconds) {

        const safeSeconds =
            Math.max(0, Math.floor(seconds));

        const minutes =
            Math.floor(safeSeconds / 60);

        const remainingSeconds =
            safeSeconds % 60;

        return (
            String(minutes).padStart(2, "0") +
            ":" +
            String(remainingSeconds).padStart(2, "0")
        );

    }

};


