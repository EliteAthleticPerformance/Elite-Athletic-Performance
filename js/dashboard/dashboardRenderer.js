
const DashboardRenderer = {

    render(data) {

        HeroStats.render(data);

        LeaderService.render(data);

        TrendingService.render(data);

        AnalyticsService.render(data);

    }

};