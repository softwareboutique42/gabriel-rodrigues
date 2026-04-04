import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const utilsPath = resolve(process.cwd(), 'src/i18n/utils.ts');
const switcherPath = resolve(process.cwd(), 'src/components/LanguageSwitcher.astro');
const headerPath = resolve(process.cwd(), 'src/components/Header.astro');
const enProjectsPath = resolve(process.cwd(), 'src/pages/en/projects/index.astro');
const ptProjectsPath = resolve(process.cwd(), 'src/pages/pt/projects/index.astro');
const enCasinocraftzPath = resolve(process.cwd(), 'src/pages/en/casinocraftz/index.astro');
const ptCasinocraftzPath = resolve(process.cwd(), 'src/pages/pt/casinocraftz/index.astro');
const enSlotsPath = resolve(process.cwd(), 'src/pages/en/slots/index.astro');
const ptSlotsPath = resolve(process.cwd(), 'src/pages/pt/slots/index.astro');
const slotsMainPath = resolve(process.cwd(), 'src/scripts/slots/main.ts');
const slotsControllerPath = resolve(process.cwd(), 'src/scripts/slots/controller.ts');
const globalCssPath = resolve(process.cwd(), 'src/styles/global.css');
const slotsDocPath = resolve(process.cwd(), 'docs/slots-image-customization.md');

const utils = readFileSync(utilsPath, 'utf8');
const switcher = readFileSync(switcherPath, 'utf8');
const header = readFileSync(headerPath, 'utf8');
const enProjects = readFileSync(enProjectsPath, 'utf8');
const ptProjects = readFileSync(ptProjectsPath, 'utf8');
const enCasinocraftz = readFileSync(enCasinocraftzPath, 'utf8');
const ptCasinocraftz = readFileSync(ptCasinocraftzPath, 'utf8');
const enSlots = readFileSync(enSlotsPath, 'utf8');
const ptSlots = readFileSync(ptSlotsPath, 'utf8');
const slotsMain = readFileSync(slotsMainPath, 'utf8');
const slotsController = readFileSync(slotsControllerPath, 'utf8');
const globalCss = readFileSync(globalCssPath, 'utf8');
const slotsDoc = readFileSync(slotsDocPath, 'utf8');

function extractCasinocraftzDatasetNames(source) {
  return new Set(
    Array.from(source.matchAll(/data-casinocraftz-[a-z0-9-]+/g), (match) => match[0]).sort(),
  );
}

test('counterpart mapping contract for projects/canvas/slots/casinocraftz surfaces stays exact', () => {
  assert.match(utils, /getLocalizedPath\(path: string, lang: Lang\)/);
  assert.ok(utils.includes("path.replace(/^\\/(en|pt)/, '')"));
  assert.match(switcher, /getLocalizedPath\(Astro\.url\.pathname, targetLang\)/);

  const matrix = [
    ['/en/projects/', '/pt/projects/'],
    ['/pt/projects/', '/en/projects/'],
    ['/en/canvas/', '/pt/canvas/'],
    ['/pt/canvas/', '/en/canvas/'],
    ['/en/slots/', '/pt/slots/'],
    ['/pt/slots/', '/en/slots/'],
    ['/en/casinocraftz/', '/pt/casinocraftz/'],
    ['/pt/casinocraftz/', '/en/casinocraftz/'],
  ];

  for (const [from, expected] of matrix) {
    const computed = from.replace(/^\/(en|pt)/, (_m, lang) => (lang === 'en' ? '/pt' : '/en'));
    assert.equal(computed, expected, `counterpart mismatch for ${from}`);
  }
});

test('canonical discovery links remain locale-correct on projects pages', () => {
  assert.match(header, /href=\{`\/\$\{lang\}\/projects\/`\}/);
  assert.match(enProjects, /href="\/en\/canvas\/"/);
  assert.match(enProjects, /href="\/en\/casinocraftz\/"/);
  assert.match(ptProjects, /href="\/pt\/canvas\/"/);
  assert.match(ptProjects, /href="\/pt\/casinocraftz\/"/);
});

test('casinocraftz links to canonical standalone slots paths in EN/PT', () => {
  assert.match(enCasinocraftz, /data-casinocraftz-slots-card/);
  assert.match(ptCasinocraftz, /data-casinocraftz-slots-card/);
  assert.match(enCasinocraftz, /data-casinocraftz-slots-link/);
  assert.match(ptCasinocraftz, /data-casinocraftz-slots-link/);
  assert.match(enCasinocraftz, /href="\/en\/slots\/"/);
  assert.match(ptCasinocraftz, /href="\/pt\/slots\/"/);
  assert.doesNotMatch(enCasinocraftz, /data-casinocraftz-slots-embed/);
  assert.doesNotMatch(ptCasinocraftz, /data-casinocraftz-slots-embed/);
  assert.match(enSlots, /data-slots-host="standalone"/);
  assert.match(ptSlots, /data-slots-host="standalone"/);
  assert.match(slotsMain, /new URLSearchParams\(window\.location\.search\)\.get\('host'\)/);
  assert.match(slotsMain, /root\.dataset\.slotsHost = hostMode/);
});

test('alias route deny-list remains enforced for projects and canonical surfaces', () => {
  const forbidden = [
    /\/en\/projects\/canvas\//,
    /\/pt\/projects\/canvas\//,
    /\/en\/projects\/slots\//,
    /\/pt\/projects\/slots\//,
    /\/en\/projects\/casinocraftz\//,
    /\/pt\/projects\/casinocraftz\//,
  ];

  const sources = [enProjects, ptProjects, enSlots, ptSlots, enCasinocraftz, ptCasinocraftz];
  for (const pattern of forbidden) {
    for (const source of sources) {
      assert.doesNotMatch(source, pattern, `forbidden alias detected: ${pattern}`);
    }
  }
});

test('standalone slots route remains locale-prefixed and rejects bare /slots alias links', () => {
  const canonicalSurfaces = [enProjects, ptProjects, enCasinocraftz, ptCasinocraftz];
  for (const source of canonicalSurfaces) {
    assert.doesNotMatch(source, /href="\/slots\/?"/);
    assert.doesNotMatch(source, /href='\/slots\/?'/);
  }
});

test('integrated casinocraftz surfaces keep zero-risk framing and reject monetization hooks', () => {
  assert.match(enCasinocraftz, /casinocraftz\.disclaimer\.zeroRisk/);
  assert.match(ptCasinocraftz, /casinocraftz\.disclaimer\.zeroRisk/);
  assert.match(enCasinocraftz, /never connected to real wagers/i);
  assert.match(ptCasinocraftz, /nunca ligados a aposta real/i);

  const monetizationPatterns = [
    /data-(stripe|checkout|payment|deposit|withdraw)/i,
    /href="\/(checkout|billing|wallet|deposit|purchase)\/?"/i,
    /href='\/(checkout|billing|wallet|deposit|purchase)\/?'/i,
    /\b(microtransaction|buy now|subscribe now|real money purchase)\b/i,
  ];

  const integratedSurfaces = [enCasinocraftz, ptCasinocraftz, enSlots, ptSlots];
  for (const source of integratedSurfaces) {
    for (const pattern of monetizationPatterns) {
      assert.doesNotMatch(source, pattern, `unexpected monetization hook detected: ${pattern}`);
    }
  }
});

test('casinocraftz canonical pages expose tutorial step dataset in EN and PT', () => {
  assert.match(enCasinocraftz, /data-casinocraftz-tutorial-step/);
  assert.match(ptCasinocraftz, /data-casinocraftz-tutorial-step/);
  assert.ok(
    enCasinocraftzPath.endsWith('src/pages/en/casinocraftz/index.astro'),
    'EN casinocraftz page must be at canonical path',
  );
  assert.ok(
    ptCasinocraftzPath.endsWith('src/pages/pt/casinocraftz/index.astro'),
    'PT casinocraftz page must be at canonical path',
  );
});

test('casinocraftz curriculum shell dataset surface stays parity-locked in EN/PT', () => {
  const enDatasetNames = extractCasinocraftzDatasetNames(enCasinocraftz);
  const ptDatasetNames = extractCasinocraftzDatasetNames(ptCasinocraftz);

  assert.deepEqual(
    [...enDatasetNames],
    [...ptDatasetNames],
    'EN/PT Casinocraftz pages must expose the same data-casinocraftz-* anchors',
  );

  for (const requiredAnchor of [
    'data-casinocraftz-current-lesson',
    'data-casinocraftz-curriculum-progress-title',
    'data-casinocraftz-curriculum-bounded-rule',
    'data-casinocraftz-causality-near-miss-reveal',
    'data-casinocraftz-causality-sensory-reveal',
    'data-casinocraftz-step-near-miss-reveal-label',
    'data-casinocraftz-step-sensory-conditioning-reveal-label',
  ]) {
    assert.ok(enDatasetNames.has(requiredAnchor), `missing EN anchor ${requiredAnchor}`);
    assert.ok(ptDatasetNames.has(requiredAnchor), `missing PT anchor ${requiredAnchor}`);
  }
});

test('casinocraftz curriculum surfaces reject manipulative outcome-control claims', () => {
  const protectedSurfaces = [enCasinocraftz, ptCasinocraftz];
  const forbiddenClaims = [
    /beat the odds/i,
    /improve your odds/i,
    /increase your chances/i,
    /control outcomes/i,
    /exploit the machine/i,
    /melhorar as odds/i,
    /aumentar suas chances/i,
    /controlar resultados/i,
    /explorar a maquina/i,
  ];

  for (const source of protectedSurfaces) {
    for (const pattern of forbiddenClaims) {
      assert.doesNotMatch(source, pattern, `unexpected manipulative claim detected: ${pattern}`);
    }
  }
});

test('bridge event sender in slots/main.ts emits versioned envelope with payload wrapper', () => {
  assert.match(slotsMain, /version:\s*1/);
  assert.match(slotsMain, /payload:\s*\{/);
  assert.match(slotsMain, /ccz:spin-settled/);
});

test('slots symbol atlas presentation remains deterministic and source-locked', () => {
  assert.match(slotsController, /windowEl\.dataset\.slotsSymbol = symbol/);
  assert.match(slotsController, /SYMBOL_PRESENTATION/);
  assert.match(globalCss, /\/images\/slots\/symbols\/bar\.svg/);
  assert.match(globalCss, /\/images\/slots\/symbols\/seven\.svg/);
  assert.match(globalCss, /\/images\/slots\/symbols\/crown\.svg/);
  assert.match(globalCss, /\/images\/slots\/symbols\/diamond\.svg/);
  assert.match(globalCss, /\/images\/slots\/symbols\/star\.svg/);
});

test('slots image customization documentation preserves authority-safety guidance', () => {
  assert.match(slotsDoc, /Do not change RNG, reels, payline rules, or payout logic\./);
  assert.match(slotsDoc, /Never modify payout or RNG code while changing visuals\./);
  assert.match(slotsDoc, /data-slots-\*/);
});
