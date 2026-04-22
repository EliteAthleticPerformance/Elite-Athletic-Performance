// ===============================
// GLOBAL STATE
// ===============================
let grouped = {};
let athletes = [];
let podiumBuilt = false;

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", init);

async function init() {
  try {
    const data = await loadAthleteData();

    processDataFromJSON(data);

    render(); // 🔥 render immediately

    const search = document.getElementById("leaderboardSearch");
    if (search) search.addEventListener("input", render);

  } catch (err) {
    console.error("❌ Leaderboard init error:", err);
  }
}

// ===============================
// UTIL
// ===============================
function toNumber(val) {
  const num = parseFloat(String(val || "").replace(/[^0-9.\-]/g, ""));
  return isNaN(num) ? 0 : num;
}

function safe(val) {
  return val && val !== 0 ? val : "-";
}

function medal(i) {
  if (i === 0) return "gold";
  if (i === 1) return "silver";
  if (i === 2) return "bronze";
  return "";
}

function parseDateSafe(val) {
  const d = new Date(val);
  return isNaN(d) ? null : d;
}

// ===============================
// PROCESS DATA
// ===============================
function processDataFromJSON(data) {

  const parsed = data.map(row => {

    const bench = toNumber(row.bench);
    const squat = toNumber(row.squat);
    const clean = toNumber(row.clean);

    const score = toNumber(row.score || row.overall);

    return {
      name: row.name,
      dateRaw: row.date,
      date: parseDateSafe(row.date),

      bench,
      squat,
      clean,

      vertical: toNumber(row.vertical),
      broad: toNumber(row.broad),
      med: toNumber(row.med),

      pro: toNumber(row.agility),
      ten: toNumber(row.ten),
      forty: toNumber(row.forty),

      sit: toNumber(row.situps),

      score,
      lift: bench + squat + clean
    };

  }).filter(a => a.name);

  // GROUP
  grouped = {};
  parsed.forEach(a => {
    if (!grouped[a.name]) grouped[a.name] = [];
    grouped[a.name].push(a);
  });

  // SORT each athlete
  Object.values(grouped).forEach(arr => {
    arr.sort((a, b) => (b.date || 0) - (a.date || 0));
  });

  // LATEST snapshot
  athletes = Object.keys(grouped).map(name => grouped[name][0]);
}

// ===============================
// BUILD LEADERBOARD
// ===============================
function buildLeaderboardData(data) {
  const map = {};

  data.forEach(a => {

    if (!map[a.name]) {
      map[a.name] = {
        name: a.name,
        lift: 0,
        score: 0,
        liftDate: null,
        scoreDate: null
      };
    }

    const athlete = map[a.name];

    if (a.lift > athlete.lift) {
      athlete.lift = a.lift;
      athlete.liftDate = a.date;
    }

    if (a.score > athlete.score) {
      athlete.score = a.score;
      athlete.scoreDate = a.date;
    }
  });

  return Object.values(map);
}

// ===============================
// RENDER
// ===============================
function render() {

  const search = document.getElementById("leaderboardSearch")?.value.toLowerCase() || "";

  const allTests = Object.values(grouped).flat();
  const leaderboardData = buildLeaderboardData(allTests);

  const filtered = leaderboardData.filter(a =>
    a.name.toLowerCase().includes(search)
  );

  // 🔥 CLEAN PODIUM BUILD
  if (!podiumBuilt) {
    renderPodium(leaderboardData);
    podiumBuilt = true;
  }

  renderTable(filtered, "liftTable", "lift");
  renderTable(filtered, "scoreTable", "score");
}

// ===============================
// TABLE
// ===============================
function renderTable(data, tableId, type) {

  const tbody = document.querySelector(`#${tableId} tbody`);
  if (!tbody) return;

  tbody.innerHTML = "";

  const sorted = [...data]
    .filter(a => a[type] > 0)
    .sort((a, b) => b[type] - a[type]);

  sorted.forEach((a, i) => {
    tbody.appendChild(createRow(a, i, type));
  });
}

// ===============================
// PODIUM
// ===============================
function renderPodium(data) {

  const container = document.getElementById("podium");
  if (!container) return;

  const top3 = [...data]
    .filter(a => a.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (top3.length < 3) return;

  const [first, second, third] = top3;

  container.innerHTML = `
    <div class="podium">

      <div class="podium-item second" onclick="goToAthlete('${second.name}')">
        🥈 ${second.name}<br>${Math.round(second.score)}
      </div>

      <div class="podium-item first" onclick="goToAthlete('${first.name}')">
        🥇 ${first.name}<br>${Math.round(first.score)}
      </div>

      <div class="podium-item third" onclick="goToAthlete('${third.name}')">
        🥉 ${third.name}<br>${Math.round(third.score)}
      </div>

    </div>
  `;
}

// ===============================
// ROW CREATION
// ===============================
function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString();
}

function createRow(a, index, type) {

  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td class="${medal(index)}">${index + 1}</td>
    <td>${a.name}</td>
    <td>${safe(a[type])}</td>
    <td>${formatDate(type === "lift" ? a.liftDate : a.scoreDate)}</td>
  `;

  return tr;
}

// ===============================
// NAVIGATION (🔥 FIXED)
// ===============================
function goToAthlete(name) {
  const params = new URLSearchParams(window.location.search);
  const school = params.get("school");

  window.location.href = school
    ? `athlete.html?name=${encodeURIComponent(name)}&school=${school}`
    : `athlete.html?name=${encodeURIComponent(name)}`;
}
