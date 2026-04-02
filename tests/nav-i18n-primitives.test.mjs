import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const headerPath = resolve(process.cwd(), 'src/components/Header.astro');
const enJsonPath = resolve(process.cwd(), 'src/i18n/en.json');
const ptJsonPath = resolve(process.cwd(), 'src/i18n/pt.json');

const headerSource = readFileSync(headerPath, 'utf8');
const en = JSON.parse(readFileSync(enJsonPath, 'utf8'));
const pt = JSON.parse(readFileSync(ptJsonPath, 'utf8'));

test('nav labels contract: header uses Projects and removes Canvas top-level link', () => {
  assert.match(headerSource, /t\('nav\.projects'\)/);
  assert.doesNotMatch(headerSource, /t\('nav\.canvas'\)/);
  assert.ok(headerSource.includes('href={`/${lang}/projects/`}'));
});

test('active-state contract: Projects nav covers /projects /canvas /slots surfaces', () => {
  assert.match(headerSource, /currentPath\.includes\('\/projects'\)/);
  assert.match(headerSource, /currentPath\.includes\('\/canvas'\)/);
  assert.match(headerSource, /currentPath\.includes\('\/slots'\)/);
  assert.match(headerSource, /isProjectsSurface/);
});

test('i18n parity: nav labels and primitives exist in EN/PT with matching keys', () => {
  const primitiveKeys = [
    'nav.projects',
    'projects.title',
    'projects.subtitle',
    'projects.status.live',
    'projects.status.foundation',
    'slots.title',
    'slots.subtitle',
    'slots.status.inDevelopment',
    'slots.disclaimer',
  ];

  for (const key of primitiveKeys) {
    assert.equal(typeof en[key], 'string', `EN missing key: ${key}`);
    assert.equal(typeof pt[key], 'string', `PT missing key: ${key}`);
    assert.ok(en[key].trim().length > 0, `EN empty value: ${key}`);
    assert.ok(pt[key].trim().length > 0, `PT empty value: ${key}`);
  }
});
