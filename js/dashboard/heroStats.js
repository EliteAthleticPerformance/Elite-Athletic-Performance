// ========================================
// HERO STATS SERVICE
// ========================================

const HeroStats = {

    render(data) {

        if (!Array.isArray(data) || data.length === 0) {
            return;
        }

        const athleteCount =
            document.getElementById("athleteCount");

        const testCount =
            document.getElementById("testCount");

        if (!athleteCount || !testCount) {
            return;
        }

        const totalAthletes = new Set(
    data
        .map(a => a.name?.trim())
        .filter(Boolean)
).size;

        athleteCount.textContent = totalAthletes;
        testCount.textContent = data.length;

    }

};