// ===============================
// 🔥 ELITE ATHLETE PROFILE (PRODUCTION HARDENED)
// ===============================

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

    // 🚨 HARD GUARD (prevents crash from nav click)
    if (!nameFromURL) {
      redirectToAthletes();
      return;
    }

    const data = await loadAthleteData();

    console.log("DATA READY:", data.length);

    if (!data.length) {
      setSafe("athleteName", "No data available");
      return;
    }

    // ========================================
    // 🔍 FILTER THIS ATHLETE
    // ========================================
    const athleteData = data.filter(a => a.name === nameFromURL);

    if (!athleteData.length) {
      setSafe("athleteName", "Athlete not found");
      return;
    }

    // newest first
    athleteData.sort((a, b) => new Date(b.date) - new Date(a.date));
    const latest = athleteData[0];

    // ========================================
    // 🧠 RANK + PERCENTILE
    // ========================================
    const bestScores = {};

    data.forEach(a => {
      if (!a.name) return;
      if (!bestScores[a.name] || a.score > bestScores[a.name]) {
        bestScores[a.name] = a.score;
      }
    });

    const ranking = Object.values(bestScores).sort((a, b) => b - a);
    const athleteScore = bestScores[nameFromURL] || 0;

    const rank = ranking.findIndex(s => s === athleteScore) + 1;
    const percentile = Math.round((1 - rank / ranking.length) * 100);

    // ========================================
    // 🎯 HEADER
    // ========================================
    setSafe("athleteName", nameFromURL);
    setSafe("rank", `Rank: #${rank}`);
    setSafe("percentile", `Top ${percentile}%`);

    // ========================================
    // 📊 STATS
    // ========================================
    setSafe("bench", latest.bench);
    setSafe("squat", latest.squat);
    setSafe("clean", latest.clean);

    setSafe("verticalScore", latest.vertical);
    setSafe("broadScore", latest.broad);
    setSafe("medballScore", latest.med);

    setSafe("proagility", latest.agility);
    setSafe("situps", latest.situps);
    setSafe("tenyard", latest.ten);
    setSafe("forty", latest.forty);

    // ========================================
    // 🧠 TEAM AVERAGE (for comparison)
    // ========================================
    const teamAvg = getTeamAverage(data);

    // ========================================
    // 🕸️ RADAR CHART (YOU vs TEAM)
    // ========================================
    const radarCtx = document.getElementById("radarChart");

    if (radarCtx) {
      if (radarChart) radarChart.destroy();

      radarChart = new Chart(radarCtx, {
        type: "radar",
        data: {
          labels: [
            "Bench", "Squat", "Clean",
            "Vertical", "Broad", "Med Ball",
            "Agility", "Sit-Ups"
          ],
          datasets: [
            {
              label: nameFromURL,
              data: [
                latest.bench, latest.squat, latest.clean,
                latest.vertical, latest.broad, latest.med,
                latest.agility, latest.situps
              ]
            },
            {
              label: "Team Avg",
              data: [
                teamAvg.bench, teamAvg.squat, teamAvg.clean,
                teamAvg.vertical, teamAvg.broad, teamAvg.med,
                teamAvg.agility, teamAvg.situps
              ]
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            r: { beginAtZero: true }
          }
        }
      });
    }

    // ========================================
    // 📈 PROGRESS CHART
    // ========================================
    const progressCtx = document.getElementById("progressChart");

    if (progressCtx) {
      if (progressChart) progressChart.destroy();

      const history = [...athleteData].reverse();

      progressChart = new Chart(progressCtx, {
        type: "line",
        data: {
          labels: history.map(a => formatDate(a.date)),
          datasets: [{
            label: "Performance Score",
            data: history.map(a => a.score),
            tension: 0.3
          }]
        },
        options: { responsive: true }
      });
    }

    // ========================================
    // 📋 HISTORY TABLE
    // ========================================
    const tbody = document.querySelector("#historyTable tbody");

    if (tbody) {
      tbody.innerHTML = "";

      athleteData.forEach(a => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
          <td>${formatDate(a.date)}</td>
          <td>${a.bench}</td>
          <td>${a.squat}</td>
          <td>${a.clean}</td>
          <td>${avg(a.bench, a.squat, a.clean)}</td>
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
    }

  } catch (err) {
    console.error("❌ PROFILE LOAD FAILED:", err);
  }
}

/* ========================================
   🧠 TEAM AVERAGE CALC
======================================== */

function getTeamAverage(data) {
  const avg = {
    bench: 0, squat: 0, clean: 0,
    vertical: 0, broad: 0, med: 0,
    agility: 0, situps: 0
  };

  let count = 0;

  data.forEach(a => {
    if (!a.name) return;

    avg.bench += a.bench;
    avg.squat += a.squat;
    avg.clean += a.clean;
    avg.vertical += a.vertical;
    avg.broad += a.broad;
    avg.med += a.med;
    avg.agility += a.agility;
    avg.situps += a.situps;

    count++;
  });

  if (!count) return avg;

  Object.keys(avg).forEach(k => {
    avg[k] = Math.round(avg[k] / count);
  });

  return avg;
}

/* ========================================
   HELPERS
======================================== */

function setSafe(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val ?? "-";
}

function avg(a, b, c) {
  return Math.round(((a || 0) + (b || 0) + (c || 0)) / 3);
}

function formatDate(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString();
}

function redirectToAthletes() {
  const params = new URLSearchParams(window.location.search);
  const school = params.get("school");

  const base = window.location.pathname.includes("/Elite-Athletic-Performance/")
    ? "/Elite-Athletic-Performance/"
    : "/";

  window.location.href = school
    ? `${base}athletes.html?school=${school}`
    : `${base}athletes.html`;
}
