(() => {

window.CoachUI = window.CoachUI || {};
const CoachUI = window.CoachUI;

// ========================================
// TOGGLE PANEL
// ========================================

function toggle() {

    const panel =
        document.getElementById("coachPanel");

    if (!panel) return;

    panel.classList.toggle("hidden");

}

// ========================================
// INITIALIZE
// ========================================

function init() {

    const coachBtn =
        document.getElementById("coachToggle");

    if (coachBtn) {
        coachBtn.onclick = toggle;
    }

    }

// ========================================
// PUBLIC API
// ========================================

CoachUI.toggle = toggle;
CoachUI.init = init;

})();


