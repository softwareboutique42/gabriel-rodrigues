import type { CompanyConfig } from './types';
import { CanvasRenderer } from './renderer';
import { VERSIONS, getDefaultVersion, getVersion } from './versions';
import { normalizeCompanyConfig } from './config-normalization';
import {
  detectExportCapabilities,
  selectExportPathForFormat,
  type ExportAspectRatio,
  type ExportFormat,
  type ExportQuality,
  type ExportSettings,
} from './export-support';

const WORKER_URL = 'https://company-canvas-api.gabrielr47.workers.dev';
const EXPORT_SETTINGS_STORAGE_KEY = 'canvas-export-settings';
const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  format: 'webm',
  aspectRatio: '16:9',
  quality: '1080p',
};

let exportControllerModulePromise: Promise<typeof import('./export-controller')> | null = null;
let exportHtmlModulePromise: Promise<typeof import('./export')> | null = null;

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
let lastModalTrigger: HTMLElement | null = null;

function loadExportControllerModule(): Promise<typeof import('./export-controller')> {
  exportControllerModulePromise ??= import('./export-controller');
  return exportControllerModulePromise;
}

function loadExportHtmlModule(): Promise<typeof import('./export')> {
  exportHtmlModulePromise ??= import('./export');
  return exportHtmlModulePromise;
}

function isExportFormat(value: string): value is ExportFormat {
  return value === 'webm' || value === 'mp4';
}

function isAspectRatio(value: string): value is ExportAspectRatio {
  return value === '16:9' || value === '1:1' || value === '9:16';
}

function isExportQuality(value: string): value is ExportQuality {
  return value === '1080p' || value === '720p';
}

function resolveExportSettings(settings: Partial<ExportSettings> = {}): ExportSettings {
  const format: ExportFormat =
    settings.format && isExportFormat(settings.format)
      ? settings.format
      : DEFAULT_EXPORT_SETTINGS.format;
  const aspectRatio: ExportAspectRatio =
    settings.aspectRatio && isAspectRatio(settings.aspectRatio)
      ? settings.aspectRatio
      : DEFAULT_EXPORT_SETTINGS.aspectRatio;
  const quality: ExportQuality =
    settings.quality && isExportQuality(settings.quality)
      ? settings.quality
      : DEFAULT_EXPORT_SETTINGS.quality;

  return { format, aspectRatio, quality };
}

function getExportModalElements(): {
  modal: HTMLElement | null;
  formatSelect: HTMLSelectElement | null;
  ratioSelect: HTMLSelectElement | null;
  qualitySelect: HTMLSelectElement | null;
  formatHint: HTMLElement | null;
} {
  return {
    modal: document.getElementById('canvas-export-modal'),
    formatSelect: document.getElementById('export-format') as HTMLSelectElement | null,
    ratioSelect: document.getElementById('export-aspect-ratio') as HTMLSelectElement | null,
    qualitySelect: document.getElementById('export-quality') as HTMLSelectElement | null,
    formatHint: document.getElementById('export-format-hint'),
  };
}

function readExportSettingsFromModal(): ExportSettings {
  const { formatSelect, ratioSelect, qualitySelect } = getExportModalElements();
  return resolveExportSettings({
    format: formatSelect?.value as ExportFormat | undefined,
    aspectRatio: ratioSelect?.value as ExportAspectRatio | undefined,
    quality: qualitySelect?.value as ExportQuality | undefined,
  });
}

function setExportSettingsInModal(settings: ExportSettings): void {
  const { formatSelect, ratioSelect, qualitySelect } = getExportModalElements();
  if (formatSelect) formatSelect.value = settings.format;
  if (ratioSelect) ratioSelect.value = settings.aspectRatio;
  if (qualitySelect) qualitySelect.value = settings.quality;
}

function savePendingExportSettings(settings: ExportSettings): void {
  try {
    localStorage.setItem(EXPORT_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage failures and fallback to defaults on return
  }
}

function loadPendingExportSettings(): ExportSettings {
  try {
    const raw = localStorage.getItem(EXPORT_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_EXPORT_SETTINGS;
    return resolveExportSettings(JSON.parse(raw) as Partial<ExportSettings>);
  } catch {
    return DEFAULT_EXPORT_SETTINGS;
  }
}

function clearPendingExportSettings(): void {
  try {
    localStorage.removeItem(EXPORT_SETTINGS_STORAGE_KEY);
  } catch {
    // Ignore storage cleanup failures
  }
}

function syncExportFormatAvailability(): void {
  const capabilities = detectExportCapabilities();
  const { formatSelect, formatHint } = getExportModalElements();
  if (!formatSelect) return;

  const mp4Option = formatSelect.querySelector('option[value="mp4"]') as HTMLOptionElement | null;
  if (mp4Option) {
    mp4Option.disabled = !capabilities.canEncodeMp4;
  }

  if (formatHint) {
    if (capabilities.canEncodeMp4) {
      formatHint.textContent = getExportStatusText(
        'modalFormatHintMp4',
        'MP4 available in this browser.',
      );
    } else if (capabilities.canEncodeWebM) {
      formatHint.textContent = getExportStatusText(
        'modalFormatHintWebmOnly',
        'MP4 is unavailable here. WebM will be used.',
      );
    } else {
      formatHint.textContent = getExportStatusText(
        'modalFormatHintUnsupported',
        'Video export unsupported in this browser. HTML fallback may be used after payment.',
      );
    }
  }

  if (!capabilities.canEncodeMp4 && formatSelect.value === 'mp4') {
    formatSelect.value = 'webm';
  }
}

function openExportModal(): void {
  const { modal } = getExportModalElements();
  if (!modal) return;
  lastModalTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  syncExportFormatAvailability();
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');

  const [firstFocusable] = getFocusableElements(modal);
  firstFocusable?.focus();
}

function closeExportModal(): void {
  const { modal } = getExportModalElements();
  if (!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  lastModalTrigger?.focus();
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector =
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => !el.hasAttribute('hidden') && el.getAttribute('aria-hidden') !== 'true',
  );
}

function trapModalFocus(event: KeyboardEvent): void {
  if (event.key !== 'Tab') return;

  const { modal } = getExportModalElements();
  if (!modal || modal.classList.contains('hidden')) return;

  const focusable = getFocusableElements(modal);
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;

  if (event.shiftKey && active === first) {
    event.preventDefault();
    last.focus();
    return;
  }

  if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

function setDownloadStatus(
  statusEl: HTMLElement | null,
  key: string,
  fallback: string,
  pulse = false,
  isError = false,
): void {
  if (!statusEl) return;
  statusEl.textContent = getExportStatusText(key, fallback);
  statusEl.classList.toggle('animate-pulse', pulse);
  statusEl.classList.toggle('text-gold', isError);
}

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
  getEl('info-style').textContent = config.presetId
    ? `${config.presetId} (${config.animationStyle})`
    : config.animationStyle;

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

function getSelectedPresetId(): string | undefined {
  const select = document.getElementById('preset-select') as HTMLSelectElement | null;
  if (!select || !select.value) return undefined;
  return select.value;
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
    const config = normalizeCompanyConfig({
      ...payload,
      version,
      presetId: getSelectedPresetId(),
    });
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
    const config = normalizeCompanyConfig({
      ...payload,
      version,
      presetId: getSelectedPresetId(),
    });
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

function populatePresetOptions(versionId: string): void {
  const select = document.getElementById('preset-select') as HTMLSelectElement | null;
  if (!select) return;

  const selectedVersion = getVersion(versionId) ?? getDefaultVersion();
  const autoLabel = select.dataset.autoLabel ?? 'Auto (Deterministic)';
  const labelMap: Record<string, string> = {
    'education-story': select.dataset.labelEducationStory ?? '',
    'hospitality-orbit': select.dataset.labelHospitalityOrbit ?? '',
    'commerce-signal': select.dataset.labelCommerceSignal ?? '',
  };
  const previousValue = select.value;

  select.innerHTML = '';

  const autoOption = document.createElement('option');
  autoOption.value = '';
  autoOption.textContent = autoLabel;
  select.appendChild(autoOption);

  selectedVersion.verticalPresets.forEach((preset) => {
    const option = document.createElement('option');
    option.value = preset.id;
    option.textContent = labelMap[preset.id] || preset.label;
    option.title = `${preset.description} (${preset.baseStyle})`;
    select.appendChild(option);
  });

  if (
    previousValue &&
    selectedVersion.verticalPresets.some((preset) => preset.id === previousValue)
  ) {
    select.value = previousValue;
  }
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

  populatePresetOptions(select.value || getDefaultVersion().id);
}

export function initCanvas(): void {
  // Abort previous listeners to prevent duplicates on SPA re-navigation
  if (controller) controller.abort();
  controller = new AbortController();
  const { signal } = controller;

  const form = getEl<HTMLFormElement>('canvas-form');
  const input = getEl<HTMLInputElement>('canvas-input');
  const modalConfirm = document.getElementById('export-modal-confirm');
  const modalCancel = document.getElementById('export-modal-cancel');
  const modalBackdrop = document.getElementById('canvas-export-modal');

  populateVersions();
  setExportSettingsInModal(loadPendingExportSettings());
  syncExportFormatAvailability();

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

  getEl<HTMLSelectElement>('version-select')?.addEventListener(
    'change',
    (event) => {
      const target = event.target as HTMLSelectElement;
      populatePresetOptions(target.value);
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
      openExportModal();
    },
    { signal },
  );

  modalCancel?.addEventListener(
    'click',
    () => {
      closeExportModal();
    },
    { signal },
  );

  modalConfirm?.addEventListener(
    'click',
    () => {
      if (!currentConfig) return;
      const settings = readExportSettingsFromModal();
      closeExportModal();
      handleDownload(currentConfig, settings);
    },
    { signal },
  );

  modalBackdrop?.addEventListener(
    'click',
    (event) => {
      if (event.target === modalBackdrop) {
        closeExportModal();
      }
    },
    { signal },
  );

  document.addEventListener(
    'keydown',
    (event) => {
      trapModalFocus(event);
      if (event.key === 'Escape') {
        closeExportModal();
      }
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

async function handleDownload(config: CompanyConfig, settings: ExportSettings): Promise<void> {
  const processingEl = document.getElementById('canvas-download-processing');
  const statusEl = document.getElementById('download-status');
  const warningEl = document.getElementById('download-warning');
  const progressBarEl = document.getElementById('download-progress-bar') as HTMLElement | null;
  const progressLabelEl = document.getElementById('download-progress-label') as HTMLElement | null;
  const normalizedConfig = normalizeCompanyConfig(config);

  try {
    savePendingExportSettings(settings);
    processingEl?.classList.remove('hidden');
    setDownloadStatus(statusEl, 'processing', 'Processing payment...', true, false);
    if (progressBarEl) progressBarEl.style.width = '0%';
    if (progressLabelEl) progressLabelEl.textContent = '';
    warningEl?.classList.add('hidden');

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
    processingEl?.classList.remove('hidden');
    setDownloadStatus(statusEl, 'error', 'Payment failed. Please try again.', false, true);
    warningEl?.classList.add('hidden');
    if (progressBarEl) progressBarEl.style.width = '0%';
    if (progressLabelEl) progressLabelEl.textContent = '';
    clearPendingExportSettings();
  }
}

async function handlePaymentReturn(signal?: AbortSignal): Promise<void> {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get('session_id');
  if (!sessionId) return;

  const processingEl = document.getElementById('canvas-download-processing');
  const statusEl = document.getElementById('download-status');
  const warningEl = document.getElementById('download-warning');
  const progressBarEl = document.getElementById('download-progress-bar') as HTMLElement | null;
  const progressLabelEl = document.getElementById('download-progress-label') as HTMLElement | null;
  processingEl?.classList.remove('hidden');
  setDownloadStatus(
    statusEl,
    'paymentConfirmed',
    'Payment confirmed \u2014 starting your export.',
    true,
    false,
  );
  warningEl?.classList.add('hidden');
  if (progressBarEl) progressBarEl.style.width = '0%';
  if (progressLabelEl) progressLabelEl.textContent = '';

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
    const selectedSettings = loadPendingExportSettings();
    const capabilities = detectExportCapabilities();
    const bestPath = selectExportPathForFormat(capabilities, selectedSettings.format);

    if (exportIntent === 'video' && bestPath !== 'html-fallback') {
      setDownloadStatus(statusEl, 'preparing', 'Preparing video export...', true, false);
      warningEl?.classList.remove('hidden');

      const { startVideoExport, downloadVideoBlob } = await loadExportControllerModule();
      const result = await startVideoExport(normalizedConfig, {
        signal,
        preferredPath: bestPath,
        settings: selectedSettings,
        onProgress: ({ frame, totalFrames, percent }) => {
          warningEl?.classList.remove('hidden');
          if (!statusEl) return;
          const prefix = getExportStatusText('exporting', 'Exporting video');
          statusEl.textContent = `${prefix}: ${percent}% (${frame}/${totalFrames})`;
          statusEl.classList.add('animate-pulse');
          statusEl.classList.remove('text-gold');
          if (progressBarEl) {
            progressBarEl.style.width = `${percent}%`;
          }
          if (progressLabelEl) {
            const template = getExportStatusText('progressTemplate', 'Frame {frame} of {total}');
            progressLabelEl.textContent = template
              .replace('{frame}', String(frame))
              .replace('{total}', String(totalFrames));
          }
        },
      });

      downloadVideoBlob(result.blob, result.filename);
      setDownloadStatus(
        statusEl,
        'complete',
        'Video export complete. Download started!',
        false,
        false,
      );
      if (progressBarEl) progressBarEl.style.width = '100%';
      warningEl?.classList.add('hidden');
      clearPendingExportSettings();
    } else {
      setDownloadStatus(
        statusEl,
        'unsupported',
        'Video export is not supported in this browser.',
        false,
        false,
      );
      const { generateExportHTML, downloadHTML } = await loadExportHtmlModule();
      const html = generateExportHTML(normalizedConfig, normalizedConfig.version ?? data.version);
      const filename = `${normalizedConfig.companyName.toLowerCase().replace(/\s+/g, '-')}-canvas.html`;
      downloadHTML(html, filename);

      setDownloadStatus(
        statusEl,
        'fallback',
        'Video export unsupported here. HTML fallback download started.',
        false,
        false,
      );
      warningEl?.classList.add('hidden');
      clearPendingExportSettings();
    }
  } catch {
    setDownloadStatus(statusEl, 'error', 'Download failed. Please contact support.', false, true);
    warningEl?.classList.add('hidden');
    clearPendingExportSettings();
  }

  // Clean URL
  const cleanUrl = window.location.href.split('?')[0];
  window.history.replaceState({}, '', cleanUrl);
}
