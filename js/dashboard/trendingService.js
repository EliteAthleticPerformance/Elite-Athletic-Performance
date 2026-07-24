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

  athleteMap[row.name].push(row);

});
