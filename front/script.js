// --- CONFIGURATION ---
const API_KEY = ''; // Optionnel pour l'instant
const API_URL = 'https://www.googleapis.com/books/v1/volumes';

// --- 1. RECHERCHE DE LIVRES (Publique) ---
async function searchBooks() {
  const query = document.getElementById('search-input').value;
  if (!query) return alert("Veuillez écrire un titre !");

  const grid = document.getElementById('library-grid');
  grid.innerHTML = '<p class="text-center col-span-full">Recherche en cours...</p>';

  try {
    let url = `${API_URL}?q=${query}&maxResults=8`;
    if (API_KEY) url += `&key=${API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    // On affiche les livres avec le mode 'search' (pour avoir le bouton ajouter)
    if (data.items) {
      displayBooks(data.items, 'library-grid', true);
    } else {
      grid.innerHTML = '<p class="text-center col-span-full">Aucun résultat trouvé.</p>';
    }
  } catch (error) {
    console.error(error);
    grid.innerHTML = '<p class="text-red-500 text-center col-span-full">Erreur lors de la recherche.</p>';
  }
}

// --- 2. NOUVEAU : AJOUTER UN LIVRE AUX FAVORIS ---
async function addToLibrary(bookId) {
  const tokenData = getAccessToken();
  if (!tokenData) return alert("Veuillez vous connecter pour ajouter des livres !");

  try {
    // ID 0 = Favoris. On utilise POST pour ajouter.
    const url = `https://www.googleapis.com/books/v1/mylibrary/bookshelves/0/addVolume?volumeId=${bookId}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    if (response.ok) {
      alert("Livre ajouté à votre désespoir ! 🎉");
      // Optionnel : On peut vider la recherche ou proposer d'aller voir la bibliothèque
    } else {
      console.error(await response.json());
      alert("Erreur lors de l'ajout.");
    }
  } catch (error) {
    console.error(error);
    alert("Erreur technique.");
  }
}

// --- 3. MES LIVRES (Privé) ---
async function getMyBooks() {
  if (typeof getAccessToken !== 'function') return;
  const tokenData = getAccessToken();
  const grid = document.getElementById('library-grid');

  if (!tokenData) {
    grid.innerHTML = '<p class="text-center col-span-full text-gray-500">Connectez-vous pour revivre vos angoisses littéraires.</p>';
    return;
  }

  grid.innerHTML = '<p class="text-center col-span-full animate-pulse">Chargement de vos erreurs...</p>';

  try {
    // On ajoute un timestamp pour éviter le cache
    const response = await fetch(`https://www.googleapis.com/books/v1/mylibrary/bookshelves/0/volumes?t=${Date.now()}`, {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
    });

    if (response.status === 401) { signOut(); return; }

    const data = await response.json();

    if (data.items && data.items.length > 0) {
      // Mode 'library' (pas de bouton ajouter, peut-être un bouton supprimer plus tard)
      displayBooks(data.items, 'library-grid', false);
    } else {
      grid.innerHTML = '<p class="text-center col-span-full">Votre liste "Mes cauchemars" est vide.<br>Utilisez la recherche pour en ajouter !</p>';
    }
  } catch (error) {
    console.error(error);
    grid.innerHTML = '<p class="text-red-500 text-center col-span-full">Erreur de connexion Google.</p>';
  }
}

// --- 4. RECOMMANDATIONS ---
async function generateRecommendations() {
  const subjects = ['fantasy', 'history', 'romance'];
  const authors = ['J.K. Rowling', 'Brandon Sanderson', 'Aiden Thomas', 'Suzanne Collins', 'Rebecca Yarros'];
  const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
  const randomAuthor = authors[Math.floor(Math.random() * authors.length)];
  const grid = document.getElementById('reco-grid');

  grid.innerHTML = '<p class="text-center col-span-full">Recherche d\'idées...</p>';

  try {
    let urlA = `${API_URL}?q=subject:${randomSubject}&maxResults=4`;
    if (API_KEY) urlA += `&key=${API_KEY}`;
    const response = await fetch(urlA);
    const dataA = await response.json();

    console.log(dataA);

    let urlB = `${API_URL}?q=inauthor:${randomAuthor}&maxResults=2`;
    if (API_KEY) urlB += `&key=${API_KEY}`;
    const res = await fetch(urlB);
    const dataB = await res.json();

    const combinedData = [
      ...(dataA.items || []),
      ...(dataB.items || [])
    ];

    console.log(combinedData);
    // Mode 'déreco' -> on met true pour pouvoir les ajouter aussi
    displayBooks(combinedData, 'reco-grid', true);
  } catch (error) {
    console.error(error);
  }
}

// --- 5. AFFICHAGE (Template Mis à jour avec Bouton) ---
function displayBooks(books, containerId, showAddButton) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  if (!books) return;

  books.forEach(book => {
    const info = book.volumeInfo;
    const image = info.imageLinks?.thumbnail || 'https://via.placeholder.com/128x196?text=No+Cover';
    const title = info.title || 'Titre inconnu';
    const author = info.authors ? info.authors[0] : 'Auteur inconnu';

    // Le bouton n'apparait que si showAddButton est vrai (Recherche/Déreco)
    // et on passe l'ID du livre à la fonction addToLibrary
    let actionButton = '';
    if (showAddButton) {
      actionButton = `
                <button onclick="addToLibrary('${book.id}')" class="mt-2 w-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-bold py-1 px-2 rounded text-sm transition">
                    + Je me suis fait avoir
                </button>
            `;
    }

    const bookCard = `
            <div class="bg-white p-3 rounded-lg shadow hover:shadow-lg transition flex flex-col h-full border border-gray-100">
                <div class="h-48 bg-gray-100 rounded mb-3 overflow-hidden flex justify-center items-center">
                    <img src="${image}" class="h-full object-contain">
                </div>
                <div class="mt-auto">
                    <h3 class="font-bold text-sm text-gray-900 line-clamp-2 leading-tight" title="${title}">${title}</h3>
                    <p class="text-xs text-indigo-600 font-medium mt-1 mb-2">${author}</p>
                    ${actionButton}
                </div>
            </div>
        `;
    container.innerHTML += bookCard;
  });
}

// --- 6. NAVIGATION ---
function showPage(pageId) {
  const libraryPage = document.getElementById('page-library');
  const recoPage = document.getElementById('page-reco');
  const btnLib = document.getElementById('btn-lib');
  const btnReco = document.getElementById('btn-reco');
  const searchSection = document.querySelector('#page-library section:first-child');

  if (pageId === 'library') {
    libraryPage.classList.remove('hidden');
    recoPage.classList.add('hidden');

    btnLib.classList.add('bg-indigo-700', 'opacity-100');
    btnLib.classList.remove('opacity-75');
    btnReco.classList.remove('bg-indigo-700', 'opacity-100');
    btnReco.classList.add('opacity-75');

    // Si on est connecté, on charge mes livres (et on cache la recherche pour faire plus propre ?)
    // Pour l'instant on laisse la recherche visible pour pouvoir ajouter des livres
    if (typeof getAccessToken === 'function' && getAccessToken()) {
      // Petite astuce : si on vient de faire une recherche, on ne recharge pas "Mes livres" tout de suite
      // Sauf si on clique explicitement sur le bouton
      getMyBooks();
    }

  } else if (pageId === 'reco') {
    recoPage.classList.remove('hidden');
    libraryPage.classList.add('hidden');

    btnReco.classList.add('bg-indigo-700', 'opacity-100');
    btnReco.classList.remove('opacity-75');
    btnLib.classList.remove('bg-indigo-700', 'opacity-100');
    btnLib.classList.add('opacity-75');

    const grid = document.getElementById('reco-grid');
    if (grid.children.length <= 1) generateRecommendations();
  }
}