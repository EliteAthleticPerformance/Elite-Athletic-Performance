const AnalyticsService = {

    elements: {},

    render(data) {

        if (!Array.isArray(data) || !data.length) {
            return;
        }

        this.cacheElements();

        const stats = this.calculateStats(data);

        this.updateDisplay(stats);

    },

    cacheElements() {

        this.elements = {

            totalAthletes: document.getElementById("totalAthletes"),

            totalTests: document.getElementById("totalTests"),

            avgBench: document.getElementById("avgBench"),

            avgSquat: document.getElementById("avgSquat"),

            avgClean: document.getElementById("avgClean")

        };

    },

    calculateStats(data) {

        return {

            totalAthletes: this.countAthletes(data),

            totalTests: data.length,

            avgBench: this.average(data, "bench"),

            avgSquat: this.average(data, "squat"),

            avgClean: this.average(data, "clean")

        };

    },

    updateDisplay(stats) {

        // Update dashboard cards here

    },

    countAthletes(data) {

        return new Set(
            data
                .map(a => a.name?.trim())
                .filter(Boolean)
        ).size;

    },

    average(data, key) {

        const values = data
            .map(a => Number(a[key]))
            .filter(v => !isNaN(v) && v > 0);

        if (!values.length) {
            return 0;
        }

        const total =
            values.reduce((sum, value) => sum + value, 0);

        return Math.round(total / values.length);

    }

};