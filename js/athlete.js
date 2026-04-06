/* ========================================
   🔥 ELITE V3 ATHLETE PROFILE ENGINE
   ======================================== */

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS81ri1sMtpBVl605PVV_Te2WdA3hVohdXIb1Lc22CrUJSdzXUzGa-0Z0THGtlSa9WVaa77owi-_BAR/pub?output=csv";

/* ========================================
   STATE
   ======================================== */

let rawData = [];
let processedData = [];

const params = new URLSearchParams(window.location.search);
const athleteName = decodeURIComponent(params.get("name") || "");

/* ========================================
   INIT
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {
  loadData();
});

/* ========================================
   FETCH DATA
   ======================================== */

async function loadData() {
  try {
    const res = await fetch(SHEET_URL + "?t=" + Date.now());
    const text = await res.text();

    rawData = parseCSV(text);
    processedData = processData(rawData);

    render();

  } catch (err) {
    console.error("Athlete load error:", err);
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
   PROCESS DATA
   ======================================== */

function processData(rows) {

  const headers = rows.shift().map(h => h.trim());

  const getIndex = (name) =>
    headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()));

  return rows.map(cols => {

    const name = clean(cols[getIndex("student")]);
    if (!name) return null;

    return {
      name,
      date: formatDate(cols[getIndex("date")]),
      weight: toNumber(cols[getIndex("weight")]),

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

  }).filter(Boolean);
}

/* ========================================
   MAIN RENDER
   ======================================== */

function render() {

  const athleteData = processedData.filter(a =>
    normalize(a.name).includes(normalize(athleteName))
  );

  if (!athleteData.length) {
    setText("athleteName", "Athlete not found");
    return;
  }

  const sorted = [...athleteData]
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const latest = sorted[0];
  const prev = sorted[1];

  /* ===== TEAM RANK ===== */

  const latestAll = getLatestPerAthlete(processedData);

  const ranked = [...latestAll]
    .map(a => ({
      ...a,
      score: calcPerformance(a)
    }))
    .sort((a, b) => b.score - a.score);

  const rank = ranked.findIndex(a =>
    normalize(a.name) === normalize(latest.name)
  ) + 1;

  const percentile = Math.round((1 - (rank - 1) / ranked.length) * 100);

  /* ===== DISPLAY ===== */

  setText("athleteName", latest.name);

  setMetric("bench", latest.bench, prev?.bench);
  setMetric("squat", latest.squat, prev?.squat);
  setMetric("clean", latest.clean, prev?.clean);

  setMetric("verticalScore", latest.vertical, prev?.vertical);
  setMetric("broadScore", latest.broad, prev?.broad);
  setMetric("medballScore", latest.med, prev?.med);

  setMetric("proagility", latest.agility, prev?.agility);
  setMetric("situps", latest.situps, prev?.situps);
  setMetric("tenyard", latest.ten, prev?.ten);
  setMetric("forty", latest.forty, prev?.forty);

  setText("rank", `#${rank} / ${ranked.length}`);
  setText("percentile", `Top ${percentile}%`);

  renderHistoryTable(sorted);
  renderChart(sorted);
  renderRadarChart(latest);
}

/* ========================================
   HISTORY TABLE
   ======================================== */

function renderHistoryTable(data) {

  const tbody = document.querySelector("#historyTable tbody");
  if (!tbody) return;

  tbody.innerHTML = data.map(a => `

    <tr>
      <td>${a.date}</td>
      <td>${a.bench || "-"}</td>
      <td>${a.squat || "-"}</td>
      <td>${a.clean || "-"}</td>
      <td>${avg(a.bench, a.squat, a.clean)}</td>

      <td>${a.vertical || "-"}</td>
      <td>${a.broad || "-"}</td>
      <td>${a.med || "-"}</td>

      <td>${a.agility || "-"}</td>
      <td>${a.situps || "-"}</td>
      <td>${a.ten || "-"}</td>
      <td>${a.forty || "-"}</td>

      <td>${calcPerformance(a)}</td>
    </tr>

  `).join("");
}

/* ========================================
   CHART
   ======================================== */

function renderChart(history) {

  if (typeof Chart === "undefined") return;

  const ctx = document.getElementById("progressChart");
  if (!ctx) return;

  if (window.chart) window.chart.destroy();

  window.chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: history.map(a => a.date).reverse(),
      datasets: [
        {
          label: "Strength",
          data: history.map(a =>
            avg(a.bench, a.squat, a.clean)
          ).reverse()
        },
        {
          label: "Performance",
          data: history.map(a =>
            calcPerformance(a)
          ).reverse()
        }
      ]
    }
  });
}

function renderRadarChart(a) {

  if (typeof Chart === "undefined") return;

  const ctx = document.getElementById("radarChart");
  if (!ctx) return;

  if (window.radarChart) window.radarChart.destroy();

  /* =========================
     🔥 NORMALIZATION (KEY)
  ========================= */

  const normalize = (val, min, max) => {
    if (!val) return 0;
    return Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100));
  };

  const data = [
    normalize(a.bench, 100, 400),
    normalize(a.squat, 150, 500),
    normalize(a.clean, 100, 300),

    normalize(a.vertical, 15, 40),
    normalize(a.broad, 6, 11),
    normalize(a.med, 10, 25),

    normalize(a.forty, 6, 4),     // reversed (lower is better)
    normalize(a.agility, 6, 4)    // reversed
  ];

  /* =========================
     🎨 COLOR SYSTEM
  ========================= */

  const gradient = ctx.getContext("2d").createRadialGradient(150,150,20,150,150,200);
  gradient.addColorStop(0, "rgba(0,230,118,0.6)");
  gradient.addColorStop(1, "rgba(0,102,255,0.1)");

  /* =========================
     📊 CHART
  ========================= */

  window.radarChart = new Chart(ctx, {
    type: "radar",
    data: {
      labels: [
        "Bench","Squat","Clean",
        "Vertical","Broad","Med Ball",
        "Speed","Agility"
      ],
      datasets: [{
        label: "Performance",
        data: data,
        backgroundColor: gradient,
        borderColor: "#00E676",
        borderWidth: 2,
        pointBackgroundColor: "#00E676",
        pointBorderColor: "#fff",
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: {
            display: false
          },
          grid: {
            color: "rgba(255,255,255,0.1)"
          },
          angleLines: {
            color: "rgba(255,255,255,0.2)"
          },
          pointLabels: {
            color: "#ccc",
            font: {
              size: 12,
              weight: "600"
            }
          }
        }
      }
    }
  });
}

/* ========================================
   UTILITIES
   ======================================== */

function getLatestPerAthlete(data) {
  const grouped = {};

  data.forEach(a => {
    if (!grouped[a.name]) grouped[a.name] = [];
    grouped[a.name].push(a);
  });

  return Object.values(grouped).map(arr =>
    arr.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
  );
}

function calcPerformance(a) {
  return Math.round(avg(
    a.vertical,
    a.broad,
    a.med,
    a.agility,
    a.situps,
    a.ten,
    a.forty
  ));
}

function setMetric(id, current, previous) {
  const el = document.getElementById(id);
  if (!el) return;

  const change = previous !== undefined
    ? current - previous
    : null;

  let text = current || "-";

  if (change !== null) {
    if (change > 0) text += ` ↑ +${change}`;
    if (change < 0) text += ` ↓ ${change}`;
  }

  el.textContent = text;
  el.style.color = getColor(current);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function getColor(score) {
  if (score >= 90) return "#00E676";
  if (score >= 75) return "#FFD54F";
  return "#FF5252";
}

function avg(...nums) {
  const valid = nums.filter(n => !isNaN(n));
  if (!valid.length) return 0;
  return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length);
}

function clean(v) {
  return v ? String(v).trim() : "";
}

function toNumber(val) {
  return parseFloat(String(val).replace(/[^0-9.\-]/g, "")) || 0;
}

function formatDate(raw) {
  const d = new Date(raw);
  return isNaN(d) ? "-" : d.toLocaleDateString();
}

function normalize(str) {
  return (str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}