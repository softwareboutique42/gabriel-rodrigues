import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const geometricPath = resolve(process.cwd(), 'src/scripts/canvas/animations/geometric.ts');
const source = readFileSync(geometricPath, 'utf8');

test('geometric animation declares a shared material pool', () => {
  assert.match(source, /materialPool/i);
});

test('geometric animation does not allocate one MeshBasicMaterial per shape', () => {
  const allocations = [...source.matchAll(/new THREE\.MeshBasicMaterial\(/g)].length;
  assert.ok(
    allocations <= 3,
    `expected up to 3 material allocations (one per palette bucket), found ${allocations}`,
  );
});
