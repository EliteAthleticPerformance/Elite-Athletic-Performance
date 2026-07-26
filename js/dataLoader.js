// ========================================
// 🔥 ELITE DATA LOADER (BULLETPROOF)
// ========================================

let APP_DATA = [];

// ========================================
// SCHOOL ACCESS VALIDATION
// ========================================

function validateSchoolAccess(schoolSlug) {

  const config =
    SchoolService.getConfig();

  const base = getBasePath();

  console.log(
    "🔍 VALIDATING SCHOOL:",
    schoolSlug
  );

  console.log(
    "📚 AVAILABLE CONFIGS:",
    Object.keys(window.SCHOOL_CONFIG || {})
  );

  // no config found
  if (!config) {

    console.error(
      "❌ SCHOOL NOT FOUND:",
      schoolSlug
    );

    window.location.href =
      base + "invalid-school.html";

    return false;
  }

  const subscription = config.subscription;

// inactive school
if (!subscription?.active) {

    console.warn(
        "⚠️ SCHOOL INACTIVE:",
        schoolSlug
    );

    window.location.href =
        base + "expired.html";

    return false;

}

// expired trial
if (
    subscription?.trial &&
    subscription?.end
) {

    const today = new Date();

    const endDate =
        new Date(subscription.end);

    if (today > endDate) {

        console.warn(
            "⏳ TRIAL EXPIRED:",
            schoolSlug
        );

        window.location.href =
            base + "expired.html";

        return false;

    }

}

return true;

}



// ========================================
// TRIAL DAYS REMAINING
// ========================================

function getTrialDaysRemaining(config) {

  const end =
    config.subscription?.end;

if (!end) {
    return null;
}

const endDate =
    new Date(end);

  const today = new Date();

  const diff =
    endDate - today;

  return Math.ceil(
    diff / (1000 * 60 * 60 * 24)
  );
}


// ========================================
// TRIAL BANNER
// ========================================

function renderTrialBanner(schoolSlug) {

  const config = SchoolService.getConfig();

  if (!config) return;

  // only show for trial schools
  if (!config.subscription?.trial) {
    return;
}

  const daysRemaining =
    getTrialDaysRemaining(config);

  if (daysRemaining == null) return;

  // prevent duplicates
  if (
    document.getElementById(
      "trialBanner"
    )
  ) {
    return;
  }

  const banner =
    document.createElement("div");

  banner.id = "trialBanner";

  banner.innerHTML = `
    ⏳ FREE TRIAL:
    <strong>
      ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""}
      remaining
    </strong>
  `;

  banner.style.position = "fixed";
  banner.style.top = "0";
  banner.style.left = "0";
  banner.style.width = "100%";
  banner.style.padding = "10px";
  banner.style.textAlign = "center";
  banner.style.background = "#f59e0b";
  banner.style.color = "#111";
  banner.style.fontWeight = "700";
  banner.style.zIndex = "9999";
  banner.style.boxShadow =
    "0 2px 8px rgba(0,0,0,.35)";

  document.body.appendChild(banner);

  // push page down slightly
  document.body.style.paddingTop = "50px";
}



/* ========================================
   MAIN LOAD FUNCTION
======================================== */

async function loadAthleteData() {

  console.log("🚀 loadAthleteData() started");

  try {
    const config = await window.APP_READY;

    console.log("✅ APP_READY:", config);

    if (!config || !config.dataURL) {
      throw new Error("Missing SCHOOL_CONFIG or dataURL");
    }

    // ========================================
    // 🧠 BULLETPROOF SCHOOL DETECTION
    // ========================================

    const params = new URLSearchParams(window.location.search);

let school =
    params.get("school") ||
    sessionStorage.getItem("school");

if (!school) {

    console.warn(
        "No school found. Using default."
    );

    school = "harrisonville";

}

// normalize
school = school.toLowerCase().replace(/\s+/g, "");

console.log("🏫 School:", school);

   // 🔥 VALIDATE SCHOOL ACCESS
const accessAllowed =
  validateSchoolAccess(school);

if (!accessAllowed) {
  return [];
}

// 🔥 RENDER TRIAL BANNER
renderTrialBanner();

    if (!school) {
      throw new Error("❌ Missing school parameter (URL or config)");
    }

    // ========================================
    // 🔗 BUILD SAFE URL
    // ========================================

    const separator =
    config.dataURL.includes("?")
        ? "&"
        : "?";

    const url =
    `${config.dataURL}${separator}school=${school}&t=${Date.now()}`;

   

    // ========================================
    // 🌐 FETCH (SAFE)
    // ========================================

    console.log("🌐 URL:", url);

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`API request failed: ${res.status}`);
    }

    let raw;

    try {
      raw = await res.json();
    } catch (e) {
      const text = await res.text();
      console.error("❌ Non-JSON response:", text);
      throw new Error("API did not return valid JSON");
    }

    console.log("Raw first record:");
    console.log(raw[0]);

    console.log("Primary Sport from JSON:", raw[0]["Primary Sport"]);
    console.log("Primary Position from JSON:", raw[0]["Primary Position"]);

    

    if (!Array.isArray(raw)) {
      console.warn("⚠️ API did not return an array");
      return [];
    }

    if (raw.length === 0) {
      console.warn("⚠️ No data returned from API");
      return [];
    }

   // ========================================
// 🔁 MAP DATA (DUAL FORMAT SUPPORT)
// ========================================

APP_DATA = raw
    .map(mapAthlete)
    .filter(isValidAthlete);

return APP_DATA;

} catch (err) {

    console.error("❌ Data load failed:", err);

    return [];

}

}


/* ========================================
   PERFORMANCE TEST HELPERS
======================================== */

const PERFORMANCE_EVENTS = [
    "bench",
    "squat",
    "clean",
    "vertical",
    "broad",
    "med",
    "agility",
    "situps",
    "ten",
    "forty"
];

function getCompletedEvents(record) {

    return PERFORMANCE_EVENTS.filter(event =>
        Number(record[event]) > 0
    ).length;

}

const MINIMUM_PERFORMANCE_EVENTS = 10;

function isPerformanceTest(record) {

    return (
        getCompletedEvents(record) >=
        MINIMUM_PERFORMANCE_EVENTS
    );

}

function isMPHOnlyTest(record) {

    return (
        Number(record.mph) > 0 &&
        getCompletedEvents(record) === 0
    );

}


/* ========================================
   ATHLETE MAPPER
======================================== */

function mapAthlete(row) {

    const name =
        row.name ||
        row["Student-Athlete"] ||
        "";

    const activeRaw =
        row.active ??
        row["active"] ??
        true;

    const isActive =
        activeRaw === true ||
        activeRaw === "true" ||
        activeRaw === "TRUE" ||
        activeRaw === "" ||
        activeRaw === undefined;

    const bench =
        num(row.bench || row["Bench Press"]);

    const squat =
        num(row.squat || row["Squat"]);

    const cleanLift =
        num(row.clean || row["Hang Clean"]);

    const athlete = {

      id: clean(row.id || row.ID),

      active: isActive,

        // 🧍 BASIC
        name: clean(name),
        date: clean(row.date || row["Test Date"]),
        gender: clean(row.gender || row["Gender"]),
        grade: clean(row.grade || row["Grade"]),
        weight: num(row.weight || row["Actual Weight"]),
        group: clean(row.group || row["Weight Group"]),

        // 🏅 SPORTS / POSITIONS
        primarySport: clean(row.primarySport || row["Primary Sport"]),
        primaryPosition: clean(row.primaryPosition || row["Primary Position"]),
        primaryPosition2: clean(row.primaryPosition2 || row["Primary Position 2"]),

        secondarySport: clean(row.secondarySport || row["Secondary Sport"]),
        secondaryPosition: clean(row.secondaryPosition || row["Secondary Position"]),
        secondaryPosition2: clean(row.secondaryPosition2 || row["Secondary Position 2"]),

        thirdSport: clean(row.thirdSport || row["Third Sport"]),
        thirdPosition: clean(row.thirdPosition || row["Third Position"]),
        thirdPosition2: clean(row.thirdPosition2 || row["Third Position 2"]),

        // 🏋️ STRENGTH
        bench,
        squat,
        clean: cleanLift,

        // 🔥 3-LIFT TOTAL
        liftTotal:
            bench +
            squat +
            cleanLift,

        // ⚡ EXPLOSIVE
        vertical: num(row.vertical || row["Vertical Jump"]),
        broad: num(row.broad || row["Broad Jump"]),
        med: num(row.medBall || row["Med Ball Toss"]),

        // 🏃 SPEED
        agility: num(row.agility || row["Pro Agility"]),
        ten: num(row.dash10 || row["10 yd Dash"]),
        forty: num(row.dash40 || row["40 yd Dash"]),

        // 💨 VELOCITY
        mph: num(row.mph || row["MPH"]),

        // 🔁 CORE
        situps: num(row.situps || row["Sit-Ups"]),

        
        // 📊 SCORES
        strengthPoints: num(row.strengthPoints || row["Strength Score"]),
        speedPoints: num(row.speedPoints || row["Speed Score"]),
        explosivePoints: num(row.explosivePoints || row["Explosive Score"]),
        powerPoints: num(row.powerPoints || row["Power Score"]),

        // 🏆 ATHLETIC PERFORMANCE SCORE
        score: num(
    row.total ||
    row["Total Athletic Performance Points"]

    )

};

athlete.completedEvents =
    getCompletedEvents(athlete);

    athlete.completionPercent =
    athlete.completedEvents /
    PERFORMANCE_EVENTS.length;

athlete.isPerformanceTest =
    isPerformanceTest(athlete);

athlete.isMPHOnlyTest =
    isMPHOnlyTest(athlete);

    if (athlete.isPerformanceTest) {

    athlete.testType = "performance";

}
else if (athlete.isMPHOnlyTest) {

    athlete.testType = "mph";

}
else {

    athlete.testType = "partial";

}

    return athlete;

    }


/* ========================================
   ATHLETE VALIDATION
======================================== */

function isValidAthlete(athlete) {

    return (
        athlete.name &&
        athlete.name.trim() !== "" &&
        athlete.active
    );

}


/* ========================================
   HELPERS
======================================== */

function num(val) {
  if (val === null || val === undefined || val === "") return 0;
  const n = parseFloat(String(val).replace(/[^0-9.\-]/g, ""));
  return isNaN(n) ? 0 : n;
}

function clean(val) {
  if (!val) return "";
  return String(val).trim();
}
