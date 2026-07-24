const HeroStats = {

  elements: {

    athleteCount:
      document.getElementById("athleteCount"),

    testCount:
      document.getElementById("testCount")

  },

  update(data) {

    if (!data || !data.length) return;

    const athletes =
      new Set(data.map(d => d.name)).size;

    this.elements.athleteCount.textContent =
      athletes;

    this.elements.testCount.textContent =
      data.length;

  }

};
