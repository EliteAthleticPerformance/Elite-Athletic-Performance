document.addEventListener("DOMContentLoaded", async () => {

  const data = await loadAthleteData();

  if (!data?.length) return;

  // ====================================
  // MPH DATA ONLY
  // ====================================

  const mphRows = data.filter(
    a =>
      Number(a.mph) > 0 &&
      a.date &&
      a.date.toString().trim() !== ""
  );

  if (!mphRows.length) return;

  // ====================================
  // WEEK SELECTOR
  // ====================================

  const weekSelector =
    document.getElementById("weekSelector");

  const uniqueDates = [
    ...new Set(
      mphRows.map(r => r.date)
    )
  ]
    .sort()
    .reverse();

  weekSelector.innerHTML = "";

  uniqueDates.forEach(date => {

    const option =
      document.createElement("option");

    option.value = date;

    option.textContent =
      new Date(date).toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric"
        }
      );

    weekSelector.appendChild(option);

  });

  // ====================================
  // FASTEST SPEED OVERALL
  // ====================================

  const fastestOverall =
    [...mphRows]
      .sort((a, b) => b.mph - a.mph)[0];

  document.getElementById("fastestMPH")
    .textContent =
      fastestOverall.mph.toFixed(2) + " MPH";

  document.getElementById("fastestAthlete")
    .textContent =
      fastestOverall.name;

  // ====================================
  // FASTEST ATHLETE THIS WEEK
  // ====================================

  function updateWeekLeader(selectedDate) {

    const weekRows =
      mphRows.filter(
        r => r.date === selectedDate
      );

    if (!weekRows.length) return;

    const fastestWeek =
      [...weekRows]
        .sort((a, b) => b.mph - a.mph)[0];

    document.getElementById("weeklyMPH")
      .textContent =
        fastestWeek.mph.toFixed(2) + " MPH";

    document.getElementById("weeklyAthlete")
      .textContent =
        fastestWeek.name;

  }

  updateWeekLeader(uniqueDates[0]);

  weekSelector.addEventListener(
    "change",
    () =>
      updateWeekLeader(
        weekSelector.value
      )
  );

  // ====================================
  // ATHLETE DEVELOPMENT DATA
  // ====================================

  const athleteMap = {};

  mphRows.forEach(row => {

    if (!athleteMap[row.name]) {
      athleteMap[row.name] = [];
    }

    athleteMap[row.name].push(row);

  });

  const athleteDevelopment = [];

  Object.entries(athleteMap).forEach(
    ([name, tests]) => {

      tests.sort(
        (a, b) =>
          new Date(a.date) -
          new Date(b.date)
      );

      const firstMPH =
        Number(tests[0].mph);

      const recentMPH =
        Number(
          tests[tests.length - 1].mph
        );

      const bestMPH =
        Math.max(
          ...tests.map(
            t => Number(t.mph)
          )
        );

      const change =
        recentMPH - firstMPH;

      athleteDevelopment.push({

        name,
        firstMPH,
        recentMPH,
        bestMPH,
        change

      });

    }
  );

  // =========================
// POPULATE SIMULATOR
// =========================

const athlete1 = document.getElementById("athlete1");
const athlete2 = document.getElementById("athlete2");
const athlete3 = document.getElementById("athlete3");

  console.log("ATHLETE DROPDOWNS:");
console.log(athlete1);
console.log(athlete2);
console.log(athlete3);

console.log(
  "ATHLETE DEVELOPMENT COUNT:",
  athleteDevelopment.length
);

if (athlete1 && athlete2 && athlete3) {

  [...athleteDevelopment]
  .sort((a,b)=>
    a.name.localeCompare(b.name)
  )
  .forEach(a => {

      const html = `
        <option value="${a.name}">
          ${a.name}
        </option>
      `;

      athlete1.innerHTML += html;
      athlete2.innerHTML += html;
      athlete3.innerHTML += html;

    });

  console.log(
  "ATHLETE 1 OPTIONS:",
  athlete1.options.length
);

  console.log(
  "ATHLETE DEVELOPMENT COUNT:",
  athleteDevelopment.length
);

}

    
  // ====================================
  // ATHLETES TESTED
  // ====================================

  document.getElementById(
    "athletesTested"
  ).textContent =
    athleteDevelopment.length;

  // ====================================
  // TABLE RENDERER
  // ====================================

  function renderTable(rows) {

    const tbody =
      document.getElementById(
        "mphTableBody"
      );

    tbody.innerHTML = "";

    rows
      .sort(
        (a, b) =>
          b.bestMPH - a.bestMPH
      )
      .forEach(a => {

        const sign =
          a.change > 0
            ? "+"
            : "";

        tbody.innerHTML += `
          <tr>

            <td>${a.name}</td>

            <td>
              ${a.firstMPH.toFixed(2)}
            </td>

            <td>
              ${a.recentMPH.toFixed(2)}
            </td>

            <td>
              ${a.bestMPH.toFixed(2)}
            </td>

            <td class="${
              a.change > 0
                ? "positive-change"
                : a.change < 0
                ? "negative-change"
                : ""
            }">

              ${sign}${a.change.toFixed(2)}

            </td>

          </tr>
        `;

      });

  }

  renderTable(athleteDevelopment);

  // ====================================
  // SEARCH
  // ====================================

  const searchInput =
    document.getElementById(
      "searchInput"
    );

  searchInput.addEventListener(
    "input",
    () => {

      const term =
        searchInput.value
          .trim()
          .toLowerCase();

      const filtered =
        athleteDevelopment.filter(
          athlete =>
            athlete.name
              .toLowerCase()
              .includes(term)
        );

      renderTable(filtered);

    }
  );

  // ====================================
  // ALPHABET FILTER
  // ====================================

  const alphabetBar =
    document.getElementById(
      "alphabetBar"
    );

  alphabetBar.innerHTML = "";

  const allBtn =
    document.createElement(
      "button"
    );

  allBtn.textContent = "ALL";

  allBtn.className =
    "alphabet-btn active";

  allBtn.addEventListener(
    "click",
    () =>
      renderTable(
        athleteDevelopment
      )
  );

  alphabetBar.appendChild(allBtn);

  "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    .split("")
    .forEach(letter => {

      const btn =
        document.createElement(
          "button"
        );

      btn.textContent =
        letter;

      btn.className =
        "alphabet-btn";

      btn.addEventListener(
        "click",
        () => {

          const filtered =
            athleteDevelopment.filter(
              athlete => {

                const lastName =
                  athlete.name
                    .split(",")[0]
                    .trim();

                return (
                  lastName
                    .charAt(0)
                    .toUpperCase() ===
                  letter
                );

              }
            );

          renderTable(filtered);

        }
      );

      alphabetBar.appendChild(
        btn
      );

    });

  // =========================
// SPEED SIMULATOR
// =========================

document
  .getElementById("startRaceBtn")
  ?.addEventListener(
    "click",
    startRace
  );

function startRace() {

  const selections = [

    athlete1.value,
    athlete2.value,
    athlete3.value

  ].filter(Boolean);

  if (selections.length < 2) {

    alert(
      "Select at least 2 athletes."
    );

    return;

  }

  const racers =
  selections.map(name =>
    athleteDevelopment.find(
      a => a.name === name
    )
  );

  const runners = [

  document.getElementById("runner1"),
  document.getElementById("runner2"),
  document.getElementById("runner3")

];

runners.forEach(runner => {

  // Reset position
  runner.style.transition = "none";
  runner.style.transform = "translateX(0)";

  // Clear athlete name
  const nameEl =
    runner.querySelector(
      ".runner-name"
    );

  if (nameEl) {
    nameEl.textContent = "";
  }

});

  void document.body.offsetWidth;

 racers.forEach((athlete,index)=>{

  const runner =
    runners[index];

  const fps =
    athlete.bestMPH * 1.46667;

  const raceTime =
    60 / fps;

  const nameEl =
    runner.querySelector(".runner-name");

  if (nameEl) {
    nameEl.textContent =
      athlete.name;
  }

  // Width of this lane
  const laneWidth =
    runner.parentElement.offsetWidth;

  runner.style.transition =
    `transform ${raceTime}s linear`;

  runner.style.transform =
    `translateX(${laneWidth - 350}px)`;

});

  const results =
  [...racers]
    .sort(
      (a,b)=>
        b.bestMPH-a.bestMPH
    );

const slowestTime =
  Math.max(
    ...racers.map(a =>
      60 /
      (a.bestMPH * 1.46667)
    )
  );

setTimeout(() => {

  let resultsHTML = `

    🥇 ${results[0].name}
    (${results[0].bestMPH.toFixed(2)} MPH)

    <br>

  `;

  // 2nd & 3rd tie
  if (
    results.length >= 3 &&
    results[1].bestMPH === results[2].bestMPH
  ) {

    resultsHTML += `

      🥈 ${results[1].name}
      (${results[1].bestMPH.toFixed(2)} MPH)

      <br>

      🥈 ${results[2].name}
      (${results[2].bestMPH.toFixed(2)} MPH)

    `;

  } else {

    resultsHTML += `

      ${
        results[1]
          ? `🥈 ${results[1].name}
             (${results[1].bestMPH.toFixed(2)} MPH)`
          : ""
      }

      <br>

      ${
        results[2]
          ? `🥉 ${results[2].name}
             (${results[2].bestMPH.toFixed(2)} MPH)`
          : ""
      }

    `;

  }

  document.getElementById(
    "raceResults"
  ).innerHTML = resultsHTML;

}, slowestTime * 1000 + 200);

}

});



