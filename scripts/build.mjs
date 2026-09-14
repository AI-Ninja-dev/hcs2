import { rm, mkdir, cp, readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

execFileSync(process.execPath, ['scripts/validate.mjs'], { stdio: 'inherit' });
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await cp('src', 'dist', { recursive: true });

const htmlPath = 'dist/index.html';
let html = await readFile(htmlPath, 'utf8');
html = html.replace('styles.css', 'styles.css?v=1').replace('app.js', 'app.js?v=1');
await writeFile(htmlPath, html);
console.log('\nProduction build complete: dist/');
