import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const PHASES_DIR = resolve(process.cwd(), '.planning/phases');

function collectSummaryFiles(dirPath) {
  const entries = readdirSync(dirPath);
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dirPath, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      files.push(...collectSummaryFiles(fullPath));
      continue;
    }

    if (entry.endsWith('-SUMMARY.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

test('VER-10/11/12: every phase summary contains a Validation section', () => {
  const summaryFiles = collectSummaryFiles(PHASES_DIR);
  assert.ok(summaryFiles.length > 0, 'Expected at least one phase summary file');

  const missing = [];
  for (const file of summaryFiles) {
    const content = readFileSync(file, 'utf8');
    if (!/^## Validation$/m.test(content)) {
      missing.push(file.replace(`${process.cwd()}/`, ''));
    }
  }

  assert.deepEqual(
    missing,
    [],
    `Missing ## Validation in summary files:\n${missing.map((file) => `- ${file}`).join('\n')}`,
  );
});
