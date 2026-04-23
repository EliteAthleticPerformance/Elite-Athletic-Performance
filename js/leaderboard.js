// ========================================
// 🔥 ELITE LEADERBOARD ENGINE (FINAL)
// ========================================

let grouped = {};
let athletes = [];

/* ========================================
   INIT (SYNCED)
======================================== */

document.addEventListener("headerLoaded", init);

async function init() {
  try {
    await window.APP_READY;

    const data = await loadAthleteData();

    processDataFromJSON(data);

    render();

    const search = document.getElementById("leaderboardSearch");
    if (search) {
      search.addEventListener("input", render);
    }

  } catch (err) {
    console.error("❌ Leaderboard init error:", err);
  }
}

/* ========================================
   UTIL
======================================== */

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

function formatName(name) {
  if (!name.includes(",")) return name;
  const [last, first] = name.split(",");
  return `${first.trim()} ${last.trim()}`;
}

/* ========================================
   PROCESS DATA
======================================== */

function processDataFromJSON(data) {

  const parsed = data.map(row => {

    const bench = toNumber(row.bench);
    const squat = toNumber(row.squat);
    const clean = toNumber(row.clean);

    return {
      name: row.name,
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

      score: toNumber(row.score),
      lift: bench + squat + clean
    };

  }).filter(a => a.name);

  grouped = {};

  parsed.forEach(a => {
    if (!grouped[a.name]) grouped[a.name] = [];
    grouped[a.name].push(a);
  });

  Object.values(grouped).forEach(arr => {
    arr.sort((a, b) => (b.date || 0) - (a.date || 0));
  });

  athletes = Object.keys(grouped).map(name => grouped[name][0]);
}

/* ========================================
   BUILD DATA
======================================== */

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

/* ========================================
   RENDER
======================================== */

function render() {

  const search = document.getElementById("leaderboardSearch")?.value.toLowerCase() || "";

  const allTests = Object.values(grouped).flat();
  const leaderboardData = buildLeaderboardData(allTests);

  const filtered = leaderboardData.filter(a =>
    a.name.toLowerCase().includes(search)
  );

  renderPodium(filtered);
  renderTable(filtered, "liftTable", "lift");
  renderTable(filtered, "scoreTable", "score");
}

/* ========================================
   TABLE
======================================== */

function renderTable(data, tableId, type) {

  const tbody = document.querySelector(`#${tableId} tbody`);
  if (!tbody) return;

  tbody.innerHTML = "";

  const sorted = [...data]
    .filter(a => a[type] > 0)
    .sort((a, b) => b[type] - a[type]);

  if (!sorted.length) {
    tbody.innerHTML = `<tr><td colspan="4">No data</td></tr>`;
    return;
  }

  sorted.forEach((a, i) => {
    tbody.appendChild(createRow(a, i, type));
  });
}

/* ========================================
   PODIUM (DYNAMIC)
======================================== */

function renderPodium(data) {

  const container = document.getElementById("podium");
  if (!container) return;

  const top3 = [...data]
    .filter(a => a.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (top3.length < 3) {
    container.innerHTML = "";
    return;
  }

  const [first, second, third] = top3;

  container.innerHTML = `
    <div class="podium">

      <div class="podium-item second" onclick="goToAthlete('${second.name}')">
        🥈 ${formatName(second.name)}<br>${Math.round(second.score)}
      </div>

      <div class="podium-item first" onclick="goToAthlete('${first.name}')">
        🥇 ${formatName(first.name)}<br>${Math.round(first.score)}
      </div>

      <div class="podium-item third" onclick="goToAthlete('${third.name}')">
        🥉 ${formatName(third.name)}<br>${Math.round(third.score)}
      </div>

    </div>
  `;
}

/* ========================================
   ROW
======================================== */

function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString();
}

function createRow(a, index, type) {

  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td class="${medal(index)}">${index + 1}</td>
    <td>${formatName(a.name)}</td>
    <td>${safe(a[type])}</td>
    <td>${formatDate(type === "lift" ? a.liftDate : a.scoreDate)}</td>
  `;

  return tr;
}

/* ========================================
   NAV
======================================== */

function goToAthlete(name) {
  const params = new URLSearchParams(window.location.search);
  const school = params.get("school");

  window.location.href = school
    ? `athlete.html?name=${encodeURIComponent(name)}&school=${school}`
    : `athlete.html?name=${encodeURIComponent(name)}`;
}
