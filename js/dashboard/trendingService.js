const TrendingService = {

  render(data) {

    if (!data || !data.length) {
      return;
    }

    this.buildTrendingAthletes(data);

  },

  
  
  buildTrendingAthletes(data) {

  const feed =
    document.getElementById("trendingFeed");

  if (!feed) return;

  const athleteMap = {};

  data.forEach(row => {

  if (!row.name) return;

if (!row.date) {
  row.date = "1900-01-01";
}

  if (!athleteMap[row.name]) {
    athleteMap[row.name] = [];
  }

const trending = [];

  const trackedMetrics = [

  {
    type: "bench",
    label: "🏋️ Bench Press",
    key: "bench",
    better: "higher",
    suffix: " lbs"
  },

  {
    type: "squat",
    label: "🦵 Squat",
    key: "squat",
    better: "higher",
    suffix: " lbs"
  },

  {
    type: "clean",
    label: "💥 Hang Clean",
    key: "clean",
    better: "higher",
    suffix: " lbs"
  },

  {
    type: "vertical",
    label: "🚀 Vertical Jump",
    key: "vertical",
    better: "higher",
    suffix: " in"
  },

  {
    type: "broad",
    label: "↔️ Broad Jump",
    key: "broad",
    better: "higher",
    suffix: " ft"
  },

  {
    type: "med",
    label: "🏐 Med Ball Toss",
    key: "med",
    better: "higher",
    suffix: " ft"
  },

  {
    type: "situps",
    label: "🔥 Sit-Ups",
    key: "situps",
    better: "higher",
    suffix: ""
  },

  {
    type: "agility",
    label: "⚡ Agility",
    key: "agility",
    better: "lower",
    suffix: " sec"
  },

  {
    type: "ten",
    label: "🏃 10 Yard Dash",
    key: "ten",
    better: "lower",
    suffix: " sec"
  },

  {
    type: "forty",
    label: "🏃 40 Yard Dash",
    key: "forty",
    better: "lower",
    suffix: " sec"
  }

];

Object.values(athleteMap).forEach(tests => {

  tests.sort(
    (a,b) =>
      new Date(a.date) -
      new Date(b.date)
  );

  if (tests.length < 2) return;

  athleteMap[row.name].push(row);

});
