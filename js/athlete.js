let athletes = [];
let currentLetter = "ALL";

/* ========================================
INIT (🔥 USE GLOBAL DATA LOADER)
======================================== */

document.addEventListener("DOMContentLoaded", async () => {
const data = await loadAthleteData();
processData(data);
});

/* ========================================
PROCESS DATA (GROUP BY ATHLETE)
======================================== */

function processData(data) {
const map = {};

data.forEach(row => {
if (!row.name) return;

```
if (!map[row.name] || row.score > map[row.name].score) {
  map[row.name] = row;
}
```

});

athletes = Object.values(map);

// sort highest score first
athletes.sort((a, b) => b.score - a.score);

renderAlphabet();
render(athletes);
}

/* ========================================
TAG SYSTEM
======================================== */

function getTag(score) {
score = Number(score);

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

```
const card = document.createElement("div");
card.className = `card athlete-card ${tagClass}`;

card.onclick = () => goToAthlete(a.name);

card.innerHTML = `
  <h3>${a.name}</h3>
  <p class="score">Score: ${a.score}</p>
  <div class="tag ${tagClass}">${tagText}</div>
`;

fragment.appendChild(card);
```

});

grid.appendChild(fragment);
}

/* ========================================
A-Z BAR
======================================== */

function renderAlphabet() {
const bar = document.getElementById("alphabetBar");
if (!bar) return;

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const counts = {};

athletes.forEach(a => {
const last = a.name.split(",")[0].trim().toUpperCase()[0];
counts[last] = (counts[last] || 0) + 1;
});

bar.innerHTML = `     <span class="letter active" onclick="showAll()">ALL (${athletes.length})</span>
  `;

letters.forEach(letter => {
const count = counts[letter] || 0;

```
bar.innerHTML += `
  <span class="letter" onclick="filterByLetter('${letter}')">
    ${letter}${count ? ` (${count})` : ""}
  </span>
`;
```

});
}

/* ========================================
FILTERING
======================================== */

function filterByLetter(letter) {
currentLetter = letter;
setActiveLetter(letter);

const filtered = athletes.filter(a => {
const last = a.name.split(",")[0].trim().toUpperCase();
return last.startsWith(letter);
});

render(filtered);
}

function showAll() {
currentLetter = "ALL";
setActiveLetter("ALL");
render(athletes);
}

/* ========================================
ACTIVE UI
======================================== */

function setActiveLetter(letter) {
document.querySelectorAll(".letter").forEach(el => {
el.classList.remove("active");
if (el.textContent.startsWith(letter)) {
el.classList.add("active");
}
});
}

/* ========================================
SEARCH
======================================== */

function filterAthletes() {
const term = document.getElementById("search").value.toLowerCase();

const filtered = athletes.filter(a =>
a.name.toLowerCase().includes(term)
);

render(filtered);
}

/* ========================================
NAVIGATION
======================================== */

function goToAthlete(name) {
window.location.href = `history.html?name=${encodeURIComponent(name)}`;
}

/* ========================================
🔥 LIVE UPDATE SUPPORT
======================================== */

window.addEventListener("dataUpdated", () => {
console.log("🔄 Athletes page updating...");

processData(APP_DATA);
});
