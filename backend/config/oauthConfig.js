function generateRandomState() {
  const array = new Uint32Array(2);
  window.crypto.getRandomValues(array);
  return Array.from(array, num => num.toString(16)).join('');
}

// Parse URL hash parameters (OAuth returns token in URL hash)
function parseHashParams() {
  const hash = window.location.hash.substring(1);
  const params = {};

  hash.split('&').forEach(param => {
    const [key, value] = param.split('=');
    if (key && value) {
      params[decodeURIComponent(key)] = decodeURIComponent(value);
    }
  });

  return params;
}

// Get access token
function getAccessToken() {
  const tokenData = localStorage.getItem('google_books_token');
  return tokenData ? JSON.parse(tokenData) : null;
}

function storeAccessToken(token) {
  localStorage.setItem('google_books_token', JSON.stringify(token));
}

function signIn() {
  const state = generateRandomState();
  localStorage.setItem('oauth_state', state);

  // Build that long OAuth URL
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.append('client_id', CLIENT_ID);
  authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.append('response_type', 'token');
  authUrl.searchParams.append('scope', SCOPES);
  authUrl.searchParams.append('state', state);

  // Redirect to Google OAuth
  window.location.href = authUrl.toString();
}

function handleOAuthCallback() {
  const params = parseHashParams();

  if (!params.access_token) {
    return;
  }

  // Verify state to prevent CSRF attacks
  const storedState = localStorage.getItem('oauth_state');
  if (params.state !== storedState) {
    console.error('State mismatch - possible CSRF attack');
    displayResult({ error: 'Security error: State mismatch' });
    return;
  }

  // Storing access token
  storeAccessToken({
    access_token: params.access_token,
    expires_in: params.expires_in,
    token_type: params.token_type,
    timestamp: Date.now()
  });

  // Removing unneeded item
  localStorage.removeItem('oauth_state');

  // Remove hash from URL
  window.location.hash = '';

  displayResult({
    message: 'Successfully signed in!',
    token_expires_in: params.expires_in + ' seconds'
  });
}

// Sign out & clear stored token
function signOut() {
  localStorage.removeItem('google_books_token');
  localStorage.removeItem('oauth_state');
  displayResult({ message: 'Signed out successfully' });
}


// Make authenticated API call to Google Books
async function callBooksAPI(endpoint) {
  const tokenData = getAccessToken();

  if (!tokenData || !tokenData.access_token) {
    displayResult({ error: 'Not signed in. Please sign in first.' });
    return null;
  }

  try {
    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401) {
      displayResult({ error: 'Token expired. Please sign in again.' });
      signOut();
      return null;
    }

    const data = await response.json();
    return data;

  } catch (error) {
    displayResult({ error: error.message });
    return null;
  }
}

// Initialisation: check that OAuth callback happens
window.addEventListener('load', handleOAuthCallback);

module.exports = callBooksAPI;
