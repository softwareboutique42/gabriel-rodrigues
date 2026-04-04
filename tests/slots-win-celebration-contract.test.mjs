import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const globalCssPath = resolve(process.cwd(), 'src/styles/global.css');
const globalCss = readFileSync(globalCssPath, 'utf8');

test('FX-70: win outcome triggers cyan reel-window glow via slots-reel-win-pulse keyframes', () => {
  assert.match(globalCss, /@keyframes slots-reel-win-pulse/);
  assert.match(globalCss, /rgba\(0, 229, 255/);
  assert.match(globalCss, /data-slots-anim-effect='win'\] \.slots-stage__reel-window/);
  assert.match(globalCss, /animation: slots-reel-win-pulse 0\.95s/);
});

test('FX-70: win-flare gold frame pulse is amplified to dramatic opacity', () => {
  assert.match(globalCss, /@keyframes slots-win-flare/);
  assert.match(globalCss, /rgba\(255, 215, 9, 0\.58\)/);
  assert.match(globalCss, /filter: brightness\(1\.12\)/);
});

test('FX-72: reduced intensity caps reel-win-pulse to single iteration', () => {
  assert.match(
    globalCss,
    /data-slots-anim-intensity='reduced'\]\[data-slots-anim-effect='win'\]\s*\n?\s*\.slots-stage__reel-window/,
  );
});

test('FX-72: minimal intensity disables reel-window animation and provides box-shadow fallback', () => {
  assert.match(
    globalCss,
    /data-slots-anim-intensity='minimal'\] \.slots-stage__reel-window[\s\S]*?animation: none !important/,
  );
  assert.match(
    globalCss,
    /data-slots-anim-intensity='minimal'\]\[data-slots-anim-effect='win'\]\s*\n?\s*\.slots-stage__reel-window/,
  );
});
