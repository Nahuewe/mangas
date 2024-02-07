const autocompleteList = document.getElementById("autocompleteList");

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
autocompleteList.addEventListener("click", function (event) {
    const clickedSuggestion = event.target.textContent;
    searchInput.value = clickedSuggestion;
    autocompleteList.innerHTML = ""; // Limpiar la lista de sugerencias
    filterTable(clickedSuggestion.toLowerCase()); // Filtrar la tabla con la sugerencia seleccionada
});

// Evento para autocompletar al presionar Enter
searchInput.addEventListener("keydown", function (event) {
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

// Agregar sugerencias cuando tenga una nueva serie en la coleccion
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