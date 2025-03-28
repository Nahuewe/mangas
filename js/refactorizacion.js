const CONFIG = {
    EXCEL_PATH: './assets/Mangas.xlsx',
    HIDDEN_ROW_START: 127,
    HIDDEN_ROW_END: 128,
    DISCOUNT_RATES: {
        SALE_PRICE_5: 0.8,
        SALE_PRICE_7: 0.6
    }
};

const FILTER_OPTIONS = {
    "Estado": ["En curso", "Completado", "Droppeado", "Tomo único"],
    "Editorial": [
        "Ivrea", "Panini", "Kemuri", "Distrito Manga", "Ovni Press", 
        "Planeta Cómic", "Utopia", "Merci", "Milky Way", "Moztros", 
        "Random Comics", "Hotel de las Ideas", "Kibook Ediciones"
    ],
    "Tamaño": ["A5 color", "A5", "C6x2", "B6x2", "C6", "B6"],
    "Tomos totales": ["En publicación", "Finalizado"]
};

const CONTENT_STYLES = {
    estados: {
        "en curso": { backgroundColor: "#FFCC99" },
        completado: { backgroundColor: "#C6EFCE" },
        droppeado: { backgroundColor: "#FFC7CE" },
        "tomo único": { backgroundColor: "#FFEB9C" },
    },
    editoriales: {
        ivrea: { backgroundColor: "#FF33CC", color: "#ffffff" },
        panini: { backgroundColor: "#70AD47", color: "#ffffff" },
        kemuri: { backgroundColor: "#FF9966" },
        "distrito manga": { backgroundColor: "#8FAADC", color: "#ffffff" },
        "ovni press": { backgroundColor: "#7030A0", color: "#ffffff" },
        "planeta cómic": { backgroundColor: "#3333CC", color: "#ffffff" },
        utopia: { backgroundColor: "#0099CC", color: "#ffffff" },
        merci: { backgroundColor: "#333300", color: "#ffffff" },
        "milky way": { backgroundColor: "#003366", color: "#ffffff" },
        moztros: { backgroundColor: "#FF0000", color: "#ffffff" },
        "kibook ediciones": { backgroundColor: "#00a59a", color: "#ffffff" },
        "random comics": { backgroundColor: "#ff99ff", color: "#000000" },
        "hotel de las ideas": { backgroundColor: "#f9c8de", color: "#000000" },
    },
    tamaños: {
        a5: { backgroundColor: "#FF0066", color: "#ffffff" },
        c6x2: { backgroundColor: "#FFD966" },
        b6x2: { backgroundColor: "#A9D18E" },
        c6: { backgroundColor: "#FFE699" },
        b6: { backgroundColor: "#0EAE02" },
        "a5 color": { backgroundColor: "#FF5050", color: "#ffffff" },
    },
    tomos: {
        "en publicación": { backgroundColor: "#4472C4", color: "#ffffff" },
        finalizado: { backgroundColor: "#E7E6E6" },
    },
};

class MangaInventoryManager {
    constructor() {
        this.originalValues = [];
        this.discountedValues = [];
        this.discountApplied = false;
        this.initializeDOM();
        this.initializeEventListeners();
    }

    initializeDOM() {
        this.loadingOverlay = document.getElementById("loadingOverlay");
        this.content = document.getElementById("content");
        this.preview = document.getElementById("preview");
        this.searchInput = document.getElementById("searchInput");
        this.filterSelect = document.getElementById("filterSelect");
        this.filterButton = document.getElementById("filterButton");
        this.filtersContainer = document.getElementById("filtersContainer");
        this.discountButton = document.getElementById("discountButton");
        this.noResultsMessage = document.getElementById("noResultsMessage");
    }

    initializeEventListeners() {
        window.onload = () => {
            this.toggleLoadingOverlay(false);
            this.previewExcel(CONFIG.EXCEL_PATH);
            this.fillFilterSelect();
        };

        this.searchInput.addEventListener("input", () => this.applyFilters());
        this.filterSelect.addEventListener("change", () => this.applyFilters());
        this.filterButton.addEventListener("click", () => this.toggleFiltersContainer());
        document.getElementById("downloadButton").addEventListener("click", this.downloadExcel);
        this.discountButton.addEventListener("click", () => this.toggleDiscount());
    }

    toggleLoadingOverlay(isVisible) {
        this.loadingOverlay.style.display = isVisible ? "block" : "none";
        this.content.style.display = isVisible ? "none" : "block";
    }

    previewExcel(filePath) {
        const req = new XMLHttpRequest();
        req.open("GET", filePath, true);
        req.responseType = "arraybuffer";

        req.onload = () => {
            const data = new Uint8Array(req.response);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const html = XLSX.utils.sheet_to_html(sheet);

            this.preview.innerHTML = html;
            this.applyStylesToTable();
            this.hideHiddenRows();
            this.createShowStatisticsButton();
        };

        req.onerror = (e) => console.error("Error al cargar el archivo:", e);
        req.send();
    }

    fillFilterSelect() {
        Object.entries(FILTER_OPTIONS).forEach(([filterName, filterValues]) => {
            const optgroup = document.createElement("optgroup");
            optgroup.label = filterName;
            
            filterValues.forEach(value => {
                const option = document.createElement("option");
                option.textContent = value;
                option.value = value;
                optgroup.appendChild(option);
            });

            this.filterSelect.appendChild(optgroup);
        });
    }

    toggleFiltersContainer() {
        const isHidden = this.filtersContainer.style.display === "none";
        this.filtersContainer.style.display = isHidden ? "block" : "none";

        if (!isHidden) {
            this.clearFilterSelect();
            this.applyFilters();
        }
    }

    clearFilterSelect() {
        this.filterSelect.selectedIndex = 0;
    }

    getSelectedFilters() {
        return Array.from(this.filterSelect.selectedOptions)
            .map(option => option.value.toLowerCase());
    }

    applyFilters() {
        const searchText = this.searchInput.value.toLowerCase();
        const selectedFilters = this.getSelectedFilters();
        const rows = document.querySelectorAll("#preview table tr");
        let anyRowMatch = false;

        rows.forEach((row, index) => {
            if (index === 0 || index >= CONFIG.HIDDEN_ROW_START) {
                row.style.display = index === 0 ? "" : "none";
                return;
            }

            const cells = Array.from(row.querySelectorAll("td"));
            const textMatch = cells.some(cell => 
                cell.textContent.toLowerCase().includes(searchText)
            );
            const filtersMatch = selectedFilters.every(filter => 
                cells.some(cell => cell.textContent.toLowerCase() === filter)
            );

            const rowMatch = textMatch && filtersMatch;
            row.style.display = rowMatch ? "" : "none";
            if (rowMatch) anyRowMatch = true;
        });

        this.noResultsMessage.style.display = anyRowMatch ? "none" : "block";
    }

    downloadExcel() {
        window.location.href = CONFIG.EXCEL_PATH;
    }

    toggleDiscount() {
        this.initializeOrRefreshValues();
        const rows = document.querySelectorAll("#preview table tr");

        rows.forEach((row, index) => {
            if (index !== 0 && index !== CONFIG.HIDDEN_ROW_START) {
                const cell5 = row.querySelector("td:nth-child(5)");
                const cell7 = row.querySelector("td:nth-child(7)");

                if (this.discountApplied) {
                    cell5.textContent = this.originalValues[index].cell5;
                    cell7.textContent = this.originalValues[index].cell7;
                    cell5.classList.remove("rainbow-text-inverse");
                    cell7.classList.remove("rainbow-text");
                } else {
                    cell5.textContent = this.discountedValues[index].cell5;
                    cell7.textContent = this.discountedValues[index].cell7;
                    cell5.classList.add("rainbow-text-inverse");
                    cell7.classList.add("rainbow-text");
                }
            }
        });

        this.discountApplied = !this.discountApplied;
        this.discountButton.textContent = 
            this.discountApplied ? "Precio de Lista" : "Precio de Venta";
    }

    initializeOrRefreshValues() {
        const rows = document.querySelectorAll("#preview table tr");

        if (this.originalValues.length === 0 || this.discountedValues.length === 0) {
            rows.forEach((row, index) => {
                if (index !== 0 && index !== CONFIG.HIDDEN_ROW_START) {
                    const cell5 = row.querySelector("td:nth-child(5)");
                    const cell7 = row.querySelector("td:nth-child(7)");

                    const value5 = parseFloat(cell5.textContent.replace(/[^0-9.-]+/g, ""));
                    const value7 = parseFloat(cell7.textContent.replace(/[^0-9.-]+/g, ""));

                    this.originalValues[index] = { 
                        cell5: cell5.textContent, 
                        cell7: cell7.textContent 
                    };

                    const discountValue5 = !isNaN(value5) 
                        ? `$ ${Math.round(value5 * CONFIG.DISCOUNT_RATES.SALE_PRICE_5 * 100) / 100}` 
                        : cell5.textContent;
                    const discountValue7 = !isNaN(value7) 
                        ? `$ ${Math.round(value7 * CONFIG.DISCOUNT_RATES.SALE_PRICE_7 * 100) / 100}` 
                        : cell7.textContent;

                    this.discountedValues[index] = { 
                        cell5: discountValue5, 
                        cell7: discountValue7 
                    };
                }
            });
        }
    }

    applyStylesToTable() {
        const table = document.querySelector("#preview table");
        const cells = table.querySelectorAll("td");
        const rowCount = table.rows[0]?.cells.length || 0;

        cells.forEach((cell, index) => {
            const columnIndex = index % rowCount;
            const rowIndex = Math.floor(index / rowCount);
            const cellContent = cell.textContent.trim().toLowerCase();

            this.applySpecialRowStyles(cell, rowIndex, columnIndex, cellContent, rowCount);
            this.applyContentBasedStyles(cell, cellContent);
        });
    }

    applySpecialRowStyles(cell, rowIndex, columnIndex, cellContent, rowCount) {
        const specialStyles = [
            { 
                condition: () => rowIndex === 0 || rowIndex === CONFIG.HIDDEN_ROW_START, 
                style: { backgroundColor: "#7030A0", color: "#ffffff" }
            },
            { 
                condition: () => rowIndex === CONFIG.HIDDEN_ROW_END && 
                    (columnIndex === 9 || columnIndex === 2), 
                style: { backgroundColor: "#F2F2F2" }
            },
            { 
                condition: () => columnIndex === 3 && 
                    rowIndex >= 1 && rowIndex <= CONFIG.HIDDEN_ROW_START && 
                    rowIndex !== CONFIG.HIDDEN_ROW_START, 
                style: { backgroundColor: "#A5A5A5", color: "#ffffff" }
            },
            { 
                condition: () => columnIndex === 10 && 
                    cellContent !== "" && 
                    rowIndex >= 1 && rowIndex <= CONFIG.HIDDEN_ROW_START && 
                    rowIndex !== CONFIG.HIDDEN_ROW_START, 
                style: { backgroundColor: "#95DFDB" }
            }
        ];

        const matchedStyle = specialStyles.find(s => s.condition());
        if (matchedStyle) {
            Object.assign(cell.style, matchedStyle.style);
        }
    }

    applyContentBasedStyles(cell, cellContent) {
        Object.values(CONTENT_STYLES).forEach(styleGroup => {
            Object.entries(styleGroup).forEach(([key, style]) => {
                if (cellContent.includes(key)) {
                    Object.assign(cell.style, style);
                }
            });
        });
    }

    hideHiddenRows() {
        const hiddenRows = document.querySelectorAll(`#preview table tr:nth-child(n+${CONFIG.HIDDEN_ROW_START + 1})`);
        hiddenRows.forEach(row => row.style.display = "none");
    }

    createShowStatisticsButton() {
        const buttonContainer = document.createElement("div");
        buttonContainer.id = "showHiddenRowsButtonContainer";
        buttonContainer.className = "showHiddenRowsButtonContainer";

        const showHiddenRowsButton = document.createElement("button");
        showHiddenRowsButton.id = "showHiddenRowsButton";
        showHiddenRowsButton.textContent = "Mostrar Estadisticas";
        showHiddenRowsButton.dataset.clicked = "false";

        showHiddenRowsButton.addEventListener("click", () => {
            const isVisible = showHiddenRowsButton.dataset.clicked === "true";
            showHiddenRowsButton.dataset.clicked = isVisible ? "false" : "true";
            showHiddenRowsButton.textContent = isVisible 
                ? "Mostrar Estadisticas" 
                : "Ocultar Estadisticas";
            this.toggleHiddenRows(isVisible);
        });

        buttonContainer.appendChild(showHiddenRowsButton);
        this.content.appendChild(buttonContainer);
    }

    toggleHiddenRows(isVisible) {
        const hiddenRows = document.querySelectorAll(`#preview table tr:nth-child(n+${CONFIG.HIDDEN_ROW_START + 1})`);
        
        if (!isVisible) {
            let visibleRowsFound = 0;
            hiddenRows.forEach(row => {
                const cells = row.querySelectorAll("td");
                const hasContent = Array.from(cells).some(cell => 
                    cell.textContent.trim() !== "" && 
                    cell.textContent.trim().toLowerCase() !== "total"
                );

                if (hasContent) {
                    row.style.display = "table-row";
                    visibleRowsFound++;
                } else {
                    row.style.display = "none";
                }

                if (visibleRowsFound >= 10) return;
            });
        } else {
            hiddenRows.forEach(row => row.style.display = "none");
        }
    }
}

// Initialize the application
const mangaInventoryApp = new MangaInventoryManager();