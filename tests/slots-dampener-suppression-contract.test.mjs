import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const cardsPath = resolve(process.cwd(), 'src/scripts/casinocraftz/tutorial/cards.ts');
const slotsMainPath = resolve(process.cwd(), 'src/scripts/slots/main.ts');
const globalCssPath = resolve(process.cwd(), 'src/styles/global.css');
const enCasinocraftzPath = resolve(process.cwd(), 'src/pages/en/casinocraftz/index.astro');
const ptCasinocraftzPath = resolve(process.cwd(), 'src/pages/pt/casinocraftz/index.astro');
const enSlotsPath = resolve(process.cwd(), 'src/pages/en/slots/index.astro');
const ptSlotsPath = resolve(process.cwd(), 'src/pages/pt/slots/index.astro');

const cards = readFileSync(cardsPath, 'utf8');
const slotsMain = readFileSync(slotsMainPath, 'utf8');
const globalCss = readFileSync(globalCssPath, 'utf8');
const enCasinocraftz = readFileSync(enCasinocraftzPath, 'utf8');
const ptCasinocraftz = readFileSync(ptCasinocraftzPath, 'utf8');
const enSlots = readFileSync(enSlotsPath, 'utf8');
const ptSlots = readFileSync(ptSlotsPath, 'utf8');

test('FX-71: dopamine-dampener activation writes ccz:dampened signal to sessionStorage', () => {
  assert.match(cards, /sessionStorage\.setItem\(['"]ccz:dampened['"]/);
  assert.match(cards, /dopamine-dampener/);
});

test('FX-71: clearCard removes ccz:dampened from sessionStorage', () => {
  assert.match(cards, /sessionStorage\.removeItem\(['"]ccz:dampened['"]/);
});

test('FX-71: slots init reads ccz:dampened and sets slotsAnimDampened dataset', () => {
  assert.match(slotsMain, /sessionStorage\.getItem\(['"]ccz:dampened['"]\)/);
  assert.match(slotsMain, /slotsAnimDampened/);
});

test('FX-71: CSS suppresses win-celebration animations when dampened attribute is true', () => {
  assert.match(globalCss, /data-slots-anim-dampened='true'\]\[data-slots-anim-effect='win'\]/);
  assert.match(globalCss, /data-slots-anim-dampened='true'[\s\S]*?animation: none/);
});

test('FX-73: EN and PT Casinocraftz pages both expose dopamine-dampener card activate button', () => {
  assert.ok(enCasinocraftz.includes('data-casinocraftz-card-activate="dopamine-dampener"'));
  assert.ok(ptCasinocraftz.includes('data-casinocraftz-card-activate="dopamine-dampener"'));
});

test('FX-73: EN and PT Slots pages both mount the shared shell that reads dampened signal', () => {
  assert.match(enSlots, /data-slots-shell="cabinet"/);
  assert.match(ptSlots, /data-slots-shell="cabinet"/);
  // Shared slots/main.ts initSlotsShell() handles both routes — one JS file, automatic parity
  assert.match(slotsMain, /slotsAnimDampened/);
});
