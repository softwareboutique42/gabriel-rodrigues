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

test('Bridge Versioning: types.ts exports versioned bridge event types', () => {
  const src = readWorkspaceFile('src/scripts/casinocraftz/tutorial/types.ts');

  assert.match(src, /export interface BridgeEvent/);
  assert.match(src, /export interface SpinSettledV1Payload/);
  assert.match(src, /export type CczSpinSettledEvent/);
  assert.match(src, /version: 1/);
  assert.match(src, /payload: SpinSettledV1Payload/);
});

test('Bridge Versioning: parseSpinSettledBridgeEvent is exported and handles v1 payload', () => {
  const src = readWorkspaceFile('src/scripts/casinocraftz/tutorial/main.ts');

  assert.match(src, /export function parseSpinSettledBridgeEvent/);
  // v1 version branch
  assert.match(src, /version.*===.*1/);
  // extracts spinIndex from payload object
  assert.match(src, /payload.*spinIndex|spinIndex.*payload/);
});

test('Bridge Versioning: parseSpinSettledBridgeEvent handles legacy unversioned payload', () => {
  const src = readWorkspaceFile('src/scripts/casinocraftz/tutorial/main.ts');

  // legacy branch: version is undefined
  assert.match(src, /version.*===.*undefined/);
});

test('Bridge Versioning: parseSpinSettledBridgeEvent rejects unknown versions and returns null', () => {
  const src = readWorkspaceFile('src/scripts/casinocraftz/tutorial/main.ts');

  // catches unknown versions and returns null (else branch returning null)
  assert.match(src, /return null/);
  // uses Number.isInteger for spinIndex validation
  assert.match(src, /Number\.isInteger/);
  // validates spinIndex >= 0
  assert.match(src, /spinIndex.*<.*0|<.*0.*spinIndex/);
});

test('Bridge Versioning: parseSpinSettledBridgeEvent rejects null/non-object/missing-type payloads', () => {
  const src = readWorkspaceFile('src/scripts/casinocraftz/tutorial/main.ts');

  // null guard
  assert.match(src, /data.*===.*null|=== null/);
  // type guard
  assert.match(src, /typeof data.*!==.*'object'|typeof.*data.*!==.*"object"/);
  // type field check
  assert.match(src, /ccz:spin-settled/);
});

test('Bridge Versioning: onSpinMessage uses safe parser and returns early on null', () => {
  const src = readWorkspaceFile('src/scripts/casinocraftz/tutorial/main.ts');

  assert.match(src, /parseSpinSettledBridgeEvent\(event\.data\)/);
  assert.match(src, /parsed.*===.*null|=== null/);
});

test('Authority Isolation: tutorial engine does not import Slots modules', () => {
  const engineSource = readWorkspaceFile('src/scripts/casinocraftz/tutorial/engine.ts');

  assert.doesNotMatch(engineSource, /import.*slots\//i);
  assert.doesNotMatch(engineSource, /import.*slots\/rng/i);
  assert.doesNotMatch(engineSource, /import.*slots\/payout/i);
  assert.doesNotMatch(engineSource, /import.*slots\/economy/i);
});

test('Authority Isolation: tutorial cards module does not import Slots modules', () => {
  const cardsSource = readWorkspaceFile('src/scripts/casinocraftz/tutorial/cards.ts');

  assert.doesNotMatch(cardsSource, /import.*slots\//i);
  assert.doesNotMatch(cardsSource, /import.*slots\/rng/i);
  assert.doesNotMatch(cardsSource, /import.*slots\/payout/i);
  assert.doesNotMatch(cardsSource, /import.*slots\/economy/i);
});

test('Authority Isolation: tutorial main does not import Slots RNG/payout/economy internals', () => {
  const src = readWorkspaceFile('src/scripts/casinocraftz/tutorial/main.ts');

  assert.doesNotMatch(src, /import.*slots\/rng/i);
  assert.doesNotMatch(src, /import.*slots\/payout/i);
  assert.doesNotMatch(src, /import.*slots\/economy/i);
});

test('Card Lock Transparency: locked cards have LOCKED badge in renderCards', () => {
  const src = readWorkspaceFile('src/scripts/casinocraftz/tutorial/main.ts');

  // Badge rendering logic for locked state
  assert.match(src, /cardsUnlocked\.includes|LOCKED/);
  assert.match(src, /dataset\.casinocraftzCardStatus/);
});

test('Card Lock Transparency: unlocked cards have UNLOCKED badge in renderCards', () => {
  const src = readWorkspaceFile('src/scripts/casinocraftz/tutorial/main.ts');

  // Badge rendering logic for unlocked state
  assert.match(src, /UNLOCKED/);
  assert.match(src, /text-neon/);
});

test('Causality Messaging: probability-reveal dialogue includes causality context', () => {
  const src = readWorkspaceFile('src/scripts/casinocraftz/tutorial/dialogue.ts');

  // probability-reveal narrator message includes "observed" and "spins" language
  assert.match(src, /observed.*spins?|spins?.*observed/i);
  // Also check PT version
  assert.match(src, /observou.*giros|giros.*observou/i);
});

test('Replay Button: renderDialogue includes replay button rendering', () => {
  const src = readWorkspaceFile('src/scripts/casinocraftz/tutorial/main.ts');

  // Replay button markup
  assert.match(src, /dataset\.casinocraftzReplay/);
  // Button text variations
  assert.match(src, /Revisit lesson|Revisite a licao/);
  // Event listener for replay button
  assert.match(src, /replayBtn.*addEventListener/);
  // Calls renderDialogue to replay
  assert.match(src, /renderDialogue\(zone, stepId, lang/);
});

test('Recap Disclosure: spin-triggered transitions show recap element', () => {
  const src = readWorkspaceFile('src/scripts/casinocraftz/tutorial/main.ts');

  // lastTransitionTrigger check
  assert.match(src, /lastTransitionTrigger.*===.*'spin'|lastTransitionTrigger.*==.*"spin"/);
  // Details/summary elements for progressive enhancement
  assert.match(src, /createElement\('details'\)|createElement\('summary'\)/);
  // Recap data attribute
  assert.match(src, /dataset\.casinocraftzRecap/);
});
