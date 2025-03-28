// Funcion que se ejecuta al cargar la pagina
window.onload = () => {
    toggleLoadingOverlay(false);
    previewExcel('./assets/Mangas.xlsx');
    fillFilterSelect();
};

// Función para mostrar u ocultar el overlay de carga
function toggleLoadingOverlay(isVisible) {
    const loadingOverlay = document.getElementById("loadingOverlay");
    const content = document.getElementById("content");
    loadingOverlay.style.display = isVisible ? "block" : "none";
    content.style.display = isVisible ? "none" : "block";
}

// Funcion donde se edita todo lo que se visualiza dentro de las tablas
function previewExcel(filePath) {
    // Leer el archivo Excel
    const req = new XMLHttpRequest();
    req.open("GET", filePath, true);
    req.responseType = "arraybuffer";

    req.onload = function () {
        const data = new Uint8Array(req.response);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const html = XLSX.utils.sheet_to_html(sheet);

        // Agregar la tabla al div de previsualización
        document.getElementById("preview").innerHTML = html;

        // Agregar el evento de escucha al input de búsqueda
        document.getElementById("searchInput").addEventListener("input", function () {
            filterTable(this.value.toLowerCase());
        });

        // Agregar el evento de escucha al botón de descarga de Excel
        document.getElementById("downloadButton").addEventListener("click", function () {
            downloadExcel();
        });

        // Aplicar estilos adicionales a la tabla
        applyStylesToTable();

        // Ocultar las filas desde la 127 hacia abajo al cargar la página
        hideHiddenRows();

        // Llenar el selector de filtro con las opciones de filtro al cargar la página
        fillFilterSelect();

        // Crear y agregar el contenedor para el botón "Mostrar Estadísticas"
        const buttonContainer = document.createElement("div");
        buttonContainer.id = "showHiddenRowsButtonContainer";
        buttonContainer.className = "showHiddenRowsButtonContainer";

        // Crear y agregar el botón de mostrar estadísticas al contenedor
        const showHiddenRowsButton = document.createElement("button");
        showHiddenRowsButton.id = "showHiddenRowsButton";
        showHiddenRowsButton.textContent = "Mostrar Estadisticas";
        showHiddenRowsButton.addEventListener("click", function () {
            if (this.dataset.clicked === "true") {
                this.dataset.clicked = "false";
                this.textContent = "Mostrar Estadisticas";
            } else {
                this.dataset.clicked = "true";
                this.textContent = "Ocultar Estadisticas";
            }
            showHiddenRows();
        });

        // Agregar el botón al contenedor
        buttonContainer.appendChild(showHiddenRowsButton);

        // Agregar el contenedor al div de contenido
        document.getElementById("content").appendChild(buttonContainer);
    };

    req.onerror = function (e) {
        console.error("Error al cargar el archivo:", e);
    };

    req.send();
}

// Opciones del filtro
const filterOptions = {
    "Estado": ["En curso", "Completado", "Droppeado", "Tomo único"],
    "Editorial": ["Ivrea", "Panini", "Kemuri", "Distrito Manga", "Ovni Press", "Planeta Cómic", "Utopia", "Merci", "Milky Way", "Moztros", "Random Comics", "Hotel de las Ideas", "Kibook Ediciones"],
    "Tamaño": ["A5 color", "A5", "C6x2", "B6x2", "C6", "B6"],
    "Tomos totales": ["En publicación", "Finalizado"]
};

// Función para llenar el selector de filtro con las opciones de filtro
function fillFilterSelect() {
    const filterSelect = document.getElementById("filterSelect");

    // Generar opciones para cada filtro
    for (const filterName in filterOptions) {
        if (filterOptions.hasOwnProperty(filterName)) {
            const filterValues = filterOptions[filterName];
            const optgroup = document.createElement("optgroup");
            optgroup.label = filterName;
            filterValues.forEach(function (value) {
                const option = document.createElement("option");
                option.textContent = value;
                option.value = value;
                optgroup.appendChild(option);
            });
            filterSelect.appendChild(optgroup);
        }
    }
}

function clearSearchInput() {
    const searchInput = document.getElementById("searchInput");
    searchInput.value = ""; // Limpiar el texto del input de búsqueda
    filterTable(""); // Llamar a la función filterTable con una cadena vacía para restaurar la tabla
}

const filterButton = document.getElementById("filterButton");
const filtersContainer = document.getElementById("filtersContainer");

filterButton.addEventListener("click", function () {
    if (filtersContainer.style.display === "none") {
        filtersContainer.style.display = "block";
    } else {
        filtersContainer.style.display = "none";
        // Limpiar el select al ocultar los filtros
        clearFilterSelect();
        // Restaurar la tabla al estado original
        filterTable("");
    }
});

function clearFilterSelect() {
    // Obtener el select de los filtros
    const filterSelect = document.getElementById("filterSelect");
    // Establecer el primer elemento como seleccionado
    filterSelect.selectedIndex = 0;
}

// Función para filtrar las tablas
function filterTable(searchText) {
    const rows = document.querySelectorAll("#preview table tr");
    const noResultsMessage = document.getElementById("noResultsMessage");
    let anyRowMatch = false;

    rows.forEach((row, index) => {
        if (index === 0) {
            // Mostrar siempre el encabezado
            row.style.display = "";
            return;
        }

        if (index >= 127) {
            // Ocultar filas desde la 127
            row.style.display = "none";
            return;
        }

        const cells = Array.from(row.querySelectorAll("td"));
        const rowMatch = cells.some(cell => cell.textContent.toLowerCase().includes(searchText));

        row.style.display = rowMatch ? "" : "none";
        if (rowMatch) anyRowMatch = true;
    });

    // Mostrar u ocultar el mensaje de "No se encontraron resultados"
    noResultsMessage.style.display = anyRowMatch ? "none" : "block";
}

function applyFilters() {
    const searchText = document.getElementById("searchInput").value.toLowerCase();
    const selectedFilters = getSelectedFilters();
    const rows = document.querySelectorAll("#preview table tr");
    const noResultsMessage = document.getElementById("noResultsMessage");
    let anyRowMatch = false;

    rows.forEach((row, index) => {
        if (index === 0 || index >= 127) {
            // Mostrar encabezado y ocultar filas desde la 127
            row.style.display = index === 0 ? "" : "none";
            return;
        }

        const cells = Array.from(row.querySelectorAll("td"));
        const textMatch = cells.some(cell => cell.textContent.toLowerCase().includes(searchText));
        const filtersMatch = selectedFilters.every(filter =>
            cells.some(cell => cell.textContent.toLowerCase() === filter)
        );

        const rowMatch = textMatch && filtersMatch;
        row.style.display = rowMatch ? "" : "none";
        if (rowMatch) anyRowMatch = true;
    });

    // Mostrar u ocultar el mensaje de "No se encontraron resultados"
    noResultsMessage.style.display = anyRowMatch ? "none" : "block";
}

function getSelectedFilters() {
    const filterSelect = document.getElementById("filterSelect");
    return Array.from(filterSelect.selectedOptions).map(option => option.value.toLowerCase());
}

// Función para verificar si las opciones seleccionadas coinciden con el contenido de la celda
function filtersMatch(selectedFilters, cellIndex, cellContent) {
    for (const filterName in selectedFilters) {
        if (selectedFilters.hasOwnProperty(filterName)) {
            const selectedOptions = selectedFilters[filterName];
            if (selectedOptions.length > 0) {
                const columnIndex = getFilterIndex(filterName);
                if (columnIndex === cellIndex && selectedOptions.includes(cellContent)) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Función para obtener el índice de la columna según el filtro seleccionado
function getFilterIndex(filter) {
    switch (filter) {
        case "Estado":
            return 1; // Índice de la columna de Estado
        case "Editorial":
            return 2; // Índice de la columna de Editorial
        case "Tamaño":
            return 6; // Índice de la columna de Tamaño
        case "Tomos totales":
            return 8; // Índice de la columna de Tomos Totales
        default:
            return -1; // Valor por defecto para manejar filtros no válidos
    }
}

// Funciones para el autocompletado en los filtros
const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", function () {
    filterTable(this.value.toLowerCase());
});

// Evento para manejar el cambio en el filtro seleccionado
const filterSelect = document.getElementById("filterSelect");

// Evento para manejar el cambio en el filtro seleccionado
filterSelect.addEventListener("change", function () {
    applyFilters();
});

searchInput.addEventListener("input", function () {
    applyFilters();
});

// Descargar el Excel con el boton de "descarga"
function downloadExcel() {
    // Función para descargar el archivo Excel
    const excelFilePath = './assets/Mangas.xlsx';
    window.location.href = excelFilePath;
}

// Botón de descuento
const discountButton = document.getElementById("discountButton");

// Agregar evento de clic al botón de descuento
discountButton.addEventListener("click", function () {
    // Alternar entre mostrar el valor de venta y el valor de lista
    toggleDiscount();
});

let originalValues = []; // Este array almacenará objetos { cell5: valor, cell7: valor }
let discountedValues = []; // Similar a originalValues, para los valores con descuento
let discountApplied = false; // Para controlar el estado del descuento

function initializeOrRefreshValues() {
    const rows = document.querySelectorAll("#preview table tr");

    if (originalValues.length === 0 || discountedValues.length === 0) {
        rows.forEach((row, index) => {
            if (index !== 0 && index !== 127) { // Excluyendo filas específicas
                // Para el quinto hijo
                const cell5 = row.querySelector("td:nth-child(5)");
                const value5 = parseFloat(cell5.textContent.replace(/[^0-9.-]+/g, ""));
                // Para el séptimo hijo
                const cell7 = row.querySelector("td:nth-child(7)");
                const value7 = parseFloat(cell7.textContent.replace(/[^0-9.-]+/g, ""));

                originalValues[index] = { cell5: cell5.textContent, cell7: cell7.textContent }; // Guardar valores originales

                // Calculando descuentos
                const discountValue5 = !isNaN(value5) ? "$ " + Math.round(value5 * 0.8 * 100) / 100 : cell5.textContent;
                const discountValue7 = !isNaN(value7) ? "$ " + Math.round(value7 * 0.6 * 100) / 100 : cell7.textContent;

                discountedValues[index] = { cell5: discountValue5, cell7: discountValue7 }; // Guardar valores con descuento
            }
        });
    }
}

function toggleDiscount() {
    initializeOrRefreshValues();

    const rows = document.querySelectorAll("#preview table tr");

    rows.forEach((row, index) => {
        if (index !== 0 && index !== 127) {
            // Aplicando o quitando el descuento para el quinto y séptimo hijo
            const cell5 = row.querySelector("td:nth-child(5)");
            const cell7 = row.querySelector("td:nth-child(7)");

            if (discountApplied) {
                // Restaurar valores originales
                cell5.textContent = originalValues[index].cell5;
                cell7.textContent = originalValues[index].cell7;
                cell5.classList.remove("rainbow-text-inverse");
                cell7.classList.remove("rainbow-text");
            } else {
                // Aplicar descuento
                cell5.textContent = discountedValues[index].cell5;
                cell7.textContent = discountedValues[index].cell7;
                cell5.classList.add("rainbow-text-inverse");
                cell7.classList.add("rainbow-text");
            }
        }
    });

    discountApplied = !discountApplied; // Alternar estado del descuento
    discountButton.textContent = discountApplied ? "Precio de Lista" : "Precio de Venta";
}

// Función para mostrar los valores de venta, ignorando las filas con índice 1 y 100
function showSaleValues() {
    const rows = document.querySelectorAll("#preview table tr");
    rows.forEach(function (row, index) {
        // Ignorar las filas con índice 1 y 128
        if (index === 0 || index === 128) return;

        const cell = row.querySelector("td:nth-child(7)");
        cell.textContent = saleValues[index - 1];
    });
}

// Funcion para aplicar todos los estilos a la tabla
function applyStylesToTable() {
    // Obtener todas las celdas de la tabla
    const table = document.querySelector("#preview table");
    const cells = table.querySelectorAll("td");
    const rowCount = table.rows[0]?.cells.length || 0;

    // Mapas de valores a estilos
    const contentStyles = {
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

    // Función auxiliar para aplicar estilos
    function applyStyle(cell, style) {
        Object.assign(cell.style, style);
    }

    // Iterar sobre las celdas
    cells.forEach((cell, index) => {
        const columnIndex = index % rowCount;
        const rowIndex = Math.floor(index / rowCount);
        const cellContent = cell.textContent.trim().toLowerCase();

        // Estilos especiales para posiciones específicas
        if (rowIndex === 0) {
            applyStyle(cell, { backgroundColor: "#7030A0", color: "#ffffff" });
        } else if (rowIndex === 127 && columnIndex <= 9) {
            applyStyle(cell, { backgroundColor: "#7030A0", color: "#ffffff" });
        } else if (rowIndex === 128 && (columnIndex === 9 || columnIndex === 2)) {
            applyStyle(cell, { backgroundColor: "#F2F2F2" });
        } else if (columnIndex === 3 && rowIndex >= 1 && rowIndex <= 128 && rowIndex !== 127) {
            applyStyle(cell, { backgroundColor: "#A5A5A5", color: "#ffffff" });
        } else if (columnIndex === 10 && cellContent !== "" && rowIndex >= 1 && rowIndex <= 128 && rowIndex !== 127) {
            applyStyle(cell, { backgroundColor: "#95DFDB" });
        }

        // Aplicar estilos según contenido
        Object.entries(contentStyles).forEach(([, styles]) => {
            Object.entries(styles).forEach(([key, style]) => {
                if (cellContent.includes(key)) {
                    applyStyle(cell, style);
                }
            });
        });
    });
}

// Función para ocultar las filas desde la 128 hacia abajo
function hideHiddenRows() {
    const hiddenRows = document.querySelectorAll("#preview table tr:nth-child(n+128)");
    hiddenRows.forEach(row => {
        row.style.display = "none";
    });
}

// Funcion para mostrar las tablas ocultas en la funcion de mostrar estadisticas
function showHiddenRows() {
    const hiddenRows = document.querySelectorAll("#preview table tr:nth-child(n+128)");
    const button = document.getElementById("showHiddenRowsButton");

    if (button.dataset.clicked === "true") {
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

            if (visibleRowsFound >= 10) {
                return;
            }
        });
    } else {
        hiddenRows.forEach(row => {
            row.style.display = "none";
        });
    }
}