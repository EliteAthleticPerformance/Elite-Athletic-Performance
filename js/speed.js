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
      a.date.trim() !== ""
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

  const displayDate =
    new Date(date).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric"
      }
    );

  option.textContent = displayDate;

  weekSelector.appendChild(option);

});

  // ====================================
  // FASTEST OVERALL
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
  // UPDATE WEEK LEADER
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

    console.log(
      "Selected Week:",
      selectedDate,
      fastestWeek
    );

  }

  // Default to newest week

  updateWeekLeader(uniqueDates[0]);

  // Change week

  weekSelector.addEventListener(
    "change",
    () => updateWeekLeader(
      weekSelector.value
    )
  );

  // ====================================
  // ATHLETE DEVELOPMENT
  // ====================================

  const athleteMap = {};

  mphRows.forEach(row => {

    if (!athleteMap[row.name]) {
      athleteMap[row.name] = [];
    }

    athleteMap[row.name].push(row);

  });

  const athleteDevelopment = [];

  Object.entries(athleteMap).forEach(([name, tests]) => {

    tests.sort(
      (a, b) =>
        new Date(a.date) -
        new Date(b.date)
    );

    const firstMPH =
      tests[0].mph;

    const recentMPH =
      tests[tests.length - 1].mph;

    const bestMPH =
      Math.max(
        ...tests.map(t => t.mph)
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

  });

  // ====================================
  // ATHLETES TESTED
  // ====================================

  document.getElementById(
    "athletesTested"
  ).textContent =
    athleteDevelopment.length;

  // ====================================
  // TABLE
  // ====================================

  const tbody =
    document.getElementById(
      "mphTableBody"
    );

  tbody.innerHTML = "";

  athleteDevelopment
    .sort(
      (a, b) =>
        b.bestMPH - a.bestMPH
    )
    .forEach(a => {

      const sign =
        a.change > 0 ? "+" : "";

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

});
