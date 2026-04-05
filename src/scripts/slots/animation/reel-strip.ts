import type { SlotSymbol } from '../engine/types.ts';

const ALL_SYMBOLS: readonly SlotSymbol[] = ['A', 'B', 'C', 'D', 'E'];

const SYMBOL_IMAGES: Record<SlotSymbol, string> = {
  A: '/images/slots/symbols/antimatter.png',
  B: '/images/slots/symbols/californium.png',
  C: '/images/slots/symbols/diamond.png',
  D: '/images/slots/symbols/gold.png',
  E: '/images/slots/symbols/tritium.png',
};

// Strip layout: FAST_COUNT random symbols → DECEL_COUNT random symbols → target symbol
const FAST_COUNT = 20;
const DECEL_COUNT = 5;
const STRIP_LENGTH = FAST_COUNT + DECEL_COUNT + 1;

// Each reel stops at this time (ms from spin start)
const REEL_STOP_TIMES_MS: readonly [number, number, number] = [900, 1300, 1700];
// Duration of deceleration phase per reel
const DECEL_DURATION_MS = 440;

export interface ReelStripController {
  spin(targets: SlotSymbol[], signal: AbortSignal, onAllStopped: () => void): void;
  cancel(): void;
}

function rand(symbols: readonly SlotSymbol[]): SlotSymbol {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function buildStrip(target: SlotSymbol): SlotSymbol[] {
  const strip: SlotSymbol[] = [];
  for (let i = 0; i < FAST_COUNT + DECEL_COUNT; i++) {
    strip.push(rand(ALL_SYMBOLS));
  }
  strip.push(target);
  return strip;
}

function createStripEl(symbols: SlotSymbol[], cellH: number): HTMLElement {
  const strip = document.createElement('div');
  strip.className = 'slots-reel-strip';
  strip.setAttribute('aria-hidden', 'true');

  for (const sym of symbols) {
    const cell = document.createElement('div');
    cell.className = 'slots-reel-strip__cell';
    cell.style.height = `${cellH}px`;
    cell.dataset.slotsSymbol = sym;
    cell.style.setProperty('--slots-cell-symbol', `url('${SYMBOL_IMAGES[sym]}')`);
    strip.appendChild(cell);
  }

  return strip;
}

export function createReelStripController(root: HTMLElement): ReelStripController {
  const windows = Array.from(root.querySelectorAll<HTMLElement>('[data-slots-reel-window]'));
  let activeAnims: Animation[] = [];

  const cancel = () => {
    for (const a of activeAnims) {
      try { a.cancel(); } catch { /* ignore if already finished */ }
    }
    activeAnims = [];
    for (const w of windows) {
      w.querySelector('.slots-reel-strip')?.remove();
    }
  };

  const spin = (targets: SlotSymbol[], signal: AbortSignal, onAllStopped: () => void) => {
    cancel();

    let doneCount = 0;
    const totalReels = windows.length;

    windows.forEach((windowEl, i) => {
      const cellH = windowEl.getBoundingClientRect().height || windowEl.offsetHeight || 120;
      const target = targets[i] ?? rand(ALL_SYMBOLS);
      const symbols = buildStrip(target);
      const stripEl = createStripEl(symbols, cellH);
      windowEl.appendChild(stripEl);

      const stopMs = REEL_STOP_TIMES_MS[i] ?? 1700;
      const fastDuration = stopMs - DECEL_DURATION_MS;
      const fastRatio = fastDuration / stopMs;

      // Positions
      const fastEndY = -(FAST_COUNT * cellH);
      const finalY = -((FAST_COUNT + DECEL_COUNT) * cellH);
      const overshootY = finalY - cellH * 0.09; // 9% past target — mechanical thunk

      const anim = stripEl.animate(
        [
          {
            transform: 'translateY(0px)',
            filter: 'blur(3px) brightness(1.1)',
            easing: 'linear',
          },
          {
            transform: `translateY(${fastEndY}px)`,
            filter: 'blur(3px) brightness(1.1)',
            easing: 'cubic-bezier(0.06, 0, 0.06, 1)',
            offset: fastRatio,
          },
          {
            transform: `translateY(${overshootY}px)`,
            filter: 'blur(0px) brightness(1)',
            easing: 'cubic-bezier(0, 0, 0.3, 1)',
            offset: fastRatio + (1 - fastRatio) * 0.74,
          },
          {
            transform: `translateY(${finalY}px)`,
            filter: 'blur(0px) brightness(1)',
          },
        ],
        { duration: stopMs, fill: 'forwards' },
      );

      activeAnims.push(anim);

      anim.addEventListener('finish', () => {
        if (signal.aborted) return;

        // Brief settle pause, then fade strip to reveal the underlying symbol background
        window.setTimeout(() => {
          const fade = stripEl.animate([{ opacity: '1' }, { opacity: '0' }], {
            duration: 180,
            fill: 'forwards',
          });
          fade.addEventListener('finish', () => stripEl.remove());
        }, 60);

        doneCount++;
        if (doneCount === totalReels) onAllStopped();
      });

      signal.addEventListener(
        'abort',
        () => {
          try { anim.cancel(); } catch { /* ignore */ }
          stripEl.remove();
        },
        { once: true },
      );
    });
  };

  return { spin, cancel };
}
