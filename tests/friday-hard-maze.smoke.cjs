const fs = require('fs');

const source = fs.readFileSync('prototype-friday.js', 'utf8');
const lessonsSource = fs.readFileSync('lessons.js', 'utf8');
const appSource = fs.readFileSync('app.js', 'utf8');
const sandbox = { window: {} };
require('vm').runInNewContext(lessonsSource, sandbox);
const friday = sandbox.window.GameLabData.LESSONS.find(lesson => lesson.date === 'FRI • NOV 13');

if (!friday?.hardGame) throw new Error('Friday is missing a separate hard-maze game slide.');
if (friday.hardGame.title !== 'Prototype Pit Crew: Hard Maze') throw new Error('Hard maze title is incorrect.');
if (!appSource.includes('key:"hardgame"')) throw new Error('Lesson navigation is missing the separate Hard Maze page.');
if (source.includes('data-hard')) throw new Error('Hard Maze must not be a button inside the original game.');

for (const required of [
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
