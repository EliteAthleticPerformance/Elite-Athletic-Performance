// ========================================
// 🔥 ELITE DATA LOADER (BULLETPROOF)
// ========================================

let APP_DATA = [];

// ========================================
// SCHOOL ACCESS VALIDATION
// ========================================

function validateSchoolAccess(schoolSlug) {

  const config =
    window.SCHOOL_CONFIG?.[schoolSlug];

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

  // manually disabled
  if (!config.active) {

    console.warn(
      "⚠️ SCHOOL DISABLED:",
      schoolSlug
    );

    window.location.href =
      base + "expired.html";

    return false;
  }

  // trial validation
  if (
    config.trial &&
    config.trialEnd
  ) {

    const today =
      new Date();

    const endDate =
      new Date(config.trialEnd);

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

  if (!config?.trialEnd) {
    return null;
  }

  const today = new Date();

  const endDate =
    new Date(config.trialEnd);

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

  const config =
    window.SCHOOL_CONFIG?.[schoolSlug];

  if (!config) return;

  // only show for trial schools
  if (!config.trial) return;

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
  try {
    const config = await window.APP_READY;

    if (!config || !config.dataURL) {
      throw new Error("Missing SCHOOL_CONFIG or dataURL");
    }

    // ========================================
    // 🧠 BULLETPROOF SCHOOL DETECTION
    // ========================================

    const urlParams = new URLSearchParams(window.location.search);

let school = urlParams.get("school");

// 🔥 HARD FALLBACK (guaranteed)
if (!school) {
  console.warn("⚠️ No school in URL — forcing default");
  school = "pleasanthill";
}

// normalize
school = school.toLowerCase().replace(/\s+/g, "");

   // 🔥 VALIDATE SCHOOL ACCESS
const accessAllowed =
  validateSchoolAccess(school);

if (!accessAllowed) {
  return [];
}

// 🔥 RENDER TRIAL BANNER
renderTrialBanner(school);

    if (!school) {
      throw new Error("❌ Missing school parameter (URL or config)");
    }

    // ========================================
    // 🔗 BUILD SAFE URL
    // ========================================

    const separator = config.dataURL.includes("?") ? "&" : "?";

    const url = `${config.dataURL}?school=${school}&t=${Date.now()}`;

   

    // ========================================
    // 🌐 FETCH (SAFE)
    // ========================================

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

    APP_DATA = raw.map(row => {



      if (
  row["Student-Athlete"] &&
  row["Student-Athlete"].includes("Alvarez")
) {
  
}
       
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

     // 🔍 DEBUG BLISS SCORE
if (name.includes("Gilmore")) {
  console.log(
    "FINAL SCORE VALUE:",
    num(row["Total Athletic Performance Points"])
  );

  console.log(
    "RAW SCORE FIELD:",
    row["Total Athletic Performance Points"]
  );

  console.log("FULL ROW:", row);
}

      return {
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
  bench: num(row.bench || row["Bench Press"]),
  squat: num(row.squat || row["Squat"]),
  clean: num(row.clean || row["Hang Clean"]),

  // 🔥 3-LIFT TOTAL
liftTotal:
  num(row.bench || row["Bench Press"]) +
  num(row.squat || row["Squat"]) +
  num(row.clean || row["Hang Clean"]),

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

  // 🔍 TRUE ATHLETIC PERFORMANCE TEST?
  // MPH-only entries will return FALSE
  isPerformanceTest:
    (
      num(row.bench || row["Bench Press"]) > 0 ||
      num(row.squat || row["Squat"]) > 0 ||
      num(row.clean || row["Hang Clean"]) > 0 ||
      num(row.vertical || row["Vertical Jump"]) > 0 ||
      num(row.broad || row["Broad Jump"]) > 0 ||
      num(row.medBall || row["Med Ball Toss"]) > 0 ||
      num(row.agility || row["Pro Agility"]) > 0 ||
      num(row.situps || row["Sit-Ups"]) > 0 ||
      num(row.dash10 || row["10 yd Dash"]) > 0 ||
      num(row.dash40 || row["40 yd Dash"]) > 0
    ),

  // 🔁 CORE
  situps: num(row.situps || row["Sit-Ups"]),

  // 📊 SCORES
  strengthPoints: num(row.strengthPoints || row["Strength Score"]),
  speedPoints: num(row.speedPoints || row["Speed Score"]),
  explosivePoints: num(row.explosivePoints || row["Explosive Score"]),
  powerPoints: num(row.powerPoints || row["Power Score"]),

  // 🏆 ATHLETIC PERFORMANCE SCORE
  score: num(row.total)
};
      })

    // ========================================
    // ✅ FINAL FILTER (CRITICAL)
    // ========================================

    .filter(a =>
      a.name &&
      a.name.trim() !== "" &&
      a.active
    );

    

    return APP_DATA;

  } catch (err) {
    console.error("❌ Data load failed:", err);

    // Optional: surface error to UI later
    return [];
  }
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
