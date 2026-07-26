const NavigationService = {

    navigate(page) {

        const school = SchoolService.getSchoolKey();

        window.location.href =
            `${page}?school=${school}`;

    },

    logout() {

        sessionStorage.clear();

        localStorage.clear();

        const base =
            window.location.pathname.includes("/Elite-Athletic-Performance/")
                ? "/Elite-Athletic-Performance/"
                : "/";

        window.location.href =
            base + "index.html";

    }

};