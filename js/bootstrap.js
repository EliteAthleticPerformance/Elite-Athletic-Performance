// ========================================
// 🚀 ELITE APP BOOTSTRAP
// ========================================

// ========================================
// APPLICATION STARTUP
//
// 1. Load school configuration
// 2. Track analytics
// 3. Apply school branding
// 4. Expose APP_READY
// ========================================




// 🔥 GA4 EVENT TRACKING
function trackEvent(eventName, params = {}) {

    if (typeof gtag !== "undefined") {
        gtag("event", eventName, params);
    }

}

/* ========================================
   🌐 APP READY
======================================== */

console.log("🚀 Bootstrap loaded");

console.log("SchoolService on window:", window.SchoolService);

window.APP_READY = new Promise(async (resolve, reject) => {

    try {

        console.log("1️⃣ SchoolService...");

        const schoolService = window.SchoolService;

if (!schoolService) {
    throw new Error("SchoolService was not loaded before bootstrap.");
}

const school = schoolService.getSchoolKey();

const data = schoolService.getData();

const appConfig = {
    ...schoolService.getConfig(),

    dataURL: data.workoutApiURL,
    submitURL: data.submitApiURL
};


window.APP_CONFIG = appConfig;

        console.log("3️⃣ ThemeService...");

        await ThemeService.apply(appConfig);

        console.log("4️⃣ APP READY");

        resolve(appConfig);

    } catch (err) {

        console.error("BOOTSTRAP FAILED", err);

        reject(err);

    }

});


 
/* ========================================
   🔐 GLOBAL LOGOUT
======================================== */

window.logout = () => NavigationService.logout();

/* ========================================
   🚨 FAIL SAFE
======================================== */

window.APP_READY.catch(() => {
  document.body.innerHTML = `
    <div style="display:flex;justify-content:center;align-items:center;height:100vh;">
      <div>
        <h1>⚠️ System Error</h1>
        <p>Unable to load configuration</p>
      </div>
    </div>
  `;
});


