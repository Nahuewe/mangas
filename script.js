// script.js
window.onload = function() {
    // Path al archivo Excel que deseas previsualizar
    const excelFilePath = './Mangas.xlsx';
    
    // Llamada a la función para previsualizar el archivo Excel
    previewExcel(excelFilePath);
};

function previewExcel(filePath) {
    // Leer el archivo Excel
    const req = new XMLHttpRequest();
    req.open("GET", filePath, true);
    req.responseType = "arraybuffer";

    req.onload = function(e) {
        const data = new Uint8Array(req.response);
        const workbook = XLSX.read(data, { type: "array" });

        // Mostrar la primera hoja del archivo Excel en la página
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const html = XLSX.utils.sheet_to_html(sheet);

        // Agregar la tabla al div de previsualización
        document.getElementById("preview").innerHTML = html;

        // Aplicar estilos CSS a la tabla
        applyStylesToTable();
    };

    req.onerror = function(e) {
        console.error("Error al cargar el archivo:", e);
    };

    req.send();
}

function applyStylesToTable() {
    // Obtener todas las celdas de la tabla
    const cells = document.querySelectorAll("#preview table td");

    // Aplicar estilos a las celdas según su contenido
    cells.forEach(function(cell) {
        const cellContent = cell.textContent.trim();
        switch (cellContent) {
            case "Alto":
                cell.classList.add("Alto");
                break;
            case "Medio":
                cell.classList.add("Medio");
                break;
            case "Bajo":
                cell.classList.add("Bajo");
                break;
            default:
                // No hacer nada para otros contenidos
                break;
        }
    });

    // Obtener todas las celdas de la fila número 95 de la tabla
    const cell95 = document.querySelectorAll("#preview table tr:nth-child(95) td");

    // Aplicar la clase "Rojo" a las celdas de la fila número 95
    cell95.forEach(function(cell) {
        cell.classList.add("Rojo");
    });
}
