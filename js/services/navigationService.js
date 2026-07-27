const NavigationService = {

    init() {

        console.log("✅ NavigationService initialized");

        const nav = document.getElementById("navDropdown");

        console.log("Navigation:", nav);

        if (!nav) return;

        nav.addEventListener("change", (e) => {

            const page = e.target.value;

            if (!page) return;

            this.navigate(page);

        });

        const logoutBtn = document.querySelector(".logout-btn");

        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => this.logout());
        }

    },

    navigate(page) {

        const school = SchoolService.getSchoolKey();

        const separator = page.includes("?") ? "&" : "?";

        window.location.href = `${page}${separator}school=${school}`;

    },

    logout() {

        sessionStorage.clear();
        localStorage.clear();

        const base =
            window.location.pathname.includes("/Elite-Athletic-Performance/")
                ? "/Elite-Athletic-Performance/"
                : "/";

        window.location.href = base + "index.html";

    }

};

window.NavigationService = NavigationService;