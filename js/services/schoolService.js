// ========================================
// SCHOOL SERVICE
// ========================================

const SchoolService = {

    DEFAULT_SCHOOL: "harrisonville",

    getCurrentSchool() {

        return (
            sessionStorage.getItem("school") ||
            this.DEFAULT_SCHOOL
        );

    },

    setCurrentSchool(school) {

        sessionStorage.setItem("school", school);

    },

    hasSchool(key) {

    return Boolean(window.SCHOOL_CONFIG[key]);

    },

    getSchools() {

    return Object.values(window.SCHOOL_CONFIG);

},

    getConfig() {

    let school = this.getCurrentSchool();

    if (!this.hasSchool(school)) {

        school = this.DEFAULT_SCHOOL;

        this.setCurrentSchool(school);

    }

    return window.SCHOOL_CONFIG[school];

},


    // ========================================
    // NEW CONFIGURATION API
    // ========================================

    getBranding() {

    return this.getConfig().branding || {};

},

    getData() {

    return this.getConfig().data || {};

},

    getTerminology() {

    return this.getConfig().terminology || {};

},

    getFeatures() {

    return this.getConfig().features || {};

},


    getSchoolKey() {

        return this.getCurrentSchool();

    },

    getSchoolName() {

    return this.getBranding()?.displayName ??
           this.getConfig().name;

},

    getLogo() {

    return this.getBranding()?.logo ??
           this.getConfig().logo;

},

    getTheme() {

        return this.getConfig().theme;

    },


    getMascot() {

    return this.getBranding()?.mascot ?? "";

},

getShortName() {

    return this.getBranding()?.shortName ?? "";

},

getSlogan() {

    return this.getBranding()?.slogan ?? "";

},


    getSubscription() {

        return this.getConfig().subscription;

    },

    getStatus() {

        return this.getSubscription().status;

    },

    isPaid() {

    return (
        this.getStatus() ===
        SUBSCRIPTION_STATUS.PAID
    );

},

    isActive() {

        return this.getSubscription().active;

    },

    isTrial() {

        return this.getSubscription().trial;

    }

};

window.SchoolService = SchoolService;

