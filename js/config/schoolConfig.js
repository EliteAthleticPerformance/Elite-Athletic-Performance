// ========================================
// SUBSCRIPTION STATUS
// ========================================

const SUBSCRIPTION_STATUS = Object.freeze({
    PAID: "paid",
    TRIAL: "trial",
    INACTIVE: "inactive"
});


const SUBSCRIPTIONS = Object.freeze({

    PAID: Object.freeze({

        active: true,
        status: SUBSCRIPTION_STATUS.PAID,
        trial: false,
        start: null,
        end: null

    }),

    INACTIVE: Object.freeze({

        active: false,
        status: SUBSCRIPTION_STATUS.INACTIVE,
        trial: false,
        start: null,
        end: null

    })

});



// ========================================
// DEFAULT TERMINOLOGY
// ========================================

const DEFAULT_TERMINOLOGY = Object.freeze({

    athlete: "Athlete",
    athletes: "Athletes",
    coach: "Coach",
    workout: "Workout",
    rotation: "Rotation",
    class: "Class",
    period: "Period"

});

// ========================================
// DEFAULT FEATURES
// ========================================

const DEFAULT_FEATURES = Object.freeze({

    timer: true,
    athleteTesting: true,
    analytics: true,
    coachDashboard: true,
    attendance: false,
    aiReports: false

});


// ========================================
// DEFAULT DATA
// ========================================

const DEFAULT_DATA = Object.freeze({

    workoutApiURL:
        "https://script.google.com/macros/s/AKfycbwnSjmwlod_AoqmTEoownI1CsWhjpTu9ubLrb78DsLBTaH0WDnYxXNiXEyJmY1J0Uh2/exec",

    submitApiURL:
        "https://script.google.com/macros/s/AKfycbwnSjmwlod_AoqmTEoownI1CsWhjpTu9ubLrb78DsLBTaH0WDnYxXNiXEyJmY1J0Uh2/exec"

});


// ========================================
// SCHOOL CONFIG
// ========================================

window.PLATFORM_CONFIG = Object.freeze({

    version: "1.0.0",

    release: "Production",

    brandingEngine: "2.0",

    productName: "Elite Athletic Performance",

    company: "Maxwell Performance Systems"

});


window.SCHOOL_CONFIG = Object.freeze({


demo: {

    key: "demo",

    // Legacy
    name: "Elite Performance Academy",
    logo: "./images/demo-logo.png",

    branding: {

        schoolName: "Elite Performance Academy",

        displayName: "Elite Performance Academy",

        mascot: "Titans",

        shortName: "EPA",

        slogan: "Train Smarter • Perform Better",

        logo: "./images/demo-logo.png"

    },

     subscription: SUBSCRIPTIONS.PAID,

    theme: {

        primary: "#2563eb",
        primaryLight: "#60a5fa",
        primaryDark: "#1d4ed8",
        secondary: "#f59e0b",
        secondaryLight: "#fbbf24"

    },

    data: {

    ...DEFAULT_DATA,

    sheetGids: {}

},


// -------------------------------------
// TERMINOLOGY
// -------------------------------------

terminology: DEFAULT_TERMINOLOGY,


// -------------------------------------
// FEATURES
// -------------------------------------

features: DEFAULT_FEATURES,

// Legacy compatibility
sheetGids: {}
        
},



 harrisonville: {

    key: "harrisonville",

    // -----------------------------
    // Legacy (keep for compatibility)
    // -----------------------------
    name: "Harrisonville Wildcats",
    logo: "./images/wildcats-logo.png",

    // -----------------------------
    // New Branding Engine
    // -----------------------------
    branding: {

        schoolName: "Harrisonville High School",

        displayName: "Harrisonville Wildcats",

        mascot: "Wildcats",

        shortName: "HHS",

        slogan: "Play Hard • Play Smart • Play Together",

        logo: "./images/wildcats-logo.png"

    },

    subscription: SUBSCRIPTIONS.PAID,


    // -------------------------------------
// THEME
// -------------------------------------

    theme: {

        primary: "#1e3a8a",
        primaryLight: "#3b82f6",
        primaryDark: "#1e40af",
        secondary: "#60a5fa",
        secondaryLight: "#93c5fd"

    },


// -------------------------------------
// DATA SOURCES
// -------------------------------------

    data: {

    ...DEFAULT_DATA,

    sheetGids: {

        monday: "PUT_REAL_GID_HERE",
        tuesday: "PUT_REAL_GID_HERE",
        wednesday: "PUT_REAL_GID_HERE",
        thursday: "PUT_REAL_GID_HERE",
        friday: "PUT_REAL_GID_HERE"

    }

},


// -------------------------------------
// TERMINOLOGY
// -------------------------------------

terminology: DEFAULT_TERMINOLOGY,


// -------------------------------------
// FEATURES
// -------------------------------------

features: DEFAULT_FEATURES,


// TODO DS-25.4
// Remove after WorkoutService
// switches to config.data.sheetGids

sheetGids: {

        monday: "PUT_REAL_GID_HERE",
        tuesday: "PUT_REAL_GID_HERE",
        wednesday: "PUT_REAL_GID_HERE",
        thursday: "PUT_REAL_GID_HERE",
        friday: "PUT_REAL_GID_HERE"

    }

},
     
     cassmidway: {

    key: "cassmidway",

    // -----------------------------
    // Legacy (keep for compatibility)
    // -----------------------------
    name: "Cass Midway Vikings",
    logo: "./images/vikings-logo.png",

    // -----------------------------
    // New Branding Engine
    // -----------------------------
    branding: {

        schoolName: "Cass Midway High School",

        displayName: "Cass Midway Vikings",

        mascot: "Vikings",

        shortName: "CMHS",

        slogan: "",

        logo: "./images/vikings-logo.png"

    },

    subscription: SUBSCRIPTIONS.PAID,

    // -------------------------------------
    // THEME
    // -------------------------------------

    theme: {

        primary: "#4B0082",
        primaryLight: "#6A1BB9",
        primaryDark: "#2E0054",
        secondary: "#C0C0C0",
        secondaryLight: "#E6E6E6"

    },

    // -------------------------------------
    // DATA SOURCES
    // -------------------------------------

    data: {

        ...DEFAULT_DATA,

        sheetGids: {

            monday: "",
            tuesday: "",
            wednesday: "",
            thursday: "",
            friday: ""

        }

    },

    // -------------------------------------
    // TERMINOLOGY
    // -------------------------------------

    terminology: DEFAULT_TERMINOLOGY,

    // -------------------------------------
    // FEATURES
    // -------------------------------------

    features: DEFAULT_FEATURES,

    // TODO DS-25.4
    // Remove after WorkoutService
    // switches to config.data.sheetGids

    sheetGids: {

        monday: "",
        tuesday: "",
        wednesday: "",
        thursday: "",
        friday: ""

    }

},

     jefferson: {

    key: "jefferson",

    // -----------------------------
    // Legacy (keep for compatibility)
    // -----------------------------
    name: "Jefferson Blue Jays",
    logo: "./images/jeffersonbluejays-logo.png",

    // -----------------------------
    // New Branding Engine
    // -----------------------------
    branding: {

        schoolName: "Jefferson High School",

        displayName: "Jefferson Blue Jays",

        mascot: "Blue Jays",

        shortName: "JHS",

        slogan: "",

        logo: "./images/jeffersonbluejays-logo.png"

    },

    subscription: SUBSCRIPTIONS.INACTIVE,

    // -------------------------------------
    // THEME
    // -------------------------------------

    theme: {

        primary: "#0A3B9E",
        primaryLight: "#5DA9E9",
        primaryDark: "#061F52",
        secondary: "#E5E5E5",
        secondaryLight: "#FFFFFF"

    },

    // -------------------------------------
    // DATA SOURCES
    // -------------------------------------

    data: {

        ...DEFAULT_DATA,

        sheetGids: {

            monday: "",
            tuesday: "",
            wednesday: "",
            thursday: "",
            friday: ""

        }

    },

    // -------------------------------------
    // TERMINOLOGY
    // -------------------------------------

    terminology: DEFAULT_TERMINOLOGY,

    // -------------------------------------
    // FEATURES
    // -------------------------------------

    features: DEFAULT_FEATURES,

    // TODO DS-25.4
    // Remove after WorkoutService
    // switches to config.data.sheetGids

    sheetGids: {

        monday: "",
        tuesday: "",
        wednesday: "",
        thursday: "",
        friday: ""

    }

},
     
     pleasanthill: {

    key: "pleasanthill",

    // -----------------------------
    // Legacy (keep for compatibility)
    // -----------------------------
    name: "Pleasant Hill Roosters",
    logo: "./images/roosters-logo.png",

    // -----------------------------
    // New Branding Engine
    // -----------------------------
    branding: {

        schoolName: "Pleasant Hill High School",

        displayName: "Pleasant Hill Roosters",

        mascot: "Roosters",

        shortName: "PHHS",

        slogan: "",

        logo: "./images/roosters-logo.png"

    },

    subscription: SUBSCRIPTIONS.PAID,

    // -------------------------------------
    // THEME
    // -------------------------------------

    theme: {

        primary: "#5a2ca0",
        primaryLight: "#8b5cf6",
        primaryDark: "#3b1a6e",
        secondary: "#a78bfa",
        secondaryLight: "#c4b5fd"

    },

    // -------------------------------------
    // DATA SOURCES
    // -------------------------------------

    data: {

        ...DEFAULT_DATA,

        sheetGids: {

            monday: "",
            tuesday: "",
            wednesday: "",
            thursday: "",
            friday: ""

        }

    },

    // -------------------------------------
    // TERMINOLOGY
    // -------------------------------------

    terminology: DEFAULT_TERMINOLOGY,

    // -------------------------------------
    // FEATURES
    // -------------------------------------

    features: DEFAULT_FEATURES,

    // TODO DS-25.4
    // Remove after WorkoutService
    // switches to config.data.sheetGids

    sheetGids: {

        monday: "",
        tuesday: "",
        wednesday: "",
        thursday: "",
        friday: ""

    }

},

     raypec: {

    key: "raypec",

    // -----------------------------
    // Legacy (keep for compatibility)
    // -----------------------------
    name: "Ray-Pec Panthers",
    logo: "./images/panthers-logo.png",

    // -----------------------------
    // New Branding Engine
    // -----------------------------
    branding: {

        schoolName: "Raymore-Peculiar High School",

        displayName: "Ray-Pec Panthers",

        mascot: "Panthers",

        shortName: "RPHS",

        slogan: "",

        logo: "./images/panthers-logo.png"

    },

    subscription: SUBSCRIPTIONS.INACTIVE,

    // -------------------------------------
    // THEME
    // -------------------------------------

    theme: {

        primary: "#C9A646",
        primaryLight: "#E2C46A",
        primaryDark: "#8A6E2F",
        secondary: "#0A0A0A",
        secondaryLight: "#2E2E2E"

    },

    // -------------------------------------
    // DATA SOURCES
    // -------------------------------------

    data: {

        ...DEFAULT_DATA,

        sheetGids: {

            monday: "",
            tuesday: "",
            wednesday: "",
            thursday: "",
            friday: ""

        }

    },

    // -------------------------------------
    // TERMINOLOGY
    // -------------------------------------

    terminology: DEFAULT_TERMINOLOGY,

    // -------------------------------------
    // FEATURES
    // -------------------------------------

    features: DEFAULT_FEATURES,

    // TODO DS-25.4
    // Remove after WorkoutService
    // switches to config.data.sheetGids

    sheetGids: {

        monday: "",
        tuesday: "",
        wednesday: "",
        thursday: "",
        friday: ""

    }

},


springhill: {

    key: "springhill",

    // -----------------------------
    // Legacy (keep for compatibility)
    // -----------------------------
    name: "Spring Hill Broncos",
    logo: "./images/broncos-logo.png",

    // -----------------------------
    // New Branding Engine
    // -----------------------------
    branding: {

        schoolName: "Spring Hill High School",

        displayName: "Spring Hill Broncos",

        mascot: "Broncos",

        shortName: "SHHS",

        slogan: "",

        logo: "./images/broncos-logo.png"

    },

    subscription: SUBSCRIPTIONS.INACTIVE,

    // -------------------------------------
    // THEME
    // -------------------------------------

    theme: {

        primary: "#5A2D91",
        primaryLight: "#6A3FB0",
        primaryDark: "#3F1660",
        secondary: "#FDBB30",
        secondaryLight: "#FFD166"

    },

    // -------------------------------------
    // DATA SOURCES
    // -------------------------------------

    data: {

        ...DEFAULT_DATA,

        sheetGids: {

            monday: "",
            tuesday: "",
            wednesday: "",
            thursday: "",
            friday: ""

        }

    },

    // -------------------------------------
    // TERMINOLOGY
    // -------------------------------------

    terminology: DEFAULT_TERMINOLOGY,

    // -------------------------------------
    // FEATURES
    // -------------------------------------

    features: DEFAULT_FEATURES,

    // TODO DS-25.4
    // Remove after WorkoutService
    // switches to config.data.sheetGids

    sheetGids: {

        monday: "",
        tuesday: "",
        wednesday: "",
        thursday: "",
        friday: ""

    }

},
     
     
     warrensburg: {

    key: "warrensburg",

    // -----------------------------
    // Legacy (keep for compatibility)
    // -----------------------------
    name: "Warrensburg Tigers",
    logo: "./images/tigers-logo.png",

    // -----------------------------
    // New Branding Engine
    // -----------------------------
    branding: {

        schoolName: "Warrensburg High School",

        displayName: "Warrensburg Tigers",

        mascot: "Tigers",

        shortName: "WHS",

        slogan: "",

        logo: "./images/tigers-logo.png"

    },

    subscription: SUBSCRIPTIONS.INACTIVE,

    // -------------------------------------
    // THEME
    // -------------------------------------

    theme: {

        primary: "#C8102E",
        primaryLight: "#E03A4F",
        primaryDark: "#8B0E22",
        secondary: "#111111",
        secondaryLight: "#2A2A2A"

    },

    // -------------------------------------
    // DATA SOURCES
    // -------------------------------------

    data: {

        ...DEFAULT_DATA,

        sheetGids: {

            monday: "",
            tuesday: "",
            wednesday: "",
            thursday: "",
            friday: ""

        }

    },

    // -------------------------------------
    // TERMINOLOGY
    // -------------------------------------

    terminology: DEFAULT_TERMINOLOGY,

    // -------------------------------------
    // FEATURES
    // -------------------------------------

    features: DEFAULT_FEATURES,

    // TODO DS-25.4
    // Remove after WorkoutService
    // switches to config.data.sheetGids

    sheetGids: {

        monday: "",
        tuesday: "",
        wednesday: "",
        thursday: "",
        friday: ""

    }

}

  });
