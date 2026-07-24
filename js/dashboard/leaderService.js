const LeaderService = {

    leaderStats: [

  {
    label: "🏋️ Bench Press",
    key: "bench",
    suffix: " lbs",
    best: "max"
  },

  {
    label: "🏋️ Squat",
    key: "squat",
    suffix: " lbs",
    best: "max"
  },

  {
    label: "🏋️ Power Clean",
    key: "clean",
    suffix: " lbs",
    best: "max"
  },

  {
    label: "🚀 Vertical Jump",
    key: "vertical",
    suffix: " in",
    best: "max"
  },

  {
    label: "↔️ Broad Jump",
    key: "broad",
    suffix: " ft",
    best: "max"
  },

  {
    label: "💥 Med Ball Toss",
    key: "med",
    suffix: " ft",
    best: "max"
  },

  {
    label: "⚡ Agility",
    key: "agility",
    suffix: " sec",
    best: "min"
  },

  {
    label: "🔥 Sit-Ups",
    key: "situps",
    suffix: "",
    best: "max"
  },

  {
    label: "🏃 10 Yard Dash",
    key: "ten",
    suffix: " sec",
    best: "min"
  },

  {
    label: "🏃 40 Yard Dash",
    key: "forty",
    suffix: " sec",
    best: "min"
  }
],

  femaleLeaders: [],
    maleLeaders: [],

    femaleIndex: 0,
    maleIndex: 0,

    rotationTimer: null,

    elements: {},

    render(data) {

    if (!data?.length) return;

    const femaleData = data.filter(
    athlete => athlete.gender === "Female"
);

const maleData = data.filter(
    athlete => athlete.gender === "Male"
);

    this.femaleLeaders =
    this.buildLeaders(femaleData);

this.maleLeaders =
    this.buildLeaders(maleData);

    this.cacheElements();

this.femaleIndex = 0;
this.maleIndex = 0;

this.updateDisplays();

if (this.rotationTimer) {
    clearInterval(this.rotationTimer);
}

this.rotationTimer = setInterval(() => {
    this.updateDisplays();
}, 3500);

},

buildLeaders(groupData) {

  return this.leaderStats.map(stat => {

    let bestAthlete = null;

    groupData.forEach(athlete => {

      const value =
        Number(athlete[stat.key]);

      if (
        isNaN(value) ||
        value <= 0
      ) return;

      if (
        !bestAthlete ||
        (
          stat.best === "max" &&
          value > bestAthlete.value
        ) ||
        (
          stat.best === "min" &&
          value < bestAthlete.value
        )
      ) {

        bestAthlete = {
          value,
          name: athlete.name
        };

      }

    });

    return {

      label: stat.label,

      value:
  bestAthlete
    ? `${bestAthlete.value}${stat.suffix}`
    : "--",

      athlete:
        bestAthlete?.name ||
        "--"

    };

  });

},

cacheElements() {

    this.elements = {

        female: {

            event:
                document.getElementById("femaleLeaderEvent"),

            value:
                document.getElementById("femaleLeaderValue"),

            athlete:
                document.getElementById("femaleLeaderAthlete")

        },

        male: {

            event:
                document.getElementById("maleLeaderEvent"),

            value:
                document.getElementById("maleLeaderValue"),

            athlete:
                document.getElementById("maleLeaderAthlete")

        }

    };

},

updateDisplays() {

    if (
    !this.elements.female?.event ||
    !this.elements.female?.value ||
    !this.elements.female?.athlete ||
    !this.elements.male?.event ||
    !this.elements.male?.value ||
    !this.elements.male?.athlete
) {
    return;
}

    if (
        !this.femaleLeaders.length ||
        !this.maleLeaders.length
    ) {
        return;
    }

    const female =
        this.femaleLeaders[this.femaleIndex];

    const male =
        this.maleLeaders[this.maleIndex];

    this.elements.female.event.textContent =
        female.label;

    this.elements.female.value.textContent =
        female.value;

    this.elements.female.athlete.textContent =
        female.athlete;

    this.elements.male.event.textContent =
        male.label;

    this.elements.male.value.textContent =
        male.value;

    this.elements.male.athlete.textContent =
        male.athlete;

    this.femaleIndex =
        (this.femaleIndex + 1) %
        this.femaleLeaders.length;

    this.maleIndex =
        (this.maleIndex + 1) %
        this.maleLeaders.length;

},

};