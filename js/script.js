// script.js
window.onload = function () {
    // Path al archivo Excel que deseas previsualizar
    const excelFilePath = '../assets/Mangas.xlsx';

    // Llamada a la función para previsualizar el archivo Excel
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

        // Mostrar la primera hoja del archivo Excel en la página
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const html = XLSX.utils.sheet_to_html(sheet);

        // Agregar la tabla al div de previsualización
        document.getElementById("preview").innerHTML = html;

        // Agregar el evento de escucha al input de búsqueda
        document.getElementById("searchInput").addEventListener("input", function () {
            filterTable(this.value.toLowerCase());
        });
    };

    req.onerror = function (e) {
        console.error("Error al cargar el archivo:", e);
    };

    req.send();
}

function filterTable(searchText) {
    // Obtener todas las filas de la tabla
    const rows = document.querySelectorAll("#preview table tr");

    // Recorrer todas las filas y ocultar aquellas que no coincidan con el texto de búsqueda
    rows.forEach(function (row) {
        const cells = row.querySelectorAll("td");
        let rowMatch = false;
        cells.forEach(function (cell) {
            if (cell.textContent.toLowerCase().includes(searchText)) {
                rowMatch = true;
            }
        });
        if (rowMatch) {
            row.style.display = ""; // Mostrar la fila
        } else {
            row.style.display = "none"; // Ocultar la fila
        }
    });
}