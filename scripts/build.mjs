import { rm, mkdir, cp, readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

execFileSync(process.execPath, ['scripts/validate.mjs'], { stdio: 'inherit' });
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await cp('src', 'dist', { recursive: true });

const htmlPath = 'dist/index.html';
let html = await readFile(htmlPath, 'utf8');
for (const asset of ['styles.css', 'app.js']) {
  const content = await readFile(`dist/${asset}`);
  const version = createHash('sha256').update(content).digest('hex').slice(0, 12);
  html = html.replace(asset, `${asset}?v=${version}`);
}
await writeFile(htmlPath, html);
console.log('\nProduction build complete: dist/');
