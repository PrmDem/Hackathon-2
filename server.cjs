const express = require('express');
const path = require('path');
const app = express();
const port = 3000;


app.use(express.static(path.join(__dirname, 'front')));


app.get('/', (req, res) => {
  const cheminFichier = path.join(__dirname, 'front/index.html');
  res.sendFile(cheminFichier);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Serveur lancé ! Ouvre http://localhost:${port}`);
});
