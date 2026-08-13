// ========================================
// 📋 EAP CSV MAPPER
// ========================================
//
// RESPONSIBILITY:
// Convert CSVParser output into the
// EAP CSV import canonical structure.
//
// DOES NOT:
// - Validate values
// - Validate required fields
// - Calculate results
// - Determine active school
// - Write to Google Sheets
// - Modify existing EAP data
//
// INPUT:
// {
//     headers: [],
//     rows: []
// }
//
// OUTPUT:
// {
//     headers: [],
//     rows: []
// }
//
// ========================================


// ========================================
// EAP CANONICAL HEADERS
// ========================================

const EAP_CANONICAL_HEADERS = Object.freeze([

    "Student-Athlete",
    "Test Date",
    "Gender",
    "Grade",
    "Actual Weight",
    "Bench Press",
    "Squat",
    "Hang Clean",
    "Vertical Jump",
    "Broad Jump",
    "Med Ball Toss",
    "Pro Agility",
    "Sit-Ups",
    "10 Yd Dash",
    "40 Yd Dash",
    "Primary Sport",
    "Primary Position",
    "Primary Position 2",
    "Secondary Sport",
    "Secondary Position",
    "Secondary Position 2",
    "Third Sport",
    "Third Position",
    "Third Position 2",
    "MPH"

]);


// ========================================
// HEADER NORMALIZATION
// ========================================
//
// This allows harmless differences such as:
//
// "Student-Athlete"
// " Student-Athlete "
// "student-athlete"
//
// to match the canonical header.
//
// We are NOT creating aliases yet.
//

function normalizeHeader(header) {

    return String(header ?? "")
        .replace(/^\uFEFF/, "")
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();

}


// ========================================
// BUILD HEADER MAP
// ========================================

function buildHeaderMap(headers) {

    const headerMap = new Map();

    headers.forEach((header, index) => {

        const normalized =
            normalizeHeader(header);

        if (!normalized) {
            return;
        }

        if (!headerMap.has(normalized)) {

            headerMap.set(
                normalized,
                index
            );

        }

    });

    return headerMap;
}


// ========================================
// CREATE EMPTY CANONICAL ROW
// ========================================

function createEmptyCanonicalRow() {

    const row = {};

    EAP_CANONICAL_HEADERS.forEach(header => {

        row[header] = "";

    });

    return row;
}


// ========================================
// NORMALIZE THREE-INCH DISTANCE
// ========================================
//
// Used by:
// - Broad Jump
// - Med Ball Toss
//
// EAP stores these distances using
// feet.inches notation with 3-inch increments.
//
// Rounding rule:
// 0" → exact
// 1" → down
// 2" → up
// 3" → exact
// 4" → down
// 5" → up
// 6" → exact
// 7" → down
// 8" → up
// 9" → exact
// 10" → down
// 11" → up
//
// Examples:
// 9'4"  → 9.03
// 9'5"  → 9.06
// 9'11" → 10.00
//
// ========================================

function normalizeThreeInchDistance(value) {

    // ----------------------------------------
    // BLANK
    // ----------------------------------------

    if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
    ) {

        return "";

    }


    const text =
        String(value).trim();


    // ----------------------------------------
    // ALREADY CANONICAL
    // ----------------------------------------
    //
    // Examples:
    // 9.00
    // 9.03
    // 9.06
    // 9.09
    // 10.00
    //
    // Leave these values unchanged.
    //

    if (/^\d+\.\d{2}$/.test(text)) {

        return text;

    }


    // ----------------------------------------
    // PARSE FEET / INCHES
    // ----------------------------------------
    //
    // Examples:
    // 9'4"
    // 9'5"
    // 9'11"
    //
    // The double quote is optional.
    //

    const match =
        text.match(
            /^(\d+)\s*['′]\s*(\d+)\s*(?:"|″)?$/
        );


    // ----------------------------------------
    // NOT A FEET / INCHES VALUE
    // ----------------------------------------

    if (!match) {

        return value;

    }


    let feet =
        Number(match[1]);

    const inches =
        Number(match[2]);


    // ----------------------------------------
    // VALIDATE COMPONENTS
    // ----------------------------------------

    if (
        !Number.isInteger(feet) ||
        !Number.isInteger(inches) ||
        feet < 0 ||
        inches < 0 ||
        inches > 11
    ) {

        return value;

    }


    // ----------------------------------------
    // DETERMINE THREE-INCH ROUNDING
    // ----------------------------------------

    const remainder =
        inches % 3;


    let roundedInches;


    if (remainder === 0) {

        // 0, 3, 6, 9 → exact

        roundedInches =
            inches;

    } else if (remainder === 1) {

        // 1, 4, 7, 10 → round down

        roundedInches =
            inches - 1;

    } else {

        // 2, 5, 8, 11 → round up

        roundedInches =
            inches + 1;

    }


    // ----------------------------------------
    // HANDLE NEXT FOOT
    // ----------------------------------------

    if (roundedInches === 12) {

        feet += 1;

        roundedInches = 0;

    }


    // ----------------------------------------
    // RETURN EAP CANONICAL FORMAT
    // ----------------------------------------

    return (
        `${feet}.${String(roundedInches).padStart(2, "0")}`
    );

}


// ========================================
// MAP ONE ROW
// ========================================

function mapRow(rawRow, headerMap) {

    const mappedRow =
        createEmptyCanonicalRow();


    EAP_CANONICAL_HEADERS.forEach(header => {

        const normalizedHeader =
            normalizeHeader(header);


        const sourceIndex =
            headerMap.get(normalizedHeader);


        if (sourceIndex === undefined) {
            return;
        }


        const rawValue =
            rawRow[sourceIndex] ?? "";


        // ========================================
        // THREE-INCH DISTANCE FIELDS
        // ========================================

        if (
            header === "Broad Jump" ||
            header === "Med Ball Toss"
        ) {

            mappedRow[header] =
                normalizeThreeInchDistance(rawValue);

        } else {

            mappedRow[header] =
                rawValue;

        }

    });


    return mappedRow;

}


// ========================================
// MAP CSV DATA
// ========================================

const CSVMapper = {

    map(parsedCSV) {

        if (!parsedCSV || typeof parsedCSV !== "object") {

            throw new TypeError(
                "CSVMapper.map() requires parsed CSV data."
            );

        }

        if (!Array.isArray(parsedCSV.headers)) {

            throw new TypeError(
                "CSVMapper.map() requires a headers array."
            );

        }

        if (!Array.isArray(parsedCSV.rows)) {

            throw new TypeError(
                "CSVMapper.map() requires a rows array."
            );

        }


        // ========================================
        // BUILD SOURCE HEADER MAP
        // ========================================

        const headerMap =
            buildHeaderMap(parsedCSV.headers);


        // ========================================
        // MAP EACH ROW
        // ========================================

        const mappedRows =
            parsedCSV.rows.map(rawRow =>
                mapRow(rawRow, headerMap)
            );


        // ========================================
        // RETURN CANONICAL DATA
        // ========================================

        return {

            headers: [...EAP_CANONICAL_HEADERS],

            rows: mappedRows

        };

    }

};


// ========================================
// GLOBAL ACCESS
// ========================================

window.CSVMapper = CSVMapper;

window.EAP_CANONICAL_HEADERS =
    EAP_CANONICAL_HEADERS;