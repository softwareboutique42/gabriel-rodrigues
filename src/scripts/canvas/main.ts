import type { CompanyConfig } from './types';
import { CanvasRenderer } from './renderer';

const WORKER_URL = 'https://company-canvas-api.gabriel-rodrigues-dev.workers.dev';

let renderer: CanvasRenderer | null = null;

function getEl<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}

function showState(state: 'idle' | 'loading' | 'result' | 'error'): void {
  getEl('canvas-idle').classList.toggle('hidden', state !== 'idle');
  getEl('canvas-loading').classList.toggle('hidden', state !== 'loading');
  getEl('canvas-error').classList.toggle('hidden', state !== 'error');
  getEl('canvas-result').classList.toggle('hidden', state !== 'result');
  getEl('canvas-info').classList.toggle('hidden', state !== 'result');
}

function renderInfo(config: CompanyConfig): void {
  getEl('info-industry').textContent = config.industry;
  getEl('info-description').textContent = config.description;
  getEl('info-style').textContent = config.animationStyle;

  const paletteEl = getEl('info-palette');
  paletteEl.innerHTML = '';
  const colorEntries = Object.entries(config.colors) as [string, string][];
  colorEntries.forEach(([name, hex]) => {
    const swatch = document.createElement('div');
    swatch.className = 'flex items-center gap-2';
    swatch.innerHTML = `<span class="w-4 h-4 inline-block" style="background:${hex}"></span>
      <span class="font-mono text-xs text-text-muted">${name}: ${hex}</span>`;
    paletteEl.appendChild(swatch);
  });

  getEl('overlay-name').textContent = config.companyName;
  getEl('overlay-name').style.color = config.colors.primary;
  getEl('overlay-tagline').textContent = config.tagline;
  getEl('overlay-tagline').style.color = config.colors.secondary;
}

async function generate(companyName: string): Promise<void> {
  showState('loading');

  if (renderer) {
    renderer.dispose();
    renderer = null;
  }

  try {
    const res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyName }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error((err as { error: string }).error);
    }

    const config: CompanyConfig = await res.json();

    showState('result');
    renderInfo(config);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      const canvas = getEl<HTMLCanvasElement>('canvas-el');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = canvas.clientWidth * 2;
        canvas.height = canvas.clientHeight * 2;
        ctx.fillStyle = config.colors.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    renderer = new CanvasRenderer();
    renderer.init(getEl<HTMLCanvasElement>('canvas-el'), config);
    renderer.start();
  } catch {
    showState('error');
  }
}

export function initCanvas(): void {
  const form = getEl<HTMLFormElement>('canvas-form');
  const input = getEl<HTMLInputElement>('canvas-input');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = input.value.trim();
    if (name) generate(name);
  });

  getEl('canvas-retry')?.addEventListener('click', () => {
    if (renderer) {
      renderer.dispose();
      renderer = null;
    }
    input.value = '';
    showState('idle');
    input.focus();
  });

  getEl('error-retry')?.addEventListener('click', () => {
    const name = input.value.trim();
    if (name) generate(name);
  });
}
