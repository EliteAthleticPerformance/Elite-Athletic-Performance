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

window.APP_READY = new Promise(async (resolve, reject) => {

    try {

        console.log("1️⃣ SchoolService...");

        const school = SchoolService.getSchoolKey();

        console.log("2️⃣ Config...");

        const appConfig = {

            ...SchoolService.getConfig(),

            dataURL:
                "https://script.google.com/macros/s/AKfycbwnSjmwlod_AoqmTEoownI1CsWhjpTu9ubLrb78DsLBTaH0WDnYxXNiXEyJmY1J0Uh2/exec",

            submitURL:
                "https://script.google.com/macros/s/AKfycbwnSjmwlod_AoqmTEoownI1CsWhjpTu9ubLrb78DsLBTaH0WDnYxXNiXEyJmY1J0Uh2/exec"

        };

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
