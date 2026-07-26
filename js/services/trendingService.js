const TrendingService = {

    render(data) {

        if (!data?.length) return;

        const athleteMap =
    this.buildAthleteMap(data);

const trending =
    this.calculateTrending(athleteMap);

this.renderSummary(
    trending,
    athleteMap
);

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
    label: "🏋️ Hang Clean",
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

getEventIcon(type){

    const icons = {

        bench:"🏋️",
        squat:"🦵",
        clean:"💥",
        vertical:"🚀",
        broad:"↔️",
        med:"🥎",
        agility:"⚡",
        ten:"🏃",
        forty:"🏃",
        situps:"🔥"

    };

    return icons[type] || "📈";

},


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

countLiftTotalImprovements(athleteMap) {

    let count = 0;

    Object.values(athleteMap).forEach(tests => {

        if (tests.length < 2) return;

        tests.sort((a,b)=>
            new Date(a.date)-new Date(b.date)
        );

        const previous = tests[tests.length-2];
        const latest = tests[tests.length-1];

        const previousTotal =
            Number(previous.bench || 0) +
            Number(previous.squat || 0) +
            Number(previous.clean || 0);

        const latestTotal =
            Number(latest.bench || 0) +
            Number(latest.squat || 0) +
            Number(latest.clean || 0);

        if (latestTotal > previousTotal) {

            count++;

        }

    });

    return count;

},

calculateAthleteScore(test) {

    let score = 0;

    score += Number(test.bench || 0);
    score += Number(test.squat || 0);
    score += Number(test.clean || 0);

    score += Number(test.vertical || 0) * 10;
    score += Number(test.broad || 0) * 5;
    score += Number(test.med || 0) * 3;
    score += Number(test.situps || 0);

    score -= Number(test.ten || 0) * 50;
    score -= Number(test.forty || 0) * 40;
    score -= Number(test.agility || 0) * 40;

    return score;

},

countOverallScoreImprovements(athleteMap) {

    let count = 0;

    Object.values(athleteMap).forEach(tests => {

        if (tests.length < 2) return;

        tests.sort((a,b)=>
            new Date(a.date)-new Date(b.date)
        );

        const previous =
            this.calculateAthleteScore(
                tests[tests.length-2]
            );

        const latest =
            this.calculateAthleteScore(
                tests[tests.length-1]
            );

        if (latest > previous) {

            count++;

        }

    });

    return count;

},

renderSummary(trending, athleteMap) {

    const athletes =
        new Set(trending.map(t => t.name));

    const update = (id, value) => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = value;
        }
    };

    update(
        "trendAthletes",
        athletes.size
    );

    update(
        "trendLiftTotals",
        this.countLiftTotalImprovements(athleteMap)
    );

    update(
        "trendOverallScore",
        this.countOverallScoreImprovements(athleteMap)
    );

    update(
        "trendPRs",
        trending.length
    );

},

formatImprovement(athlete) {

    const timed =
        ["ten", "forty", "agility"]
        .includes(athlete.type);

    if (timed) {

        return {

            arrow: "⚡",

            value:
                `${athlete.improvement.toFixed(2)} sec Faster`,

            className: "trend-faster"

        };

    }

    return {

        arrow: "💪",

        value:
            `+${athlete.improvement.toFixed(0)}${athlete.suffix}`,

        className: "trend-stronger"

    };

},

  
    renderTicker(trending) {

    const container =
        document.getElementById("trendingFeed");

    if (!container) return;

    if (!trending.length) {

        container.innerHTML =
            "<div class='trend-empty'>No recent improvements.</div>";

        return;
    }

    const cards = trending
        .slice(0, 15)
        .map(athlete => this.buildCard(athlete))
        .join("");

    container.innerHTML = `
        <div class="trending-ticker">
            <div class="trending-track">
                ${cards}
                ${cards}
            </div>
        </div>
    `;

},

    buildCard(athlete) {

    const trend =
    this.formatImprovement(athlete);

    const initials = athlete.name
    .replace(",", " ")
    .trim()
    .split(/\s+/)
    .map(word => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

    
    return `

        
        <div class="trending-card">

            <div class="trending-avatar">
                ${initials}
            </div>

            <div class="trending-name">
                ${athlete.name}
            </div>

            <div class="trending-value ${trend.className}">

    ${trend.arrow} ${trend.value}

</div>

            <div class="trending-event">

    ${this.getEventIcon(athlete.type)}
    ${athlete.label.replace(/^[^\w]+\s*/, "")}

</div>

            <div class="trending-pr-label">
                Current PR
            </div>

            <div class="trending-current">
                ${athlete.latest}${athlete.suffix}
            </div>

        </div>

    `;

}

};  