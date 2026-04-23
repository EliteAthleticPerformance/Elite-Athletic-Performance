// ========================================
// 🔥 ATHLETES LIST PAGE (PRODUCTION)
// ========================================

let athletes = [];
let currentLetter = "ALL";

/* ========================================
   INIT
======================================== */

document.addEventListener("headerLoaded", init);

async function init() {
  try {
    const data = await loadAthleteData();

    const map = {};

    data.forEach(a => {
      if (!a.name) return;

      const score = Number(a.score) || 0;

      if (!map[a.name] || score > map[a.name]) {
        map[a.name] = score;
      }
    });

    athletes = Object.keys(map).map(name => ({
      name,
      score: map[name]
    }));

    athletes.sort((a, b) => b.score - a.score);

    renderAlphabet();
    applyFilters();

  } catch (err) {
    console.error("❌ Athlete load failed:", err);
  }
}

/* ========================================
   FILTER SYSTEM
======================================== */

function applyFilters() {
  const input = document.getElementById("search");
  const term = input ? input.value.toLowerCase().trim() : "";

  let filtered = athletes;

  if (currentLetter !== "ALL") {
    filtered = filtered.filter(a => {
      const last = a.name.split(",")[0].trim().toUpperCase();
      return last.startsWith(currentLetter);
    });
  }

  if (term) {
    filtered = filtered.filter(a =>
      a.name.toLowerCase().includes(term)
    );
  }

  render(filtered);
}

/* ========================================
   RENDER
======================================== */

function render(list) {
  const grid = document.getElementById("athleteGrid");
  if (!grid) return;

  grid.innerHTML = "";

  const fragment = document.createDocumentFragment();

  list.forEach(a => {
    const [tagClass, tagText] = getTag(a.score);

    const card = document.createElement("div");
    card.className = `athlete-card ${tagClass}`;

    card.onclick = () => goToAthlete(a.name);

    card.innerHTML = `
      <div class="athlete-card-inner">
        <h2 class="athlete-name">${a.name}</h2>
        <div class="athlete-score">Score: ${a.score}</div>
        <div class="athlete-tag ${tagClass}">
          ${tagText}
        </div>
      </div>
    `;

    fragment.appendChild(card);
  });

  grid.appendChild(fragment);
}

/* ========================================
   A-Z
======================================== */

function renderAlphabet() {
  const bar = document.getElementById("alphabetBar");
  if (!bar) return;

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  bar.innerHTML = `
    <span class="letter active" onclick="showAll()">ALL</span>
  `;

  letters.forEach(letter => {
    bar.innerHTML += `
      <span class="letter" onclick="filterByLetter('${letter}')">
        ${letter}
      </span>
    `;
  });
}

function filterByLetter(letter) {
  currentLetter = letter;
  setActive(letter);
  applyFilters();
}

function showAll() {
  currentLetter = "ALL";
  setActive("ALL");
  applyFilters();
}

function setActive(letter) {
  document.querySelectorAll(".letter").forEach(el => {
    el.classList.remove("active");

    if (
      (letter === "ALL" && el.textContent === "ALL") ||
      el.textContent === letter
    ) {
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
   NAV
======================================== */

function goToAthlete(name) {
  const params = new URLSearchParams(window.location.search);
  const school = params.get("school");

  window.location.href = school
    ? `athlete.html?name=${encodeURIComponent(name)}&school=${school}`
    : `athlete.html?name=${encodeURIComponent(name)}`;
}
