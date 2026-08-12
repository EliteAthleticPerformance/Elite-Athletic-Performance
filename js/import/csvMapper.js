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

        mappedRow[header] =
            rawRow[sourceIndex] ?? "";

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