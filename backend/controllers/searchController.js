// 'query' vient de ce qui sera noté dans la barre de recherche
const { config } = require('../config/dotenvConfig');

async function searchBooks(query) {
  try {
    const callUrl = `https://www.googleapis.com/books/v1/volumes?q=${query}&key=${config.googleBooksApiKey}`;
    console.log(callUrl);
    const response = await fetch(callUrl, {
      method: 'GET'
    });

    if (!response.ok) {
      window.alert("Couldn't find that book");
    }

    const data = await response.json();
    console.log(data);

  } catch (error) {
    window.alert('Something went wrong: ' + error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const query = document.getElementById('search-input').value;
  const btn = document.getElementById('search-book');
  btn.addEventListener('click', () => {
    searchBooks(query);
  });
});

module.exports = searchBooks;
