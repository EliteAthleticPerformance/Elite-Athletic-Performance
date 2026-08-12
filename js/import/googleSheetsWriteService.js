// ========================================
// 📤 EAP GOOGLE SHEETS WRITE SERVICE
// ========================================
//
// RESPONSIBILITY:
// Send validated CSV import records to the
// EAP Google Apps Script backend.
//
// DOES NOT:
// - Parse CSV
// - Map CSV data
// - Validate CSV data
// - Calculate Weight Group
// - Modify existing EAP data directly
//
// IMPORTANT:
// Weight Group is intentionally NOT sent.
// Google Sheets calculates it from Actual Weight.
//
// ========================================

const GoogleSheetsWriteService = {

    // ========================================
    // CONFIG
    // ========================================

    async getSubmitURL() {

        if (!window.APP_READY) {

            throw new Error(
                "APP_READY is not available."
            );

        }

        const config =
            await window.APP_READY;

        const url =
            config?.submitURL;

        if (!url) {

            throw new Error(
                "Google Sheets submitURL is not configured."
            );

        }

        return url;
    },


    // ========================================
    // BUILD IMPORT PAYLOAD
    // ========================================

    buildImportPayload(record) {

        if (
            !record ||
            typeof record !== "object"
        ) {

            throw new TypeError(
                "buildImportPayload() requires a record."
            );
        }

        return {

            action: "import",

            school:
                window.APP_CONFIG?.key || "",

            name:
                record["Student-Athlete"] || "",

            date:
                record["Test Date"] || "",

            gender:
                record["Gender"] || "",

            grade:
                record["Grade"] || "",

            weight:
                record["Actual Weight"] || "",

            bench:
                record["Bench Press"] || "",

            squat:
                record["Squat"] || "",

            clean:
                record["Hang Clean"] || "",

            vertical:
                record["Vertical Jump"] || "",

            broad:
                record["Broad Jump"] || "",

            medball:
                record["Med Ball Toss"] || "",

            agility:
                record["Pro Agility"] || "",

            situps:
                record["Sit-Ups"] || "",

            ten:
                record["10 Yd Dash"] || "",

            forty:
                record["40 Yd Dash"] || "",

            primarySport:
                record["Primary Sport"] || "",

            primaryPosition:
                record["Primary Position"] || "",

            primaryPosition2:
                record["Primary Position 2"] || "",

            secondarySport:
                record["Secondary Sport"] || "",

            secondaryPosition:
                record["Secondary Position"] || "",

            secondaryPosition2:
                record["Secondary Position 2"] || "",

            thirdSport:
                record["Third Sport"] || "",

            thirdPosition:
                record["Third Position"] || "",

            thirdPosition2:
                record["Third Position 2"] || "",

            mph:
                record["MPH"] || ""

        };
    },


    // ========================================
    // WRITE ONE RECORD
    // ========================================

    async writeRecord(record) {

        const url =
            await this.getSubmitURL();

        const payload =
            this.buildImportPayload(record);

        const body =
            new URLSearchParams(payload);

        const response =
            await fetch(url, {

                method: "POST",

                body

            });

        if (!response.ok) {

            throw new Error(
                `Google Sheets request failed: HTTP ${response.status}`
            );

        }

        const result =
            await response.json();

        if (!result.success) {

            throw new Error(
                result.error ||
                "Google Sheets import failed."
            );

        }

        return result;
    }

};


// ========================================
// GLOBAL ACCESS
// ========================================

window.GoogleSheetsWriteService =
    GoogleSheetsWriteService;