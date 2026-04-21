// ===============================
// 🔥 ELITE V3 DATA LOADER (PRODUCTION)
// ===============================

/* ========================================
   CSV LOADER
======================================== */

async function loadCSV(url) {
  const response = await fetch(url);
  const csvText = await response.text();

  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true
  });

  return parsed.data;
}

/* ========================================
   GLOBAL STATE
======================================== */

let APP_DATA = [];

/* ========================================
   MAIN DATA LOAD
======================================== */

async function loadAthleteData() {
  const url =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vS81ri1sMtpBVl605PVV_Te2WdA3hVohdXIb1Lc22CrUJSdzXUzGa-0Z0THGtlSa9WVaa77owi-_BAR/pub?output=csv&t=" +
    Date.now();

  const raw = await loadCSV(url);

  console.log("🧪 RAW SAMPLE:", raw[0]);

  APP_DATA = raw
    .map(row => {

      // 🔥 BULLETPROOF SCORE DETECTION
      const scoreKey = Object.keys(row).find(k =>
        k && k.toLowerCase().includes("athletic")
      );

      const athlete = {
        name: clean(row["Student-Athlete"]),
        date: clean(row["Test Date"]),

        bench: num(row["Bench Press"]),
        squat: num(row["Squat"]),
        clean: num(row["Hang Clean"]),

        vertical: num(row["Vertical Jump"]),
        broad: num(row["Broad Jump"]),
        med: num(row["Med Ball Toss"]),

        agility: num(row["Pro Agility"]),
        ten: num(row["10 yd"]),
        forty: num(row["40 yd"]),

        situps: num(row["Sit-Ups"]),

        // ✅ SAFE SCORE
        score: num(row[scoreKey])
      };

      // unified alias
      athlete.overall = athlete.score;

      return athlete;
    })

    /* ========================================
       DATA CLEANING
    ======================================== */
    .filter(row => {
      if (!row.name) return false;

      const hasData =
        row.bench > 0 ||
        row.squat > 0 ||
        row.clean > 0 ||
        row.vertical > 0 ||
        row.broad > 0 ||
        row.med > 0 ||
        row.agility > 0 ||
        row.ten > 0 ||
        row.forty > 0 ||
        row.situps > 0 ||
        row.score > 0;

      return hasData;
    });

  console.log("✅ DATA READY:", APP_DATA.length);

  // 🔍 DEBUG (remove later if you want)
  APP_DATA.slice(0, 10).forEach(a => {
    console.log("📊", a.name, "Score:", a.score, "Overall:", a.overall);
  });

  return APP_DATA;
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
