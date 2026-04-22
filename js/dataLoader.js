// ===============================
// 🔥 ELITE V8 DATA LOADER (APP_READY LOCKED)
// ===============================

let APP_DATA = [];

/* ========================================
   MAIN LOAD FUNCTION
======================================== */

async function loadAthleteData() {
  try {

    // ✅ GUARANTEED CONFIG (NEW SYSTEM)
    const config = await window.APP_READY;

    if (!config || !config.dataURL) {
      console.warn("⚠️ Missing config dataURL");
      return [];
    }

    const url = config.dataURL + "?t=" + Date.now(); // cache bust

    console.log("📡 Loading data from:", url);

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error("Network response failed");
    }

    const data = await res.json();

    if (!data || !data.length) {
      console.warn("⚠️ No data returned");
      return [];
    }

    console.log("🧪 RAW SAMPLE:", data[0]);

    // ========================================
    // 🔥 SAFE HEADER MAP (BULLETPROOF)
    // ========================================

    const firstValidRow = data.find(r => Object.keys(r).length > 0);
    const keyMap = buildKeyMap(firstValidRow || {});

    APP_DATA = data
      .map(row => {

        const athlete = {

          // 🧍 BASIC INFO
          name: clean(row[keyMap.studentathlete]).replace(/\s+/g, " "),
          date: clean(row[keyMap.testdate]),

          hour: clean(row[keyMap.hour]),
          grade: clean(row[keyMap.grade]),
          weight: num(row[keyMap.actualweight]),
          weightClass: clean(row[keyMap.weightgroup]),

          // 🏋️ STRENGTH
          bench: num(row[keyMap.benchpress]),
          squat: num(row[keyMap.squat]),
          clean: num(row[keyMap.hangclean]),

          // ⚡ EXPLOSIVE
          vertical: num(row[keyMap.verticaljump]),
          broad: num(row[keyMap.broadjump]),
          med: num(row[keyMap.medballtoss]),

          // 🏃 SPEED
          agility: num(row[keyMap.proagility]),
          ten: num(row[keyMap["10yddash"]]),
          forty: num(row[keyMap["40yddash"]]),

          // 🔁 CORE
          situps: num(row[keyMap.situps])
        };

        // ========================================
        // 📊 SCORE (SMART FALLBACK)
        // ========================================

        athlete.score =
          num(row[keyMap.totalathleticperformancepoints]) ||
          num(row[keyMap["3liftprojectedmaxtotal"]]) ||
          (athlete.bench + athlete.squat + athlete.clean);

        return athlete;
      })

      // ========================================
      // ✅ CLEAN DATA
      // ========================================
      .filter(a => {
        if (!a.name) return false;

        return (
          a.bench > 0 ||
          a.squat > 0 ||
          a.clean > 0 ||
          a.vertical > 0 ||
          a.broad > 0 ||
          a.med > 0 ||
          a.agility > 0 ||
          a.ten > 0 ||
          a.forty > 0 ||
          a.situps > 0 ||
          a.score > 0
        );
      });

    console.log("✅ DATA READY:", APP_DATA.length);

    return APP_DATA;

  } catch (err) {
    console.error("❌ Data load failed:", err);
    return [];
  }
}

/* ========================================
   🔥 KEY NORMALIZATION SYSTEM
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
  if (val === null || val === undefined) return 0;

  const n = parseFloat(String(val).replace(/[^0-9.\-]/g, ""));
  return isNaN(n) ? 0 : n;
}

function clean(val) {
  if (!val) return "";
  return String(val).trim();
}
