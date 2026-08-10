// ========================================
// 📥 EAP CSV IMPORT SERVICE
// ========================================
//
// RESPONSIBILITY:
// Orchestrate the CSV import pipeline.
//
// PIPELINE:
//
// CSV text/file
//      ↓
// CSVParser
//      ↓
// CSVMapper
//      ↓
// CSVValidator
//      ↓
// Clean import result
//
// DOES NOT:
// - Write to Google Sheets
// - Modify existing EAP data
// - Know which school is active
// - Modify dataLoader.js
// - Modify enter.js
// - Modify timer code
//
// ========================================


const CSVImportService = {

    // ========================================
    // PROCESS CSV TEXT
    // ========================================

    processText(text) {

        // ----------------------------------------
        // SAFETY CHECK
        // ----------------------------------------

        if (typeof text !== "string") {

            throw new TypeError(
                "CSVImportService.processText() requires CSV text."
            );
        }


        // ========================================
        // STEP 1 — PARSE
        // ========================================

        const parsed =
            CSVParser.parse(text);


        // ========================================
        // EMPTY FILE CHECK
        // ========================================

        if (
            !parsed.headers.length &&
            !parsed.rows.length
        ) {

            return this.buildEmptyResult();
        }


        // ========================================
        // STEP 2 — MAP
        // ========================================

        const mapped =
            CSVMapper.map(parsed);


        // ========================================
        // STEP 3 — VALIDATE
        // ========================================

        const validation =
            CSVValidator.validateAll(
                mapped.rows
            );


        // ========================================
        // BUILD FINAL RESULT
        // ========================================

        return this.buildResult(
            parsed,
            mapped,
            validation
        );
    },


    // ========================================
    // PROCESS FILE
    // ========================================

    async processFile(file) {

        if (!(file instanceof File)) {

            throw new TypeError(
                "CSVImportService.processFile() requires a File."
            );
        }


        const parsed =
            await CSVParser.parseFile(file);


        // ----------------------------------------
        // EMPTY FILE
        // ----------------------------------------

        if (
            !parsed.headers.length &&
            !parsed.rows.length
        ) {

            return this.buildEmptyResult(file);
        }


        // ----------------------------------------
        // MAP
        // ----------------------------------------

        const mapped =
            CSVMapper.map(parsed);


        // ----------------------------------------
        // VALIDATE
        // ----------------------------------------

        const validation =
            CSVValidator.validateAll(
                mapped.rows
            );


        // ----------------------------------------
        // FINAL RESULT
        // ----------------------------------------

        return this.buildResult(
            parsed,
            mapped,
            validation,
            file
        );
    },


    // ========================================
    // BUILD RESULT
    // ========================================

    buildResult(
        parsed,
        mapped,
        validation,
        file = null
    ) {

        // ----------------------------------------
        // COUNT VALID / INVALID
        // ----------------------------------------

        const validRecords =
            validation.filter(
                result => result.valid
            );

        const invalidRecords =
            validation.filter(
                result => !result.valid
            );


        // ----------------------------------------
        // COUNT WARNINGS
        // ----------------------------------------

        const warningCount =
            validation.reduce(
                (total, result) =>
                    total + result.warnings.length,
                0
            );


        // ----------------------------------------
        // COUNT ERRORS
        // ----------------------------------------

        const errorCount =
            validation.reduce(
                (total, result) =>
                    total + result.errors.length,
                0
            );


        // ----------------------------------------
        // COUNT MEASUREMENTS
        // ----------------------------------------

        const measurementCount =
            this.countMeasurements(
                mapped.rows
            );


        // ----------------------------------------
        // FINAL RESULT
        // ----------------------------------------

        return {

            success: true,

            file: file
                ? {
                    name: file.name,
                    size: file.size,
                    type: file.type
                }
                : null,

            headers: parsed.headers,

            sourceRows: parsed.rows,

            mappedRows: mapped.rows,

            validation,

            summary: {

                athletesAnalyzed:
                    mapped.rows.length,

                validRecords:
                    validRecords.length,

                invalidRecords:
                    invalidRecords.length,

                errorCount,

                warningCount,

                measurementCount
            },

            canImport:
                invalidRecords.length === 0
        };
    },


    // ========================================
    // COUNT MEASUREMENTS
    // ========================================

    countMeasurements(records) {

        if (!Array.isArray(records)) {
            return 0;
        }


        return records.reduce(
            (total, record) => {

                const count =
                    CSVValidator.PERFORMANCE_FIELDS
                        .filter(field =>
                            !CSVValidator.isBlank(
                                record[field]
                            )
                        )
                        .length;

                return total + count;

            },
            0
        );
    },


    // ========================================
    // EMPTY RESULT
    // ========================================

    buildEmptyResult(file = null) {

        return {

            success: false,

            file: file
                ? {
                    name: file.name,
                    size: file.size,
                    type: file.type
                }
                : null,

            headers: [],

            sourceRows: [],

            mappedRows: [],

            validation: [],

            summary: {

                athletesAnalyzed: 0,

                validRecords: 0,

                invalidRecords: 0,

                errorCount: 0,

                warningCount: 0,

                measurementCount: 0
            },

            canImport: false,

            errors: [
                "CSV file is empty."
            ]
        };
    }

};


// ========================================
// GLOBAL ACCESS
// ========================================

window.CSVImportService = CSVImportService;
