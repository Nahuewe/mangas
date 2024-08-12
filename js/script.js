// Distribucion de funciones: carga de la pagina | Visualizacion de la tabla con formato Excel | Filtro general | Boton de "filtros" | Boton de "descargar" | Estilos de la tabla | Mostrar o esconder las tablas de estadisticas.

// Funcion que se ejecuta al cargar la pagina
window.onload = function () {
    const loadingOverlay = document.getElementById("loadingOverlay");
    const content = document.getElementById("content");
    setTimeout(function () {
        loadingOverlay.style.display = "none";
        content.style.display = "block";
    }, 200);

    // Path al archivo Excel
    const excelFilePath = './assets/Mangas.xlsx';
    previewExcel(excelFilePath);

    // Llenar el selector de filtro con las opciones de filtro al cargar la página
    fillFilterSelect();
};

// Funcion donde se edita todo lo que se visualiza dentro de las tablas
function previewExcel(filePath) {
    // Leer el archivo Excel
    const req = new XMLHttpRequest();
    req.open("GET", filePath, true);
    req.responseType = "arraybuffer";

    req.onload = function (e) {
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

        // Ocultar las filas desde la 117 hacia abajo al cargar la página
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
    "Editorial": ["Ivrea", "Panini", "Kemuri", "Distrito Manga", "Ovni Press", "Planeta Cómic", "Utopia", "Merci", "Milky Way", "Moztros", "Random Comics", "Hotel de las Ideas"],
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
    // Obtener todas las filas de la tabla
    const rows = document.querySelectorAll("#preview table tr");
    let anyRowMatch = false; // Variable para controlar si alguna fila coincide con el filtro

    // Recorrer todas las filas y ocultar aquellas que no coincidan con el texto de búsqueda
    for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        if (index === 0) {
            row.style.display = ""; // Mostrar la fila de encabezado
        } else if (index < 117) {
            const cells = row.querySelectorAll("td");
            let rowMatch = false;
            cells.forEach(function (cell) {
                if (cell.textContent.toLowerCase().includes(searchText)) {
                    rowMatch = true;
                    anyRowMatch = true; // Al menos una fila coincide con el filtro
                }
            });
            if (rowMatch) {
                row.style.display = ""; // Mostrar la fila si coincide con el texto de búsqueda
            } else {
                row.style.display = "none"; // Ocultar la fila si no coincide con el texto de búsqueda
            }
        } else {
            row.style.display = "none"; // Ocultar las filas desde la fila 95 hacia abajo
        }
    }

    // Mostrar u ocultar el mensaje de "No se encontraron resultados" según la variable anyRowMatch
    const noResultsMessage = document.getElementById("noResultsMessage");
    if (!anyRowMatch) {
        noResultsMessage.style.display = "block"; // Mostrar el mensaje si no hay filas que coincidan con el filtro
    } else {
        noResultsMessage.style.display = "none"; // Ocultar el mensaje si hay filas que coinciden con el filtro
    }
}

// Función para aplicar los filtros seleccionados
function applyFilters() {
    const searchText = document.getElementById("searchInput").value.toLowerCase();
    const selectedFilters = getSelectedFilters();

    // Obtener todas las filas de la tabla
    const rows = document.querySelectorAll("#preview table tr");
    let anyRowMatch = false;

    rows.forEach((row, index) => {
        if (index === 0 || index >= 117) {
            row.style.display = index === 0 ? "" : "none";
            return;
        }

        const cells = row.querySelectorAll("td");
        let textMatch = false;
        let filtersMatch = true;

        // Verificar coincidencia con el texto de búsqueda
        cells.forEach(cell => {
            if (cell.textContent.toLowerCase().includes(searchText)) {
                textMatch = true;
            }
        });

        // Verificar coincidencia con los filtros seleccionados
        selectedFilters.forEach(filterValue => {
            if (!Array.from(cells).some(cell => cell.textContent.toLowerCase() === filterValue)) {
                filtersMatch = false;
            }
        });

        // Mostrar u ocultar la fila dependiendo de las coincidencias
        if (textMatch && filtersMatch) {
            row.style.display = "";
            anyRowMatch = true;
        } else {
            row.style.display = "none";
        }
    });

    // Mostrar u ocultar el mensaje de "No se encontraron resultados"
    const noResultsMessage = document.getElementById("noResultsMessage");
    noResultsMessage.style.display = anyRowMatch ? "none" : "block";
}


// Función para obtener los filtros seleccionados
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
            if (index !== 0 && index !== 117) { // Excluyendo filas específicas
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
        if (index !== 0 && index !== 117) {
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
        // Ignorar las filas con índice 1 y 118
        if (index === 0 || index === 118) return;

        const cell = row.querySelector("td:nth-child(7)");
        cell.textContent = saleValues[index - 1];
    });
}

// Funcion para aplicar todos los estilos a la tabla
function applyStylesToTable() {
    // Obtener todas las celdas de la tabla
    const cells = document.querySelectorAll("#preview table td");

    // Iterar sobre cada celda y aplicar los estilos según su contenido
    cells.forEach(function (cell, index) {
        const rowCount = document.querySelector("#preview table tr").cells.length;
        const columnIndex = index % rowCount;
        const rowIndex = Math.floor(index / rowCount);

        if (columnIndex === 3 && rowIndex >= 1 && rowIndex <= 118 && rowIndex !== 117) {
            cell.style.backgroundColor = "#A5A5A5";
            cell.style.color = "#ffffff";
            // } else if (columnIndex === 8 && rowIndex >= 1 && rowIndex <= 118 && rowIndex !== 117) {
            //     cell.style.backgroundColor = "#F2F2F2";
            //     cell.style.color = "#ff6f00";
            // } else if (columnIndex === 9 && rowIndex >= 1 && rowIndex <= 118 && rowIndex !== 117) {
            //     cell.style.backgroundColor = "#F2F2F2";
            //     cell.style.color = "#ff6f00";
        } else if (columnIndex === 10 && cell.textContent.trim() !== "" && rowIndex >= 1 && rowIndex <= 118 && rowIndex !== 117) {
            cell.style.backgroundColor = "#95DFDB";
        } else {
            const cellContent = cell.textContent.trim().toLowerCase();

            // Estados

            if (cellContent.toLowerCase().includes("en curso")) {
                cell.style.backgroundColor = "#FFCC99";
            } else if (cellContent.toLowerCase().includes("completado")) {
                cell.style.backgroundColor = "#C6EFCE";
            } else if (cellContent.toLowerCase().includes("droppeado")) {
                cell.style.backgroundColor = "#FFC7CE";
            } else if (cellContent.toLowerCase().includes("tomo único")) {
                cell.style.backgroundColor = "#FFEB9C";
            }

            // Editoriales

            else if (cellContent.toLowerCase().includes("ivrea")) {
                cell.style.backgroundColor = "#FF33CC";
                cell.style.color = "#ffffff";
            } else if (cellContent.toLowerCase().includes("panini")) {
                cell.style.backgroundColor = "#70AD47";
                cell.style.color = "#ffffff";
            } else if (cellContent.toLowerCase().includes("kemuri")) {
                cell.style.backgroundColor = "#FF9966";
            } else if (cellContent.toLowerCase().includes("distrito manga")) {
                cell.style.backgroundColor = "#8FAADC";
                cell.style.color = "#ffffff";
            } else if (cellContent.toLowerCase().includes("ovni press")) {
                cell.style.backgroundColor = "#7030A0";
                cell.style.color = "#ffffff";
            } else if (cellContent.toLowerCase().includes("planeta cómic")) {
                cell.style.backgroundColor = "#3333CC";
                cell.style.color = "#ffffff";
            } else if (cellContent.toLowerCase().includes("utopia")) {
                cell.style.backgroundColor = "#0099CC";
                cell.style.color = "#ffffff";
            } else if (cellContent.toLowerCase().includes("merci")) {
                cell.style.backgroundColor = "#333300";
                cell.style.color = "#ffffff";
            } else if (cellContent.toLowerCase().includes("milky way")) {
                cell.style.backgroundColor = "#003366";
                cell.style.color = "#ffffff";
            } else if (cellContent.toLowerCase().includes("moztros")) {
                cell.style.backgroundColor = "#FF0000";
                cell.style.color = "#ffffff";
            } else if (cellContent.toLowerCase().includes("random comics")) {
                cell.style.backgroundColor = "#ff99ff";
                cell.style.color = "#000000";
            } else if (cellContent.toLowerCase().includes("hotel de las ideas")) {
                cell.style.backgroundColor = "#f9c8de";
                cell.style.color = "#000000";
            }

            // Tamaño

            if (cellContent.includes("a5 color")) {
                cell.style.backgroundColor = "#FF5050";
                cell.style.color = "#ffffff";
            } else if (cellContent.includes("a5")) {
                cell.style.backgroundColor = "#FF0066";
                cell.style.color = "#ffffff";
            } else if (cellContent.includes("c6x2")) {
                cell.style.backgroundColor = "#FFD966";
            } else if (cellContent.includes("b6x2")) {
                cell.style.backgroundColor = "#A9D18E";
            } else if (cellContent.includes("c6")) {
                cell.style.backgroundColor = "#FFE699";
            } else if (cellContent.includes("b6")) {
                cell.style.backgroundColor = "#0EAE02";
            }

            // Tomos totales

            if (cellContent.toLowerCase().includes("en publicacion")) {
                cell.style.backgroundColor = "#4472C4";
                cell.style.color = "#ffffff";
            } else if (cellContent.toLowerCase().includes("finalizado")) {
                cell.style.backgroundColor = "#E7E6E6";
            }
        }

        // Aplicar estilos a la fila 0
        if (rowIndex === 0) {
            cell.style.backgroundColor = "#7030A0";
            cell.style.color = "#ffffff";
        }

        // Aplicar estilos a la fila 100 (excluir columna 11)
        if (rowIndex === 117 && columnIndex <= 9) {
            cell.style.backgroundColor = "#7030A0";
            cell.style.color = "#ffffff";
        }

        if (rowIndex === 118 && columnIndex === 9) {
            cell.style.backgroundColor = "#F2F2F2";
        }

        if (rowIndex === 118 && columnIndex === 2) {
            cell.style.backgroundColor = "#F2F2F2";
        }
    });
}

// Función para ocultar las filas desde la 118 hacia abajo
function hideHiddenRows() {
    const hiddenRows = document.querySelectorAll("#preview table tr:nth-child(n+118)");
    hiddenRows.forEach(row => {
        row.style.display = "none";
    });
}

// Funcion para mostrar las tablas ocultas en la funcion de mostrar estadisticas
function showHiddenRows() {
    const hiddenRows = document.querySelectorAll("#preview table tr:nth-child(n+118)");
    const button = document.getElementById("showHiddenRowsButton");

    if (button.dataset.clicked === "true") {
        hiddenRows.forEach(row => {
            row.style.display = "table-row";
        });
    } else {
        hiddenRows.forEach(row => {
            row.style.display = "none";
        });
    }
}