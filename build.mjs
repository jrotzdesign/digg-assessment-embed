// Builds dist/digg-assessment.js from src/. No dependencies: `node build.mjs`.
// Fails if questions.js drifts from the production repo or if any CSS rule escapes #digg-assessment.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const read = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');
const version = read('./VERSION').trim();
const css = read('./src/app.css');
const html = read('./src/markup.html');
const questions = read('./src/questions.js');
const app = read('./src/app.js');
const fail = (m) => { console.error('BUILD FAILED: ' + m); process.exit(1); };

// 1. Content parity with production (skipped when the production repo is not next to this one)
const prod = process.env.PROD_REPO || new URL('../digg-assessment/', import.meta.url).pathname;
if (existsSync(prod + 'questions.js')) {
  if (readFileSync(prod + 'questions.js', 'utf8') !== questions) fail('src/questions.js differs from ' + prod + 'questions.js');
  console.log('questions.js identical to production');
} else console.log('production repo not found, parity check skipped');

// 2. Every selector scoped to the container, every keyframe prefixed
function rules(text, out = []) {
  text = text.replace(/\/\*[\s\S]*?\*\//g, '');
  let depth = 0, start = 0, head = '';
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '{') { if (depth === 0) { head = text.slice(start, i).trim(); start = i + 1; } depth++; }
    else if (c === '}') {
      depth--;
      if (depth === 0) {
        const body = text.slice(start, i);
        if (head.startsWith('@media')) rules(body, out);
        else out.push(head);
        start = i + 1;
      }
    }
  }
  return out;
}
for (const head of rules(css)) {
  if (head.startsWith('@keyframes')) { if (!/^@keyframes dga-/.test(head)) fail('unprefixed keyframes: ' + head); continue; }
  if (head.startsWith('@')) fail('unexpected at-rule: ' + head);
  for (const sel of head.split(',').map((s) => s.trim()))
    if (!/^#digg-assessment(?![\w-])/.test(sel)) fail('unscoped selector: ' + sel);
}
console.log('CSS: all selectors scoped');

// 3. Assemble
let out = app
  .replaceAll('__VERSION__', version)
  .replace('__CSS__', () => JSON.stringify(css))
  .replace('__HTML__', () => JSON.stringify(html))
  .replace('__QUESTIONS__', () => questions);
if (/__(CSS|HTML|QUESTIONS|VERSION)__/.test(out)) fail('placeholder left in output');
writeFileSync(new URL('./dist/digg-assessment.js', import.meta.url), out);
const sha = createHash('sha256').update(out).digest('base64');
console.log(`dist/digg-assessment.js v${version}  ${out.length} bytes  sha256-${sha}`);
