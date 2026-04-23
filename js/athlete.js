/* ========================================
   🔥 ELITE ATHLETES (FINAL PRODUCTION VERSION)
======================================== */

let athletes = [];
let currentLetter = "ALL";

/* ========================================
   INIT (LOCKED LOAD ORDER)
======================================== */

document.addEventListener("headerLoaded", init);

async function init() {
  try {
    const data = await loadAthleteData();

    console.log("👥 RAW DATA:", data);

    const map = {};

    data.forEach(a => {
      if (!a.name) return;

      const score = Number(a.score) || 0;

      // ✅ keep best score per athlete
      if (!map[a.name] || score > map[a.name]) {
        map[a.name] = score;
      }
    });

    athletes = Object.keys(map).map(name => ({
      name,
      score: map[name]
    }));

    athletes.sort((a, b) => b.score - a.score);

    console.log("✅ ATHLETES READY:", athletes);

    renderAlphabet();
    applyFilters();

  } catch (err) {
    console.error("❌ Athlete load failed:", err);
  }
}

/* ========================================
   🔥 UNIFIED FILTER SYSTEM
======================================== */

function applyFilters() {
  const input = document.getElementById("search");
  const term = input ? input.value.toLowerCase().trim() : "";

  let filtered = athletes;

  // LETTER FILTER
  if (currentLetter !== "ALL") {
    filtered = filtered.filter(a => {
      const last = a.name.split(",")[0].trim().toUpperCase();
      return last.startsWith(currentLetter);
    });
  }

  // SEARCH FILTER
  if (term) {
    filtered = filtered.filter(a =>
      a.name.toLowerCase().includes(term)
    );
  }

  render(filtered);
}

/* ========================================
   TAG SYSTEM
======================================== */

function getTag(score) {
  if (score >= 800) return ["elite", "🔥 Elite"];
  if (score >= 650) return ["strong", "💪 Strong"];
  if (score >= 500) return ["developing", "⚡ Developing"];
  return ["needs", "📈 Needs Work"];
}

/* ========================================
   RENDER GRID
======================================== */

function render(list) {
  const grid = document.getElementById("athleteGrid");
  if (!grid) return;

  grid.innerHTML = "";

  const fragment = document.createDocumentFragment();

  list.forEach(a => {
    const [tagClass, tagText] = getTag(a.score);

    const card = document.createElement("div");
    card.className = `card athlete-card ${tagClass}`;

    card.onclick = () => goToAthlete(a.name);

    card.innerHTML = `
      <h3>${a.name}</h3>
      <p class="score">Score: ${a.score}</p>
      <div class="tag ${tagClass}">${tagText}</div>
    `;

    fragment.appendChild(card);
  });

  grid.appendChild(fragment);
}

/* ========================================
   A-Z FILTER
======================================== */

function renderAlphabet() {
  const bar = document.getElementById("alphabetBar");
  if (!bar) return;

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const counts = {};

  athletes.forEach(a => {
    const last = (a.name.split(",")[0] || "").trim().toUpperCase()[0];
    counts[last] = (counts[last] || 0) + 1;
  });

  bar.innerHTML = `
    <span class="letter active" onclick="showAll()">
      ALL (${athletes.length})
    </span>
  `;

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
  applyFilters();
}

function showAll() {
  currentLetter = "ALL";
  setActiveLetter("ALL");
  applyFilters();
}

/* ========================================
   ACTIVE UI
======================================== */

function setActiveLetter(letter) {
  document.querySelectorAll(".letter").forEach(el => {
    el.classList.remove("active");

    if (letter === "ALL" && el.textContent.startsWith("ALL")) {
      el.classList.add("active");
    } else if (el.textContent.startsWith(letter)) {
      el.classList.add("active");
    }
  });
}

/* ========================================
   SEARCH
======================================== */

function filterAthletes() {
  applyFilters();
}

/* ========================================
   🚀 NAV (FIXED — THIS IS THE KEY)
======================================== */

function goToAthlete(name) {
  const school = new URLSearchParams(window.location.search).get("school");

  const base = window.location.pathname.includes("/Elite-Athletic-Performance/")
    ? "/Elite-Athletic-Performance/"
    : "/";

  // ✅ FIX: route to athlete profile page (NOT history)
  window.location.href = school
    ? `${base}athlete.html?name=${encodeURIComponent(name)}&school=${school}`
    : `${base}athlete.html?name=${encodeURIComponent(name)}`;
}
