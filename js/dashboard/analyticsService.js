const AnalyticsService = {

    render(data) {

        if (!data?.length) return;

        this.updateAnalytics(data);

    },

    updateAnalytics(data) {

        // Future analytics go here

        console.log("Analytics ready:", data.length);

    }

};