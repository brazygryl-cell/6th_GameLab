const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('lessons.js', 'utf8');
const appSource = fs.readFileSync('app.js', 'utf8');
const stylesSource = fs.readFileSync('styles.css', 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(source, sandbox);

const week = sandbox.window.GameLabData.LESSONS.filter(lesson =>
  /NOV (16|17|18|19|20)$/.test(lesson.date)
);

if (week.length !== 5) throw new Error(`Expected 5 Code Caverns lessons, found ${week.length}.`);
if (/Scratch/i.test(JSON.stringify(week))) throw new Error('Code Caverns still tells students to use Scratch.');

const requiredCode = ['position:absolute', 'addEventListener', 'for (', 'if (', 'let score'];
week.forEach((lesson, index) => {
  if (!lesson.codeBuild) throw new Error(`${lesson.date} is missing its browser-code build.`);
  if (lesson.codeBuild.toolUrl !== 'https://html.onlineviewer.net/') throw new Error(`${lesson.date} is not using HTML Online Viewer.`);
  if (!lesson.codeBuild.starter.includes('<style>') || !lesson.codeBuild.starter.includes('<script>')) throw new Error(`${lesson.date} starter is not a complete HTML/CSS/JS file.`);
  if (!lesson.codeBuild.starter.includes(requiredCode[index])) throw new Error(`${lesson.date} starter is missing ${requiredCode[index]}.`);
});

if (!appSource.includes('codeDemoHTML')) throw new Error('I Do slides are missing the code dropdown renderer.');
if (!appSource.includes("OPEN TODAY’S COMPLETE CODE")) throw new Error('I Do slides are missing the code dropdown label.');
if (!stylesSource.includes('.teacher-code-demo')) throw new Error('I Do code dropdown is missing its styles.');

console.log('PASS: Nov 16–20 teaches game building through HTML, CSS, and JavaScript with no Scratch dependency.');
