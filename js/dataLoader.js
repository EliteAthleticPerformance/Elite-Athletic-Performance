// ========================================
// 🔥 ELITE V14 DATA LOADER (FULLY FIXED)
// ========================================

let APP_DATA = [];

/* ========================================
   MAIN LOAD FUNCTION
======================================== */

async function loadAthleteData() {
  try {
    const config = await window.APP_READY;

    if (!config || !config.dataURL) {
      throw new Error("Missing SCHOOL_CONFIG or dataURL");
    }

    const url = config.dataURL + "?t=" + Date.now();

    console.log("📡 Loading data from:", url);

    const res = await fetch(url);
    const raw = await res.json();

    if (!Array.isArray(raw)) {
      console.warn("⚠️ API did not return array");
      return [];
    }

    if (!raw.length) {
      console.warn("⚠️ No data returned from API");
      return [];
    }

    console.log("🧪 RAW SAMPLE:", raw[0]);

    const keyMap = buildKeyMap(raw[0]);

    APP_DATA = raw.map(row => {

      // ========================================
      // 🔒 SAFE ACCESSOR
      // ========================================
      const get = (...keys) => {

        // 1️⃣ exact match
        for (let k of keys) {
          if (row[k] !== undefined && row[k] !== "") {
            return row[k];
          }
        }

        // 2️⃣ normalized fallback
        for (let k of keys) {
          const normalized = normalizeKey(k);
          if (keyMap[normalized]) {
            const realKey = keyMap[normalized];
            if (row[realKey] !== undefined && row[realKey] !== "") {
              return row[realKey];
            }
          }
        }

        return "";
      };

      // ========================================
      // 🆔 SYSTEM FIELDS (FIXED)
      // ========================================

      const rawActive = get("active");

      const isActive =
        rawActive === "" ||
        rawActive === undefined ||
        rawActive === true ||
        rawActive === "TRUE" ||
        rawActive === "true";

      return {

        id: clean(get("id")),
        active: isActive,

        // ========================================
        // 🧍 BASIC
        // ========================================
        name: clean(get("Student-Athlete")),
        date: clean(get("Test Date")),

        hour: clean(get("Hour")),
        grade: clean(get("Grade")),
        weight: num(get("Actual Weight")),
        weightClass: clean(get("Weight Group")),

        // ========================================
        // 🏋️ STRENGTH
        // ========================================
        bench: num(get("Bench Press")),
        squat: num(get("Squat")),
        clean: num(get("Hang Clean")),

        // ========================================
        // ⚡ EXPLOSIVE
        // ========================================
        vertical: num(get("Vertical Jump")),
        broad: num(get("Broad Jump")),
        med: num(get("Med Ball Toss")),

        // ========================================
        // 🏃 SPEED
        // ========================================
        agility: num(get("Pro Agility")),
        ten: num(get("10 yd Dash")),
        forty: num(get("40 yd Dash")),

        // ========================================
        // 🔁 CORE
        // ========================================
        situps: num(get("Sit-Ups")),

        // ========================================
        // 🔥 CATEGORY SCORES
        // ========================================
        strengthPoints: num(get("Strength Score")),
        speedPoints: num(get("Speed Score")),
        explosivePoints: num(get("Explosive Score")),
        powerPoints: num(get("Power Score")),

        // ========================================
        // 📊 TOTAL SCORE
        // ========================================
        score:
          num(get("Total Athletic Performance Points")) ||
          num(get("3 Lift Projected Max Total")) ||
          (
            num(get("Bench Press")) +
            num(get("Squat")) +
            num(get("Hang Clean"))
          )
      };
    })

    // ========================================
    // ✅ FINAL FILTER (FIXED)
    // ========================================
    .filter(a => a.name && a.active);

    console.log("🔥 FINAL SAMPLE:", APP_DATA[0]);
    console.log("✅ DATA READY:", APP_DATA.length);

    return APP_DATA;

  } catch (err) {
    console.error("❌ Data load failed:", err);
    return [];
  }
}

/* ========================================
   🔑 KEY NORMALIZATION
======================================== */

function normalizeKey(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function buildKeyMap(sampleRow) {
  const map = {};

  Object.keys(sampleRow).forEach(key => {
    map[normalizeKey(key)] = key;
  });

  return map;
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
