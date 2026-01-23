async function displayShelf() {
  const data = await callBooksAPI('https://www.googleapis.com/books/v1/mylibrary/bookshelves');

  if (data && data.items) {
    displayResult({
      message: 'Mes livres',
      count: data.items.length,
      shelves: data.items.map(shelf => ({
        id: shelf.id,
        title: shelf.title,
        volumeCount: shelf.volumeCount
      }))
    });
  }
}

async function findBooks(query) {
  const tokenData = getAccessToken();
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`;

  const headers = tokenData
    ? { 'Authorization': `Bearer ${tokenData.access_token}` }
    : {};

  try {
    const response = await fetch(url, { headers });
    const data = await response.json();

    displayResult({
      message: `Search results for: ${query}`,
      totalItems: data.totalItems,
      books: data.items?.slice(0, 5).map(book => ({
        title: book.volumeInfo.title,
        authors: book.volumeInfo.authors
      }))
    });
  } catch (error) {
    displayResult({ error: error.message });
  }
}

module.exports = findBooks;
module.exports = displayShelf;
