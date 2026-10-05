import { readFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';

const required = [
  'src/index.html',
  'src/shop.html',
  'src/styles.css',
  'src/app.js',
  'src/shop.js',
];

for (const file of required) await access(file, constants.R_OK);

const html = await readFile('src/index.html', 'utf8');
const shop = await readFile('src/shop.html', 'utf8');
const css = await readFile('src/styles.css', 'utf8');
const js = await readFile('src/app.js', 'utf8');
const shopJs = await readFile('src/shop.js', 'utf8');

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
  ['Mobile menu behavior', /menu-toggle/.test(js)],
  ['Shop launch page', /shop-launch/.test(shop)],
  ['Shop CGM flagship', /Yuwell Anytime CT3/.test(shop)],
  ['Shop search and filters', /shop-search/.test(shop) && /data-shop-filter/.test(shop)],
  ['Shop request flow', /shop-request-form/.test(shop) && /wa\.me\/27678042273/.test(shopJs)],
  ['Shop delivery information', /DELIVERY/.test(shop)],
  ['Shop warranty information', /WARRANTY/.test(shop)],
  ['Shop returns information', /RETURNS/.test(shop)],
  ['No downloadable enquiry flow', !html.includes('download-enquiry') && !shop.includes('download-enquiry') && !js.includes('download-enquiry') && !shopJs.includes('download-enquiry')],
];

let failed = false;
for (const [label, ok] of checks) {
  console.log(`${ok ? '✓' : '✗'} ${label}`);
  if (!ok) failed = true;
}

if (failed) process.exit(1);
console.log('\nValidation passed.');
