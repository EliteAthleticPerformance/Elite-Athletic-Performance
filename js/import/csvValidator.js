// ========================================
// 📋 EAP CSV VALIDATOR
// ========================================
//
// RESPONSIBILITY:
// Validate mapped EAP CSV records.
//
// DOES NOT:
// - Parse CSV files
// - Map CSV columns
// - Modify Google Sheets
// - Write application data
// - Know which school is active
// - Modify existing EAP records
//
// INPUT:
// A mapped EAP record using the canonical
// 26-column Events schema.
//
// OUTPUT:
// {
//     valid: true/false,
//     errors: [],
//     warnings: []
// }
//
// ========================================


const CSVValidator = {

    // ========================================
    // REQUIRED FIELDS
    // ========================================

    REQUIRED_FIELDS: [
        "Student-Athlete",
        "Test Date",
        "Gender",
        "Grade",
        "Actual Weight"
    ],


    // ========================================
    // PERFORMANCE FIELDS
    // ========================================

    PERFORMANCE_FIELDS: [
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
        "MPH"
    ],


    // ========================================
    // VALIDATE ONE RECORD
    // ========================================

    validate(record) {

        const errors = [];
        const warnings = [];


        // ========================================
        // SAFETY CHECK
        // ========================================

        if (!record || typeof record !== "object") {

            return {
                valid: false,

                errors: [
                    "Record is missing or invalid."
                ],

                warnings: []
            };
        }


        // ========================================
        // REQUIRED TEXT FIELDS
        // ========================================

        if (this.isBlank(record["Student-Athlete"])) {

            errors.push(
                "Student-Athlete is required."
            );
        }


        // ========================================
        // TEST DATE
        // ========================================

        if (this.isBlank(record["Test Date"])) {

            errors.push(
                "Test Date is required."
            );

        } else if (!this.isValidDate(record["Test Date"])) {

            errors.push(
                "Test Date must be a valid date."
            );
        }


        // ========================================
        // GENDER
        // ========================================

        if (this.isBlank(record["Gender"])) {

            errors.push(
                "Gender is required."
            );

        } else {

            const gender =
                String(record["Gender"])
                    .trim()
                    .toLowerCase();

            if (
                gender !== "male" &&
                gender !== "female"
            ) {

                errors.push(
                    'Gender must be "Male" or "Female".'
                );
            }
        }


        // ========================================
        // GRADE
        // ========================================

        if (this.isBlank(record["Grade"])) {

            errors.push(
                "Grade is required."
            );

        } else {

            const grade =
                Number(record["Grade"]);

            if (
                !Number.isInteger(grade) ||
                grade < 6 ||
                grade > 12
            ) {

                errors.push(
                    "Grade must be an integer from 6 through 12."
                );
            }
        }


        // ========================================
        // ACTUAL WEIGHT
        // ========================================

        if (this.isBlank(record["Actual Weight"])) {

            errors.push(
                "Actual Weight is required."
            );

        } else if (
            !this.isPositiveNumber(
                record["Actual Weight"]
            )
        ) {

            errors.push(
                "Actual Weight must be a positive number."
            );
        }


        // ========================================
        // PERFORMANCE VALIDATION
        // ========================================

        this.PERFORMANCE_FIELDS.forEach(field => {

            const value = record[field];

            // Blank performance values are allowed.
            if (this.isBlank(value)) {
                return;
            }


            // Sit-Ups should be an integer.
            if (field === "Sit-Ups") {

                if (!this.isNonNegativeInteger(value)) {

                    errors.push(
                        `${field} must be a non-negative whole number.`
                    );
                }

                return;
            }


            // All other performance measurements
            // must contain a valid numeric value.

            if (!this.isNumber(value)) {

                errors.push(
                    `${field} must be a numeric value.`
                );
            }
        });


        // ========================================
        // RETURN RESULT
        // ========================================

        return {

            valid: errors.length === 0,

            errors,

            warnings
        };
    },


    // ========================================
    // VALIDATE MULTIPLE RECORDS
    // ========================================

    validateAll(records) {

        if (!Array.isArray(records)) {

            throw new TypeError(
                "CSVValidator.validateAll() requires an array."
            );
        }

        return records.map((record, index) => {

            const result =
                this.validate(record);

            return {

                rowNumber: index + 2,

                record,

                ...result
            };
        });
    },


    // ========================================
    // BLANK CHECK
    // ========================================

    isBlank(value) {

        return (
            value === null ||
            value === undefined ||
            String(value).trim() === ""
        );
    },


    // ========================================
    // NUMBER CHECK
    // ========================================

    isNumber(value) {

        if (this.isBlank(value)) {
            return false;
        }

        const text =
            String(value)
                .trim()
                .replace(/,/g, "");

        return (
            text !== "" &&
            Number.isFinite(Number(text))
        );
    },


    // ========================================
    // POSITIVE NUMBER
    // ========================================

    isPositiveNumber(value) {

        if (!this.isNumber(value)) {
            return false;
        }

        return Number(value) > 0;
    },


    // ========================================
    // NON-NEGATIVE INTEGER
    // ========================================

    isNonNegativeInteger(value) {

        if (!this.isNumber(value)) {
            return false;
        }

        const number =
            Number(value);

        return (
            Number.isInteger(number) &&
            number >= 0
        );
    },


    // ========================================
    // DATE VALIDATION
    // ========================================

    isValidDate(value) {

        const text =
            String(value).trim();

        // ----------------------------------------
        // ISO FORMAT
        // YYYY-MM-DD
        // ----------------------------------------

        const isoMatch =
            text.match(
                /^(\d{4})-(\d{1,2})-(\d{1,2})$/
            );

        if (isoMatch) {

            const year =
                Number(isoMatch[1]);

            const month =
                Number(isoMatch[2]);

            const day =
                Number(isoMatch[3]);

            const date =
                new Date(
                    year,
                    month - 1,
                    day
                );

            return (
                date.getFullYear() === year &&
                date.getMonth() === month - 1 &&
                date.getDate() === day
            );
        }


        // ----------------------------------------
        // MM/DD/YYYY
        // ----------------------------------------

        const usMatch =
            text.match(
                /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
            );

        if (usMatch) {

            const month =
                Number(usMatch[1]);

            const day =
                Number(usMatch[2]);

            const year =
                Number(usMatch[3]);

            const date =
                new Date(
                    year,
                    month - 1,
                    day
                );

            return (
                date.getFullYear() === year &&
                date.getMonth() === month - 1 &&
                date.getDate() === day
            );
        }


        return false;
    }

};


// ========================================
// GLOBAL ACCESS
// ========================================

window.CSVValidator = CSVValidator;
