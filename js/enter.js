/* ========================================
   🔥 ELITE ENTER ENGINE (FINAL CLEAN PROD)
   ======================================== */

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
   BUILD ENTRY (USED BY HTML)
   ======================================== */

function buildEntry() {

  const weight = toNumber(getValue("weight"));

  return {
    name: getValue("name"),
    date: getValue("date") || todayISO(),
    hour: getValue("hour"),
    grade: getValue("grade"),
    weight,

    bench: toNumber(getValue("bench")),
    squat: toNumber(getValue("squat")),
    clean: toNumber(getValue("clean")),

    vertical: toNumber(getValue("vertical")),
    broad: toNumber(getValue("broad")),
    medball: toNumber(getValue("medball")),

    agility: toNumber(getValue("agility")),
    ten: toNumber(getValue("ten")),
    forty: toNumber(getValue("forty")),
    situps: toNumber(getValue("situps")),

    weightClass: getWeightClass(weight)
  };
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
   UI HELPERS
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
    el.value = "";
  });

  focusFirstInput();
}

/* ========================================
   UX BOOSTS
   ======================================== */

function focusFirstInput() {
  document.getElementById("name")?.focus();
}

function setupEnterSubmit() {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && document.activeElement.tagName !== "BUTTON") {
      const active = document.activeElement;

      if (active && ["INPUT", "SELECT"].includes(active.tagName)) {
        e.preventDefault();
        document.getElementById("submitBtn")?.click();
      }
    }
  });
}

/* ========================================
   GLOBAL ACCESS (HTML USES THESE)
   ======================================== */

window.buildEntry = buildEntry;
window.validateEntry = validateEntry;
window.showMessage = showMessage;
window.clearForm = clearForm;
