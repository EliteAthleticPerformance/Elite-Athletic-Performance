// ========================================
// SCHOOL SERVICE
// ========================================

const SchoolService = {

    DEFAULT_SCHOOL: "Demo",

    // ========================================
    // GET CURRENT SCHOOL
    // ========================================

    getCurrentSchool() {

        const params =
            new URLSearchParams(window.location.search);

        const urlSchool =
            params.get("school");

        // ========================================
        // URL SCHOOL TAKES PRIORITY
        // ========================================

        if (urlSchool) {

            const configKey =
                this.getSchoolConfigKey(urlSchool);

            if (configKey) {

                sessionStorage.setItem(
                    "school",
                    configKey
                );

                return configKey;
            }
        }

        // ========================================
        // SESSION SCHOOL
        // ========================================

        const sessionSchool =
            sessionStorage.getItem("school");

        if (sessionSchool) {

            const configKey =
                this.getSchoolConfigKey(sessionSchool);

            if (configKey) {

                sessionStorage.setItem(
                    "school",
                    configKey
                );

                return configKey;
            }
        }

        // ========================================
        // FINAL FALLBACK
        // ========================================

        return this.DEFAULT_SCHOOL;
    },


    // ========================================
    // SET CURRENT SCHOOL
    // ========================================

    setCurrentSchool(school) {

        const configKey =
            this.getSchoolConfigKey(school);

        sessionStorage.setItem(
            "school",
            configKey || this.DEFAULT_SCHOOL
        );
    },


    // ========================================
    // CHECK IF SCHOOL EXISTS
    // CASE-INSENSITIVE
    // ========================================

    hasSchool(key) {

        if (
            !key ||
            !window.SCHOOL_CONFIG
        ) {
            return false;
        }

        const normalized =
            key.trim().toLowerCase();

        return Object.keys(
            window.SCHOOL_CONFIG
        ).some(configKey =>
            configKey.toLowerCase() === normalized
        );
    },


    // ========================================
    // GET CANONICAL CONFIG KEY
    // ========================================

    getSchoolConfigKey(key) {

        if (
            !key ||
            !window.SCHOOL_CONFIG
        ) {
            return "";
        }

        const normalized =
            key.trim().toLowerCase();

        return Object.keys(
            window.SCHOOL_CONFIG
        ).find(configKey =>
            configKey.toLowerCase() === normalized
        ) || "";
    },


    // ========================================
    // GET CONFIG
    // ========================================

    getConfig() {

        const school =
            this.getCurrentSchool();

        return (
            window.SCHOOL_CONFIG[school] ||
            window.SCHOOL_CONFIG[this.DEFAULT_SCHOOL]
        );
    },


    // ========================================
    // BRANDING
    // ========================================

    getBranding() {

        return this.getConfig().branding || {};

    },


    // ========================================
    // DATA
    // ========================================

    getData() {

        return this.getConfig().data || {};

    },


    // ========================================
    // TERMINOLOGY
    // ========================================

    getTerminology() {

        return this.getConfig().terminology || {};

    },


    // ========================================
    // FEATURES
    // ========================================

    getFeatures() {

        return this.getConfig().features || {};

    },


    // ========================================
    // SCHOOL KEY
    // ========================================

    getSchoolKey() {

        return this.getCurrentSchool();

    },


    // ========================================
    // SCHOOL NAME
    // ========================================

    getSchoolName() {

        return (
            this.getBranding()?.displayName ??
            this.getConfig().name
        );

    },


    // ========================================
    // LOGO
    // ========================================

    getLogo() {

        return (
            this.getBranding()?.logo ??
            this.getConfig().logo
        );

    },


    // ========================================
    // THEME
    // ========================================

    getTheme() {

        return this.getConfig().theme;

    },


    // ========================================
    // MASCOT
    // ========================================

    getMascot() {

        return this.getBranding()?.mascot ?? "";

    },


    // ========================================
    // SHORT NAME
    // ========================================

    getShortName() {

        return this.getBranding()?.shortName ?? "";

    },


    // ========================================
    // SLOGAN
    // ========================================

    getSlogan() {

        return this.getBranding()?.slogan ?? "";

    },


    // ========================================
    // SUBSCRIPTION
    // ========================================

    getSubscription() {

        return this.getConfig().subscription;

    },


    // ========================================
    // STATUS
    // ========================================

    getStatus() {

        return this.getSubscription().status;

    },


    // ========================================
    // PAID
    // ========================================

    isPaid() {

        return (
            this.getStatus() ===
            SUBSCRIPTION_STATUS.PAID
        );

    },


    // ========================================
    // ACTIVE
    // ========================================

    isActive() {

        return this.getSubscription().active;

    },


    // ========================================
    // TRIAL
    // ========================================

    isTrial() {

        return this.getSubscription().trial;

    }

};


// ========================================
// GLOBAL
// ========================================

window.SchoolService = SchoolService;