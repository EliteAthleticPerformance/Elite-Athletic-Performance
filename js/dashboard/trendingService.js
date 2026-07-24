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

            const name = test.name?.trim();

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

},

  groupTestsByEvent(tests) {

    const grouped = {};

    this.trendingMetrics.forEach(metric => {

        const eventTests = tests.filter(test => {

            const value = Number(test[metric.key]);

            return !isNaN(value) && value > 0;

        });

        if (eventTests.length) {

    eventTests.sort((a, b) => {

        return new Date(a.date) - new Date(b.date);

    });

    grouped[metric.type] = eventTests;

}

    });

    return grouped;

},


 trendingMetrics: [

    {
    type: "bench",
    key: "bench",
    label: "🏋️ Bench Press",
    suffix: " lbs",
    better: "higher",
    weight: 5
},

  {
    type: "squat",
    key: "squat",
    label: "🏋️ Squat",
    suffix: " lbs",
    better: "higher",
    weight: 3
},

  {
    type: "clean",
    key: "clean",
    label: "🏋️ Power Clean",
    suffix: " lbs",
    better: "higher",
    weight: 4
},

  {
    type: "vertical",
    key: "vertical",
    label: "🚀 Vertical Jump",
    suffix: " in",
    better: "higher",
    weight: 15
},

  {
    type: "broad",
    key: "broad",
    label: "↔️ Broad Jump",
    suffix: " ft",
    better: "higher",
    weight: 10
},

  {
    type: "med",
    key: "med",
    label: "💥 Med Ball Toss",
    suffix: " ft",
    better: "higher",
    weight: 3
},

  {
    type: "agility",
    key: "agility",
    label: "⚡ Agility",
    suffix: " sec",
    better: "lower",
    weight: 50
},

  {
    type: "situps",
    key: "situps",
    label: "🔥 Sit-Ups",
    suffix: "",
    better: "higher",
    weight: 1
},

  {
    type: "ten",
    key: "ten",
    label: "🏃 10 Yard Dash",
    suffix: " sec",
    better: "lower",
    weight: 50
},

  {
    type: "forty",
    key: "forty",
    label: "🏃 40 Yard Dash",
    suffix: " sec",
    better: "lower",
    weight: 50
},
],


calculateEventImprovement(event, tests) {

    const metric =
        this.trendingMetrics.find(
            m => m.type === event
        );

    if (!metric) return null;

    if (tests.length < 2) {

        return null;

    }

    const latest =
        tests[tests.length - 1];

    const previous =
        tests[tests.length - 2];

    const latestValue =
        Number(latest[metric.key]);

    const previousValue =
        Number(previous[metric.key]);

    if (
        isNaN(latestValue) ||
        isNaN(previousValue)
    ) {
        return null;
    }

    const improvement =
        metric.better === "higher"
            ? latestValue - previousValue
            : previousValue - latestValue;

    if (improvement <= 0) {
        return null;
    }

    return {

        type: metric.type,

        label: metric.label,

        suffix: metric.suffix,

        latest: latestValue,

        improvement,

        score:
            improvement *
            (metric.weight || 1)

    };

},

  
    renderTicker(trending) {

    const container =
        document.getElementById("trendingFeed");

    if if (!container) return;

if (!trending.length) {

    container.innerHTML =
        "<div class='trend-empty'>No recent improvements.</div>";

    return;
}

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
    ${athlete.label}: +${athlete.improvement}${athlete.suffix}
</div>

            </div>
        `;

    }

};  