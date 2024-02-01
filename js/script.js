window.onload = function () {
    // Path al archivo Excel
    const excelFilePath = './assets/Mangas.xlsx';
    previewExcel(excelFilePath);
};

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

        // Aplicar estilos adicionales a la tabla
        applyStylesToTable();
    };

    req.onerror = function (e) {
        console.error("Error al cargar el archivo:", e);
    };

    req.send();
}

function filterTable(searchText) {
    // Obtener todas las filas de la tabla
    const rows = document.querySelectorAll("#preview table tr");
    let noResults = true;

    // Recorrer todas las filas y ocultar aquellas que no coincidan con el texto de búsqueda
    for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        if (index === 0) {
            row.style.display = "";
        } else if (index < 94) {
            const cells = row.querySelectorAll("td");
            let rowMatch = false;
            cells.forEach(function (cell) {
                if (cell.textContent.toLowerCase().includes(searchText)) {
                    rowMatch = true;
                    noResults = false;
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

    // Mostrar o ocultar el mensaje de "No se encontraron resultados"
    const noResultsMessage = document.getElementById("noResultsMessage");
    if (noResults) {
        noResultsMessage.style.display = ""; // Mostrar el mensaje
    } else {
        noResultsMessage.style.display = "none"; // Ocultar el mensaje
    }
}

function applyStylesToTable() {
    // Obtener todas las celdas de la tabla
    const cells = document.querySelectorAll("#preview table td");

    // Iterar sobre cada celda y aplicar los estilos según su contenido
    cells.forEach(function (cell, index) {
        const rowCount = document.querySelector("#preview table tr").cells.length;
        const columnIndex = index % rowCount;
        const rowIndex = Math.floor(index / rowCount);

        if (columnIndex === 3 && rowIndex >= 1 && rowIndex <= 95 && rowIndex !== 94) {
            cell.style.backgroundColor = "#A5A5A5";
            cell.style.color = "#ffffff";
        } else if (columnIndex === 4 && rowIndex >= 1 && rowIndex <= 95 && rowIndex !== 94) {
            cell.style.backgroundColor = "#F2F2F2";
            cell.style.color = "#ff6f00";
        } else if (columnIndex === 6 && rowIndex >= 1 && rowIndex <= 95 && rowIndex !== 94) {
            cell.style.backgroundColor = "#F2F2F2";
            cell.style.color = "#ff6f00";
        } else if (columnIndex === 10 && cell.textContent.trim() !== "" && rowIndex >= 1 && rowIndex <= 94 && rowIndex !== 94) {
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

        // Aplicar estilos a la fila 94 (excluir columna 11)
        if (rowIndex === 94 && columnIndex <= 9) {
            cell.style.backgroundColor = "#7030A0";
            cell.style.color = "#ffffff";
        }
    });
}

