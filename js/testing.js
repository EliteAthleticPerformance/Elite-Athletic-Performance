/* ========================================
   🔥 ELITE V3 TESTING ENGINE (PRODUCTION)
   ======================================== */

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS81ri1sMtpBVl605PVV_Te2WdA3hVohdXIb1Lc22CrUJSdzXUzGa-0Z0THGtlSa9WVaa77owi-_BAR/pub?output=csv";

/* ========================================
   HELPERS
   ======================================== */

const format = (val) => (!val ? "-" : Math.round(val));
const formatDecimal = (val) => (!val ? "-" : Number(val).toFixed(2));

const cleanNumber = (val) => {
  if (!val) return 0;
  val = String(val).replace(/"/g, "").trim();
  if (val === "#DIV/0!" || val === "") return 0;
  return parseFloat(val) || 0;
};

const formatDate = (raw) => {
  if (!raw) return "-";
  const d = new Date(raw);
  if (isNaN(d)) return "-";
  return `${d.toLocaleString("default", { month: "short" })} ${d.getFullYear()}`;
};

function findIndex(headers, keywords) {
  const lower = headers.map(h => h.toLowerCase());
  for (let key of keywords) {
    const idx = lower.findIndex(h => h.includes(key));
    if (idx !== -1) return idx;
  }
  return -1;
}

/* ========================================
   STATE
   ======================================== */

let tableData = [];
let currentSort = { col: null, dir: "asc" };
let currentLetter = "ALL";

/* ========================================
   INIT
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {
  loadData();
  setupSearch();
  window.addEventListener("resize", () => renderTable(tableData)); // ✅ FIXED (only once)
});

/* ========================================
   LOAD DATA
   ======================================== */

async function loadData() {
  try {
    const res = await fetch(CSV_URL + "&t=" + Date.now());
    const text = await res.text();

    const parsed = parseCSV(text);
    const headers = parsed.shift().map(h => h.trim());

    const idx = {
      name: findIndex(headers, ["student", "athlete", "name"]),
      date: findIndex(headers, ["date"]),
      hour: findIndex(headers, ["hour"]),
      grade: findIndex(headers, ["grade"]),
      weight: findIndex(headers, ["weight"]),
      group: findIndex(headers, ["group"]),

      bench: findIndex(headers, ["bench"]),
      squat: findIndex(headers, ["squat"]),
      clean: findIndex(headers, ["clean"]),
      vertical: findIndex(headers, ["vertical"]),
      broad: findIndex(headers, ["broad"]),
      med: findIndex(headers, ["med"]),
      agility: findIndex(headers, ["agility"]),
      situps: findIndex(headers, ["sit"]),
      ten: findIndex(headers, ["10"]),
      forty: findIndex(headers, ["40"]),

      score: findIndex(headers, [
        "total athletic performance",
        "performance",
        "points",
        "score"
      ])
    };

    console.log("🧪 COLUMN MAP:", idx);

    tableData = parsed
      .map(cols => buildAthlete(cols, idx))
      .filter(Boolean);

    renderAlphabet();
    renderTable(tableData);

    localStorage.setItem("athleteScores", JSON.stringify(tableData));

  } catch (err) {
    console.error("❌ Sheet load error:", err);
  }
}

/* ========================================
   CSV PARSER
   ======================================== */

function parseCSV(text) {
  const rows = [];
  let current = "";
  let insideQuotes = false;
  let row = [];

  for (let char of text) {
    if (char === '"') insideQuotes = !insideQuotes;
    else if (char === "," && !insideQuotes) {
      row.push(current);
      current = "";
    }
    else if (char === "\n" && !insideQuotes) {
      row.push(current);
      rows.push(row);
      row = [];
      current = "";
    }
    else {
      current += char;
    }
  }

  if (current) {
    row.push(current);
    rows.push(row);
  }

  return rows;
}

/* ========================================
   BUILD ATHLETE
   ======================================== */

function buildAthlete(cols, idx) {

  const name = (cols[idx.name] || "").replace(",", ", ").trim();
  if (!name) return null;

  return {
    name,
    date: formatDate(cols[idx.date]),
    hour: cleanNumber(cols[idx.hour]),
    grade: cleanNumber(cols[idx.grade]),
    weight: cleanNumber(cols[idx.weight]),
    group: cols[idx.group] || "",

    bench: cleanNumber(cols[idx.bench]),
    squat: cleanNumber(cols[idx.squat]),
    clean: cleanNumber(cols[idx.clean]),

    vertical: cleanNumber(cols[idx.vertical]),
    broad: cleanNumber(cols[idx.broad]),
    med: cleanNumber(cols[idx.med]),

    agility: cleanNumber(cols[idx.agility]),
    situps: cleanNumber(cols[idx.situps]),
    ten: cleanNumber(cols[idx.ten]),
    forty: cleanNumber(cols[idx.forty]),

    score: cleanNumber(cols[idx.score])
  };
}

/* ========================================
   PR CALCULATION
   ======================================== */

function computeAthletePRs(data) {
  const map = {};

  data.forEach(a => {
    if (!map[a.name]) {
      map[a.name] = {
        bench: 0, squat: 0, clean: 0,
        vertical: 0, broad: 0, med: 0,
        agility: Infinity, situps: 0,
        ten: Infinity, forty: Infinity
      };
    }

    const p = map[a.name];

    p.bench = Math.max(p.bench, a.bench);
    p.squat = Math.max(p.squat, a.squat);
    p.clean = Math.max(p.clean, a.clean);
    p.vertical = Math.max(p.vertical, a.vertical);
    p.broad = Math.max(p.broad, a.broad);
    p.med = Math.max(p.med, a.med);
    p.situps = Math.max(p.situps, a.situps);

    if (a.agility > 0) p.agility = Math.min(p.agility, a.agility);
    if (a.ten > 0) p.ten = Math.min(p.ten, a.ten);
    if (a.forty > 0) p.forty = Math.min(p.forty, a.forty);
  });

  return map;
}

/* ========================================
   RENDER TABLE
   ======================================== */

function renderTable(data) {

  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    document.getElementById("testingTable").style.display = "none";
    renderMobileCards(data);
    return;
  }

  document.getElementById("testingTable").style.display = "table";
  document.getElementById("mobileCards").innerHTML = "";

  const tbody = document.querySelector("#testingTable tbody");
  tbody.innerHTML = "";

  const prMap = computeAthletePRs(data);

  data.forEach(a => {
    const prs = prMap[a.name];

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${a.name}</td>
      <td>${a.date}</td>
      <td>${a.hour}</td>
      <td>${a.grade}</td>
      <td>${format(a.weight)}</td>
      <td>${a.group}</td>

      <td class="${a.bench === prs.bench ? 'pr' : ''}">${format(a.bench)}</td>
      <td class="${a.squat === prs.squat ? 'pr' : ''}">${format(a.squat)}</td>
      <td class="${a.clean === prs.clean ? 'pr' : ''}">${format(a.clean)}</td>

      <td class="${a.vertical === prs.vertical ? 'pr' : ''}">${format(a.vertical)}</td>
      <td class="${a.broad === prs.broad ? 'pr' : ''}">${formatDecimal(a.broad)}</td>
      <td class="${a.med === prs.med ? 'pr' : ''}">${formatDecimal(a.med)}</td>

      <td class="${a.agility === prs.agility ? 'pr' : ''}">${formatDecimal(a.agility)}</td>
      <td class="${a.situps === prs.situps ? 'pr' : ''}">${format(a.situps)}</td>
      <td class="${a.ten === prs.ten ? 'pr' : ''}">${formatDecimal(a.ten)}</td>
      <td class="${a.forty === prs.forty ? 'pr' : ''}">${formatDecimal(a.forty)}</td>
    `;

    tbody.appendChild(tr);
  });
}

/* ========================================
   MOBILE
   ======================================== */

function renderMobileCards(data) {
  const container = document.getElementById("mobileCards");
  if (!container) return;

  container.innerHTML = "";

  const prMap = computeAthletePRs(data);

  data.forEach(a => {
    const prs = prMap[a.name];

    const card = document.createElement("div");
    card.className = "athlete-card";

    card.innerHTML = `
      <div class="card-header">
        <div class="name">${a.name}</div>
        <div class="meta">${a.grade} | ${a.group}</div>
      </div>

      <div class="card-grid">
        <div class="${a.bench === prs.bench ? 'pr' : ''}">Bench: ${format(a.bench)}</div>
        <div class="${a.squat === prs.squat ? 'pr' : ''}">Squat: ${format(a.squat)}</div>
        <div class="${a.clean === prs.clean ? 'pr' : ''}">Clean: ${format(a.clean)}</div>
        <div class="${a.vertical === prs.vertical ? 'pr' : ''}">Vert: ${format(a.vertical)}</div>
        <div class="${a.broad === prs.broad ? 'pr' : ''}">Broad: ${formatDecimal(a.broad)}</div>
        <div class="${a.med === prs.med ? 'pr' : ''}">Med: ${formatDecimal(a.med)}</div>
        <div class="${a.agility === prs.agility ? 'pr' : ''}">Agility: ${formatDecimal(a.agility)}</div>
        <div class="${a.ten === prs.ten ? 'pr' : ''}">10 yd: ${formatDecimal(a.ten)}</div>
        <div class="${a.forty === prs.forty ? 'pr' : ''}">40 yd: ${formatDecimal(a.forty)}</div>
      </div>
    `;

    container.appendChild(card);
  });
}

/* ========================================
   SEARCH
   ======================================== */

function setupSearch() {
  const input = document.getElementById("searchInput");
  if (!input) return;

  input.addEventListener("input", () => {
    const term = input.value.toLowerCase();

    const filtered = tableData.filter(a =>
      a.name.toLowerCase().includes(term)
    );

    renderTable(filtered);
  });
}

/* ========================================
   A-Z FILTER
   ======================================== */

function renderAlphabet() {
  const bar = document.getElementById("alphabetBar");
  if (!bar) return;

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const counts = {};

  tableData.forEach(a => {
    const last = (a.name.split(",")[0] || "").trim().toUpperCase()[0];
    counts[last] = (counts[last] || 0) + 1;
  });

  bar.innerHTML = `<span class="letter active" onclick="showAll()">ALL (${tableData.length})</span>`;

  letters.forEach(letter => {
    const count = counts[letter] || 0;

    bar.innerHTML += `
      <span class="letter" onclick="filterByLetter('${letter}')">
        ${letter}${count ? ` (${count})` : ""}
      </span>
    `;
  });
}

function filterByLetter(letter) {
  currentLetter = letter;
  setActiveLetter(letter);

  const filtered = tableData.filter(a => {
    const last = a.name.split(",")[0].trim().toUpperCase();
    return last.startsWith(letter);
  });

  renderTable(filtered);
}

function showAll() {
  currentLetter = "ALL";
  setActiveLetter("ALL");
  renderTable(tableData);
}

function setActiveLetter(letter) {
  document.querySelectorAll(".letter").forEach(el => {
    el.classList.remove("active");
    if (el.textContent.startsWith(letter)) {
      el.classList.add("active");
    }
  });
}
