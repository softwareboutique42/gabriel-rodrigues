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

test('casinocraftz embeds canonical slots module paths in EN/PT', () => {
  assert.match(enCasinocraftz, /data-casinocraftz-slots-embed/);
  assert.match(ptCasinocraftz, /data-casinocraftz-slots-embed/);
  assert.match(enCasinocraftz, /src="\/en\/slots\/\?host=casinocraftz"/);
  assert.match(ptCasinocraftz, /src="\/pt\/slots\/\?host=casinocraftz"/);
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
