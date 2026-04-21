/* ========================================
   🔥 ELITE V3 ENTER ENGINE (PRODUCTION)
   ======================================== */

// 🔥 REQUIRED: Add your Google Apps Script URL here
const SCRIPT_URL = ""; // ← paste your URL here when ready

/* ========================================
   INIT
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {
  focusFirstInput();
  setupEnterSubmit();
});

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
   ⚖️ WEIGHT CLASS SYSTEM
   ======================================== */

function getWeightClass(weight) {
  if (weight <= 120) return "100";
  if (weight <= 140) return "121";
  if (weight <= 160) return "141";
  if (weight <= 180) return "161";
  if (weight <= 195) return "181";
  if (weight <= 210) return "196";
  if (weight <= 225) return "211";
  if (weight <= 240) return "226";
  if (weight <= 255) return "241";
  if (weight <= 270) return "256";
  if (weight <= 285) return "271";
  if (weight <= 300) return "286";
  return "301+";
}

/* ========================================
   MAIN SAVE FUNCTION
   ======================================== */

async function saveAthlete() {

  const btn = document.querySelector(".save-btn");
  if (btn) btn.disabled = true;

  const entry = buildEntry();

  if (!validateEntry(entry)) {
    if (btn) btn.disabled = false;
    return;
  }

  try {

    if (!SCRIPT_URL) throw new Error("No script URL");

    const res = await sendToGoogle(entry);

    if (!res.ok) throw new Error("Network response failed");

    showMessage("✅ Saved to Google Sheets!", "success");

  } catch (err) {
    console.warn("⚠️ Cloud save failed, using offline:", err);

    saveOffline(entry);
    showMessage("⚠️ Offline — saved locally", "warning");
  }

  clearForm();

  if (btn) btn.disabled = false;
}

/* ========================================
   BUILD ENTRY OBJECT
   ======================================== */

function buildEntry() {

  const weight = toNumber(getValue("weight"));

  const entry = {
    name: getValue("name"),
    date: getValue("date") || todayISO(),
    weight,
    weightClass: getWeightClass(weight),

    bench: toNumber(getValue("bench")),
    squat: toNumber(getValue("squat")),
    clean: toNumber(getValue("clean")),

    vertical: toNumber(getValue("vertical")),
    broad: toNumber(getValue("broad")),
    med: toNumber(getValue("medball")), // 🔥 unified naming

    agility: toNumber(getValue("agility")),
    ten: toNumber(getValue("ten")),
    forty: toNumber(getValue("forty")),
    situps: toNumber(getValue("situps"))
  };

  // Derived metrics
  entry.total = entry.bench + entry.squat + entry.clean;

  // 🔥 Optional: calculate score locally (faster UI consistency)
  entry.score =
    entry.bench +
    entry.squat +
    entry.clean +
    entry.vertical +
    entry.broad +
    entry.med;

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

  if (!entry.bench && !entry.squat && !entry.clean) {
    showMessage("Enter at least one strength value", "error");
    return false;
  }

  return true;
}

/* ========================================
   API CALL
   ======================================== */

async function sendToGoogle(entry) {
  return fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify(entry),
    headers: {
      "Content-Type": "application/json"
    }
  });
}

/* ========================================
   OFFLINE SAVE
   ======================================== */

function saveOffline(entry) {

  let data = [];

  try {
    data = JSON.parse(localStorage.getItem("athleteScores")) || [];
  } catch {
    data = [];
  }

  data.push(entry);

  localStorage.setItem("athleteScores", JSON.stringify(data));
}

/* ========================================
   UI HELPERS
   ======================================== */

function clearForm() {
  document.querySelectorAll("input, select").forEach(el => {
    el.value = "";
  });

  focusFirstInput();
}

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

/* ========================================
   UX BOOSTS
   ======================================== */

function focusFirstInput() {
  document.getElementById("name")?.focus();
}

function setupEnterSubmit() {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const active = document.activeElement;

      if (active && ["INPUT", "SELECT"].includes(active.tagName)) {
        e.preventDefault();
        saveAthlete();
      }
    }
  });
}
