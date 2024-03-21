// Distribucion de funciones: carga de la pagina | Visualizacion de la tabla con formato Excel | Filtro general | Boton de "filtros" | Boton de "descargar" | Estilos de la tabla | Mostrar o esconder las tablas de estadisticas.

// Función que se ejecuta al cargar la página
window.onload = function () {
    const loadingOverlay = document.getElementById("loadingOverlay");
    const content = document.getElementById("content");
    setTimeout(function () {
        loadingOverlay.style.display = "none";
        content.style.display = "block";
    }, 200);

    // Path al archivo Excel
    const excelFilePath = 'https://docs.google.com/spreadsheets/d/1sstxQxFDH-a0zpk5EX1-kzvHId41LcBXtn5M4Kz4-is/edit#gid=1489277399';
    previewExcel(excelFilePath);
    // getLastModified();
};

// Función para obtener la última fecha de modificación del archivo de Google Sheets
// function getLastModified() {
//     // ID del archivo de Google Sheets
//     const spreadsheetId = '1sstxQxFDH-a0zpk5EX1-kzvHId41LcBXtn5M4Kz4-is';

//     // Hacer una solicitud a la API de Google Sheets para obtener la información del archivo
//     gapi.client.sheets.spreadsheets.get({
//         spreadsheetId: spreadsheetId
//     }).then(function(response) {
//         const lastModified = response.result.properties.modifiedTime;
//         // Insertar la fecha en el elemento HTML
//         document.getElementById("lastModified").textContent = lastModified;
//     }, function(reason) {
//         console.error('Error al obtener información del archivo:', reason.result.error.message);
//     });
// }

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

        // Ocultar las filas desde la 102 hacia abajo al cargar la página
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

// Funcion para filtrar las tablas
function filterTable(searchText) {
    // Obtener todas las filas de la tabla
    const rows = document.querySelectorAll("#preview table tr");
    let anyRowMatch = false; // Variable para controlar si alguna fila coincide con el filtro

    // Recorrer todas las filas y ocultar aquellas que no coincidan con el texto de búsqueda
    for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        if (index === 1) {
            row.style.display = ""; // Mostrar la fila de encabezado
        } else if (index < 102) {
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
            row.style.display = "none"; // Ocultar las filas desde la fila 102 hacia abajo
        }
    }

    // Mostrar o ocultar el mensaje de "No se encontraron resultados" según la variable anyRowMatch
    const noResultsMessage = document.getElementById("noResultsMessage");
    const noResultsMessageFilter = document.getElementById("noResultsMessageFilter");
    const showHiddenRowsButtonContainer = document.getElementById("showHiddenRowsButtonContainer");
    if (!anyRowMatch) {
        noResultsMessage.style.display = ""; // Mostrar el mensaje si no hay filas que coincidan con el filtro
        noResultsMessageFilter.style.display = "none";
        showHiddenRowsButtonContainer.style.display = "none";
    } else {
        noResultsMessage.style.display = "none"; // Ocultar el mensaje si hay filas que coinciden con el filtro
        noResultsMessageFilter.style.display = "none";
        showHiddenRowsButtonContainer.style.display = "none";
    }
}

// Opciones del filtro
const filterOptions = {
    "Estado": ["En curso", "Completado", "Droppeado", "Tomo único"],
    "Editorial": ["Ivrea", "Panini", "Kemuri", "Distrito Manga", "Ovni Press", "Planeta Cómic", "Utopia", "Merci", "Milky Way", "Moztros", "Random Comics"],
    "Tamaño": ["A5 color", "A5", "C6x2", "B6x2", "C6", "B6"],
    "Tomos totales": ["En publicación", "Finalizado"]
};

// Función para aplicar los filtros seleccionados
function applyFilters() {
    const searchText = searchInput.value.toLowerCase();
    const selectedFilters = getSelectedFilters();

    // Obtener todas las filas de la tabla
    const rows = document.querySelectorAll("#preview table tr");
    let anyRowMatch = false; // Variable para controlar si alguna fila coincide con los filtros

    // Recorrer todas las filas y verificar si alguna coincide con los filtros seleccionados
    rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        let rowMatch = false;

        cells.forEach((cell, cellIndex) => {
            // Verificar si el texto de búsqueda coincide y si alguna de las opciones seleccionadas coincide con el contenido de la celda
            if (cell.textContent.toLowerCase().includes(searchText) && selectedFilters.some(filter => filter.includes(cell.textContent.toLowerCase()))) {
                rowMatch = true;
            }
        });

        // Mostrar u ocultar la fila según si coincide con los filtros
        if (rowMatch) {
            row.style.display = "";
            anyRowMatch = true;
        } else {
            row.style.display = "none";
        }
    });

    // Mostrar u ocultar el mensaje de "No se encontraron resultados" según la variable anyRowMatch
    const noResultsMessageFilter = document.getElementById("noResultsMessageFilter");
    if (!anyRowMatch) {
        noResultsMessageFilter.style.display = "block"; // Mostrar el mensaje si no hay filas que coincidan con los filtros
    } else {
        noResultsMessageFilter.style.display = "none"; // Ocultar el mensaje si hay filas que coinciden con los filtros
    }
}

// Función para obtener los filtros seleccionados
function getSelectedFilters() {
    const selectedFilters = [];
    const filterSelect = document.getElementById("filterSelect");

    // Iterar sobre las opciones seleccionadas dentro de filterSelect
    for (let i = 0; i < filterSelect.options.length; i++) {
        const select = filterSelect.options[i];
        // Si la opción está seleccionada, agregar su valor al array selectedFilters
        if (select.selected) {
            selectedFilters.push(select.textContent.toLowerCase());
        }
    }

    return selectedFilters;
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
            return 4; // Índice de la columna de Estado
        case "Editorial":
            return 5; // Índice de la columna de Editorial
        case "Tamaño":
            return 6; // Índice de la columna de Tamaño
        case "Tomos totales":
            return 10; // Índice de la columna de Tomos Totales
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
    // URL del archivo Excel
    const excelFilePath = 'https://docs.google.com/spreadsheets/d/1sstxQxFDH-a0zpk5EX1-kzvHId41LcBXtn5M4Kz4-is/export?format=xlsx&id=1sstxQxFDH-a0zpk5EX1-kzvHId41LcBXtn5M4Kz4-is';

    // Crear un elemento <a> para descargar el archivo
    const downloadLink = document.createElement("a");
    downloadLink.href = excelFilePath;

    // Establecer atributos para la descarga
    downloadLink.download = 'Mangas.xlsx';
    downloadLink.target = '_blank';

    // Simular un clic en el enlace para iniciar la descarga
    downloadLink.click();
}

// Botón de descuento
const discountButton = document.getElementById("discountButton");

// Agregar evento de clic al botón de descuento
discountButton.addEventListener("click", function () {
    // Alternar entre mostrar el valor de venta y el valor de lista
    toggleDiscount();
});

// Variables para almacenar los valores originales y con descuento
let originalValues = [];
let discountedValues = [];

// Flag para verificar si el descuento ya ha sido aplicado
let discountApplied = false;

// Función para inicializar o actualizar los valores originales y con descuento
function initializeOrRefreshValues() {
    const rows = document.querySelectorAll("#preview table tr");
    
    // Inicializar o refrescar solo si es necesario (la primera vez o si el array está vacío)
    if (originalValues.length === 0 || discountedValues.length === 0) {
        rows.forEach((row, index) => {
            // Considerar todas las filas excepto las que no deben modificarse (por ejemplo, títulos, encabezados, etc.)
            if (index !== 0 && index !== 1 && index !== 101) { // Asumiendo que la fila 0 y 100 no deben ser modificadas
                const cell = row.querySelector("td:nth-child(8)");
                const cellValue = parseFloat(cell.textContent.replace(/[^0-9.-]+/g, ""));
                if (!isNaN(cellValue)) {
                    originalValues[index] = cell.textContent; // Guardar el valor original
                    const discountValue = Math.round(cellValue * 0.6 * 100) / 100; // Descuento del 40%
                    discountedValues[index] = "$ " + discountValue.toString(); // Guardar el valor con descuento
                }
            }
        });
    }
}

// Función para alternar entre mostrar precios con descuento y precios originales
function toggleDiscount() {
    initializeOrRefreshValues(); // Asegurarse de que los valores están inicializados

    const rows = document.querySelectorAll("#preview table tr");

    rows.forEach((row, index) => {
        if (index !== 0 && index !== 1 && index !== 101) { // Asumiendo que la fila 0 y 100 no deben ser modificadas
            const cell = row.querySelector("td:nth-child(8)");
            if (discountApplied) {
                // Restaurar valor original
                cell.textContent = originalValues[index];
                cell.classList.remove("rainbow-text");
            } else {
                // Aplicar descuento
                cell.textContent = discountedValues[index];
                cell.classList.add("rainbow-text");
            }
        }
    });

    // Toggle el estado del descuento
    discountApplied = !discountApplied;
    // Actualizar el texto del botón según el estado
    discountButton.textContent = discountApplied ? "Precio de Lista" : "Precio de Venta";
}

// Función para mostrar los valores de venta, ignorando las filas con índice 1 y 100
function showSaleValues() {
    const rows = document.querySelectorAll("#preview table tr");
    rows.forEach(function (row, index) {
        // Ignorar las filas con índice 1 y 100
        if (index !== 0 && index !== 1 && index !== 102) return;
        
        const cell = row.querySelector("td:nth-child(8)");
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
        if (columnIndex <= 11) {
            if (columnIndex === 4 && rowIndex >= 1 && rowIndex <= 101 && rowIndex !== 101) {
                cell.style.backgroundColor = "#A5A5A5";
                cell.style.color = "#ffffff";
            } else if (columnIndex === 5 && rowIndex >= 1 && rowIndex <= 101 && rowIndex !== 101) {
                cell.style.backgroundColor = "#F2F2F2";
                cell.style.color = "#ff6f00";
            } else if (columnIndex === 11 && cell.textContent.trim() !== "" && rowIndex >= 1 && rowIndex <= 101 && rowIndex !== 101) {
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

            // Aplicar estilos a la fila 1
            if (rowIndex === 1) {
                cell.style.backgroundColor = "#7030A0";
                cell.style.color = "#ffffff";
            }

            if (columnIndex === 0) {
                cell.style.backgroundColor = "#fff";
                cell.style.color = "#000";
            }

            // Aplicar estilos a la fila 101 (excluir columna 11)
            if (rowIndex === 101 && columnIndex <= 9) {
                cell.style.backgroundColor = "#7030A0";
                cell.style.color = "#ffffff";
            }
        } else {
            // Ocultar las celdas que están en las columnas 12 en adelante
            cell.style.display = "none";
        }
    });
}

// Función para ocultar las filas desde la 95 hacia abajo
function hideHiddenRows() {
    const rows = document.querySelectorAll("#preview table tr");
    rows.forEach((row, index) => {
        if (index >= 102) {
            row.style.display = "none";
        } else if (row.style.display !== "none" && index !== 0) { // Ocultar filas que no coinciden con el filtro de búsqueda
            const cells = row.querySelectorAll("td");
            let rowMatch = false;
            cells.forEach(function (cell) {
                if (cell.textContent.toLowerCase().includes(searchInput.value.toLowerCase())) {
                    rowMatch = true;
                }
            });
            if (!rowMatch) {
                row.style.display = "none";
            }
        }
    });
}

// Función para mostrar las tablas ocultas en la función de mostrar estadísticas
function showHiddenRows() {
    const rows = document.querySelectorAll("#preview table tr");
    rows.forEach((row, index) => {
        if (index >= 102) {
            const button = document.getElementById("showHiddenRowsButton");
            if (button.dataset.clicked === "true") {
                row.style.display = "table-row";
            } else {
                row.style.display = "none";
            }
        }
    });
}

// Función para mostrar o no las estadísticas al final de la página
const showHiddenRowsButton = document.getElementById("showHiddenRowsButton");
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