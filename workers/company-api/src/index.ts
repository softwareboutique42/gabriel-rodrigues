import { createCheckoutSession, verifyAndGetConfig } from './stripe';
import { cacheKey } from './normalize';

interface Env {
  STRIPE_SECRET_KEY: string;
  ALLOWED_ORIGINS: string;
  CONFIG_CACHE: KVNamespace;
}

type CompanyMood = 'bold' | 'elegant' | 'playful' | 'minimal' | 'dynamic';
type IndustryCategory =
  | 'tech'
  | 'finance'
  | 'health'
  | 'retail'
  | 'creative'
  | 'food'
  | 'education'
  | 'hospitality'
  | 'other';

type AnimationStyle =
  | 'particles'
  | 'flowing'
  | 'geometric'
  | 'typographic'
  | 'narrative'
  | 'timeline'
  | 'constellation'
  | 'spotlight'
  | 'orbit'
  | 'pulse'
  | 'signal';

type GeneratedConfig = {
  companyName: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  tagline: string;
  industry: string;
  description: string;
  mood: CompanyMood;
  industryCategory: IndustryCategory;
  energyLevel: number;
  animationStyle: AnimationStyle;
  animationParams: {
    speed: number;
    density: number;
    complexity: number;
  };
  visualElements: string[];
  version?: string;
};

// ─── Deterministic derivation tables ───────────────────────────────────────

function nameHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const INDUSTRY_PALETTES: Record<IndustryCategory, [string, string, string][]> = {
  tech:        [['#00e5ff', '#8eff71', '#7c3aed'], ['#8eff71', '#00e5ff', '#a855f7']],
  finance:     [['#ffd709', '#1a56db', '#059669'], ['#60a5fa', '#ffd709', '#10b981']],
  health:      [['#10b981', '#60a5fa', '#f59e0b'], ['#34d399', '#38bdf8', '#fbbf24']],
  retail:      [['#f97316', '#ec4899', '#8b5cf6'], ['#fb923c', '#f472b6', '#a78bfa']],
  creative:    [['#8eff71', '#f43f5e', '#fbbf24'], ['#a3e635', '#fb7185', '#fcd34d']],
  food:        [['#f97316', '#84cc16', '#fcd34d'], ['#fb923c', '#a3e635', '#fde68a']],
  education:   [['#6366f1', '#0ea5e9', '#f59e0b'], ['#818cf8', '#38bdf8', '#fbbf24']],
  hospitality: [['#f59e0b', '#ec4899', '#8b5cf6'], ['#fbbf24', '#f472b6', '#a78bfa']],
  other:       [['#8eff71', '#00e5ff', '#ffd709'], ['#00e5ff', '#8eff71', '#a855f7']],
};

const INDUSTRY_MOOD: Record<IndustryCategory, CompanyMood> = {
  tech: 'dynamic',
  finance: 'minimal',
  health: 'elegant',
  retail: 'bold',
  creative: 'playful',
  food: 'playful',
  education: 'elegant',
  hospitality: 'elegant',
  other: 'dynamic',
};

const INDUSTRY_DEFAULTS: Record<IndustryCategory, string[]> = {
  tech:        ['software', 'cloud', 'data'],
  finance:     ['capital', 'markets', 'invest'],
  health:      ['wellness', 'clinical', 'pharma'],
  retail:      ['products', 'shop', 'brand'],
  creative:    ['design', 'media', 'content'],
  food:        ['cuisine', 'dining', 'flavor'],
  education:   ['learning', 'campus', 'skills'],
  hospitality: ['travel', 'service', 'guest'],
  other:       ['growth', 'global', 'vision'],
};

const MOOD_PARAMS: Record<CompanyMood, { speed: number; density: number; complexity: number }> = {
  bold:    { speed: 1.4, density: 0.8,  complexity: 0.75 },
  dynamic: { speed: 1.2, density: 0.7,  complexity: 0.65 },
  playful: { speed: 1.1, density: 0.75, complexity: 0.6  },
  elegant: { speed: 0.8, density: 0.55, complexity: 0.5  },
  minimal: { speed: 0.7, density: 0.45, complexity: 0.4  },
};

// Animation style selection mirrors the frontend's style-selector.ts logic
const V1_STYLE_MATRIX: Record<IndustryCategory, AnimationStyle> = {
  tech:        'particles',
  finance:     'geometric',
  health:      'flowing',
  retail:      'typographic',
  creative:    'constellation',
  food:        'flowing',
  education:   'typographic',
  hospitality: 'spotlight',
  other:       'particles',
};

const V2_STYLE_MATRIX: Record<IndustryCategory, AnimationStyle> = {
  tech:        'signal',
  finance:     'pulse',
  health:      'orbit',
  retail:      'narrative',
  creative:    'timeline',
  food:        'narrative',
  education:   'narrative',
  hospitality: 'orbit',
  other:       'signal',
};

// ─── Derivation helpers ────────────────────────────────────────────────────

function detectIndustryCategory(text: string): IndustryCategory {
  const t = text.toLowerCase();
  if (/tech|software|cloud|computing|digital|internet|\bai\b|artificial intelligence|data/.test(t)) return 'tech';
  if (/bank|financ|invest|capital|insurance|trading|fund|asset/.test(t)) return 'finance';
  if (/health|pharma|medical|hospital|clinic|biotech|drug|therapeut/.test(t)) return 'health';
  if (/retail|shop|store|commerce|fashion|apparel|consumer goods/.test(t)) return 'retail';
  if (/creative|design|media|art|entertainment|music|film|studio/.test(t)) return 'creative';
  if (/food|restaurant|beverage|drink|dining|cafe|culinar|grocer/.test(t)) return 'food';
  if (/educat|school|universit|learn|academi|college|training/.test(t)) return 'education';
  if (/hotel|hospitality|travel|tourism|resort|airline|lodg/.test(t)) return 'hospitality';
  return 'other';
}

function selectAnimationStyle(version: string, industry: IndustryCategory): AnimationStyle {
  return version === 'v2' ? V2_STYLE_MATRIX[industry] : V1_STYLE_MATRIX[industry];
}

// ─── Color contrast enforcement ───────────────────────────────────────────

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  let r: number;
  let g: number;
  let b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hue2rgb = (t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    r = hue2rgb(h + 1 / 3);
    g = hue2rgb(h);
    b = hue2rgb(h - 1 / 3);
  }
  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Ensures a color is bright enough to be visible on a dark (#0e0e0e) background. */
function ensureMinLightness(hex: string, minL = 0.6): string {
  if (!hex.startsWith('#') || hex.length !== 7) return hex;
  const [h, s, l] = hexToHsl(hex);
  if (l >= minL) return hex;
  return hslToHex(h, s, minL);
}

function deriveColors(
  industry: IndustryCategory,
  hash: number,
): { primary: string; secondary: string; accent: string; background: string } {
  const palettes = INDUSTRY_PALETTES[industry];
  const [primary, secondary, accent] = palettes[hash % palettes.length];
  return { primary, secondary, accent, background: '#0e0e0e' };
}

function deriveTagline(description: string): string {
  const first = description.split(/[.!?]/)[0].trim();
  if (!first) return '';
  return first.length <= 60 ? first : first.slice(0, 57) + '...';
}

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'that', 'this', 'with', 'from', 'have', 'been', 'also',
  'its', 'are', 'was', 'were', 'will', 'has', 'had', 'not', 'but', 'they',
  'which', 'their', 'into', 'more', 'than', 'such', 'when', 'about', 'other',
  'over', 'after', 'before', 'between', 'through', 'during', 'including',
  'based', 'known', 'well', 'founded', 'american', 'company', 'corporation',
  'incorporated', 'limited', 'group', 'holdings', 'international', 'global',
]);

function extractVisualElements(
  description: string,
  companyName: string,
  industry: IndustryCategory,
): string[] {
  const nameTokens = new Set(companyName.toLowerCase().split(/\s+/));
  const words = description
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 4 && w.length <= 12)
    .filter((w) => !STOP_WORDS.has(w) && !nameTokens.has(w));

  const unique = [...new Set(words)].slice(0, 5);
  if (unique.length >= 3) return unique;

  // Fill up to 3 from industry defaults
  const defaults = INDUSTRY_DEFAULTS[industry];
  const combined = [...new Set([...unique, ...defaults])].slice(0, 3);
  return combined;
}

// ─── Free API fetchers ─────────────────────────────────────────────────────

interface DdgResult {
  abstract: string;
  infoboxIndustry: string | null;
}

interface WikiResult {
  description: string | null;
  extract: string | null;
}

async function fetchDuckDuckGo(companyName: string): Promise<DdgResult> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const url =
      `https://api.duckduckgo.com/?q=${encodeURIComponent(companyName)}+company` +
      `&format=json&no_html=1&skip_disambig=1`;

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return { abstract: '', infoboxIndustry: null };

    const data = (await res.json()) as {
      AbstractText?: string;
      Infobox?: { content?: Array<{ label: string; value: string }> };
    };

    const abstract = data.AbstractText ?? '';
    let infoboxIndustry: string | null = null;

    // Prefer "Industry" or "Sector" labels; skip generic "Type" (usually "Public"/"Private")
    const infoboxContent = data.Infobox?.content ?? [];
    for (const entry of infoboxContent) {
      if (/^(industry|sector)$/i.test(entry.label)) {
        infoboxIndustry = entry.value;
        break;
      }
    }

    return { abstract, infoboxIndustry };
  } catch {
    return { abstract: '', infoboxIndustry: null };
  }
}

async function fetchWikipedia(companyName: string): Promise<WikiResult> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const url =
      `https://en.wikipedia.org/api/rest_v1/page/summary/` +
      encodeURIComponent(companyName);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return { description: null, extract: null };

    const data = (await res.json()) as {
      description?: string;
      extract?: string;
    };

    return {
      description: data.description ?? null,
      extract: data.extract ?? null,
    };
  } catch {
    return { description: null, extract: null };
  }
}

// ─── Main generation ────────────────────────────────────────────────────────

async function generateFromWeb(companyName: string, version: string): Promise<GeneratedConfig> {
  const [ddg, wiki] = await Promise.all([
    fetchDuckDuckGo(companyName),
    fetchWikipedia(companyName),
  ]);

  const description =
    ddg.abstract || wiki.extract || `${companyName} is a company.`;

  const industryText =
    ddg.infoboxIndustry || ddg.abstract || wiki.description || description;

  const industryCategory = detectIndustryCategory(industryText);
  const mood = INDUSTRY_MOOD[industryCategory];
  const hash = nameHash(companyName.toLowerCase());
  const energyLevel = +(0.3 + (hash % 60) / 100).toFixed(2);
  const rawColors = deriveColors(industryCategory, hash);
  const colors = {
    primary:    ensureMinLightness(rawColors.primary),
    secondary:  ensureMinLightness(rawColors.secondary),
    accent:     ensureMinLightness(rawColors.accent),
    background: rawColors.background,
  };
  const animationStyle = selectAnimationStyle(version, industryCategory);
  const animationParams = MOOD_PARAMS[mood];
  const visualElements = extractVisualElements(description, companyName, industryCategory);
  const tagline = deriveTagline(description);

  return {
    companyName,
    colors,
    tagline,
    industry: industryCategory,
    description: description.slice(0, 200),
    mood,
    industryCategory,
    energyLevel,
    animationStyle,
    animationParams,
    visualElements,
    version,
  };
}

// ─── Sanitisation (kept for cached value round-trips) ──────────────────────

const RATE_LIMIT_MAP = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 10;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = RATE_LIMIT_MAP.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);
  if (recent.length >= RATE_LIMIT_MAX) return false;
  recent.push(now);
  RATE_LIMIT_MAP.set(ip, recent);
  return true;
}

function corsHeaders(origin: string, allowedOrigins: string): HeadersInit {
  const allowed = allowedOrigins.split(',').map((o) => o.trim());
  const isLocalhost = origin.startsWith('http://localhost');
  const isAllowed = isLocalhost || allowed.includes(origin);

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : '',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function jsonResponse(data: unknown, status: number, headers: HeadersInit): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

const VALID_MOODS: CompanyMood[] = ['bold', 'elegant', 'playful', 'minimal', 'dynamic'];
const VALID_INDUSTRY_CATEGORIES: IndustryCategory[] = [
  'tech', 'finance', 'health', 'retail', 'creative',
  'food', 'education', 'hospitality', 'other',
];
const VALID_ANIMATION_STYLES: AnimationStyle[] = [
  'particles', 'flowing', 'geometric', 'typographic', 'narrative',
  'timeline', 'constellation', 'spotlight', 'orbit', 'pulse', 'signal',
];

function sanitizeMood(value: unknown): CompanyMood {
  return VALID_MOODS.includes(value as CompanyMood) ? (value as CompanyMood) : 'dynamic';
}

function sanitizeIndustryCategory(value: unknown): IndustryCategory {
  return VALID_INDUSTRY_CATEGORIES.includes(value as IndustryCategory)
    ? (value as IndustryCategory)
    : 'other';
}

function clampEnergyLevel(value: unknown): number {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return 0.6;
  if (numeric < 0) return 0;
  if (numeric > 1) return 1;
  return numeric;
}

function sanitizeAnimationStyle(value: unknown): AnimationStyle {
  return VALID_ANIMATION_STYLES.includes(value as AnimationStyle)
    ? (value as AnimationStyle)
    : 'particles';
}

function sanitizeVisualElements(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim().slice(0, 12))
    .filter((item) => item.length > 0);
}

function sanitizeGeneratedConfig(raw: unknown, version: string): GeneratedConfig {
  const candidate = (raw ?? {}) as Partial<GeneratedConfig>;

  return {
    companyName: typeof candidate.companyName === 'string' ? candidate.companyName : '',
    colors: {
      primary: candidate.colors?.primary ?? '#8eff71',
      secondary: candidate.colors?.secondary ?? '#8ff5ff',
      accent: candidate.colors?.accent ?? '#ffd709',
      background: candidate.colors?.background ?? '#0e0e0e',
    },
    tagline: typeof candidate.tagline === 'string' ? candidate.tagline : '',
    industry: typeof candidate.industry === 'string' ? candidate.industry : 'Unknown',
    description: typeof candidate.description === 'string' ? candidate.description : '',
    mood: sanitizeMood(candidate.mood),
    industryCategory: sanitizeIndustryCategory(candidate.industryCategory),
    energyLevel: clampEnergyLevel(candidate.energyLevel),
    animationStyle: sanitizeAnimationStyle(candidate.animationStyle),
    animationParams: {
      speed: Number(candidate.animationParams?.speed ?? 1),
      density: Number(candidate.animationParams?.density ?? 0.7),
      complexity: Number(candidate.animationParams?.complexity ?? 0.8),
    },
    visualElements: sanitizeVisualElements(candidate.visualElements),
    version,
  };
}

// ─── Route handlers ─────────────────────────────────────────────────────────

async function handleGenerate(request: Request, env: Env, headers: HeadersInit): Promise<Response> {
  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return jsonResponse({ error: 'Rate limit exceeded. Try again in a minute.' }, 429, headers);
  }

  let companyName: string;
  let version = 'v1';
  try {
    const body = (await request.json()) as { companyName?: string; version?: string };
    companyName = (body.companyName ?? '').trim();
    version = (body.version ?? 'v1').trim() || 'v1';
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400, headers);
  }

  if (!companyName || companyName.length > 100) {
    return jsonResponse({ error: 'Company name is required (max 100 characters)' }, 400, headers);
  }

  try {
    const config = await generateFromWeb(companyName, version);

    const key = cacheKey(companyName, version);
    await env.CONFIG_CACHE.put(key, JSON.stringify(config), { expirationTtl: 604800 });

    return jsonResponse(config, 200, headers);
  } catch (err) {
    console.error('Worker error:', err instanceof Error ? err.message : err);
    return jsonResponse({ error: 'Internal server error' }, 500, headers);
  }
}

async function handleGetConfig(
  companySlug: string,
  request: Request,
  env: Env,
  headers: HeadersInit,
): Promise<Response> {
  const url = new URL(request.url);
  const version = url.searchParams.get('version') ?? 'v1';
  const key = cacheKey(companySlug, version);

  const cached = await env.CONFIG_CACHE.get(key);
  if (cached) {
    const cachedConfig = sanitizeGeneratedConfig(JSON.parse(cached) as unknown, version);
    return new Response(JSON.stringify(cachedConfig), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json', 'X-Cache': 'HIT' },
    });
  }

  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return jsonResponse({ error: 'Rate limit exceeded. Try again in a minute.' }, 429, headers);
  }

  const companyName = decodeURIComponent(companySlug).replace(/-/g, ' ');
  if (!companyName || companyName.length > 100) {
    return jsonResponse({ error: 'Invalid company name' }, 400, headers);
  }

  try {
    const config = await generateFromWeb(companyName, version);
    const configJson = JSON.stringify(config);

    await env.CONFIG_CACHE.put(key, configJson, { expirationTtl: 604800 });

    return new Response(configJson, {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json', 'X-Cache': 'MISS' },
    });
  } catch (err) {
    console.error('Config error:', err instanceof Error ? err.message : err);
    return jsonResponse({ error: 'Failed to generate config' }, 502, headers);
  }
}

async function handleCheckout(request: Request, env: Env, headers: HeadersInit): Promise<Response> {
  try {
    const body = (await request.json()) as {
      config: unknown;
      version: string;
      returnUrl: string;
      exportType?: 'video' | 'html';
    };

    if (!body.config || !body.returnUrl) {
      return jsonResponse({ error: 'Missing config or returnUrl' }, 400, headers);
    }

    const config = body.config as { companyName?: string };
    const result = await createCheckoutSession(env.STRIPE_SECRET_KEY, {
      companyName: config.companyName ?? 'Unknown',
      config: JSON.stringify(body.config),
      version: body.version ?? 'v1',
      returnUrl: body.returnUrl,
      exportType: body.exportType,
    });

    return jsonResponse(result, 200, headers);
  } catch (err) {
    console.error('Checkout error:', err);
    return jsonResponse({ error: 'Failed to create checkout session' }, 500, headers);
  }
}

async function handleDownload(request: Request, env: Env, headers: HeadersInit): Promise<Response> {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('session_id');

  if (!sessionId) {
    return jsonResponse({ error: 'Missing session_id' }, 400, headers);
  }

  try {
    const result = await verifyAndGetConfig(env.STRIPE_SECRET_KEY, sessionId);

    if (!result.paid) {
      return jsonResponse({ error: 'Payment not completed' }, 402, headers);
    }

    return jsonResponse(
      {
        config: result.config,
        version: result.version,
        ...(result.exportType ? { exportType: result.exportType } : {}),
      },
      200,
      headers,
    );
  } catch (err) {
    console.error('Download error:', err);
    return jsonResponse({ error: 'Failed to verify payment' }, 500, headers);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin') ?? '';
    const headers = corsHeaders(origin, env.ALLOWED_ORIGINS);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/checkout' && request.method === 'POST') {
      return handleCheckout(request, env, headers);
    }

    if (path === '/download' && request.method === 'GET') {
      return handleDownload(request, env, headers);
    }

    if (path.startsWith('/config/') && request.method === 'GET') {
      const companySlug = path.slice('/config/'.length);
      if (!companySlug) return jsonResponse({ error: 'Missing company name' }, 400, headers);
      return handleGetConfig(companySlug, request, env, headers);
    }

    if ((path === '/' || path === '') && request.method === 'POST') {
      return handleGenerate(request, env, headers);
    }

    return jsonResponse({ error: 'Not found' }, 404, headers);
  },
};
