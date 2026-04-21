// ===============================
// 🔥 ELITE V4 DATA LOADER (BULLETPROOF)
// ===============================

/* ========================================
   CSV LOADER
======================================== */

async function loadCSV(url) {
  const res = await fetch(url);
  const text = await res.text();

  const parsed = Papa.parse(text, {
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
   MAIN LOAD FUNCTION
======================================== */

async function loadAthleteData() {

  const url =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vS81ri1sMtpBVl605PVV_Te2WdA3hVohdXIb1Lc22CrUJSdzXUzGa-0Z0THGtlSa9WVaa77owi-_BAR/pub?output=csv&t=" +
    Date.now(); // cache bust

  const raw = await loadCSV(url);

  if (!raw || !raw.length) {
    console.warn("⚠️ No data returned from CSV");
    return [];
  }

  console.log("🧪 RAW SAMPLE:", raw[0]);

  // 🔍 normalize keys once (for performance)
  const normalizedKeyMap = buildKeyMap(raw[0]);

  APP_DATA = raw
    .map(row => {

      const athlete = {
        name: clean(row[normalizedKeyMap["studentathlete"]]),
        date: clean(row[normalizedKeyMap["testdate"]]),

        bench: num(row[normalizedKeyMap["benchpress"]]),
        squat: num(row[normalizedKeyMap["squat"]]),
        clean: num(row[normalizedKeyMap["hangclean"]]),

        vertical: num(row[normalizedKeyMap["verticaljump"]]),
        broad: num(row[normalizedKeyMap["broadjump"]]),
        med: num(row[normalizedKeyMap["medballtoss"]]),

        agility: num(row[normalizedKeyMap["proagility"]]),
        ten: num(row[normalizedKeyMap["10yd"]]),
        forty: num(row[normalizedKeyMap["40yd"]]),

        situps: num(row[normalizedKeyMap["situps"]]),

        // 🔥 BULLETPROOF SCORE
        score: num(row[normalizedKeyMap["totalathleticperformancepoints"]])
      };

      athlete.overall = athlete.score;

      return athlete;
    })

    /* ========================================
       CLEAN DATA
    ======================================== */
    .filter(a => {

      if (!a.name) return false;

      const hasData =
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
        a.score > 0;

      return hasData;
    });

  console.log("✅ DATA READY:", APP_DATA.length);

  // 🔍 sample debug
  APP_DATA.slice(0, 10).forEach(a => {
    console.log("📊", a.name, "Score:", a.score);
  });

  return APP_DATA;
}

/* ========================================
   🔥 KEY NORMALIZATION SYSTEM
======================================== */

function normalizeKey(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ""); // remove spaces, line breaks, symbols
}

function buildKeyMap(sampleRow) {
  const map = {};

  Object.keys(sampleRow).forEach(key => {
    const normalized = normalizeKey(key);
    map[normalized] = key;
  });

  // 🔥 REQUIRED FIELDS (auto fallback-safe)
  return {
    studentathlete: map["studentathlete"],
    testdate: map["testdate"],

    benchpress: map["benchpress"],
    squat: map["squat"],
    hangclean: map["hangclean"],

    verticaljump: map["verticaljump"],
    broadjump: map["broadjump"],
    medballtoss: map["medballtoss"],

    proagility: map["proagility"],
    "10yd": map["10yd"],
    "40yd": map["40yd"],

    situps: map["situps"],

    // 🔥 MOST IMPORTANT FIELD
    totalathleticperformancepoints:
      map["totalathleticperformancepoints"] ||
      map["totalathleticperformance"] ||
      map["score"]
  };
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
