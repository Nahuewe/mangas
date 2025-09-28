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
    "Hanako-Kun: Despues de Clases",
    "Blue Period",
    "Re:Zero",
    "Shangri-la Frontier",
    "Wotakoi",
    "Miraculous",
    "Hikaru Ga Shinda Natsu",
    "Elden Ring",
    "Heart Program",
    "Trabajo y Vida Privado On/Off",
    "Ruri Dragon",
    "The Guy she was Interested in Wasn't a Guy at all",
    "Rooster Fighter",
    "Un Extraño en Primavera",
    "Adabana",
    "Girls Last Tour",
    "Spy x Family",
    "Blue Lock",
    "Blue Lock: Episode Nagi",
    "Chainsaw Man",
    "Sakamoto Days",
    "Dandadan",
    "Gachiakuta",
    "Versus",
    "Los Pecados de la Familia Ichinose",
    "Solo Leveling",
    "Made in Abyss",
    "La Tierra de las Gemas",
    "Las Montañas de la Locura",
    "Hooky",
    "Sweet Paprika + Hot Paprika",
    "Boyfriends",
    "Kaguya-Sama: Love is War",
    "All you Need is Kill",
    "Given",
    "Bakemonogatari",
    "The Promised Neverland",
    "Your Lie in April",
    "Fire Punch",
    "Aku no Hana",
    "Dead Dead Demon's Dededede Destruction",
    "Oshi no Ko",
    "El Pecado Original de Takopi",
    "The Goldeen Sheep",
    "Museum",
    "Oyasumi Punpun",
    "Darling in the Franxx",
    "Danganronpa",
    "Madoka Magica",
    "Madoka Magica: Rebelion",
    "Madoka Magica: The Different Story",
    "Madoka Magica: Homura's Revenge",
    "Madoka Magica: Wraith Arc",
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
    "The Blue Summer and You #2",
    "Mi Vecino Metalero",
    "Los Dioses Mienten",
    "Hitorijime Boyfriend",
    "Twilight Outfocus",
    "Twilight Outfocus Overlap",
    "My Capricorn Friend",
    "El Fin del Mundo y Antes del Amanecer",
    "Reigen Nivel 131 de Espiritismo",
    "Ella y su Gato",
    "Voices of a Distant Star",
    "5 Centímetros por Segundo",
    "Uzumaki",
    "Nijigahara Holograph",
    "La Chica a la Orilla del Mar",
    "Spy's Wife",
    "Goodbye Eri",
    "Look Back",
    "Tatsuki Fujimoto's Short Stories: 17-21",
    "Tatsuki Fujimoto's Short Stories: 22-26",
    "Spy x Family: Family Portrait",
    "Spy x Family: Eyes Only",
    "Chainsaw Man: Buddy Stories",
    "Para Vos, Nacido en la Tierra",
    "Burn The Witch",
    "Miroirs",
    "Neko Wappa!",
    "Historias de Amor",
    "Solanin",
    "What a Wonderful World",
    "Reiraku",
    "Inio Asano: Short Stories",
    "Heroes",
    "Shino no es Capaz de decir su Propio Nombre",
    "El Chico y el Perro",
    "El Color que Cayó del Cielo",
    "El Morador de las Tinieblas",
    "The Dovecote Express",
    "5 Seconds Before the Witch Falls in Love",
    "Nude Model",
    "Quiero Comerme tu Páncreas",
    "Home Far Away",
    "¿Mi Hobby es Raro?",
    "No me Calientes asi",
    "Abrazando tu Noche",
    "Boy Meets Maria",
    "K-ON!",
    "Me Acuesto con mi Amiga Casada",
    "Historias de Sexo de Chicas JK",
    "Bibliomania Deluxe",
    "Us",
    "Hot Paprika"
  ]
