import { readFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';

const required = ['src/index.html', 'src/styles.css', 'src/app.js'];
for (const file of required) await access(file, constants.R_OK);

const html = await readFile('src/index.html', 'utf8');
const css = await readFile('src/styles.css', 'utf8');
const js = await readFile('src/app.js', 'utf8');

const checks = [
  ['HTML lang attribute', /<html[^>]+lang="en"/i.test(html)],
  ['Viewport metadata', /name="viewport"/i.test(html)],
  ['HomeClinicStore brand', html.includes('HomeClinicStore')],
  ['CGM primary story', /Continuous Glucose Monitoring|CGM/i.test(html)],
  ['CareGrid section', html.includes('CareGrid')],
  ['Biomedical services', /Calibration|Biomedical/i.test(html)],
  ['Main landmark', /<main/i.test(html)],
  ['Navigation label', /aria-label="Primary navigation"/i.test(html)],
  ['Reduced motion support', /prefers-reduced-motion/.test(css)],
  ['Responsive breakpoint', /@media/.test(css)],
  ['Mobile menu behavior', /menu-toggle/.test(js)]
];

let failed = false;
for (const [label, ok] of checks) {
  console.log(`${ok ? '✓' : '✗'} ${label}`);
  if (!ok) failed = true;
}
if (failed) process.exit(1);
console.log('\nValidation passed.');
