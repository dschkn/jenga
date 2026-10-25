import { readdir, readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const excluded = new Set(['node_modules', 'dist', '.next', '.vinext', '.wrangler', '.git']);
async function scan(path) {
 for (const entry of await readdir(path, {withFileTypes:true})) {
  if (excluded.has(entry.name)) continue;
  const name = `${path}/${entry.name}`;
  if (entry.isDirectory()) { await scan(name); continue; }
  if (!/\.(tsx?|jsx?|html|css|json|webmanifest|svg)$/.test(name)) continue;
  const content = await readFile(name, 'utf8');
  assert.doesNotMatch(content, /deutsch[- ]?klub|дойч[- ]?клуб|немецкий клуб|deutsch2026|dk-logo|dk-mark|logo-deutsch/i, name);
 }
}
await scan('apps');
console.log('Jenga branding check passed');
