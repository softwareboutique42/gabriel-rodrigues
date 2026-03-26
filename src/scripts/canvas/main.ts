import type { CompanyConfig } from './types';
import { CanvasRenderer } from './renderer';
import { VERSIONS, getDefaultVersion } from './versions';
import { generateExportHTML, downloadHTML } from './export';

const WORKER_URL = 'https://company-canvas-api.gabrielr47.workers.dev';

const DEMO_CONFIG: CompanyConfig = {
  companyName: 'Company Canvas',
  colors: {
    primary: '#8eff71',
    secondary: '#8ff5ff',
    accent: '#ffd709',
    background: '#0e0e0e',
  },
  tagline: 'AI-powered brand animations in seconds',
  industry: 'Creative Technology',
  description:
    'Company Canvas transforms any brand name into a living, breathing canvas animation using AI-generated brand identity and Three.js rendering.',
  animationStyle: 'particles',
  animationParams: { speed: 1.0, density: 0.7, complexity: 0.8 },
  visualElements: ['particles', 'neon', 'motion', 'generative', 'brand'],
  version: 'v1',
};

let renderer: CanvasRenderer | null = null;
let currentConfig: CompanyConfig | null = null;

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

function getSelectedVersion(): string {
  const select = document.getElementById('version-select') as HTMLSelectElement | null;
  return select?.value ?? getDefaultVersion().id;
}

async function generate(companyName: string): Promise<void> {
  showState('loading');

  if (renderer) {
    renderer.dispose();
    renderer = null;
  }

  const version = getSelectedVersion();

  try {
    const res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyName, version }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error((err as { error: string }).error);
    }

    const config: CompanyConfig = await res.json();
    config.version = version;
    currentConfig = config;

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

function renderDemo(): void {
  const config = DEMO_CONFIG;
  currentConfig = config;

  showState('result');
  renderInfo(config);

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  renderer = new CanvasRenderer();
  renderer.init(getEl<HTMLCanvasElement>('canvas-el'), config);
  renderer.start();
}

function populateVersions(): void {
  const select = document.getElementById('version-select') as HTMLSelectElement | null;
  if (!select) return;
  select.innerHTML = '';
  VERSIONS.forEach((v) => {
    const opt = document.createElement('option');
    opt.value = v.id;
    opt.textContent = v.label;
    opt.title = v.description;
    select.appendChild(opt);
  });
}

export function initCanvas(): void {
  const form = getEl<HTMLFormElement>('canvas-form');
  const input = getEl<HTMLInputElement>('canvas-input');

  populateVersions();

  // Show demo on first load (unless returning from payment)
  const params = new URLSearchParams(window.location.search);
  if (!params.has('session_id')) {
    renderDemo();
  }

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

  getEl('canvas-download')?.addEventListener('click', () => {
    if (!currentConfig) return;
    handleDownload(currentConfig);
  });

  handlePaymentReturn();
}

async function handleDownload(config: CompanyConfig): Promise<void> {
  const processingEl = document.getElementById('canvas-download-processing');
  const statusEl = document.getElementById('download-status');

  try {
    processingEl?.classList.remove('hidden');
    if (statusEl) statusEl.textContent = 'Creating checkout session...';

    const res = await fetch(`${WORKER_URL}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        config,
        version: config.version ?? getDefaultVersion().id,
        returnUrl: window.location.href.split('?')[0],
      }),
    });

    if (!res.ok) throw new Error('Checkout failed');

    const { url } = (await res.json()) as { url: string };
    window.location.href = url;
  } catch {
    processingEl?.classList.add('hidden');
    alert('Payment failed. Please try again.');
  }
}

async function handlePaymentReturn(): Promise<void> {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get('session_id');
  if (!sessionId) return;

  const processingEl = document.getElementById('canvas-download-processing');
  const statusEl = document.getElementById('download-status');
  processingEl?.classList.remove('hidden');

  try {
    const res = await fetch(`${WORKER_URL}/download?session_id=${encodeURIComponent(sessionId)}`);

    if (!res.ok) throw new Error('Download failed');

    const data = (await res.json()) as { config: CompanyConfig; version: string };
    const html = generateExportHTML(data.config, data.version);
    const filename = `${data.config.companyName.toLowerCase().replace(/\s+/g, '-')}-canvas.html`;
    downloadHTML(html, filename);

    if (statusEl) {
      statusEl.textContent = 'Download started!';
      statusEl.classList.remove('animate-pulse');
    }
  } catch {
    if (statusEl) {
      statusEl.textContent = 'Download failed. Please contact support.';
      statusEl.classList.remove('animate-pulse');
      statusEl.classList.add('text-gold');
    }
  }

  // Clean URL
  const cleanUrl = window.location.href.split('?')[0];
  window.history.replaceState({}, '', cleanUrl);
}
