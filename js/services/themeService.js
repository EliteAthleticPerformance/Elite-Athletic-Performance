// ========================================
// THEME SERVICE
// ========================================

const ThemeService = {

    async apply(config) {

        this.applyTheme(config);

        this.applyBaseTheme(config);

        await this.waitForHeader();

        this.applyHeaderBranding(config);

    },

    applyTheme(config) {

        const theme = config.theme;

        if (!theme) return;

        const root = document.documentElement;

        root.style.setProperty("--primary", theme.primary);
        root.style.setProperty("--primaryLight", theme.primaryLight);
        root.style.setProperty("--primaryDark", theme.primaryDark);
        root.style.setProperty("--secondary", theme.secondary);
        root.style.setProperty("--secondaryLight", theme.secondaryLight);

        sessionStorage.setItem(
            "theme-" + SchoolService.getSchoolKey(),
            JSON.stringify(config)
        );

        console.log("🎨 THEME APPLIED:", theme);

    },

    applyBaseTheme(config) {

        let favicon =
            document.getElementById("dynamicFavicon");

        if (!favicon) {

            favicon = document.createElement("link");

            favicon.id = "dynamicFavicon";

            favicon.rel = "icon";

            document.head.appendChild(favicon);

        }

        favicon.href =
            config.logo + "?v=" + Date.now();

        sessionStorage.setItem(
            "schoolName",
            config.name
        );

        sessionStorage.setItem(
            "schoolLogo",
            config.logo
        );

    },

    waitForHeader() {

        return new Promise(resolve => {

            let attempts = 0;

            const check = () => {

                const logo =
                    document.getElementById("schoolLogo");

                if (logo) {

                    resolve();

                } else if (attempts < 50) {

                    attempts++;

                    setTimeout(check, 50);

                } else {

                    resolve();

                }

            };

            check();

        });

    },

    applyHeaderBranding(config) {

        const headerLogo =
            document.getElementById("schoolLogo");

        const timerLogo =
            document.getElementById("teamLogo");

        const schoolName =
            document.getElementById("schoolName");

        if (headerLogo) {

            headerLogo.src =
                config.logo + "?v=" + Date.now();

            headerLogo.onload = () =>
                headerLogo.classList.add("loaded");

        }

        if (timerLogo) {

            timerLogo.src =
                config.logo + "?v=" + Date.now();

            timerLogo.onload = () =>
                timerLogo.classList.add("loaded");

        }

        if (schoolName) {

            schoolName.textContent =
                config.name;

        }

    }

};

window.ThemeService = ThemeService;