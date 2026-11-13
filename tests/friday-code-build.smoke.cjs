const fs = require('fs');
const vm = require('vm');

const lessonsSource = fs.readFileSync('lessons.js', 'utf8');
const appSource = fs.readFileSync('app.js', 'utf8');
const stylesSource = fs.readFileSync('styles.css', 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(lessonsSource, sandbox);

const friday = sandbox.window.GameLabData.LESSONS.find(
  lesson => lesson.date === 'FRI • NOV 13'
);

if (!friday) throw new Error('Friday, November 13 lesson is missing.');
if (!friday.codeBuild) throw new Error('Friday lesson is missing the browser-game code build.');
if (friday.codeBuild.toolUrl !== 'https://html.onlineviewer.net/') {
  throw new Error('Friday code build must open HTML Online Viewer.');
}
for (const language of ['HTML', 'CSS', 'JavaScript']) {
  if (!friday.codeBuild.languages.some(item => item.name === language)) {
    throw new Error(`Friday code build is missing the ${language} explanation.`);
  }
}
for (const feature of ['score', 'winScore', 'addEventListener']) {
  if (!friday.codeBuild.starter.includes(feature)) {
    throw new Error(`Starter game is missing ${feature}.`);
  }
}
if (!appSource.includes('data-copy-code')) throw new Error('The webpage is missing the starter-code copy control.');
if (!appSource.includes('codeBuildHTML')) throw new Error('The webpage is missing the Friday code-build renderer.');
if (!stylesSource.includes('.code-build-card')) throw new Error('The Friday code-build section is missing its visual styling.');

console.log('PASS: Friday includes an HTML Online Viewer game-build section with starter code.');
