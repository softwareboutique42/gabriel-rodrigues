import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test.describe('Particles loop determinism', () => {
  test('uses progress-based closed-form motion and no velocity accumulation', () => {
    const filePath = resolve(process.cwd(), 'src/scripts/canvas/animations/particles.ts');
    const source = readFileSync(filePath, 'utf8');

    // Disallow unbounded elapsed-time accumulation terms that break loop seams.
    expect(source).not.toMatch(/velocities\s*\[\s*i3\s*\]\s*\*\s*t\s*\*\s*60/);
    expect(source).not.toMatch(/velocities\s*\[\s*i3\s*\+\s*1\s*\]\s*\*\s*t\s*\*\s*60/);

    // Require loop progress helper usage for seam-safe deterministic updates.
    expect(source).toMatch(/loopProgress\(elapsed\)/);
  });
});
