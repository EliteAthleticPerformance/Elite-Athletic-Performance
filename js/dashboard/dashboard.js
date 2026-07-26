const Dashboard = {

    async init() {

        try {

            await window.APP_READY;

            this.setupEvents();

            const data = await loadAthleteData();

            DashboardRenderer.render(data);

        } catch (err) {

            console.error("❌ Dashboard load error:", err);

        }

    },

    setupEvents() {

        document
            .getElementById("freeTrialBtn")
            ?.addEventListener("click", () => {

                if (typeof trackEvent === "function") {

                    trackEvent("free_trial_click", {
                        page: window.location.pathname
                    });

                    trackEvent("trial_signup_started");

                }

            });

    }

};

document.addEventListener("DOMContentLoaded", () => {
    Dashboard.init();
});