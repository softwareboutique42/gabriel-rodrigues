import type { CompanyConfig } from './types';
import { CanvasRenderer } from './renderer';
import { VERSIONS, getDefaultVersion } from './versions';
import { generateExportHTML, downloadHTML } from './export';
import { normalizeCompanyConfig } from './config-normalization';
import { detectExportCapabilities, selectBestExportPath } from './export-support';
import { downloadVideoBlob, startVideoExport } from './export-controller';

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
  mood: 'dynamic',
  industryCategory: 'creative',
  energyLevel: 0.7,
  animationStyle: 'particles',
  animationParams: { speed: 1.0, density: 0.7, complexity: 0.8 },
  visualElements: ['particles', 'neon', 'motion', 'generative', 'brand'],
  version: 'v1',
};

let renderer: CanvasRenderer | null = null;
let currentConfig: CompanyConfig | null = null;
let controller: AbortController | null = null;

function getExportStatusText(kind: string, fallback: string): string {
  const processingEl = document.getElementById('canvas-download-processing') as HTMLElement | null;
  if (!processingEl) return fallback;

  const value = processingEl.dataset[`${kind}Text` as keyof DOMStringMap];
  return value ?? fallback;
}

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

    const colorBox = document.createElement('span');
    colorBox.className = 'w-4 h-4 inline-block';
    if (isValidHex(hex)) colorBox.style.background = hex;

    const label = document.createElement('span');
    label.className = 'font-mono text-xs text-text-muted';
    label.textContent = `${name}: ${hex}`;

    swatch.appendChild(colorBox);
    swatch.appendChild(label);
    paletteEl.appendChild(swatch);
  });

  getEl('overlay-name').textContent = config.companyName;
  if (isValidHex(config.colors.primary)) {
    getEl('overlay-name').style.color = config.colors.primary;
  }
  getEl('overlay-tagline').textContent = config.tagline;
  if (isValidHex(config.colors.secondary)) {
    getEl('overlay-tagline').style.color = config.colors.secondary;
  }
}

function getSelectedVersion(): string {
  const select = document.getElementById('version-select') as HTMLSelectElement | null;
  return select?.value ?? getDefaultVersion().id;
}

function isValidHex(color: string): boolean {
  return /^#[0-9a-fA-F]{3,8}$/.test(color);
}

function applyBrandTheme(config: CompanyConfig): void {
  const { primary, secondary, accent } = config.colors;
  if (!isValidHex(primary) || !isValidHex(secondary) || !isValidHex(accent)) return;

  const root = document.documentElement;
  root.style.setProperty('--color-neon', primary);
  root.style.setProperty('--color-cyan', secondary);
  root.style.setProperty('--color-gold', accent);
  root.style.setProperty('--color-neon-dim', primary + '26');
  root.style.setProperty('--color-cyan-dim', secondary + '1a');
}

function resetBrandTheme(): void {
  ['--color-neon', '--color-cyan', '--color-gold', '--color-neon-dim', '--color-cyan-dim'].forEach(
    (p) => document.documentElement.style.removeProperty(p),
  );
}

function updateUrlWithCompany(config: CompanyConfig): void {
  const slug = config.companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const newUrl = `${window.location.pathname}?company=${encodeURIComponent(slug)}`;
  window.history.replaceState({}, '', newUrl);
}

function startRenderer(config: CompanyConfig): void {
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

    const payload: CompanyConfig = await res.json();
    const config = normalizeCompanyConfig({ ...payload, version });
    currentConfig = config;

    showState('result');
    renderInfo(config);
    applyBrandTheme(config);
    updateUrlWithCompany(config);
    startRenderer(config);
  } catch {
    showState('error');
  }
}

async function fetchBrandedConfig(companySlug: string): Promise<void> {
  showState('loading');

  if (renderer) {
    renderer.dispose();
    renderer = null;
  }

  try {
    const version = getSelectedVersion();
    const res = await fetch(
      `${WORKER_URL}/config/${encodeURIComponent(companySlug)}?version=${encodeURIComponent(version)}`,
    );

    if (!res.ok) {
      throw new Error('Failed to fetch config');
    }

    const payload: CompanyConfig = await res.json();
    const config = normalizeCompanyConfig({ ...payload, version });
    currentConfig = config;

    showState('result');
    renderInfo(config);
    applyBrandTheme(config);
    startRenderer(config);
  } catch {
    showState('error');
  }
}

function renderDemo(): void {
  const config = normalizeCompanyConfig(DEMO_CONFIG);
  currentConfig = config;

  showState('result');
  renderInfo(config);
  startRenderer(config);
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
  // Abort previous listeners to prevent duplicates on SPA re-navigation
  if (controller) controller.abort();
  controller = new AbortController();
  const { signal } = controller;

  const form = getEl<HTMLFormElement>('canvas-form');
  const input = getEl<HTMLInputElement>('canvas-input');

  populateVersions();

  // Auto-load from URL params or show demo
  const params = new URLSearchParams(window.location.search);
  const companyParam = params.get('company');
  if (companyParam) {
    input.value = decodeURIComponent(companyParam).replace(/-/g, ' ');
    fetchBrandedConfig(companyParam);
  } else if (!params.has('session_id')) {
    renderDemo();
  }

  form.addEventListener(
    'submit',
    (e) => {
      e.preventDefault();
      const name = input.value.trim();
      if (name) generate(name);
    },
    { signal },
  );

  getEl('canvas-retry')?.addEventListener(
    'click',
    () => {
      if (renderer) {
        renderer.dispose();
        renderer = null;
      }
      input.value = '';
      resetBrandTheme();
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
      showState('idle');
      input.focus();
    },
    { signal },
  );

  getEl('error-retry')?.addEventListener(
    'click',
    () => {
      const name = input.value.trim();
      if (name) generate(name);
    },
    { signal },
  );

  getEl('canvas-download')?.addEventListener(
    'click',
    () => {
      if (!currentConfig) return;
      handleDownload(currentConfig);
    },
    { signal },
  );

  getEl('canvas-share')?.addEventListener(
    'click',
    () => {
      if (!currentConfig) return;
      navigator.clipboard.writeText(window.location.href).then(() => {
        const btn = getEl('canvas-share');
        const orig = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => {
          btn.textContent = orig;
        }, 2000);
      });
    },
    { signal },
  );

  handlePaymentReturn(signal);

  // Clean up renderer when navigating away (View Transitions SPA mode)
  document.addEventListener(
    'astro:before-swap',
    () => {
      if (renderer) {
        renderer.dispose();
        renderer = null;
      }
      resetBrandTheme();
    },
    { once: true, signal },
  );
}

async function handleDownload(config: CompanyConfig): Promise<void> {
  const processingEl = document.getElementById('canvas-download-processing');
  const statusEl = document.getElementById('download-status');
  const warningEl = document.getElementById('download-warning');
  const normalizedConfig = normalizeCompanyConfig(config);

  try {
    processingEl?.classList.remove('hidden');
    if (statusEl) {
      statusEl.textContent = getExportStatusText('processing', 'Processing payment...');
      statusEl.classList.add('animate-pulse');
    }
    warningEl?.classList.remove('hidden');

    const res = await fetch(`${WORKER_URL}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        config: normalizedConfig,
        version: normalizedConfig.version ?? getDefaultVersion().id,
        returnUrl: window.location.href.split('?')[0],
        exportType: 'video',
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

async function handlePaymentReturn(signal?: AbortSignal): Promise<void> {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get('session_id');
  if (!sessionId) return;

  const processingEl = document.getElementById('canvas-download-processing');
  const statusEl = document.getElementById('download-status');
  const warningEl = document.getElementById('download-warning');
  processingEl?.classList.remove('hidden');
  warningEl?.classList.remove('hidden');

  try {
    const res = await fetch(`${WORKER_URL}/download?session_id=${encodeURIComponent(sessionId)}`);

    if (!res.ok) throw new Error('Download failed');

    const data = (await res.json()) as {
      config: CompanyConfig;
      version: string;
      exportType?: 'video' | 'html';
    };
    const normalizedConfig = normalizeCompanyConfig({ ...data.config, version: data.version });

    const exportIntent = data.exportType ?? 'html';
    const capabilities = detectExportCapabilities();
    const bestPath = selectBestExportPath(capabilities);

    if (exportIntent === 'video' && bestPath !== 'html-fallback') {
      if (statusEl) {
        statusEl.textContent = getExportStatusText('preparing', 'Preparing video export...');
        statusEl.classList.add('animate-pulse');
      }

      const result = await startVideoExport(normalizedConfig, {
        signal,
        preferredPath: bestPath,
        onProgress: ({ frame, totalFrames, percent }) => {
          if (!statusEl) return;
          const prefix = getExportStatusText('exporting', 'Exporting video');
          statusEl.textContent = `${prefix}: ${percent}% (${frame}/${totalFrames})`;
        },
      });

      downloadVideoBlob(result.blob, result.filename);
      if (statusEl) {
        statusEl.textContent = getExportStatusText(
          'complete',
          'Video export complete. Download started!',
        );
        statusEl.classList.remove('animate-pulse');
      }
      warningEl?.classList.add('hidden');
    } else {
      if (statusEl) {
        statusEl.textContent = getExportStatusText(
          'unsupported',
          'Video export is not supported in this browser.',
        );
      }
      const html = generateExportHTML(normalizedConfig, normalizedConfig.version ?? data.version);
      const filename = `${normalizedConfig.companyName.toLowerCase().replace(/\s+/g, '-')}-canvas.html`;
      downloadHTML(html, filename);

      if (statusEl) {
        statusEl.textContent = getExportStatusText(
          'fallback',
          'Video export unsupported here. HTML fallback download started.',
        );
        statusEl.classList.remove('animate-pulse');
      }
      warningEl?.classList.add('hidden');
    }
  } catch {
    if (statusEl) {
      statusEl.textContent = getExportStatusText(
        'error',
        'Download failed. Please contact support.',
      );
      statusEl.classList.remove('animate-pulse');
      statusEl.classList.add('text-gold');
    }
    warningEl?.classList.add('hidden');
  }

  // Clean URL
  const cleanUrl = window.location.href.split('?')[0];
  window.history.replaceState({}, '', cleanUrl);
}
