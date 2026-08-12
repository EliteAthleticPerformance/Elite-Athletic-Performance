// ========================================
// 📥 EAP IMPORT PAGE
// ========================================
//
// RESPONSIBILITY:
// Control the coach-facing CSV preview UI.
//
// DOES NOT:
// - Parse CSV directly
// - Map CSV directly
// - Validate CSV directly
// - Write to Google Sheets
//
// Uses:
// CSVImportService
//
// ========================================


const ImportPage = {

    selectedFile: null,

    result: null,

    currentFilter: "all",


    // ========================================
    // INITIALIZE
    // ========================================

    init() {

        this.cacheElements();

        this.bindEvents();

    },


    // ========================================
    // CACHE ELEMENTS
    // ========================================

    cacheElements() {

        this.fileInput =
            document.getElementById("csvFile");

        this.selectedFileElement =
        document.getElementById("selectedFile");

        this.analyzeButton =
            document.getElementById("analyzeButton");

        this.statusMessage =
            document.getElementById("statusMessage");

        this.summarySection =
            document.getElementById("summarySection");

        this.validationSection =
            document.getElementById("validationSection");

        this.validationResults =
            document.getElementById("validationResults");

        this.previewSection =
            document.getElementById("previewSection");

        this.previewHead =
            document.getElementById("previewHead");

        this.previewBody =
            document.getElementById("previewBody");

        this.importActionSection =
            document.getElementById(
                "importActionSection"
            );

        this.importButton =
            document.getElementById("importButton");

    },


    // ========================================
    // EVENTS
    // ========================================

    bindEvents() {

    this.fileInput.addEventListener(
        "change",
        event => {

            this.handleFileSelection(
                event.target.files[0]
            );

        }
    );


    this.analyzeButton.addEventListener(
        "click",
        () => {

            this.analyzeFile();

        }
    );


    // ----------------------------------------
    // REVIEW FILTERS
    // ----------------------------------------

    document
        .querySelectorAll(".review-filter")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    this.setReviewFilter(
                        button.dataset.filter
                    );

                }
            );

        });

},


    // ========================================
    // FILE SELECTION
    // ========================================

    handleFileSelection(file) {

        this.selectedFile = file;

        this.result = null;

        this.currentFilter = "all";

        this.clearResults();


        if (!file) {

        this.selectedFileElement.textContent =
        "No file selected";

        this.analyzeButton.disabled = true;

        return;
    }


        // ----------------------------------------
        // BASIC FILE CHECK
        // ----------------------------------------

        const isCSV =
            file.name
                .toLowerCase()
                .endsWith(".csv");


        if (!isCSV) {

            this.selectedFileElement.textContent =
    "Please select a CSV file.";

            this.analyzeButton.disabled = true;

            this.showStatus(
                "Please select a CSV file.",
                "error"
            );

            return;
        }


        // ----------------------------------------
        // VALID FILE
        // ----------------------------------------

        this.selectedFileElement.textContent =
    `${file.name} (${this.formatFileSize(file.size)})`;


        this.analyzeButton.disabled = false;

        this.hideStatus();

    },


    // ========================================
    // ANALYZE FILE
    // ========================================

    async analyzeFile() {

        if (!this.selectedFile) {
            return;
        }


        this.analyzeButton.disabled = true;

        this.analyzeButton.textContent =
            "Analyzing...";


        this.showStatus(
            "Reading and validating CSV...",
            ""
        );


        try {

            const result =
                await CSVImportService.processFile(
                    this.selectedFile
                );


            this.result = result;

            this.renderResult();

        } catch (error) {

            console.error(
                "CSV import analysis failed:",
                error
            );


            this.showStatus(
                error.message ||
                "Unable to analyze the CSV file.",
                "error"
            );

        } finally {

            this.analyzeButton.disabled = false;

            this.analyzeButton.textContent =
                "Analyze CSV";

        }

    },


    // ========================================
    // RENDER RESULT
    // ========================================

    renderResult() {

        const result = this.result;


        if (!result) {
            return;
        }


        // ----------------------------------------
        // SUMMARY
        // ----------------------------------------

        this.renderSummary(
            result.summary
        );


        // ----------------------------------------
        // VALIDATION
        // ----------------------------------------

        this.renderValidation(
            result.validation
        );


        // ----------------------------------------
        // DATA PREVIEW
        // ----------------------------------------

        this.renderPreview(
            result.mappedRows,
            result.validation
        );


        // ----------------------------------------
        // IMPORT ACTION
        // ----------------------------------------

        this.renderImportAction(
            result
        );


        // ----------------------------------------
        // STATUS
        // ----------------------------------------

        if (result.canImport) {

            this.showStatus(
                "CSV analyzed successfully. All records are valid.",
                "success"
            );

        } else {

            this.showStatus(
                "CSV analyzed. Some records need attention before import.",
                "error"
            );

        }

    },


    // ========================================
    // SUMMARY
    // ========================================

    renderSummary(summary) {

    document.getElementById(
        "athletesAnalyzed"
    ).textContent =
        summary.athletesAnalyzed;


    document.getElementById(
        "validRecords"
    ).textContent =
        summary.validRecords;


    document.getElementById(
        "invalidRecords"
    ).textContent =
        summary.invalidRecords;


    document.getElementById(
        "measurementCount"
    ).textContent =
        summary.measurementCount;


    document.getElementById(
        "warningCount"
    ).textContent =
        summary.warningCount;


    const fileName =
        this.result?.file?.name ||
        "CSV file";


    document.getElementById(
        "summaryFileName"
    ).textContent =
        `Reviewing ${fileName}`;


    this.summarySection.classList.remove(
        "hidden"
    );

},


// ========================================
// REVIEW FILTER
// ========================================

setReviewFilter(filter) {

    this.currentFilter = filter;


    // ----------------------------------------
    // UPDATE ACTIVE BUTTON
    // ----------------------------------------

    document
        .querySelectorAll(".review-filter")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.filter === filter
            );

        });


    // ----------------------------------------
    // RE-RENDER VALIDATION
    // ----------------------------------------

    if (this.result?.validation) {

        this.renderValidation(
            this.result.validation
        );

    }

},


// ========================================
// VALIDATION RESULTS
// ========================================

renderValidation(results) {

    this.validationResults.innerHTML = "";


    if (!results.length) {

        this.validationSection.classList.add(
            "hidden"
        );

        return;
    }


    // ----------------------------------------
    // FILTER COUNTS
    // ----------------------------------------

    const validCount =
        results.filter(
            result => result.valid
        ).length;


    const attentionCount =
        results.filter(
            result => !result.valid
        ).length;


    const warningCount =
        results.filter(
            result =>
                Array.isArray(result.warnings) &&
                result.warnings.length > 0
        ).length;


    document.getElementById(
        "filterCountAll"
    ).textContent =
        results.length;


    document.getElementById(
        "filterCountValid"
    ).textContent =
        validCount;


    document.getElementById(
        "filterCountAttention"
    ).textContent =
        attentionCount;


    document.getElementById(
        "filterCountWarnings"
    ).textContent =
        warningCount;


    // ----------------------------------------
    // APPLY CURRENT FILTER
    // ----------------------------------------

    let filteredResults =
        results;


    if (this.currentFilter === "valid") {

        filteredResults =
            results.filter(
                result => result.valid
            );

    }


    if (this.currentFilter === "attention") {

        filteredResults =
            results.filter(
                result => !result.valid
            );

    }


    if (this.currentFilter === "warnings") {

        filteredResults =
            results.filter(
                result =>
                    Array.isArray(result.warnings) &&
                    result.warnings.length > 0
            );

    }


    // ----------------------------------------
    // EMPTY FILTER RESULT
    // ----------------------------------------

    if (!filteredResults.length) {

        const empty =
            document.createElement("div");

        empty.className =
            "filter-empty";


        if (this.currentFilter === "valid") {

            empty.textContent =
                "No valid records.";

        } else if (
            this.currentFilter === "attention"
        ) {

            empty.textContent =
                "No records need attention.";

        } else if (
            this.currentFilter === "warnings"
        ) {

            empty.textContent =
                "No records have warnings.";

        } else {

            empty.textContent =
                "No validation records found.";

        }


        this.validationResults.appendChild(
            empty
        );


        this.validationSection.classList.remove(
            "hidden"
        );

        return;
    }


    // ----------------------------------------
    // RENDER RECORDS
    // ----------------------------------------

    filteredResults.forEach(result => {

        const container =
            document.createElement("div");

        container.className =
            "validation-record";


        const athlete =
            result.record[
                "Student-Athlete"
            ] ||
            "Unknown Athlete";


        // ====================================
        // CLICKABLE HEADER
        // ====================================

        const toggle =
            document.createElement("button");

        toggle.type =
            "button";

        toggle.className =
            "validation-record-toggle";


        const main =
            document.createElement("div");

        main.className =
            "validation-record-main";


        // ------------------------------------
        // EXPAND ICON
        // ------------------------------------

        const icon =
            document.createElement("span");

        icon.className =
            "validation-expand-icon";

        icon.textContent =
            "›";


        // ------------------------------------
        // ATHLETE TEXT
        // ------------------------------------

        const text =
            document.createElement("div");


        const name =
            document.createElement("div");

        name.className =
            "validation-athlete";

        name.textContent =
            athlete;


        const row =
            document.createElement("div");

        row.className =
            "validation-row";

        row.textContent =
            `CSV Row ${result.rowNumber}`;


        text.appendChild(name);

        text.appendChild(row);


        main.appendChild(icon);

        main.appendChild(text);


        // ------------------------------------
// STATUS BADGE
// ------------------------------------

const badge =
    document.createElement("span");


const hasErrors =
    Array.isArray(result.errors) &&
    result.errors.length > 0;


const hasWarnings =
    Array.isArray(result.warnings) &&
    result.warnings.length > 0;


if (hasErrors) {

    badge.className =
        "badge badge-error";

    badge.textContent =
        "BLOCKED";

} else if (hasWarnings) {

    badge.className =
        "badge badge-warning";

    badge.textContent =
        "VALID · WARNINGS";

} else {

    badge.className =
        "badge badge-valid";

    badge.textContent =
        "VALID";
}


toggle.appendChild(main);

toggle.appendChild(badge);

container.appendChild(toggle);


        // ====================================
        // EXPANDED DETAILS
        // ====================================

        const details =
            document.createElement("div");

        details.className =
            "validation-details";


        // ------------------------------------
        // ATHLETE INFORMATION
        // ------------------------------------

        const athleteSection =
            document.createElement("div");

        athleteSection.className =
            "validation-detail-section";


        const athleteTitle =
            document.createElement("div");

        athleteTitle.className =
            "validation-detail-title";

        athleteTitle.textContent =
            "Athlete Information";


        athleteSection.appendChild(
            athleteTitle
        );


        const athleteGrid =
            document.createElement("div");

        athleteGrid.className =
            "validation-detail-grid";


        const athleteFields = [

            "Student-Athlete",

            "Test Date",

            "Gender",

            "Grade",

            "Actual Weight",

            "Primary Sport",

            "Primary Position",

            "Primary Position 2"

        ];


        athleteFields.forEach(field => {

            const value =
                result.record[field];


            if (
                value === undefined ||
                value === null ||
                String(value).trim() === ""
            ) {

                return;

            }


            athleteGrid.appendChild(
                this.createDetailItem(
                    field,
                    value
                )
            );

        });


        athleteSection.appendChild(
            athleteGrid
        );


        details.appendChild(
            athleteSection
        );


        // ------------------------------------
        // PERFORMANCE
        // ------------------------------------

        const performanceFields = [

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

        ];


        const performanceItems =
            performanceFields.filter(field => {

                const value =
                    result.record[field];

                return (
                    value !== undefined &&
                    value !== null &&
                    String(value).trim() !== ""
                );

            });


        if (performanceItems.length) {

            const performanceSection =
                document.createElement("div");

            performanceSection.className =
                "validation-detail-section";


            const performanceTitle =
                document.createElement("div");

            performanceTitle.className =
                "validation-detail-title";

            performanceTitle.textContent =
                "Performance Results";


            performanceSection.appendChild(
                performanceTitle
            );


            const performanceGrid =
                document.createElement("div");

            performanceGrid.className =
                "validation-detail-grid";


            performanceItems.forEach(field => {

                performanceGrid.appendChild(
                    this.createDetailItem(
                        field,
                        result.record[field]
                    )
                );

            });


            performanceSection.appendChild(
                performanceGrid
            );


            details.appendChild(
                performanceSection
            );

        }


        // ====================================
        // ERRORS
        // ====================================

        if (
            Array.isArray(result.errors) &&
            result.errors.length
        ) {

            details.appendChild(
                this.createMessageBlock(
                    "Errors",
                    result.errors,
                    "has-errors"
                )
            );

        }


        // ====================================
        // WARNINGS
        // ====================================

        if (
            Array.isArray(result.warnings) &&
            result.warnings.length
        ) {

            details.appendChild(
                this.createMessageBlock(
                    "Warnings",
                    result.warnings,
                    "has-warnings"
                )
            );

        }


        container.appendChild(
            details
        );


        // ====================================
        // TOGGLE EXPANSION
        // ====================================

        toggle.addEventListener(
            "click",
            () => {

                const expanded =
                    container.classList.toggle(
                        "expanded"
                    );


                toggle.setAttribute(
                    "aria-expanded",
                    String(expanded)
                );

            }
        );


        toggle.setAttribute(
            "aria-expanded",
            "false"
        );


        this.validationResults.appendChild(
            container
        );

    });


    this.validationSection.classList.remove(
        "hidden"
    );

},


// ========================================
// CREATE DETAIL ITEM
// ========================================

createDetailItem(label, value) {

    const item =
        document.createElement("div");

    item.className =
        "validation-detail-item";


    const labelElement =
        document.createElement("span");

    labelElement.className =
        "validation-detail-label";

    labelElement.textContent =
        label;


    const valueElement =
        document.createElement("span");

    valueElement.className =
        "validation-detail-value";

    valueElement.textContent =
        value;


    item.appendChild(
        labelElement
    );

    item.appendChild(
        valueElement
    );


    return item;

},


// ========================================
// CREATE MESSAGE BLOCK
// ========================================

createMessageBlock(title, messages, className) {

    const container =
        document.createElement("div");


    // ----------------------------------------
    // DETERMINE MESSAGE TYPE
    // ----------------------------------------

    const isError =
        className === "has-errors";


    const messageType =
        isError
            ? "error"
            : "warning";


    container.className =
        `validation-detail-messages ${className}`;


    // ----------------------------------------
    // HEADER
    // ----------------------------------------

    const header =
        document.createElement("div");

    header.className =
        "validation-message-header";


    const icon =
        document.createElement("span");

    icon.className =
        `validation-message-icon ${messageType}`;


    icon.textContent =
        isError
            ? "!"
            : "⚠";


    const heading =
        document.createElement("h4");

    heading.textContent =
        isError
            ? "Errors"
            : "Warnings";


    const count =
        document.createElement("span");

    count.className =
        `validation-message-count ${messageType}`;


    count.textContent =
        `${messages.length} ${
            messages.length === 1
                ? messageType
                : `${messageType}s`
        }`;


    header.appendChild(icon);

    header.appendChild(heading);

    header.appendChild(count);


    // ----------------------------------------
    // MESSAGE LIST
    // ----------------------------------------

    const list =
        document.createElement("ul");


    messages.forEach(message => {

        const item =
            document.createElement("li");

        item.textContent =
            message;

        list.appendChild(
            item
        );

    });


    container.appendChild(
        header
    );

    container.appendChild(
        list
    );


    return container;

},


    // ========================================
    // DATA PREVIEW
    // ========================================

    renderPreview(records, validation) {

        this.previewHead.innerHTML = "";

        this.previewBody.innerHTML = "";


        if (!records.length) {

            this.previewSection.classList.add(
                "hidden"
            );

            return;
        }


        // ----------------------------------------
        // HEADERS
        // ----------------------------------------

        const headerRow =
            document.createElement("tr");


        const statusHeader =
            document.createElement("th");

        statusHeader.textContent =
            "Status";


        headerRow.appendChild(
            statusHeader
        );


        EAP_CANONICAL_HEADERS
    .forEach(header => {

                const th =
                    document.createElement("th");

                th.textContent =
                    header;

                headerRow.appendChild(th);

            });


        this.previewHead.appendChild(
            headerRow
        );


        // ----------------------------------------
        // DATA
        // ----------------------------------------

        records.forEach(
            (record, index) => {

                const row =
                    document.createElement("tr");


                if (
                    validation[index] &&
                    !validation[index].valid
                ) {

                    row.classList.add(
                        "has-error"
                    );

                }


                const statusCell =
                    document.createElement("td");


                statusCell.textContent =
                    validation[index]?.valid
                        ? "✓"
                        : "✕";


                row.appendChild(
                    statusCell
                );


                EAP_CANONICAL_HEADERS
    .forEach(header => {

                        const cell =
                            document.createElement("td");

                        cell.textContent =
                            record[header] ?? "";

                        row.appendChild(cell);

                    });


                this.previewBody.appendChild(
                    row
                );

            }
        );


        this.previewSection.classList.remove(
            "hidden"
        );

    },


// ========================================
// IMPORT ACTION
// ========================================

renderImportAction(result) {

    this.importActionSection.classList.remove(
        "hidden"
    );


    // ----------------------------------------
    // ALWAYS DISABLE LIVE IMPORT
    // ----------------------------------------
    // Google Sheets integration does not exist
    // until Checkpoint F.

    this.importButton.disabled = true;


    // ----------------------------------------
    // SUMMARY COUNTS
    // ----------------------------------------

    const summary =
        result.summary || {};

    const total =
        Number(summary.athletesAnalyzed) || 0;

    const ready =
        Number(summary.validRecords) || 0;

    const errors =
        Number(summary.invalidRecords) || 0;

    const warnings =
        Number(summary.warningCount) || 0;


    // ----------------------------------------
    // CLEAR STATE CLASSES
    // ----------------------------------------

    this.importActionSection.classList.remove(
        "ready",
        "has-errors"
    );


    // ========================================
    // READY FOR IMPORT
    // ========================================

    if (result.canImport) {

        this.importActionSection.classList.add(
            "ready"
        );


        let warningText = "";

        if (warnings > 0) {

            warningText = `

                <div class="import-action-warning">

                    <span class="import-action-warning-icon">
                        ⚠
                    </span>

                    <span>
                        ${warnings}
                        ${warnings === 1
                            ? "warning"
                            : "warnings"}
                        detected.
                        These warnings will not prevent import.
                    </span>

                </div>

            `;

        }


        document.getElementById(
            "importActionMessage"
        ).innerHTML = `

            <div class="import-action-status">

                <div class="import-action-icon">
                    ✓
                </div>

                <div class="import-action-content">

                    <h2>
                        ${ready}
                        ${ready === 1
                            ? "record"
                            : "records"}
                        ready to import
                    </h2>

                    <p>
                        All ${total}
                        ${total === 1
                            ? "athlete record has"
                            : "athlete records have"}
                        passed required validation.
                    </p>

                    ${warningText}

                </div>

            </div>

        `;


        return;
    }


    // ========================================
    // RECORDS NEED ATTENTION
    // ========================================

    this.importActionSection.classList.add(
        "has-errors"
    );


    document.getElementById(
        "importActionMessage"
    ).innerHTML = `

        <div class="import-action-status">

            <div class="import-action-icon error">
                !
            </div>

            <div class="import-action-content">

                <h2>
                    Import needs attention
                </h2>

                <p>
                    ${ready}
                    ${ready === 1
                        ? "record is"
                        : "records are"}
                    ready to import.
                    ${errors}
                    ${errors === 1
                        ? "record has"
                        : "records have"}
                    validation errors that must
                    be corrected first.
                </p>

            </div>

        </div>

    `;
},


    // ========================================
    // CLEAR RESULTS
    // ========================================

    clearResults() {

        this.summarySection.classList.add(
            "hidden"
        );

        this.validationSection.classList.add(
            "hidden"
        );

        this.previewSection.classList.add(
            "hidden"
        );

        this.importActionSection.classList.add(
            "hidden"
        );

        this.validationResults.innerHTML = "";

        this.previewHead.innerHTML = "";

        this.previewBody.innerHTML = "";

        this.hideStatus();

    },


    // ========================================
    // STATUS
    // ========================================

    showStatus(message, type = "") {

        this.statusMessage.textContent =
            message;

        this.statusMessage.className =
            `status-message ${type}`;

        this.statusMessage.classList.remove(
            "hidden"
        );

    },


    hideStatus() {

        this.statusMessage.classList.add(
            "hidden"
        );

    },


    // ========================================
    // FILE SIZE
    // ========================================

    formatFileSize(bytes) {

        if (bytes < 1024) {
            return `${bytes} B`;
        }

        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }

        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

    }

};


// ========================================
// INITIALIZE PAGE
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        ImportPage.init();

    }
);