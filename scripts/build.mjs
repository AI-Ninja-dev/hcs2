import { rm, mkdir, cp, readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

execFileSync(process.execPath, ['scripts/validate.mjs'], { stdio: 'inherit' });
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await cp('src', 'dist', { recursive: true });

const assets = ['styles.css','app.js','analytics.js','business-config.js','shop.js','commerce.js','equipment.js'];
for (const page of ['index.html','shop.html','equipment.html']) {
  const path = 'dist/' + page;
  let html = await readFile(path, 'utf8');
  for (const asset of assets) {
    try {
      const content = await readFile('dist/' + asset);
      const version = createHash('sha256').update(content).digest('hex').slice(0, 12);
      html = html.replaceAll(asset, asset + '?v=' + version);
    } catch {}
  }
  await writeFile(path, html);
}
console.log('\nProduction build complete: dist/');
