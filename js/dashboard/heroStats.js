const HeroStats = {

  update(data) {

    if (!data || !data.length) return;

    const athleteCount =
      document.getElementById("athleteCount");

    const testCount =
      document.getElementById("testCount");

    const athletes =
      new Set(data.map(d => d.name)).size;

    athleteCount.textContent = athletes;
    testCount.textContent = data.length;

  }

};
