import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
// Check the complete current tree (including docs, scripts, SQL and filenames), not history.
const forbidden = new RegExp(['deu' + 'tsch[\\s_-]*k' + 'lub', 'дой' + 'ч[\\s_-]*клуб', 'немецкий' + ' клуб', 'deu' + 'tsch2026', '(?:^|["\'`/])d' + 'k[-_]'].join('|'), 'im');
const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { encoding:'utf8' }).split('\0').filter(Boolean);
for (const file of files) {
 assert.doesNotMatch(file, forbidden, `filename: ${file}`);
 const buffer = await readFile(file);
 // Textual metadata in binary files is scanned too; no asset rewriting.
 assert.doesNotMatch(buffer.toString('utf8'), forbidden, file);
}
console.log(`Jenga branding check passed: ${files.length} files`);
