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
};

function clearSearchInput() {
    const searchInput = document.getElementById("searchInput");
    searchInput.value = ""; // Limpiar el texto del input de búsqueda
    filterTable(""); // Llamar a la función filterTable con una cadena vacía para restaurar la tabla
}

const filterButton = document.getElementById("filterButton");
const filtersContainer = document.getElementById("filtersContainer");

filterButton.addEventListener("click", function() {
    if (filtersContainer.style.display === "none") {
        filtersContainer.style.display = "block";
    } else {
        filtersContainer.style.display = "none";
    }
});

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
    };

    req.onerror = function (e) {
        console.error("Error al cargar el archivo:", e);
    };

    req.send();
}

function filterTable(searchText) {
    // Obtener todas las filas de la tabla
    const rows = document.querySelectorAll("#preview table tr");
    let anyRowMatch = false; // Variable para controlar si alguna fila coincide con el filtro

    // Recorrer todas las filas y ocultar aquellas que no coincidan con el texto de búsqueda
    for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        if (index === 0) {
            row.style.display = ""; // Mostrar la fila de encabezado
        } else if (index < 94) {
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

    // Mostrar o ocultar el mensaje de "No se encontraron resultados" según la variable anyRowMatch
    const noResultsMessage = document.getElementById("noResultsMessage");
    if (!anyRowMatch) {
        noResultsMessage.style.display = ""; // Mostrar el mensaje si no hay filas que coincidan con el filtro
    } else {
        noResultsMessage.style.display = "none"; // Ocultar el mensaje si hay filas que coinciden con el filtro
    }
}

function downloadExcel() {
    // Función para descargar el archivo Excel
    const excelFilePath = './assets/Mangas.xlsx';
    window.location.href = excelFilePath;
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

const autocompleteList = document.getElementById("autocompleteList");
const searchInput = document.getElementById("searchInput");

// Datos de ejemplo para el autocompletar
const suggestions = [
    "Hanako-Kun",
    "Bakemonogatari",
    "Blue Period",
    "Re:Zero",
    "Given",
    "Shangri-la Frontier",
    "Wotakoi",
    "Miraculous",
    "Hikaru Ga Shinda Natsu",
    "Oshi no Ko",
    "Rooster Fighter",
    "Dead Dead Demon's Dededede Destruction",
    "Museum",
    "Spy x Family",
    "Blue Lock",
    "Chainsaw Man",
    "Sakamoto Days",
    "Aku no Hana",
    "Dandadan",
    "Gachiakuta",
    "Solo Leveling",
    "Made in Abyss",
    "La Tierra de las Gemas",
    "Las Montañas de la Locura",
    "Hooky",
    "Kaguya-Sama: Love is War",
    "All you Need is Kill",
    "Elden Ring",
    "The Promised Neverland",
    "Your Lie in April",
    "Fire Punch",
    "El Pecado Original de Takopi",
    "The Goldeen Sheep",
    "Oyasumi Punpun",
    "Darling in the Franxx",
    "Danganronpa",
    "Madoka Magica",
    "Madoka Magica: Rebelion",
    "Madoka Magica: The Different Story",
    "Madoka Magica: Homura´s Revenge",
    "Boys Run The Riot",
    "Mientras Yubooh Duerme",
    "Quiero ser Asesinado por mi Alumna",
    "Sanctify",
    "La Mansion Decagonal",
    "Hiraeth",
    "Ahora soy Zombie",
    "Sacerdotisa de la Oscuridad",
    "Heavenly Delusion",
    "Sasaki y Miyano",
    "Golden Kamuy",
    "Tokyo Revengers",
    "Kimetsu no Yaiba",
    "To Your Eternity",
    "Kanojo Okarishimasu",
    "Kaiju 8",
    "Loser Ranger",
    "Call of the Night",
    "Deadman Wonderland",
    "Kobayashi-San",
    "Me Dijiste Para Siempre",
    "Amor, Devorare tu Corazón",
    "La Ciudad de la Luz",
    "Un Extraño en la Playa",
    "You Are in The Blue Summer",
    "The Blue Summer and You",
    "Mi Vecino Metalero",
    "Los Dioses Mienten",
    "Hitorijime Boyfriend",
    "Twilight Outfocus",
    "Twilight Outfocus Overlap",
    "Goodbye Eri",
    "El Fin del Mundo y Antes del Amanecer",
    "Ella y su Gato",
    "Voices of a Distant Star",
    "Uzumaki",
    "La Chica a la Orilla del Mar",
    "Look Back",
    "Tatsuki Fujimoto´s Short Stories: 17-21",
    "Tatsuki Fujimoto´s Short Stories: 22-26",
    "Para Vos, Nacido en la Tierra",
    "Miroirs",
    "Neko Wappa!",
    "Historias de Amor",
    "Inio Asano: Short Stories",
    "Heroes",
    "Shino no es Capaz de decir su Propio Nombre",
    "El Chico y el Perro",
    "The Dovecote Express",
    "Nude Model",
    "Home Far Away",
    "Boy Meets Maria",
    "Hot Paprika"
];

searchInput.addEventListener("input", function() {
    filterTable(this.value.toLowerCase());
});

searchInput.addEventListener("input", function () {
    const searchText = this.value.toLowerCase();
    autocompleteList.innerHTML = "";

    // Verificar si hay texto en el campo de búsqueda
    if (searchText.trim() === "") {
        return; // No mostrar sugerencias si no hay texto
    }

    const matchingSuggestions = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(searchText)
    );

    matchingSuggestions.forEach(suggestion => {
        const listItem = document.createElement("li");
        listItem.textContent = suggestion;
        autocompleteList.appendChild(listItem);
    });
});

// Evento para autocompletar al hacer clic en una sugerencia
autocompleteList.addEventListener("click", function(event) {
    const clickedSuggestion = event.target.textContent;
    searchInput.value = clickedSuggestion;
    autocompleteList.innerHTML = ""; // Limpiar la lista de sugerencias
    filterTable(clickedSuggestion.toLowerCase()); // Filtrar la tabla con la sugerencia seleccionada
});

// Evento para autocompletar al presionar Enter
searchInput.addEventListener("keydown", function(event) {
    const searchText = this.value.toLowerCase();

    if (event.key === "Enter") {
        const firstSuggestion = suggestions.find(suggestion =>
            suggestion.toLowerCase().includes(searchText)
        );

        if (firstSuggestion) {
            searchInput.value = firstSuggestion;
            filterTable(firstSuggestion.toLowerCase()); // Filtrar la tabla con la sugerencia seleccionada
        }
    }
});

// Evento para manejar el cambio en el filtro seleccionado
const filterSelect = document.getElementById("filterSelect");

filterSelect.addEventListener("change", function() {
    const selectedFilter = this.value.toLowerCase();
    const searchText = searchInput.value.toLowerCase();
    
    // Filtrar la tabla según el filtro seleccionado y el texto de búsqueda actual
    filterTableByFilter(selectedFilter, searchText);
});

// Función para filtrar la tabla según el filtro seleccionado
function filterTableByFilter(filter, searchText) {
    // Obtener todas las filas de la tabla
    const rows = document.querySelectorAll("#preview table tr");
    let anyRowMatch = false; // Variable para controlar si alguna fila coincide con el filtro

    // Recorrer todas las filas y verificar si alguna coincide con el filtro
    for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        if (index === 0) {
            row.style.display = ""; // Mostrar la fila de encabezado
        } else if (index < 94) {
            const cells = row.querySelectorAll("td");
            let rowMatch = false;
            cells.forEach(function (cell, cellIndex) {
                // Verificar si el filtro seleccionado coincide con la columna actual
                const columnIndex = getFilterIndex(filter);
                if (cellIndex === columnIndex && cell.textContent.toLowerCase().includes(searchText)) {
                    rowMatch = true;
                    anyRowMatch = true; // Al menos una fila coincide con el filtro
                }
            });
            if (rowMatch) {
                row.style.display = ""; // Mostrar la fila si coincide con el filtro y el texto de búsqueda
            } else {
                row.style.display = "none"; // Ocultar la fila si no coincide con el filtro o el texto de búsqueda
            }
        } else {
            row.style.display = "none"; // Ocultar las filas desde la fila 95 hacia abajo
        }
    }

    // Mostrar el mensaje de "No se encontraron resultados" si no hay filas que coincidan con el filtro
    const noResultsMessage = document.getElementById("noResultsMessage");
    if (!anyRowMatch) {
        noResultsMessage.style.display = "block"; // Mostrar el mensaje si no hay filas que coincidan con el filtro
    } else {
        noResultsMessage.style.display = "none"; // Ocultar el mensaje si hay filas que coinciden con el filtro
    }
}

// Función para obtener el índice de la columna según el filtro seleccionado
function getFilterIndex(filter) {
    switch(filter) {
        case "estado":
            return 4; // Índice de la columna de Estado
        case "editorial":
            return 5; // Índice de la columna de Editorial
        case "tamaño":
            return 6; // Índice de la columna de Tamaño
        case "tomos Totales":
            return 10; // Índice de la columna de Tomos Totales
        default:
            return -1; // Valor por defecto para manejar filtros no válidos
    }
}

// Objeto que representa las secciones y opciones del filtro
const filterOptions = {
    "estado": ["En curso", "Completado", "Droppeado", "Tomo único"],
    "editorial": ["Ivrea", "Panini", "Kemuri", "Distrito Manga", "Ovni Press", "Planeta Cómic", "Utopia", "Merci", "Milky Way", "Moztros"],
    "tamaño": ["A5 color", "A5", "C6x2", "B6x2", "C6", "B6"],
    "tomos Totales": ["En publicación", "Finalizado"]
};

// Llenar el select del filtro con las secciones y opciones
Object.keys(filterOptions).forEach(function(section) {
    const sectionOption = document.createElement("optgroup");
    sectionOption.label = section.charAt(0).toUpperCase() + section.slice(1); // Convertir la primera letra a mayúscula
    filterOptions[section].forEach(function(option) {
        const optionElement = document.createElement("option");
        optionElement.value = option.toLowerCase().replace(/\s+/g, ''); // Convertir a minúsculas y eliminar espacios
        optionElement.textContent = option;
        sectionOption.appendChild(optionElement);
    });
    filterSelect.appendChild(sectionOption);
});