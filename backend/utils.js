const fs = require('node:fs/promises');

try {
  const user = JSON.parse(await readFile('user.json', 'utf8'));
  return user;
} catch (err) {
  console.error(`Error reading JSON file: ${err}`);
}

module.exports = user;
