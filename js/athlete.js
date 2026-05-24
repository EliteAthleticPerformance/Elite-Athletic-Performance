// ========================================
// 🔥 ATHLETE PROFILE (STABLE FINAL)
// ========================================

let DATA = [];
let radarChart = null;
let progressChart = null;
let CURRENT_ATHLETE = null;
let CURRENT_COMPARISON = "none";
let SELECTED_SPORT_COMPARISON = null;
let SELECTED_POSITION_COMPARISON = null;
let comparisonAthleteA = null;
let comparisonAthleteB = null;

let ACTIVE_PROGRESS_KEYS = new Set([
  "strengthPoints",
  "speedPoints",
  "explosivePoints",
  "powerPoints",
  "score"
]);

document.addEventListener("headerLoaded", init);

async function init() {
  try {
    await window.APP_READY;

    DATA = await loadAthleteData();

    const params = new URLSearchParams(window.location.search);
    const name = params.get("name");

    if (!name) return showError("No athlete selected");

    renderAthlete(name);

  } catch (err) {
    console.error("❌ Load error:", err);
    showError("Failed to load athlete");
  }
}

/* ========================================
   SAFE SCORE
======================================== */

function safeScore(value) {
  if (value === "" || value == null) return null;

  const num = Number(value);

  return isNaN(num) ? null : num;
}


/* ========================================
   MULTI-SPORT HELPERS
======================================== */

function athleteSports(a) {
  return [
    a.primarySport,
    a.secondarySport,
    a.thirdSport
  ]
  .filter(Boolean)
  .map(v => String(v).trim().toLowerCase());
}

function athletePositions(a) {
  return [
    a.primaryPosition,
    a.primaryPosition2,

    a.secondaryPosition,
    a.secondaryPosition2,

    a.thirdPosition,
    a.thirdPosition2
  ]
  .filter(Boolean)
  .map(v => String(v).trim().toLowerCase());
}

function athleteHasSport(a, sport) {
  return athleteSports(a).includes(
    String(sport || "")
      .trim()
      .toLowerCase()
  );
}

function athleteHasPosition(a, position) {
  return athletePositions(a).includes(
    String(position || "")
      .trim()
      .toLowerCase()
  );
}


/* ========================================
   MOST SIMILAR MULTI-SPORT ATHLETE
======================================== */

function findMostSimilarMultiSportAthlete(
  athlete,
  athletes
) {

  if (!athlete || !athletes?.length) {
    return null;
  }

  let bestMatch = null;
  let bestScore = Infinity;

  athletes.forEach(candidate => {

    // skip self
    if (candidate.name === athlete.name) {
      return;
    }

    const similarity = calculateMultiSportSimilarity(
      athlete,
      candidate
    );

    if (similarity < bestScore) {
      bestScore = similarity;
      bestMatch = candidate;
    }

  });

  return bestMatch;
}


/* ========================================
   CALCULATE MULTI-SPORT SIMILARITY
======================================== */

function calculateMultiSportSimilarity(a, b) {

  let score = 0;

  /* =============================
     SPORTS MATCH
  ============================= */

  const aSports = athleteSports(a);
  const bSports = athleteSports(b);

  const sharedSports =
    aSports.filter(s => bSports.includes(s));

  // reward shared sports heavily
  score -= sharedSports.length * 20;

  /* =============================
     POSITION MATCH
  ============================= */

  const aPositions = athletePositions(a);
  const bPositions = athletePositions(b);

  const sharedPositions =
    aPositions.filter(p => bPositions.includes(p));

  // reward shared positions
  score -= sharedPositions.length * 15;

  /* =============================
     PERFORMANCE PROFILE
  ============================= */

  const categories = [
    "strengthPoints",
    "powerPoints",
    "explosivePoints",
    "speedPoints"
  ];

  categories.forEach(category => {

    const aValue = safeScore(a[category]);
    const bValue = safeScore(b[category]);

    if (aValue == null || bValue == null) {
      return;
    }

    score += Math.abs(aValue - bValue);
  });

  /* =============================
     BODYWEIGHT
  ============================= */

  score += Math.abs(
    Number(a.weight || 0) -
    Number(b.weight || 0)
  ) * 0.35;

  /* =============================
     GRADE
  ============================= */

  score += Math.abs(
    Number(a.grade || 0) -
    Number(b.grade || 0)
  ) * 3;

  return score;
}



/* ========================================
   MAIN RENDER
======================================== */

function renderAthlete(name) {

  const history = DATA
    .filter(a => a.name === name)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (!history.length) return showError("No data found");

  const latest = history[history.length - 1];
  console.log("Cole Data:", latest);
  CURRENT_ATHLETE = latest;

  trackEvent("athlete_profile_view", {
  athlete_name: name
});

  document.getElementById("athleteName").textContent = formatName(name);

  applyRanking(name, latest.score);
  

  set("bench", cleanNumber(latest.bench));
set("squat", cleanNumber(latest.squat));
set("clean", cleanNumber(latest.clean));

set("verticalScore", cleanNumber(latest.vertical));
set("broadScore", fmt2(cleanNumber(latest.broad)));
set("medballScore", fmt2(cleanNumber(latest.med)));

set("proagility", fmt2(cleanNumber(latest.agility)));
set("situps", cleanNumber(latest.situps));
set("tenyard", fmt2(cleanNumber(latest.ten)));
set("forty", fmt2(cleanNumber(latest.forty)));

  renderRadar(latest, null);
  renderInsights(latest); // ✅ ADD THIS LINE
  populateSportDropdown();
  populatePositionDropdown();
  initProgressToggles(history);
  renderProgress(history);

  renderTable(history);
}


function populateSportDropdown() {

  const select =
    document.getElementById(
      "sportComparisonSelect"
    );

  if (!select) return;

  const sports = new Set();

  DATA.forEach(a => {

    [
      a.primarySport,
      a.secondarySport,
      a.thirdSport
    ]
    .filter(Boolean)
    .forEach(sport => {

      sports.add(
        String(sport).trim()
      );
    });
  });

  select.innerHTML =
    '<option value="">Select Sport</option>';

  [...sports]
    .sort()
    .forEach(sport => {

      const option =
        document.createElement("option");

      option.value = sport;
      option.textContent = sport;

      select.appendChild(option);
    });
}


function populatePositionDropdown() {

  const select =
    document.getElementById(
      "positionComparisonSelect"
    );

  if (!select) return;

  const positions = new Set();

  DATA.forEach(a => {

    // FILTER BY SELECTED SPORT
    if (
      SELECTED_SPORT_COMPARISON &&
      !athleteHasSport(
        a,
        SELECTED_SPORT_COMPARISON
      )
    ) {
      return;
    }

    [
      a.primaryPosition,
      a.primaryPosition2,

      a.secondaryPosition,
      a.secondaryPosition2,

      a.thirdPosition,
      a.thirdPosition2
    ]
    .filter(Boolean)
    .forEach(position => {

      positions.add(
        String(position).trim()
      );
    });
  });

  select.innerHTML =
    '<option value="">Select Position</option>';

  [...positions]
    .sort()
    .forEach(position => {

      const option =
        document.createElement("option");

      option.value = position;
      option.textContent = position;

      select.appendChild(option);
    });
}



/* ========================================
   RANKING
======================================== */

function applyRanking(name, score) {
  const scores = [...new Set(DATA.map(a => a.name))]
    .map(n => {
      const best = DATA
        .filter(a => a.name === n)
        .reduce((max, a) => Math.max(max, a.score || 0), 0);
      return { name: n, score: best };
    })
    .sort((a, b) => b.score - a.score);

  const rank = scores.findIndex(a => a.name === name) + 1;
  const total = scores.length;
  const percentile = Math.round((1 - rank / total) * 100);

  set("rank", `Rank: #${rank} of ${total}`);
  set("percentile", `Top ${percentile}%`);
}

/* ========================================
   COMPARISON BUTTONS
======================================== */

function setComparison(type) {
  if (CURRENT_COMPARISON === type) return;

  CURRENT_COMPARISON = type;

  document.querySelectorAll("#comparisonButtons button")
    .forEach(btn => btn.classList.remove("active"));

  document.querySelector(
    `#comparisonButtons button[data-type="${type}"]`
  )?.classList.add("active");

  if (type === "headtohead") {

  document
    .getElementById("compareModal")
    .classList.remove("hidden");

  populateComparisonDropdowns();

  // STOP NORMAL COMPARISON FLOW
  return false;
}

  const comparison = getComparisonData(type, CURRENT_ATHLETE);
  renderRadar(CURRENT_ATHLETE, comparison);
}


function setSportComparison(sport) {

  if (!sport) return;

  SELECTED_SPORT_COMPARISON = sport;

SELECTED_POSITION_COMPARISON = null;

populatePositionDropdown();


  CURRENT_COMPARISON = "sport";

  document.querySelectorAll(
    "#comparisonButtons button"
  )
  .forEach(btn =>
    btn.classList.remove("active")
  );

    const comparison =
    getComparisonData(
      "sport",
      CURRENT_ATHLETE
    );


document.getElementById(
  "comparisonLabel"
).textContent =
  `${SELECTED_SPORT_COMPARISON || ""} ${SELECTED_POSITION_COMPARISON || ""}`.trim();

  
  renderRadar(
    CURRENT_ATHLETE,
    comparison
  );
}

function setPositionComparison(position) {

  if (!position) return;

  SELECTED_POSITION_COMPARISON =
    position;

  CURRENT_COMPARISON = "position";

  document.querySelectorAll(
    "#comparisonButtons button"
  )
  .forEach(btn =>
    btn.classList.remove("active")
  );

   const comparison =
    getComparisonData(
      "position",
      CURRENT_ATHLETE
    );


document.getElementById(
  "comparisonLabel"
).textContent =
  `${SELECTED_SPORT_COMPARISON || ""} ${SELECTED_POSITION_COMPARISON || ""}`.trim();


  renderRadar(
    CURRENT_ATHLETE,
    comparison
  );
}


function populateComparisonDropdowns() {

  const selectA =
    document.getElementById("athleteSelectA");

  const selectB =
    document.getElementById("athleteSelectB");

  if (!selectA || !selectB) return;

  selectA.innerHTML = "";
  selectB.innerHTML = "";

 [...new Map(
  DATA.map(a => [a.name, a])
).values()]
  .sort((a, b) =>
    a.name.localeCompare(b.name)
  )
  .forEach(athlete => {

      const optionA =
        document.createElement("option");

      optionA.value = athlete.name;
      optionA.textContent = athlete.name;

      const optionB = optionA.cloneNode(true);

      selectA.appendChild(optionA);
      selectB.appendChild(optionB);
    });

  // default selections
  selectA.value = CURRENT_ATHLETE.name;

  const secondAthlete =
    DATA.find(a =>
      a.name !== CURRENT_ATHLETE.name
    );

  if (secondAthlete) {
    selectB.value = secondAthlete.name;
  }
}

/* ========================================
   COMPARISON DATA
======================================== */

function getComparisonData(type, athlete) {

  if (!type || type === "none") return null;

  // 🔥 HEAD TO HEAD handled separately
  if (type === "headtohead") {
    return null;
  }

  let group = [];

  // 🔥 normalize helper
  const norm = v =>
    String(v || "")
      .trim()
      .toLowerCase();

  // 🔥 TOP 5
  if (type === "top5") {

    group = [...DATA]
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 5);
  }


  

  // 🔥 TEAM
  else if (type === "team") {

    group = DATA;
  }

  // 🔥 GRADE
  else if (type === "grade") {

    group = DATA.filter(a =>
      norm(a.grade) === norm(athlete.grade)
    );
  }

  // 🔥 WEIGHT CLASS
  else if (type === "weight") {

    group = DATA.filter(a =>
     norm(a.group) === norm(athlete.group)
    );
  }

 // 🔥 SPORT
else if (type === "sport") {

  const selectedSport =
    SELECTED_SPORT_COMPARISON ||
    athlete.primarySport ||
    athlete.sport ||
    athlete.primary_sport;

  group = DATA.filter(a =>
    athleteHasSport(a, selectedSport)
  );
}

  // 🔥 POSITION
else if (type === "position") {

  const selectedSport =
    SELECTED_SPORT_COMPARISON ||
    athlete.primarySport ||
    athlete.sport ||
    athlete.primary_sport;

  const selectedPosition =
    SELECTED_POSITION_COMPARISON ||
    athlete.primaryPosition ||
    athlete.position ||
    athlete.primary_position;

  group = DATA.filter(a => {

    return (
      athleteHasSport(a, selectedSport) &&
      athleteHasPosition(a, selectedPosition)
    );
  });
}

  
  // 🔥 MOST SIMILAR MULTI-SPORT ATHLETE
else if (type === "similar") {

  const match =
    findMostSimilarMultiSportAthlete(
      athlete,
      DATA
    );

  if (!match) {
    return null; 
  }

  group = [match];
}

  if (!group.length) {
  return null;
}

  const avg = key =>
    group.reduce((sum, a) =>
      sum + Number(a[key] || 0), 0
    ) / group.length;

  return {
    strengthPoints: avg("strengthPoints"),
    powerPoints: avg("powerPoints"),
    explosivePoints: avg("explosivePoints"),
    speedPoints: avg("speedPoints")
  };
}

  


/* ========================================
   RADAR
======================================== */

function renderRadar(a, comparison=null) {
  console.log("CHART DATA:", a);
  const ctx = document.getElementById("radarChart");
  if (!ctx) return;

  if (radarChart) radarChart.destroy();

  const datasets = [{
    label: "Athlete",
    data: [
      a.strengthPoints,
      a.powerPoints,
      a.explosivePoints,
      a.speedPoints
    ],
    borderWidth: 2,
   backgroundColor: "rgba(54,162,235,0.18)",
borderColor: "#4da6ff",
pointBackgroundColor: "#4da6ff",
pointRadius: 4
  }];

  if (comparison) {
    datasets.push({
      label: "Comparison",
      data: [
        comparison.strengthPoints,
        comparison.powerPoints,
        comparison.explosivePoints,
        comparison.speedPoints
      ],
      borderDash: [6,6],
      borderColor: "#ff4d6d",
      backgroundColor: "rgba(255,99,132,0.2)"
    });
  }

  radarChart = new Chart(ctx, {
    type: "radar",
    data: {
      labels: ["Strength","Power","Explosive","Speed"],
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: {
          labels: {
            color: "#ddd",
            font: {
              size: 14,
              weight: "600"
            }
          }
        }
      },

      scales: {
        r: {
          min: 0,
          max: 100,

          pointLabels: {
            color: "#ffffff",
            font: {
              size: 16,
              weight: "700"
            }
          },

          ticks: {
            color: "#bbb",
            backdropColor: "transparent",
            font: {
              size: 11,
              weight: "600"
            }
          },

          grid: {
            color: "rgba(255,255,255,0.15)"
          },

          angleLines: {
            color: "rgba(255,255,255,0.2)"
          }
        }
      }
    }
  });
}

/* ========================================
   PROGRESS CHART (FIXED)
======================================== */

function renderProgress(history) {
  const ctx = document.getElementById("progressChart");
  if (!ctx) return;

  const sorted = [...history].sort((a,b)=>new Date(a.date)-new Date(b.date));

  const labels = sorted.map(a => a.date);

  const CONFIG = {
    strengthPoints: ["Strength", "#ff4d4d"],
    speedPoints: ["Speed", "#4da6ff"],
    explosivePoints: ["Explosive", "#4dff88"],
    powerPoints: ["Power", "#b366ff"],
    score: ["Overall", "#ffffff"]
  };

  const datasets = Object.keys(CONFIG)
    .filter(k => ACTIVE_PROGRESS_KEYS.has(k))
    .map(k => ({
      label: CONFIG[k][0],
      data: sorted.map(a => a[k]),
      borderColor: CONFIG[k][1],
      tension: 0.3,
      pointRadius: 3
    }));

  // ✅ UPDATE (no flicker)
  if (progressChart) {
    progressChart.data.labels = labels;
    progressChart.data.datasets = datasets;
    progressChart.update();
    return;
  }

  progressChart = new Chart(ctx, {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false
    }
  });
}

/* ========================================
   TOGGLES
======================================== */

function initProgressToggles(history) {
  document.querySelectorAll("#progressToggles button")
    .forEach(btn => {
      btn.onclick = () => {
        const key = btn.dataset.key;

        if (ACTIVE_PROGRESS_KEYS.has(key)) {
          ACTIVE_PROGRESS_KEYS.delete(key);
          btn.classList.remove("active");
        } else {
          ACTIVE_PROGRESS_KEYS.add(key);
          btn.classList.add("active");
        }

        renderProgress(history);
      };
    });
}

/* ========================================
   TABLE
======================================== */

function renderTable(history) {
  const tbody = document.querySelector("#historyTable tbody");
  if (!tbody) return;

  const sorted = [...history].sort((a,b)=>new Date(a.date)-new Date(b.date));

  tbody.innerHTML = sorted.map(h => `
    <tr>
      <td>${formatDate(h.date)}</td>
      <td>${formatNumber(h.bench)}</td>
      <td>${formatNumber(h.squat)}</td>
      <td>${formatNumber(h.clean)}</td>
      <td>${formatNumber(avg(h.bench,h.squat,h.clean))}</td>
      <td>${formatNumber(h.vertical)}</td>
      <td>${fmt2(h.broad)}</td>
      <td>${fmt2(h.med)}</td>
      <td>${fmt2(h.agility)}</td>
      <td>${formatNumber(h.situps)}</td>
      <td>${fmt2(h.ten)}</td>
      <td>${fmt2(h.forty)}</td>
      <td><strong>${formatNumber(h.score)}</strong></td>
    </tr>
  `).join("");
}

/* ========================================
   🧠 AI INSIGHTS
======================================== */

function renderInsights(a) {
  const container = document.getElementById("insightsGrid");
  if (!container) return;

  const categories = [
    { key: "strengthPoints", label: "Strength", icon: "💪" },
    { key: "powerPoints", label: "Power", icon: "🏋️" },
    { key: "explosivePoints", label: "Explosive", icon: "💥" },
    { key: "speedPoints", label: "Speed", icon: "⚡" }
  ];

  // 🎯 TAG LOGIC
  function getTag(score) {
    if (score >= 85) return { label: "Elite", class: "tag-elite" };
    if (score >= 70) return { label: "Above Avg", class: "tag-good" };
    if (score >= 55) return { label: "Average", class: "tag-mid" };
    return { label: "Needs Work", class: "tag-low" };
  }

  // Sort high → low
  const sorted = [...categories].sort(
    (x, y) => (a[y.key] || 0) - (a[x.key] || 0)
  );

  const strengths = sorted.slice(0, 2);
  const weaknesses = sorted.slice(-2);

  // 🧬 Athlete Type
  let type = "Balanced Athlete 🧠";
  if (sorted[0].key === "speedPoints") type = "Speed-Dominant Athlete ⚡";
  if (sorted[0].key === "strengthPoints") type = "Strength-Dominant Athlete 💪";
  if (sorted[0].key === "powerPoints") type = "Power Athlete 🏋️";
  if (sorted[0].key === "explosivePoints") type = "Explosive Athlete 💥";

  // 📈 Recommendations
  const recommendations = weaknesses.map(w => {
    if (w.key === "strengthPoints") return "💪 Increase max strength (bench/squat focus)";
    if (w.key === "speedPoints") return "⚡ Improve sprint mechanics and acceleration";
    if (w.key === "explosivePoints") return "💥 Focus on plyometrics and jumping";
    if (w.key === "powerPoints") return "🏋️ Develop Olympic lifts and med ball work";
    return "";
  });

  container.innerHTML = `
    <div class="insight-box">
      <h3>🔥 Strengths</h3>
      <ul>
        ${strengths.map(s => {
          const score = a[s.key] || 0;
          const tag = getTag(score);
          return `
            <li class="positive">
              ${s.icon} ${s.label}
              <span class="tag ${tag.class}">${tag.label}</span>
            </li>
          `;
        }).join("")}
      </ul>
    </div>

    <div class="insight-box">
      <h3>⚠️ Needs Work</h3>
      <ul>
        ${weaknesses.map(w => {
          const score = a[w.key] || 0;
          const tag = getTag(score);
          return `
            <li class="negative">
              ${w.icon} ${w.label}
              <span class="tag ${tag.class}">${tag.label}</span>
            </li>
          `;
        }).join("")}
      </ul>
    </div>

    <div class="insight-box">
      <h3>🧬 Athlete Type</h3>
      <p>${type}</p>
    </div>

    <div class="insight-box">
      <h3>📈 Recommendations</h3>
      <ul>
        ${recommendations.map(r => `<li class="neutral">${r}</li>`).join("")}
      </ul>
    </div>
  `;
}

/* ========================================
   HELPERS
======================================== */

/* ========================================
   HELPERS
======================================== */

function cleanNumber(value) {
  if (value === null || value === undefined) return 0;

  return Number(
    String(value)
      .trim()
      .replace(/[^\d.-]/g, "")
  ) || 0;
}

function fmt2(v){ return v || v===0 ? Number(v).toFixed(2) : "-"; }
function set(id, v) {
  document.getElementById(id).textContent =
    (v === 0 || v) ? v : "-";
}
function avg(a,b,c){ const v=[a,b,c].filter(x=>x>0); return v.length?Math.round(v.reduce((x,y)=>x+y)/v.length):"-"; }

function formatName(name){
  if (!name.includes(",")) return name;
  const [l,f]=name.split(",");
  return f.trim()+" "+l.trim();
}

function showError(msg){
  document.body.innerHTML = `<p style="text-align:center;">${msg}</p>`;
}

function formatDate(dateStr) {
  if (!dateStr) return "-";

  const d = new Date(dateStr);

  if (isNaN(d)) return dateStr;

  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

function formatNumber(val) {
  if (val === null || val === undefined) return "-";
  return Number(val).toLocaleString();
}


document
  .getElementById("generateCardBtn")
  ?.addEventListener("click", () => {

    if (!CURRENT_ATHLETE) return;

    const url =
      `athlete-card.html?name=${encodeURIComponent(CURRENT_ATHLETE.name)}`;

    window.open(url, "_blank");
});



document
  .getElementById("runComparison")
  ?.addEventListener("click", () => {

    const athleteAName =
      document.getElementById("athleteSelectA").value;

    const athleteBName =
      document.getElementById("athleteSelectB").value;

    const athleteA =
      DATA.find(a => a.name === athleteAName);

    const athleteB =
      DATA.find(a => a.name === athleteBName);

    if (!athleteA || !athleteB) {
      return;
    }

    comparisonAthleteA = athleteA;
    comparisonAthleteB = athleteB;

    renderHeadToHead(athleteA, athleteB);

    document
      .getElementById("compareModal")
      .classList.add("hidden");
});

function renderHeadToHead(a, b) {

  CURRENT_COMPARISON = "headtohead";

  renderRadar(a);

  if (!radarChart) return;

  radarChart.data.datasets = [

    {
      label: a.name,

      data: [
        a.strengthPoints,
        a.powerPoints,
        a.explosivePoints,
        a.speedPoints
      ],

      borderColor: "#3b82f6",
      backgroundColor: "rgba(59,130,246,.25)",
      borderWidth: 2
    },

    {
      label: b.name,

      data: [
        b.strengthPoints,
        b.powerPoints,
        b.explosivePoints,
        b.speedPoints
      ],

      borderColor: "#ff4d6d",
      backgroundColor: "rgba(255,77,109,.25)",
      borderDash: [6,4],
      borderWidth: 2
    }
  ];

  radarChart.update();

  console.log("🔥 HEAD TO HEAD:", a.name, b.name);
}
