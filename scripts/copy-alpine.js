const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, '..', 'node_modules', 'alpinejs', 'dist', 'cdn.min.js');
const target = path.join(__dirname, '..', 'assets', 'alpine.js');

try {
  fs.copyFileSync(source, target);
  console.log(`Copied ${source} -> ${target}`);
} catch (err) {
  console.error('Failed to copy Alpine.js. Did you run npm install?');
  console.error(err.message);
  process.exit(1);
}
