/* ========================================
   🔥 ELITE ATHLETE PROFILE (FINAL)
======================================== */

let radarChart, progressChart;

/* ========================================
   INIT (LOCKED LOAD ORDER)
======================================== */

document.addEventListener("headerLoaded", init);

async function init() {
  try {
    const params = new URLSearchParams(window.location.search);
    const nameFromURL = params.get("name");

    console.log("NAME:", nameFromURL);

    if (!nameFromURL) {
      document.getElementById("athleteName").textContent = "No athlete selected";
      return;
    }

    const data = await loadAthleteData();

    console.log("DATA READY:", data.length);

    // ========================================
    // 🔍 FILTER THIS ATHLETE
    // ========================================
    const athleteData = data.filter(a => a.name === nameFromURL);

    if (!athleteData.length) {
      document.getElementById("athleteName").textContent = "Athlete not found";
      return;
    }

    // latest test = first after sort
    athleteData.sort((a, b) => new Date(b.date) - new Date(a.date));
    const latest = athleteData[0];

    // ========================================
    // 🧠 RANKING + PERCENTILE
    // ========================================
    const bestScores = {};

    data.forEach(a => {
      if (!a.name) return;

      if (!bestScores[a.name] || a.score > bestScores[a.name]) {
        bestScores[a.name] = a.score;
      }
    });

    const ranking = Object.values(bestScores).sort((a, b) => b - a);
    const athleteScore = bestScores[nameFromURL];

    const rank = ranking.findIndex(s => s === athleteScore) + 1;
    const percentile = Math.round((1 - rank / ranking.length) * 100);

    // ========================================
    // 🎯 HEADER
    // ========================================
    document.getElementById("athleteName").textContent = nameFromURL;
    document.getElementById("rank").textContent = `Rank: #${rank}`;
    document.getElementById("percentile").textContent = `Top ${percentile}%`;

    // ========================================
    // 📊 STATS
    // ========================================
    set("bench", latest.bench);
    set("squat", latest.squat);
    set("clean", latest.clean);

    set("verticalScore", latest.vertical);
    set("broadScore", latest.broad);
    set("medballScore", latest.med);

    set("proagility", latest.agility);
    set("situps", latest.situps);
    set("tenyard", latest.ten);
    set("forty", latest.forty);

    // ========================================
    // 🕸️ RADAR CHART
    // ========================================
    const radarData = [
      latest.bench,
      latest.squat,
      latest.clean,
      latest.vertical,
      latest.broad,
      latest.med,
      latest.agility,
      latest.situps
    ];

    const radarCtx = document.getElementById("radarChart");

    if (radarChart) radarChart.destroy();

    radarChart = new Chart(radarCtx, {
      type: "radar",
      data: {
        labels: [
          "Bench",
          "Squat",
          "Clean",
          "Vertical",
          "Broad",
          "Med Ball",
          "Agility",
          "Sit-Ups"
        ],
        datasets: [{
          label: nameFromURL,
          data: radarData
        }]
      },
      options: {
        responsive: true,
        scales: {
          r: {
            beginAtZero: true
          }
        }
      }
    });

    // ========================================
    // 📈 PROGRESS CHART
    // ========================================
    const sortedHistory = [...athleteData].reverse();

    const dates = sortedHistory.map(a => formatDate(a.date));
    const scores = sortedHistory.map(a => a.score);

    const progressCtx = document.getElementById("progressChart");

    if (progressChart) progressChart.destroy();

    progressChart = new Chart(progressCtx, {
      type: "line",
      data: {
        labels: dates,
        datasets: [{
          label: "Performance Score",
          data: scores,
          tension: 0.3
        }]
      },
      options: {
        responsive: true
      }
    });

    // ========================================
    // 📋 HISTORY TABLE
    // ========================================
    const tbody = document.querySelector("#historyTable tbody");
    tbody.innerHTML = "";

    sortedHistory.forEach(a => {
      const tr = document.createElement("tr");

      const strengthAvg = avg(a.bench, a.squat, a.clean);

      tr.innerHTML = `
        <td>${formatDate(a.date)}</td>
        <td>${a.bench}</td>
        <td>${a.squat}</td>
        <td>${a.clean}</td>
        <td>${strengthAvg}</td>
        <td>${a.vertical}</td>
        <td>${a.broad}</td>
        <td>${a.med}</td>
        <td>${a.agility}</td>
        <td>${a.situps}</td>
        <td>${a.ten}</td>
        <td>${a.forty}</td>
        <td>${a.score}</td>
      `;

      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error("❌ PROFILE LOAD FAILED:", err);
  }
}

/* ========================================
   HELPERS
======================================== */

function set(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val || "-";
}

function avg(a, b, c) {
  return Math.round((a + b + c) / 3);
}

function formatDate(d) {
  if (!d) return "-";
  const date = new Date(d);
  return date.toLocaleDateString();
}
