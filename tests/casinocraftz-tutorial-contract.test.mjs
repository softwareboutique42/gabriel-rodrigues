import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

function readWorkspaceFile(relativePath) {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8');
}

function extractNamespaceKeys(source, namespacePrefix) {
  const keys = new Set();
  const parsed = JSON.parse(source);

  for (const key of Object.keys(parsed)) {
    if (key.startsWith(namespacePrefix)) {
      keys.add(key);
    }
  }

  return keys;
}

test('tutorial types contract exports expected symbols', () => {
  const src = readWorkspaceFile('src/scripts/casinocraftz/tutorial/types.ts');

  assert.match(src, /export type TutorialStepId/);
  assert.match(src, /export interface TutorialStep/);
  assert.match(src, /export interface TutorialState/);
  assert.match(src, /export type UtilityCardId/);
  assert.match(src, /export interface UtilityCard/);
  assert.match(src, /export interface DialogueMessage/);
  assert.match(src, /export interface EssenceState/);
});

test('tutorial and cards EN keys are present in PT locale', () => {
  const enSource = readWorkspaceFile('src/i18n/en.json');
  const ptSource = readWorkspaceFile('src/i18n/pt.json');

  const enTutorialKeys = extractNamespaceKeys(enSource, 'tutorial.');
  const enCardKeys = extractNamespaceKeys(enSource, 'cards.');
  const ptTutorialKeys = extractNamespaceKeys(ptSource, 'tutorial.');
  const ptCardKeys = extractNamespaceKeys(ptSource, 'cards.');

  assert.ok(enTutorialKeys.size > 0, 'Expected EN tutorial namespace to include keys.');
  assert.ok(enCardKeys.size > 0, 'Expected EN cards namespace to include keys.');

  for (const key of enTutorialKeys) {
    assert.ok(ptTutorialKeys.has(key), `Missing PT tutorial key: ${key}`);
  }

  for (const key of enCardKeys) {
    assert.ok(ptCardKeys.has(key), `Missing PT cards key: ${key}`);
  }
});

test('casinocraftz pages expose tutorial and cards zones plus tutorial step dataset', () => {
  const enPage = readWorkspaceFile('src/pages/en/casinocraftz/index.astro');
  const ptPage = readWorkspaceFile('src/pages/pt/casinocraftz/index.astro');

  assert.match(enPage, /data-casinocraftz-zone="tutorial"/);
  assert.match(enPage, /data-casinocraftz-zone="cards"/);
  assert.match(enPage, /data-casinocraftz-tutorial-step/);

  assert.match(ptPage, /data-casinocraftz-zone="tutorial"/);
  assert.match(ptPage, /data-casinocraftz-zone="cards"/);
  assert.match(ptPage, /data-casinocraftz-tutorial-step/);
});

test('tutorial module boundaries and slot bridge contracts are in place', () => {
  const cardsSource = readWorkspaceFile('src/scripts/casinocraftz/tutorial/cards.ts');
  const engineSource = readWorkspaceFile('src/scripts/casinocraftz/tutorial/engine.ts');
  const dialogueSource = readWorkspaceFile('src/scripts/casinocraftz/tutorial/dialogue.ts');
  const slotsMainSource = readWorkspaceFile('src/scripts/slots/main.ts');

  assert.doesNotMatch(cardsSource, /import\s+.*slots/i);
  assert.match(engineSource, /export function createInitialTutorialState/);
  assert.match(cardsSource, /STARTER_CARDS/);
  assert.match(cardsSource, /probability-seer/);
  assert.match(dialogueSource, /DIALOGUE_REGISTRY/);
  assert.match(dialogueSource, /export function getDialogue/);
  assert.match(slotsMainSource, /ccz:spin-settled/);
});
