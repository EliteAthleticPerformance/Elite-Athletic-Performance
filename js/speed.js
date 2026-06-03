document.addEventListener("DOMContentLoaded", async () => {

  const data = await loadAthleteData();

  const uniqueWeeks = [
    ...new Set(
      data
        .map(r => r.testDate)
        .filter(Boolean)
    )
  ];

  console.log(uniqueWeeks);

});
