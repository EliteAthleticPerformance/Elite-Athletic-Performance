// ========================================
// 🚀 ELITE APP BOOTSTRAP
// ========================================

// ========================================
// APPLICATION STARTUP
//
// 1. Load school configuration
// 2. Build APP_CONFIG
// 3. Apply school branding
// 4. Expose APP_READY
// ========================================


// ========================================
// GA4 EVENT TRACKING
// ========================================

function trackEvent(eventName, params = {}) {

    if (typeof gtag !== "undefined") {
        gtag("event", eventName, params);
    }

}


// ========================================
// CONFIGURATION
// ========================================

function buildAppConfig() {

    const config = SchoolService.getConfig();
    const data = SchoolService.getData();

    return {

        ...config,

        dataURL: data.workoutApiURL,
        submitURL: data.submitApiURL

    };

}


// ========================================
// APP READY
// ========================================

console.log("🚀 Bootstrap Loaded");

window.APP_READY = new Promise(async (resolve, reject) => {

    try {

        if (!window.SchoolService) {
            throw new Error(
                "SchoolService was not loaded before bootstrap."
            );
        }

        console.log("📚 Loading School Configuration...");

        const appConfig = buildAppConfig();

        window.APP_CONFIG = appConfig;

        console.log("🎨 Applying Theme...");

        await ThemeService.apply(appConfig);

        console.log(
            "✅ App Ready:",
            appConfig.branding.displayName
        );

        resolve(appConfig);

    } catch (err) {

        console.error(
            "❌ Bootstrap Failed",
            err
        );

        reject(err);

    }

});


// ========================================
// GLOBAL LOGOUT
// ========================================

window.logout = () => NavigationService.logout();


// ========================================
// FAIL SAFE
// ========================================

window.APP_READY.catch(() => {

    document.body.innerHTML = `
        <div style="
            display:flex;
            justify-content:center;
            align-items:center;
            height:100vh;
            text-align:center;
        ">
            <div>
                <h1>⚠️ System Error</h1>
                <p>Unable to load application configuration.</p>
            </div>
        </div>
    `;

});