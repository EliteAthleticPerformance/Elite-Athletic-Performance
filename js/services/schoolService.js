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



    getSchoolKey() {

        return this.getCurrentSchool();

    },

    getSchoolName() {

        return this.getConfig().name;

    },

    getLogo() {

        return this.getConfig().logo;

    },

    getTheme() {

        return this.getConfig().theme;

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
