const fs = require('fs');

const source = fs.readFileSync('prototype-friday.js', 'utf8');

for (const required of [
  'data-hard',
  'HARD MODE',
  'hardWalls',
  'movesLeft',
  'TIME LEFT',
  'Collect the key before reaching the exit'
]) {
  if (!source.includes(required)) {
    throw new Error(`Friday hard maze is missing: ${required}`);
  }
}

console.log('PASS: Friday prototype includes a hard maze mode with a key, move limit, and timer.');
