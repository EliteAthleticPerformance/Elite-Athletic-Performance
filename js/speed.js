document.addEventListener("DOMContentLoaded", async () => {

  const data = await loadAthleteData();

  console.log("Sample MPH Values:");
console.log(data.slice(0,10).map(a => ({
  name: a.name,
  mph: a.mph
})));

  if (!data?.length) return;

  // Only athletes with MPH data
  const mphRows = data.filter(a => a.mph > 0);

  console.log("Total Records:", data.length);
console.log("MPH Records:", mphRows.length);
console.log("First Record Full:", JSON.stringify(data[0], null, 2));

  // Group athletes
  const athleteMap = {};

  mphRows.forEach(row => {

    if (!athleteMap[row.name]) {
      athleteMap[row.name] = [];
    }

    athleteMap[row.name].push(row);

  });

  const athleteDevelopment = [];

  Object.entries(athleteMap).forEach(([name, tests]) => {

    // Sort oldest → newest
    tests.sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    const firstMPH = tests[0].mph;

    const recentMPH =
      tests[tests.length - 1].mph;

    const bestMPH =
      Math.max(...tests.map(t => t.mph));

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
  // FASTEST SPEED OVERALL
  // ====================================

  const fastestOverall =
  mphRows.sort((a,b)=>b.mph-a.mph)[0];

if (!fastestOverall) {
  console.error("No MPH data found");
  return;
}

  document.getElementById("fastestMPH")
    .textContent =
      fastestOverall.mph.toFixed(2) + " MPH";

  document.getElementById("fastestAthlete")
    .textContent =
      fastestOverall.name;

  // ====================================
  // ATHLETES TESTED
  // ====================================

  document.getElementById("athletesTested")
    .textContent =
      athleteDevelopment.length;

  // ====================================
  // TABLE
  // ====================================

  const tbody =
    document.getElementById("mphTableBody");

  tbody.innerHTML = "";

  athleteDevelopment
    .sort((a,b)=>b.bestMPH-a.bestMPH)
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
