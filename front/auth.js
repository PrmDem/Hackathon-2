// --- CONFIGURATION ---
const CLIENT_ID = '843307393091-mddgktopqlt4gj03lerocpofmeq0li6m.apps.googleusercontent.com'; // <--- VERIFIE QUE C'EST LE BON
const REDIRECT_URI = 'http://localhost:3000';
const SCOPES = 'https://www.googleapis.com/auth/books';

// --- FONCTIONS UTILITAIRES ---
function generateRandomState() {
  const array = new Uint32Array(2);
  window.crypto.getRandomValues(array);
  return Array.from(array, num => num.toString(16)).join('');
}

function parseHashParams() {
  const hash = window.location.hash.substring(1);
  const params = {};
  hash.split('&').forEach(param => {
    const [key, value] = param.split('=');
    if (key && value) params[decodeURIComponent(key)] = decodeURIComponent(value);
  });
  return params;
}

// --- GESTION DU TOKEN ---
function getAccessToken() {
  const tokenData = localStorage.getItem('google_books_token');
  return tokenData ? JSON.parse(tokenData) : null;
}

function storeAccessToken(token) {
  localStorage.setItem('google_books_token', JSON.stringify(token));
  updateAuthUI(); // On met à jour l'interface dès qu'on stocke le token
}

// --- GESTION DE L'INTERFACE (UI) ---
// C'est la nouvelle fonction magique !
function updateAuthUI() {
  const token = getAccessToken();
  const btn = document.getElementById('auth-btn');
  const btnText = document.getElementById('auth-text');

  if (!btn || !btnText) return;

  if (token) {
    // --- CAS : CONNECTÉ ---
    btnText.textContent = "Se déconnecter";
    btn.onclick = signOut; // Le clic déclenchera la déconnexion

    // Petit changement de style (Optionnel : Texte rouge pour la déconnexion)
    btn.classList.remove('text-indigo-600');
    btn.classList.add('text-red-600');
  } else {
    // --- CAS : DÉCONNECTÉ ---
    btnText.textContent = "Se connecter avec Google";
    btn.onclick = signIn; // Le clic déclenchera la connexion

    // Retour au style bleu
    btn.classList.add('text-indigo-600');
    btn.classList.remove('text-red-600');
  }
}

// --- ACTIONS PRINCIPALES ---
function signIn() {
  const state = generateRandomState();
  localStorage.setItem('oauth_state', state);

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.append('client_id', CLIENT_ID);
  authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.append('response_type', 'token');
  authUrl.searchParams.append('scope', SCOPES);
  authUrl.searchParams.append('state', state);

  window.location.href = authUrl.toString();
}

function signOut() {
  // On vide le stockage
  localStorage.removeItem('google_books_token');
  localStorage.removeItem('oauth_state');

  alert('Vous avez été déconnecté.');

  // On met à jour l'interface immédiatement
  updateAuthUI();

  // On recharge la page (optionnel, mais plus propre pour vider les livres affichés)
  window.location.href = '/';
}

function handleOAuthCallback() {
  const params = parseHashParams();
  if (!params.access_token) return;

  const storedState = localStorage.getItem('oauth_state');
  if (params.state !== storedState) {
    console.error('Erreur de sécurité');
    return;
  }

  storeAccessToken({
    access_token: params.access_token,
    expires_in: params.expires_in,
    token_type: params.token_type,
    timestamp: Date.now()
  });

  localStorage.removeItem('oauth_state');
  window.location.hash = '';
  alert("Connexion réussie !");

  // L'UI se mettra à jour grâce à storeAccessToken qui appelle updateAuthUI
}

// Initialisation au chargement de la page
window.addEventListener('load', () => {
  handleOAuthCallback(); // Vérifie si on revient de Google
  updateAuthUI();        // Met à jour le bouton selon l'état actuel
});