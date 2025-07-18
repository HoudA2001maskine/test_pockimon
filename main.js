/*** VARIABLES GLOBALES ***/
let pokemons = [' '];            // Tableau de pokémons (avec un placeholder au début)
let currentList = [];            // Liste filtrée ou complète à afficher
let currentPage = 1;             // Page courante
const itemsPerPage = 30;         // Nombre d'éléments par page

/*** COULEURS TYPES POKEMON ***/
const typeColors = {
    'normal': '#BCBCAC',
    'fighting': '#BC5442',
    'flying': '#669AFF',
    'poison': '#AB549A',
    'ground': '#DEBC54',
    'rock': '#BCAC66',
    'bug': '#ABBC1C',
    'ghost': '#6666BC',
    'steel': '#ABACBC',
    'fire': '#FF421C',
    'water': '#2F9AFF',
    'grass': '#78CD54',
    'electric': '#FFCD30',
    'psychic': '#FF549A',
    'ice': '#78DEFF',
    'dragon': '#7866EF',
    'dark': '#785442',
    'fairy': '#FFACFF',
    'shadow': '#0E2E4C'
};


/*** FONCTIONS PRINCIPALES ***/

/** Ouvre les infos d’un Pokémon au clic */
function openInfo(id) {
    document.getElementById('current-pokemon-empty').classList.add('hide');

    if(window.innerWidth > 1100){
        slideOutPokemonInfo();

        setTimeout(function(){
            fetchPokemonInfo(id);
            updateCurrentPokemonImage(id);
        }, 350);
    } else {
        fetchPokemonInfo(id);
        updateCurrentPokemonImage(id);
    }
}

/** Récupère les infos d’un Pokémon via l’API */
async function fetchPokemonInfo(id) {
    const urlPokemon = 'https://pokeapi.co/api/v2/pokemon/' + id;
    const urlSpecies = 'https://pokeapi.co/api/v2/pokemon-species/' + id;

    const responsePokemon = await fetch(urlPokemon);
    const responseSpecies = await fetch(urlSpecies);

    const pokemon = await responsePokemon.json();
    const species = await responseSpecies.json();

    const reponseEvolutions = await fetch(species.evolution_chain.url);
    const evolution_chain = await reponseEvolutions.json();

    setupPokemonAbout(pokemon, id, species);
    setupPokemonStats(pokemon);
    setupPokemonAbilities(pokemon);
    setupEvolutionChain(evolution_chain);
    setupResponsiveBackground(pokemon);

    slideInPokemonInfo();

    if(window.innerWidth < 1100){
        openPokemonResponsiveInfo();
    }
}

/** Met à jour l’image du Pokémon affiché */
function updateCurrentPokemonImage(id) {
    const currentPokemonImage = document.getElementById('current-pokemon-image');
    const img = new Image();

    img.onload = function() {
        currentPokemonImage.src = this.src;
        currentPokemonImage.style.height = this.height * 3 + 'px';
    };

    if(id >= 650) {
        img.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/' + id + '.png';
    } else {
        img.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/' + id + '.gif';
    }
}

/** Configure infos basiques du Pokémon */
function setupPokemonAbout(pokemon, id, species) {
    document.getElementById('current-pokemon-info').classList.remove('hide');
    document.getElementById('current-pokemon-id').innerHTML = 'N° ' + pokemon.id;
    document.getElementById('current-pokemon-name').innerHTML = dressUpPayloadValue(pokemon.name);
    document.getElementById('current-pokemon-types').innerHTML = getTypeContainers(pokemons[id - 1].types);
    document.getElementById('current-pokemon-height').innerHTML = pokemon.height / 10 + 'm';
    document.getElementById('current-pokemon-weight').innerHTML = pokemon.weight / 10 + 'kg';

    for(let i = 0; i < species.flavor_text_entries.length; i++) {
        if(species.flavor_text_entries[i].language.name === 'en'){
            document.getElementById('current-pokemon-description').innerHTML = dressUpPayloadValue(species.flavor_text_entries[i].flavor_text.replace('', ' '));
            break;
        }
    }
}

/** Configure stats du Pokémon */
function setupPokemonStats(pokemon) {
    document.getElementById('current-pokemon-stats-atk').innerHTML = pokemon.stats[0].base_stat;
    document.getElementById('current-pokemon-stats-hp').innerHTML = pokemon.stats[1].base_stat;
    document.getElementById('current-pokemon-stats-def').innerHTML = pokemon.stats[2].base_stat;
    document.getElementById('current-pokemon-stats-spa').innerHTML = pokemon.stats[3].base_stat;
    document.getElementById('current-pokemon-stats-spd').innerHTML = pokemon.stats[4].base_stat;
    document.getElementById('current-pokemon-stats-speed').innerHTML = pokemon.stats[5].base_stat;
    document.getElementById('current-pokemon-stats-total').innerHTML = pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
}

/** Configure les capacités */
function setupPokemonAbilities(pokemon) {
    document.getElementById('current-pokemon-abilitiy-0').innerHTML = dressUpPayloadValue(pokemon.abilities[0].ability.name);
    if(pokemon.abilities[1]){
        document.getElementById('current-pokemon-abilitiy-1').classList.remove('hide');
        document.getElementById('current-pokemon-abilitiy-1').innerHTML = dressUpPayloadValue(pokemon.abilities[1].ability.name);
    } else {
        document.getElementById('current-pokemon-abilitiy-1').classList.add('hide');
    }
}

/** Configure la chaîne d'évolution */
function setupEvolutionChain(evolutionChain) {
    const chain = evolutionChain.chain;
    const chainContainer =  document.getElementById('current-pokemon-evolution-chain-container');
    const chainImages = [
        document.getElementById('current-pokemon-evolution-0'),
        document.getElementById('current-pokemon-evolution-1'),
        document.getElementById('current-pokemon-evolution-2')
    ];
    const chainLevels = [
        document.getElementById('current-pokemon-evolution-level-0'),
        document.getElementById('current-pokemon-evolution-level-1')
    ];

    if(chain.evolves_to.length !== 0) {
        chainContainer.classList.remove('hide');

        setupEvolution(chain, 0);

        if(chain.evolves_to[0].evolves_to.length !== 0) {
            setupEvolution(chain.evolves_to[0], 1);
            chainImages[2].classList.remove('hide');
            chainLevels[1].classList.remove('hide');
        } else {
            chainImages[2].classList.add('hide');
            chainLevels[1].classList.add('hide');
        }
    } else {
        chainContainer.classList.add('hide');
    }
}

/** Configure images et niveaux d'évolution */
function setupEvolution(chain, no) {
    const chainImages = [
        document.getElementById('current-pokemon-evolution-0'),
        document.getElementById('current-pokemon-evolution-1'),
        document.getElementById('current-pokemon-evolution-2')
    ];
    const chainLevels = [
        document.getElementById('current-pokemon-evolution-level-0'),
        document.getElementById('current-pokemon-evolution-level-1')
    ];
    
    chainImages[no].src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + filterIdFromSpeciesURL(chain.species.url) + '.png';
    chainImages[no].setAttribute('onClick', 'openInfo(' + filterIdFromSpeciesURL(chain.species.url) + ')');

    chainImages[no + 1].src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + filterIdFromSpeciesURL(chain.evolves_to[0].species.url) + '.png';
    chainImages[no + 1].setAttribute('onClick', 'openInfo(' + filterIdFromSpeciesURL(chain.evolves_to[0].species.url) + ')');

    if(chain.evolves_to[0].evolution_details[0].min_level) {
        chainLevels[no].innerHTML = 'Lv. ' + chain.evolves_to[0].evolution_details[0].min_level;
    } else {
        chainLevels[no].innerHTML = '?';
    }
}

/** Extrait l'id depuis une URL de type species */
function filterIdFromSpeciesURL(url){
    return url.replace('https://pokeapi.co/api/v2/pokemon-species/', '').replace('/', '');
}

/*** RESPONSIVE ***/

/** Définit le background responsive selon type */
function setupResponsiveBackground(pokemon) {
    document.getElementById('current-pokemon-responsive-background').style.background = typeColors[pokemon.types[0].type.name];
}

/** Ouvre le panneau responsive sur petits écrans */
function openPokemonResponsiveInfo(){
    document.getElementById('current-pokemon-container').classList.remove('hide');
    document.getElementById('current-pokemon-container').style.display = 'flex';
    document.getElementById('current-pokemon-responsive-close').classList.remove('hide');
    
    document.getElementById('current-pokemon-responsive-background').classList.remove('hide');

    document.getElementById('current-pokemon-responsive-background').style.opacity = 0;
    setTimeout(function(){
        document.getElementById('current-pokemon-responsive-background').style.opacity = 1;
    }, 20);

    document.getElementsByTagName('html')[0].style.overflow = 'hidden';
}

/** Ferme les infos responsive */
function closePokemonInfo(){
    setTimeout(function(){
        document.getElementById('current-pokemon-container').classList.add('hide');
        document.getElementById('current-pokemon-responsive-close').classList.add('hide');
        document.getElementById('current-pokemon-responsive-background').classList.add('hide');
    }, 350);

    document.getElementById('current-pokemon-responsive-background').style.opacity = 1;
    setTimeout(function(){
        document.getElementById('current-pokemon-responsive-background').style.opacity = 0;
    }, 10);
    
    document.getElementsByTagName('html')[0].style.overflow = 'unset';

    slideOutPokemonInfo();
}

/** Lors du resize window */
window.addEventListener('resize', function(){
    if(document.getElementById('current-pokemon-container').classList.contains('slide-out')){
        document.getElementById('current-pokemon-container').classList.replace('slide-out', 'slide-in');
    }

    if(window.innerWidth > 1100) {
        document.getElementsByTagName('html')[0].style.overflow = 'unset';
    }
});

/*** ANIMATIONS SLIDE ***/
function slideOutPokemonInfo(){
    document.getElementById('current-pokemon-container').classList.remove('slide-in');
    document.getElementById('current-pokemon-container').classList.add('slide-out');
}

function slideInPokemonInfo(){
    document.getElementById('current-pokemon-container').classList.add('slide-in');
    document.getElementById('current-pokemon-container').classList.remove('slide-out');
}

/*** AFFICHAGE LISTE POKEMON ***/

/** Génère le HTML d’un Pokémon dans la liste */
function renderPokemonListItem(index) {
    if (currentList[index]) {
        document.getElementById('pokedex-list-render-container').insertAdjacentHTML('beforeend', `
            <div onclick="openInfo(${currentList[index].id})" class="pokemon-render-result-container container center column">
                <img class="search-pokemon-image" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${currentList[index].id}.png" alt="sprite ${currentList[index].name}">
                <span class="bold font-size-12">N° ${currentList[index].id}</span>
                <h3>${dressUpPayloadValue(currentList[index].name)}</h3>
                ${getTypeContainers(currentList[index].types)}
            </div>
        `);
    }
}

/** Retourne le HTML des types d’un Pokémon */
function getTypeContainers(typesArray) {
    let htmlToReturn = '<div class="row">';

    for (let i = 0; i < typesArray.length; i++) {
        htmlToReturn += `<div class="type-container" style="background: ${typeColors[typesArray[i]]};">
                            ${dressUpPayloadValue(typesArray[i])}
                         </div>`;
    }

    return htmlToReturn + '</div>';
}

/*** RECHERCHE ***/

/** Filtre la liste selon l’input */
function search() {
    setTimeout(function () {
        let searchResults = [];

        for (let i = 0; i < pokemons.length; i++) {
            if (pokemons[i].name) {
                if (pokemons[i].name.replaceAll('-', ' ').includes(document.getElementById('search-input').value.toLowerCase())) {
                    searchResults.push(pokemons[i]);
                }
            }
        }

        document.getElementById('pokedex-list-render-container').innerHTML = '';

        currentList = searchResults;
        currentPage = 1;

        createPaginationButtons();
        renderCurrentPage();
    }, 1);
}

/*** PAGINATION AVEC BOUTONS ***/

/** Crée les boutons Previous / Next et l’info de page */
function createPaginationButtons() {
    const container = document.getElementById('pagination-container');
    container.innerHTML = `
        <button id="prev-btn" disabled>Previous</button>
        <span id="page-info" style="margin: 0 10px;"></span>
        <button id="next-btn">Next</button>
    `;

    document.getElementById('prev-btn').addEventListener('click', previousPage);
    document.getElementById('next-btn').addEventListener('click', nextPage);
}

/** Met à jour l’état des boutons et le texte de page */
function updatePaginationButtons() {
    const totalPages = Math.ceil(currentList.length / itemsPerPage);

    document.getElementById('prev-btn').disabled = currentPage === 1;
    document.getElementById('next-btn').disabled = currentPage === totalPages || totalPages === 0;

    document.getElementById('page-info').textContent = `Page ${currentPage} / ${totalPages || 1}`;
}

/** Affiche les Pokémon de la page courante */
function renderCurrentPage() {
    const container = document.getElementById('pokedex-list-render-container');
    container.innerHTML = ''; // Vide la liste avant affichage

    const start = (currentPage - 1) * itemsPerPage;
    const end = Math.min(start + itemsPerPage, currentList.length);

    for(let i = start; i < end; i++) {
        renderPokemonListItem(i);
    }

    updatePaginationButtons();
    backToTop();
}

/** Passe à la page suivante */
function nextPage() {
    const totalPages = Math.ceil(currentList.length / itemsPerPage);
    if(currentPage < totalPages) {
        currentPage++;
        renderCurrentPage();
    }
}

/** Passe à la page précédente */
function previousPage() {
    if(currentPage > 1) {
        currentPage--;
        renderCurrentPage();
    }
}

/*** BOUTON RETOUR EN HAUT ***/

/** Affiche ou masque le bouton "Back to Top" selon scroll */
window.addEventListener('scroll', function () {
    updateBackToTopVisibility();
});

/** Gère la visibilité du bouton */
function updateBackToTopVisibility() {
    if(window.scrollY > window.innerHeight) {
        document.getElementById('back-to-top-button').classList.remove('hide');
    } else {
        document.getElementById('back-to-top-button').classList.add('hide');
    }
}

/** Scroll vers le haut */
function backToTop() {
    window.scrollTo(0, 0);
}

/*** UTILS ***/

/** Met en forme une chaîne : première lettre en majuscule, remplace les "-" par espace */
function dressUpPayloadValue(string) {
    let splitStr = string.toLowerCase().split('-');
    for (let i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(' ');
}

/*** CHARGEMENT INITIAL ***/

/** Récupère tous les noms et ids de Pokémon */
async function getAllNames() {
    let url = 'https://pokeapi.co/api/v2/pokemon/?limit=898';
    let response = await fetch(url);
    let responseAsJson = await response.json();

    for (let i = 0; i < responseAsJson.results.length; i++) {
        pokemons.push({
            id: i + 1,
            name: responseAsJson.results[i].name,
            types: []
        });
    }

    await getAllTypes();
}

/** Récupère tous les types des Pokémon (via Promise.allSettled) */
async function getAllTypes() {
    const typePromises = [];
    for (let i = 0; i < 18; i++) {
        let url = 'https://pokeapi.co/api/v2/type/' + (i + 1);
        typePromises.push(fetch(url).then(res => res.json()));
    }

    const results = await Promise.allSettled(typePromises);

    results.forEach(result => {
        if (result.status === 'fulfilled') {
            const responseAsJson = result.value;
            const pokemonInType = responseAsJson.pokemon;

            for (let j = 0; j < pokemonInType.length; j++) {
                const pokemonId = pokemonInType[j].pokemon.url.replace('https://pokeapi.co/api/v2/pokemon/', '').replace('/', '');
                if (pokemonId <= pokemons.length && pokemons[pokemonId]) {
                    pokemons[pokemonId].types.push(responseAsJson.name);
                }
            }
        }
    });

    loadingCompletion();
}

/** Cache la div de chargement et affiche la liste */
function loadingCompletion() {
    const loadingDiv = document.getElementById('loading-div');
    loadingDiv.classList.add('hideLoading');

    setTimeout(function () {
        loadingDiv.classList.replace('hideLoading', 'hide');
        document.body.style.overflow = 'unset';
    }, 500);

    pokemons.splice(0, 1);
    currentList = pokemons;

    createPaginationButtons();
    currentPage = 1;
    renderCurrentPage();
}

/*** INITIALISATION AU DEMARRAGE ***/

window.onload = function () {
    getAllNames();

    // Attach event listener à la recherche
    document.getElementById('search-input').addEventListener('input', search);

    // Setup bouton retour en haut
    document.getElementById('back-to-top-button').addEventListener('click', backToTop);
};
