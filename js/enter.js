// ========================================
// 🔥 ELITE ENTER ENGINE (PRODUCTION FINAL)
// ========================================

let isSubmitting = false;

/* ========================================
   INIT
======================================== */

document.addEventListener("DOMContentLoaded", () => {
  console.log("ENTER.JS LOADED");

  const btn = document.getElementById("submitBtn");

  if (!btn) {
    console.error("❌ submitBtn NOT FOUND");
    return;
  }

  btn.addEventListener("click", async () => {
    console.log("🔥 SAVE BUTTON CLICKED");

    try {
      await saveAthlete();
    } catch (err) {
      console.error("❌ SAVE ERROR:", err);
    }
  });
});

/* ========================================
   SCHOOL (🔥 CRITICAL FIX)
======================================== */

function getSchool() {
  const urlParams = new URLSearchParams(window.location.search);
  const urlSchool = urlParams.get("school");

  const stored = sessionStorage.getItem("school");

  const school = (urlSchool || stored || "pleasanthill")
    .toLowerCase()
    .replace(/\s+/g, "");

  // keep storage synced
  sessionStorage.setItem("school", school);

  console.log("🏫 ACTIVE SCHOOL (ENTER):", school);

  return school;
}

/* ========================================
   HELPERS
======================================== */

function getValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

function toNumber(val) {
  const num = parseFloat(val);
  return isNaN(num) ? 0 : num;
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

/* ========================================
   NAME FORMAT
======================================== */

function normalizeName(name) {
  if (!name) return "";

  if (name.includes(",")) {
    const [last, first] = name.split(",");
    return `${last.trim()}, ${first.trim()}`;
  }

  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    const first = parts.slice(0, -1).join(" ");
    const last = parts.slice(-1)[0];
    return `${last}, ${first}`;
  }

  return name;
}

/* ========================================
   WEIGHT CLASS
======================================== */

function getWeightClass(weight) {
  if (weight <= 120) return 100;
  if (weight <= 140) return 121;
  if (weight <= 160) return 141;
  if (weight <= 180) return 161;
  if (weight <= 195) return 181;
  if (weight <= 210) return 196;
  if (weight <= 225) return 211;
  if (weight <= 240) return 226;
  if (weight <= 255) return 241;
  if (weight <= 270) return 256;
  if (weight <= 285) return 271;
  if (weight <= 300) return 286;
  return 301;
}

/* ========================================
   BUILD ENTRY
======================================== */

function buildEntry() {
  const weight = toNumber(getValue("weight"));
  const school = getSchool();

  const group = getWeightClass(weight); // 🔥 FIX

  const entry = {
  school,

  name: normalizeName(getValue("name")),
  date: getValue("date") || todayISO(),
  gender: getValue("gender"),
  grade: getValue("grade"),
  weight,

  group,

  // =========================
  // SPORTS
  // =========================

  primarySport: getValue("primarySport"),
  primaryPosition: getValue("primaryPosition"),
  primaryPosition2: getValue("primaryPosition2"),

  secondarySport: getValue("secondarySport"),
  secondaryPosition: getValue("secondaryPosition"),
  secondaryPosition2: getValue("secondaryPosition2"),

  thirdSport: getValue("thirdSport"),
  thirdPosition: getValue("thirdPosition"),
  thirdPosition2: getValue("thirdPosition2"),

  // =========================
  // STRENGTH
  // =========================

  bench: toNumber(getValue("bench")),
  squat: toNumber(getValue("squat")),
  clean: toNumber(getValue("clean")),

  // =========================
  // EXPLOSIVE
  // =========================

  vertical: toNumber(getValue("vertical")),
  broad: toNumber(getValue("broad")),
  medball: toNumber(getValue("medball")),

  // =========================
  // SPEED
  // =========================

  agility: toNumber(getValue("agility")),
  ten: toNumber(getValue("ten")),
  forty: toNumber(getValue("forty")),
  situps: toNumber(getValue("situps"))
};

  console.log("📦 BUILT ENTRY:", entry);

  return entry;
}

/* ========================================
   VALIDATION
======================================== */

function validateEntry(entry) {
  if (!entry.name) {
    showMessage("Enter athlete name", "error");
    return false;
  }

  if (!entry.weight) {
    showMessage("Enter weight", "error");
    return false;
  }

  return true;
}

/* ========================================
   SUBMIT TO GOOGLE (CORS-SAFE FINAL)
======================================== */

async function submitToGoogle(entry, url) {
  try {
    console.log("🚀 POSTING TO URL:", url);
    console.log("📦 DATA BEING SENT:", entry);

    // Convert to form data (required for Apps Script)
    const body = new URLSearchParams(entry);

    // 🔥 CRITICAL: no-cors mode
    await fetch(url, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body
    });

    // ⚠️ You cannot read response in no-cors mode
    console.log("✅ POST SENT (no-cors mode)");

    // ✅ Assume success if no error thrown
    showMessage("✅ Saved successfully!", "success");

    // 🔄 Reload data if available
    if (typeof loadAthleteData === "function") {
      loadAthleteData(true);
    }

    // 🧹 Clear form after short delay
    setTimeout(clearForm, 500);

  } catch (err) {
    console.error("❌ SUBMIT ERROR:", err);
    showMessage("❌ Failed to save", "error");
  }
}

/* ========================================
   CONFIG
======================================== */

async function getSubmitURL() {
  await window.APP_READY;

  const url = window.SCHOOL_CONFIG?.submitURL;

  console.log("🔥 FINAL SUBMIT URL:", url);

  if (!url) {
    showMessage("Config error: missing submitURL", "error");
    return null;
  }

  return url;
}

/* ========================================
   MAIN SAVE
======================================== */

async function saveAthlete() {
  if (isSubmitting) return;

  isSubmitting = true;

  const btn = document.getElementById("submitBtn");

  if (btn) {
    btn.disabled = true;
    btn.textContent = "Saving...";
  }

  const entry = buildEntry();

  if (!validateEntry(entry)) {
    resetButton(btn);
    return;
  }

  const submitURL = await getSubmitURL();

  if (!submitURL) {
    resetButton(btn);
    return;
  }

  await submitToGoogle(entry, submitURL);

  resetButton(btn);
}

function resetButton(btn) {
  isSubmitting = false;

  if (btn) {
    btn.disabled = false;
    btn.textContent = "💾 Save Test";
  }
}

/* ========================================
   UI
======================================== */

function showMessage(msg, type) {
  let el = document.getElementById("formMessage");

  if (!el) {
    el = document.createElement("div");
    el.id = "formMessage";
    el.style.marginTop = "15px";
    el.style.textAlign = "center";
    document.querySelector(".card")?.appendChild(el);
  }

  el.textContent = msg;

  el.style.color =
    type === "success" ? "#00e676" :
    type === "error" ? "#ff5252" :
    "#ffd740";

  setTimeout(() => {
    el.textContent = "";
  }, 3000);
}

function clearForm() {
  document.querySelectorAll("input, select").forEach(el => {
    if (el.id !== "date") el.value = "";
  });

  focusFirstInput();
}

/* ========================================
   UX
======================================== */

function focusFirstInput() {
  document.getElementById("name")?.focus();
}

/* ========================================
   GLOBAL
======================================== */

window.saveAthlete = saveAthlete;

// ========================================
// 🏈 SPORT POSITION MAP
// ========================================

const SPORT_POSITIONS = {

  Football: [
    "OL", "QB", "RB", "TE",
    "WR", "DL", "ILB", "OLB", "CB", "S"
  ],

  Basketball_Boys: [
    "PG", "SG", "F", "C"
  ],

    Basketball_Girls: [
    "PG", "SG", "F", "C"
  ],

  Baseball: [
    "P", "C", "IF", "OF", "DH"
  ],

  Softball: [
     "P", "C", "IF", "OF", "DH"
  ],

  Volleyball: [
    "Setter",
    "Outside Hitter",
    "Middle Hitter",
    "Libero",
    "RS",
  ],

  Soccer_Boys: [
    "GK",
    "Defender",
    "Midfielder",
    "Striker"
  ],

  Soccer_Girls: [
    "GK",
    "Defender",
    "Midfielder",
    "Striker"
  ],

  TF_Boys: [
    "Sprints",
    "Distance",
    "Hurdles",
    "LJ",
    "TJ",
     "HJ",
     "SP",
     "Discus",
     "Jav",
     "PV"
  ],

  TF_Grils: [
    "Sprints",
    "Distance",
    "Hurdles",
    "LJ",
    "TJ",
     "HJ",
     "SP",
     "Discus",
     "Jav",
     "PV"
  ], 
};

// ========================================
// 🔥 POSITION DROPDOWNS
// ========================================

function setupPositionDropdowns() {

  connectSportToPositions(
    "primarySport",
    "primaryPosition",
    "primaryPosition2"
  );

  connectSportToPositions(
    "secondarySport",
    "secondaryPosition",
    "secondaryPosition2"
  );

  connectSportToPositions(
    "thirdSport",
    "thirdPosition",
    "thirdPosition2"
  );
}

function connectSportToPositions(
  sportId,
  pos1Id,
  pos2Id
) {

  const sportSelect = document.getElementById(sportId);

  if (!sportSelect) return;

  sportSelect.addEventListener("change", () => {

    const sport = sportSelect.value;

    populatePositionDropdown(pos1Id, sport);
    populatePositionDropdown(pos2Id, sport);

  });
}

function populatePositionDropdown(id, sport) {

  const select = document.getElementById(id);

  if (!select) return;

  select.innerHTML = "";

  const defaultOption = document.createElement("option");

  defaultOption.value = "";
  defaultOption.textContent = "Select Position";

  select.appendChild(defaultOption);

  const positions = SPORT_POSITIONS[sport] || [];

  positions.forEach(position => {

    const option = document.createElement("option");

    option.value = position;
    option.textContent = position;

    select.appendChild(option);

  });
}

// ========================================
// 🚀 INIT POSITION SYSTEM
// ========================================

document.addEventListener("DOMContentLoaded", () => {
  setupPositionDropdowns();
});
