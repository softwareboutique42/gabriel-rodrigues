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

function readLocale(relativePath) {
  return JSON.parse(readWorkspaceFile(relativePath));
}

test('tutorial types contract exports expected symbols', () => {
  const src = readWorkspaceFile('src/scripts/casinocraftz/tutorial/types.ts');

  assert.match(src, /export type LessonId/);
  assert.match(src, /export type LessonStatus/);
  assert.match(src, /export interface TutorialLesson/);
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

test('psychology curriculum locale copy stays anti-manipulative and zero-risk in EN/PT', () => {
  const en = readLocale('src/i18n/en.json');
  const pt = readLocale('src/i18n/pt.json');

  assert.match(en['casinocraftz.disclaimer.zeroRisk'], /no gambling|no real-money wagering/i);
  assert.match(pt['casinocraftz.disclaimer.zeroRisk'], /sem jogo de azar|sem apostas com dinheiro real/i);
  assert.match(en['tutorial.lesson.nearMiss.description'], /without changing the odds/i);
  assert.match(pt['tutorial.lesson.nearMiss.description'], /sem mudar as odds/i);
  assert.match(en['tutorial.lesson.sensoryConditioning.description'], /without changing outcomes/i);
  assert.match(pt['tutorial.lesson.sensoryConditioning.description'], /sem alterar os resultados/i);
  assert.match(en['tutorial.causality.nearMissReveal'], /not the odds/i);
  assert.match(pt['tutorial.causality.nearMissReveal'], /nao as odds/i);
  assert.match(en['tutorial.causality.sensoryReveal'], /not outcomes/i);
  assert.match(pt['tutorial.causality.sensoryReveal'], /nao os resultados/i);

  const forbiddenClaims = [
    /beat the odds/i,
    /improve your odds/i,
    /increase your chances/i,
    /control outcomes/i,
    /exploit the machine/i,
    /ganhar controle/i,
    /melhorar as odds/i,
    /aumentar suas chances/i,
    /explorar a maquina/i,
  ];

  for (const source of [en, pt]) {
    for (const [key, value] of Object.entries(source)) {
      if (!key.startsWith('tutorial.') && key !== 'casinocraftz.disclaimer.zeroRisk') {
        continue;
      }

      for (const pattern of forbiddenClaims) {
        assert.doesNotMatch(String(value), pattern, `forbidden claim in ${key}: ${pattern}`);
      }
    }
  }
});

test('casinocraftz pages expose tutorial and cards zones plus tutorial step dataset', () => {
  const enPage = readWorkspaceFile('src/pages/en/casinocraftz/index.astro');
  const ptPage = readWorkspaceFile('src/pages/pt/casinocraftz/index.astro');

  assert.match(enPage, /data-casinocraftz-zone="curriculum"/);
  assert.match(enPage, /data-casinocraftz-curriculum/);
  assert.match(enPage, /data-casinocraftz-current-lesson/);
  assert.match(enPage, /data-casinocraftz-zone="tutorial"/);
  assert.match(enPage, /data-casinocraftz-zone="cards"/);
  assert.match(enPage, /data-casinocraftz-tutorial-step/);

  assert.match(ptPage, /data-casinocraftz-zone="curriculum"/);
  assert.match(ptPage, /data-casinocraftz-curriculum/);
  assert.match(ptPage, /data-casinocraftz-current-lesson/);
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
  assert.match(engineSource, /CURRICULUM_LESSONS/);
  assert.match(engineSource, /completeCurrentLesson/);
});

test('lesson shell contracts expose deterministic bounded lesson state anchors', () => {
  const mainSource = readWorkspaceFile('src/scripts/casinocraftz/tutorial/main.ts');
  const engineSource = readWorkspaceFile('src/scripts/casinocraftz/tutorial/engine.ts');

  assert.match(mainSource, /renderCurriculum/);
  assert.match(mainSource, /casinocraftzCurrentLesson/);
  assert.match(mainSource, /casinocraftzUnlockedLessons/);
  assert.match(mainSource, /casinocraftzCompletedLessons/);
  assert.match(mainSource, /data-casinocraftzLessonState|casinocraftzLessonState/);
  assert.match(mainSource, /near-miss/);
  assert.match(mainSource, /sensoryConditioning/);
  assert.match(engineSource, /openLesson/);
  assert.match(engineSource, /unlockedLessons\.push\('near-miss'\)/);
});

test('near-miss lesson contracts include bounded steps and anti-control messaging', () => {
  const typesSource = readWorkspaceFile('src/scripts/casinocraftz/tutorial/types.ts');
  const engineSource = readWorkspaceFile('src/scripts/casinocraftz/tutorial/engine.ts');
  const dialogueSource = readWorkspaceFile('src/scripts/casinocraftz/tutorial/dialogue.ts');

  assert.match(typesSource, /'near-miss-intro'/);
  assert.match(typesSource, /'near-miss-observe'/);
  assert.match(typesSource, /'near-miss-reveal'/);
  assert.match(typesSource, /'near-miss-complete'/);
  assert.match(engineSource, /requiresSpins:\s*2/);
  assert.match(dialogueSource, /near miss/i);
  assert.match(dialogueSource, /does not signal improving odds|nao sinaliza odds melhores/i);
});

test('sensory-conditioning lesson contracts include bounded steps and anti-control messaging', () => {
  const typesSource = readWorkspaceFile('src/scripts/casinocraftz/tutorial/types.ts');
  const engineSource = readWorkspaceFile('src/scripts/casinocraftz/tutorial/engine.ts');
  const dialogueSource = readWorkspaceFile('src/scripts/casinocraftz/tutorial/dialogue.ts');
  const mainSource = readWorkspaceFile('src/scripts/casinocraftz/tutorial/main.ts');

  assert.match(typesSource, /'sensory-conditioning-intro'/);
  assert.match(typesSource, /'sensory-conditioning-observe'/);
  assert.match(typesSource, /'sensory-conditioning-reveal'/);
  assert.match(typesSource, /'sensory-conditioning-complete'/);
  assert.match(engineSource, /unlockedLessons\.push\('sensory-conditioning'\)/);
  assert.match(dialogueSource, /sensory conditioning|condicionamento sensorial/i);
  assert.match(dialogueSource, /do not alter RNG|nao alteram RNG/i);
  assert.match(mainSource, /casinocraftzCurriculumProgressTitle/);
  assert.match(mainSource, /renderCurriculumProgress/);
});

test('skip handler maps each lesson to its own bounded completion step', () => {
  const mainSource = readWorkspaceFile('src/scripts/casinocraftz/tutorial/main.ts');

  assert.match(mainSource, /state\.currentLesson === 'near-miss'/);
  assert.match(mainSource, /'near-miss-complete'/);
  assert.match(mainSource, /state\.currentLesson === 'sensory-conditioning'/);
  assert.match(mainSource, /'sensory-conditioning-complete'/);
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
  // Replay is localized via dataset-backed copy
  assert.match(src, /casinocraftzReplayLabel/);
  // Replay gate starts from house-edge-intro onward
  assert.match(src, /house-edge-intro/);
  // Event listener for replay button
  assert.match(src, /replayBtn.*addEventListener/);
  // Calls renderDialogue to replay
  assert.match(src, /renderDialogue\(root, zone, stepId, lang/);
});

test('Recap Disclosure: spin-triggered transitions show recap element', () => {
  const src = readWorkspaceFile('src/scripts/casinocraftz/tutorial/main.ts');

  // lastTransitionTrigger check
  assert.match(src, /lastTransitionTrigger.*===.*'spin'|lastTransitionTrigger.*==.*"spin"/);
  // Details/summary elements for progressive enhancement
  assert.match(src, /createElement\('details'\)|createElement\('summary'\)/);
  // Recap data attribute
  assert.match(src, /dataset\.casinocraftzRecap/);
  // Recap copy comes from localized dataset key
  assert.match(src, /casinocraftzCausalityProbabilityReveal/);
});

test('persistence wiring: localStorage keys and loadCompletedLessons export', () => {
  const engineSource = readWorkspaceFile('src/scripts/casinocraftz/tutorial/engine.ts');
  const mainSource = readWorkspaceFile('src/scripts/casinocraftz/tutorial/main.ts');

  // D-08: loadCompletedLessons is exported from engine
  assert.match(engineSource, /export function loadCompletedLessons/);

  // D-08: ccz-near-miss-completed key is written in engine
  assert.match(engineSource, /ccz-near-miss-completed/);

  // D-08: ccz-lesson-sensory-completed key is written in engine
  assert.match(engineSource, /ccz-lesson-sensory-completed/);

  // D-08: skip handler writes ccz-near-miss-completed (D-06 verification)
  assert.match(mainSource, /markNearMissComplete/);
});
