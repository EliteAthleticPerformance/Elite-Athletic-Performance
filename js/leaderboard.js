/* ========================================
   🔥 ELITE V3 LEADERBOARD ENGINE
   ======================================== */

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS81ri1sMtpBVl605PVV_Te2WdA3hVohdXIb1Lc22CrUJSdzXUzGa-0Z0THGtlSa9WVaa77owi-_BAR/pub?output=csv";

/* ========================================
   STATE
   ======================================== */

let rawData = [];
let leaderboardData = [];

/* ========================================
   INIT
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {
  loadData();
  setupSearch();
});

/* ========================================
   FETCH DATA
   ======================================== */

async function loadData() {
  try {
    const res = await fetch(SHEET_URL + "?t=" + Date.now());
    const text = await res.text();

    rawData = parseCSV(text);

    leaderboardData = processData(rawData);

    render(leaderboardData);

  } catch (err) {
    console.error("Leaderboard load error:", err);
  }
}

/* ========================================
   CSV PARSER (SAFE)
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
   DATA PROCESSING
   ======================================== */

function processData(rows) {

  const headers = rows.shift().map(h => h.trim());

  const getIndex = (name) =>
    headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()));

  const grouped = {};

  rows.forEach(cols => {

    const name = (cols[getIndex("student")] || "").trim();
    if (!name) return;

    const athlete = {
      name,
      date: formatDate(cols[getIndex("date")]),

      bench: toNumber(cols[getIndex("bench")]),
      squat: toNumber(cols[getIndex("squat")]),
      clean: toNumber(cols[getIndex("clean")]),

      vertical: toNumber(cols[getIndex("vertical")]),
      broad: toNumber(cols[getIndex("broad")]),
      med: toNumber(cols[getIndex("med")]),

      agility: toNumber(cols[getIndex("agility")]),
      situps: toNumber(cols[getIndex("sit")]),

      ten: toNumber(cols[getIndex("10")]),
      forty: toNumber(cols[getIndex("40")])
    };

    if (!grouped[name]) grouped[name] = [];
    grouped[name].push(athlete);
  });

  // Keep most recent test
  const latest = Object.values(grouped).map(arr =>
    arr.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
  );

  return latest.map(a => ({
    ...a,
    scores: calculateScores(a)
  }));
}

/* ========================================
   SCORE ENGINE (🔥 CORE)
   ======================================== */

function calculateScores(a) {

  const strength = avg(a.bench, a.squat, a.clean);
  const explosive = avg(a.vertical, a.broad, a.med);
  const speed = avg(a.ten, a.forty);
  const conditioning = avg(a.agility, a.situps);

  const performance = avg(
    strength,
    explosive,
    speed,
    conditioning
  );

  return {
    strength: round(strength),
    explosive: round(explosive),
    speed: round(speed),
    conditioning: round(conditioning),
    performance: round(performance)
  };
}

/* ========================================
   RENDER
   ======================================== */

function render(data) {

  const liftBody = document.querySelector("#liftTable tbody");
  const scoreBody = document.querySelector("#scoreTable tbody");

  const mobileLift = document.getElementById("mobileLift");
  const mobileScore = document.getElementById("mobileScore");

  if (!liftBody || !scoreBody) return;

  // Sort copies
  const liftRank = [...data].sort((a, b) =>
    (b.bench + b.squat + b.clean) - (a.bench + a.squat + a.clean)
  );

  const scoreRank = [...data].sort((a, b) =>
    b.scores.performance - a.scores.performance
  );

  renderTable(liftBody, mobileLift, liftRank, "lift");
  renderTable(scoreBody, mobileScore, scoreRank, "score");
}

/* ========================================
   TABLE BUILDER
   ======================================== */

function renderTable(tbody, mobile, data, type) {

  tbody.innerHTML = "";
  if (mobile) mobile.innerHTML = "";

  data.forEach((a, i) => {

    const medal =
  i === 0 ? "rank-1" :
  i === 1 ? "rank-2" :
  i === 2 ? "rank-3" : "";

tr.innerHTML = `
  <td class="${medal}">${i + 1}</td>
  <td>${a.name}</td>
  <td><strong>${value}</strong></td>
  <td>${a.date}</td>
`;

    const value =
      type === "lift"
        ? (a.bench + a.squat + a.clean)
        : a.scores.performance;

    // TABLE ROW
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="${medal}">${i + 1}</td>
      <td>${a.name}</td>
      <td>${value || "-"}</td>
      <td>${a.date}</td>
    `;

    tbody.appendChild(tr);

    // MOBILE CARD
    if (mobile) {
      mobile.innerHTML += `
        <div class="card">
          <strong class="${medal}">${i + 1}. ${a.name}</strong><br>
          ${type === "lift" ? "Total" : "Score"}: ${value || "-"}<br>
          ${a.date}
        </div>
      `;
    }
  });
}

/* ========================================
   SEARCH
   ======================================== */

function setupSearch() {
  const input = document.getElementById("search");

  if (!input) return;

  input.addEventListener("input", () => {
    const term = input.value.toLowerCase();

    const filtered = leaderboardData.filter(a =>
      a.name.toLowerCase().includes(term)
    );

    render(filtered);
  });
}

/* ========================================
   UTILITIES
   ======================================== */

function toNumber(val) {
  if (!val) return 0;
  return parseFloat(String(val).replace(/[^0-9.\-]/g, "")) || 0;
}

function formatDate(raw) {
  if (!raw) return "-";
  const d = new Date(raw);
  return `${d.toLocaleString("default", { month: "short" })} ${d.getFullYear()}`;
}

function avg(...nums) {
  const valid = nums.filter(n => !isNaN(n));
  if (!valid.length) return 0;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

function round(n) {
  return Math.round(n || 0);
}