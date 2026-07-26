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
// SCHOOL CONFIG
// ========================================

window.SCHOOL_CONFIG = Object.freeze({

 harrisonville: {

    key: "harrisonville",

    name: "Harrisonville Wildcats",

    subscription: SUBSCRIPTIONS.PAID,

    logo: "./images/wildcats-logo.png",

    theme: {

        primary: "#1e3a8a",
        primaryLight: "#3b82f6",
        primaryDark: "#1e40af",
        secondary: "#60a5fa",
        secondaryLight: "#93c5fd"

         },

         sheetGids: {
        monday: "PUT_REAL_GID_HERE",
        tuesday: "PUT_REAL_GID_HERE",
        wednesday: "PUT_REAL_GID_HERE",
        thursday: "PUT_REAL_GID_HERE",
        friday: "PUT_REAL_GID_HERE"
    }

      },

      harrisonvillemiddle: {
      key: "harrisonvillemiddle",
      name: "Harrisonville Middle School Wildcats",

      subscription: SUBSCRIPTIONS.PAID,
         
      logo: "./images/wildcats-logo.png",
       theme: {
        primary: "#1e3a8a",
        primaryLight: "#3b82f6",
        primaryDark: "#1e40af",
        secondary: "#60a5fa",
        secondaryLight: "#93c5fd"
      }
    },
     
     cassmidway: {
      key: "cassmidway",
      name: "Cass Midway Vikings",

      subscription: SUBSCRIPTIONS.PAID,
        
      logo: "./images/vikings-logo.png",
       theme: {
        primary: "#4B0082",
        primaryLight: "#6A1BB9",
        primaryDark: "#2E0054",
        secondary: "#C0C0C0",
        secondaryLight: "#E6E6E6"
      }
    },

     jefferson: {
     key: "jefferson",
    name: "Jefferson Blue Jays",

    subscription: SUBSCRIPTIONS.INACTIVE,

    logo: "./images/jeffersonbluejays-logo.png",

    theme: {
    primary: "#0A3B9E",
    primaryLight: "#5DA9E9",
    primaryDark: "#061F52",
    secondary: "#E5E5E5",
    secondaryLight: "#FFFFFF"
       }
    },
     
     pleasanthill: {
      key: "pleasanthill",
      name: "Pleasant Hill Roosters",

      subscription: SUBSCRIPTIONS.PAID,
        
      logo: "./images/roosters-logo.png",
       theme: {
        primary: "#5a2ca0",
        primaryLight: "#8b5cf6",
        primaryDark: "#3b1a6e",
        secondary: "#a78bfa",
        secondaryLight: "#c4b5fd"
      }
    },

     raypec: {
      key: "raypec",
      name: "Ray-Pec Panthers",

      subscription: SUBSCRIPTIONS.INACTIVE,
        
      logo: "./images/panthers-logo.png",
       theme: {
        primary: "#C9A646",
        primaryLight: "#E2C46A",
        primaryDark: "#8A6E2F",
        secondary: "#0A0A0A",
        secondaryLight: "#2E2E2E"
      }
    },


springhill: {
      key: "springhill",
      name: "Spring Hill Broncos",

      subscription: SUBSCRIPTIONS.INACTIVE,
   
      logo: "./images/broncos-logo.png", 
       theme: {
        primary: "#5A2D91",
        primaryLight: "#6A3FB0",
        primaryDark: "#3F1660",
        secondary: "#FDBB30",
        secondaryLight: "#FFD166"
      }
    },
     
     
     warrensburg: {
      key: "warrensburg",
      name: "Warrensburg Tigers",

      subscription: SUBSCRIPTIONS.INACTIVE,
        
      logo: "./images/tigers-logo.png", 
       theme: {
        primary: "#C8102E",
        primaryLight: "#E03A4F",
        primaryDark: "#8B0E22",
        secondary: "#111111",
        secondaryLight: "#2A2A2A"
      }
    }

  });
