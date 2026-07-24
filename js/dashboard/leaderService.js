const leaderStats = [

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
];


function buildLeaders(groupData) {

  return leaderStats.map(stat => {

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

}

const femaleLeaders =
  buildLeaders(females);

const maleLeaders =
  buildLeaders(males);

let femaleIndex = 0;
let maleIndex = 0;


const leaderElements = {

  female: {

    event:
      document.getElementById(
        "femaleLeaderEvent"
      ),

    value:
      document.getElementById(
        "femaleLeaderValue"
      ),

    athlete:
      document.getElementById(
        "femaleLeaderAthlete"
      )

  },

  
  male: {

    event:
      document.getElementById(
        "maleLeaderEvent"
      ),

    value:
      document.getElementById(
        "maleLeaderValue"
      ),

    athlete:
      document.getElementById(
        "maleLeaderAthlete"
      )

  }

};


function updateLeaderDisplays() {

  if (
  !femaleLeaders.length ||
  !maleLeaders.length
) {
  return;
}

  const female =
    femaleLeaders[femaleIndex];

  const male =
    maleLeaders[maleIndex];

  leaderElements.female.event.textContent =
  female.label;

leaderElements.female.value.textContent =
  female.value;

leaderElements.female.athlete.textContent =
  female.athlete;

leaderElements.male.event.textContent =
  male.label;

leaderElements.male.value.textContent =
  male.value;

leaderElements.male.athlete.textContent =
  male.athlete;

  

  femaleIndex =
    (femaleIndex + 1) %
    femaleLeaders.length;

  maleIndex =
    (maleIndex + 1) %
    maleLeaders.length;

}

updateLeaderDisplays();

setInterval(
  updateLeaderDisplays,
  3500
);
