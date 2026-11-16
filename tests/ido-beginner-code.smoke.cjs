const fs = require('fs');
const vm = require('vm');

const sandbox = {
  window: {},
  document: { addEventListener() {} },
  localStorage: { getItem() { return null; }, setItem() {} },
  setTimeout,
  clearInterval
};

vm.runInNewContext(fs.readFileSync('lessons.js', 'utf8'), sandbox);
vm.runInNewContext(fs.readFileSync('app.js', 'utf8'), sandbox);

const helpers = sandbox.window.GameLabCode;
if (!helpers) throw new Error('The I Do code-teaching helpers are not available.');

const monday = sandbox.window.GameLabData.LESSONS.find(lesson => lesson.date === 'MON • NOV 16');
const rendered = helpers.codeDemoHTML(monday.codeBuild);

const exampleCount = (rendered.match(/class="beginner-example-card/g) || []).length;
if (exampleCount !== 3) {
  throw new Error(`Expected 3 beginner code examples, found ${exampleCount}.`);
}

const expectedLabels = [
  '1. HTML: BUILD IT',
  '2. CSS: STYLE IT',
  '3. JAVASCRIPT: MAKE IT RESPOND'
];
expectedLabels.forEach(label => {
  if (!rendered.includes(label)) throw new Error(`Missing beginner example label: ${label}`);
});

if (!rendered.includes('class="full-game-code"')) {
  throw new Error('The complete game code is not separated from the beginner examples.');
}

const formatted = helpers.formatCodeForDisplay(monday.codeBuild.starter);
const lineCount = formatted.split('\n').length;
if (lineCount < 20) {
  throw new Error(`Complete game code is still cramped (${lineCount} lines).`);
}

if (!formatted.includes('body {\n') || !formatted.includes('  font-family: Arial;')) {
  throw new Error('CSS is not displayed with readable indentation.');
}

const styles = fs.readFileSync('styles.css', 'utf8');
if (!styles.includes('font:600 1rem/1.55 ui-monospace')) {
  throw new Error('Beginner code examples are too small for projection.');
}
if (!styles.includes('font:600 .95rem/1.65 ui-monospace')) {
  throw new Error('Complete game code is too small for projection.');
}

console.log('PASS: I Do slides teach three beginner examples before readable complete game code.');
