const TrendingService = {

    render(data) {

        if (!data?.length) return;

        const athleteMap = this.buildAthleteMap(data);

        const trending =
            this.calculateTrending(athleteMap);

        this.renderTicker(trending);

    },

    buildAthleteMap(data) {

        const athleteMap = {};

        data.forEach(test => {

            const name = test.Name?.trim();

            if (!name) return;

            if (!athleteMap[name]) {
                athleteMap[name] = [];
            }

            athleteMap[name].push(test);

        });

        return athleteMap;

    },

    calculateTrending(athleteMap) {

        const trending = [];

        Object.entries(athleteMap).forEach(([name, tests]) => {

    const improvements =
        this.findImprovements(name, tests);

    if (!improvements.length) return;

    trending.push(...improvements);

});

        return trending.sort((a, b) => b.score - a.score);

    },

  findImprovements(name, tests) {

    const grouped =
        this.groupTestsByEvent(tests);

    const results = [];

    Object.entries(grouped).forEach(([event, eventTests]) => {

        const improvement =
            this.calculateEventImprovement(
                event,
                eventTests
            );

        if (improvement) {

            results.push({
                name,
                ...improvement
            });

        }

    });

    return results;

}

  groupTestsByEvent(tests) {

},

  const latest =
    metricTests[metricTests.length - 1];

const previous =
    metricTests[metricTests.length - 2];

const improvement = ...

if (improvement <= 0) return;

return {
    ...
};

    renderTicker(trending) {

    const container =
        document.getElementById("trendingFeed");

    if (!container || !trending.length) return;

    container.innerHTML =
        trending
            .map(athlete => this.buildCard(athlete))
            .join("");

},

    buildCard(athlete) {

        return `
            <div class="trend-card">

                <div class="trend-name">
                    ${athlete.name}
                </div>

                <div class="trend-improvement">
                    ${athlete.improvement}
                </div>

            </div>
        `;

    }

};
