// ========================================
// 📥 EAP CSV PARSER
// ========================================
//
// RESPONSIBILITY:
// Convert CSV text/files into raw rows.
//
// DOES NOT:
// - Validate data
// - Map columns
// - Know about schools
// - Write to Google Sheets
// - Modify application data
//
// OUTPUT:
// {
//     headers: [],
//     rows: []
// }
//
// ========================================

const CSVParser = {

    // ========================================
    // PARSE CSV TEXT
    // ========================================

    parse(text) {

        if (typeof text !== "string") {
            throw new TypeError(
                "CSVParser.parse() requires CSV text."
            );
        }

        // Remove UTF-8 BOM if present
        text = text.replace(/^\uFEFF/, "");

        const rows = [];

        let row = [];
        let field = "";

        let insideQuotes = false;

        for (let i = 0; i < text.length; i++) {

            const char = text[i];
            const next = text[i + 1];

            // ========================================
            // QUOTED FIELD
            // ========================================

            if (insideQuotes) {

                // Escaped quote:
                // ""
                if (char === '"' && next === '"') {

                    field += '"';
                    i++;

                    continue;
                }

                // Closing quote
                if (char === '"') {

                    insideQuotes = false;

                    continue;
                }

                // Everything else stays in field
                field += char;

                continue;
            }

            // ========================================
            // START QUOTED FIELD
            // ========================================

            if (char === '"') {

                insideQuotes = true;

                continue;
            }

            // ========================================
            // COLUMN SEPARATOR
            // ========================================

            if (char === ",") {

                row.push(field);

                field = "";

                continue;
            }

            // ========================================
            // WINDOWS LINE BREAK
            // ========================================

            if (char === "\r" && next === "\n") {

                row.push(field);

                rows.push(row);

                row = [];
                field = "";

                i++;

                continue;
            }

            // ========================================
            // UNIX LINE BREAK
            // ========================================

            if (char === "\n") {

                row.push(field);

                rows.push(row);

                row = [];
                field = "";

                continue;
            }

            // ========================================
            // OLD MAC LINE BREAK
            // ========================================

            if (char === "\r") {

                row.push(field);

                rows.push(row);

                row = [];
                field = "";

                continue;
            }

            // ========================================
            // NORMAL CHARACTER
            // ========================================

            field += char;
        }

        // ========================================
        // FINAL FIELD / ROW
        // ========================================

        if (
            field !== "" ||
            row.length > 0
        ) {

            row.push(field);

            rows.push(row);
        }

        // ========================================
        // REMOVE COMPLETELY EMPTY ROWS
        // ========================================

        const cleanRows = rows.filter(row =>
            row.some(cell => cell !== "")
        );

        if (!cleanRows.length) {

            return {
                headers: [],
                rows: []
            };
        }

        // ========================================
        // FIRST ROW = HEADERS
        // ========================================

        const headers = cleanRows[0];

        // ========================================
        // REMAINING ROWS = DATA
        // ========================================

        const dataRows = cleanRows.slice(1);

        return {
            headers,
            rows: dataRows
        };
    },


    // ========================================
    // PARSE FILE
    // ========================================

    async parseFile(file) {

        if (!(file instanceof File)) {

            throw new TypeError(
                "CSVParser.parseFile() requires a File."
            );
        }

        const text =
            await file.text();

        return this.parse(text);
    }

};


// ========================================
// GLOBAL ACCESS
// ========================================

window.CSVParser = CSVParser;