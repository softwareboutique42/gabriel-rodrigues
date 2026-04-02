import { createCheckoutSession, verifyAndGetConfig } from './stripe';
import { cacheKey } from './normalize';

interface Env {
  ANTHROPIC_API_KEY: string;
  STRIPE_SECRET_KEY: string;
  ALLOWED_ORIGINS: string;
  CONFIG_CACHE: KVNamespace;
}

type CompanyMood = 'bold' | 'elegant' | 'playful' | 'minimal' | 'dynamic';
type IndustryCategory = 'tech' | 'finance' | 'health' | 'retail' | 'creative' | 'food' | 'other';

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
  animationStyle:
    | 'particles'
    | 'flowing'
    | 'geometric'
    | 'typographic'
    | 'narrative'
    | 'timeline'
    | 'constellation'
    | 'spotlight';
  animationParams: {
    speed: number;
    density: number;
    complexity: number;
  };
  visualElements: string[];
  version?: string;
};

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

  // Allow any localhost origin for development
  const isLocalhost = origin.startsWith('http://localhost');
  const isAllowed = isLocalhost || allowed.includes(origin);

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : '',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

const SYSTEM_PROMPT = `You are a brand identity and motion graphics expert. Given a company name and requested version family, infer brand semantics and return a structured animation config.

Return ONLY valid JSON with this exact schema — no markdown, no explanation:

{
  "companyName": "<string>",
  "colors": {
    "primary": "<hex>",
    "secondary": "<hex>",
    "accent": "<hex>",
    "background": "<hex>"
  },
  "tagline": "<string, max 60 chars>",
  "industry": "<string>",
  "description": "<string, 1-2 sentences about what the company does>",
  "mood": "<one of: bold | elegant | playful | minimal | dynamic>",
  "industryCategory": "<one of: tech | finance | health | retail | creative | food | other>",
  "energyLevel": <number 0.0-1.0>,
  "animationStyle": "<one of: particles | flowing | geometric | typographic | narrative | timeline | constellation | spotlight>",
  "animationParams": {
    "speed": <number 0.5-2.0>,
    "density": <number 0.3-1.0>,
    "complexity": <number 0.3-1.0>
  },
  "visualElements": ["<3-5 keywords max 12 chars each describing what the company does>"]
}

Use mood and industryCategory as semantic axes. Keep animationStyle as a best-effort suggestion only; client routing may overwrite it deterministically.
Use real brand colors if the company is well-known. For unknown companies, infer appropriate colors from the name and likely industry.`;

function jsonResponse(data: unknown, status: number, headers: HeadersInit): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

const VALID_MOODS: CompanyMood[] = ['bold', 'elegant', 'playful', 'minimal', 'dynamic'];
const VALID_INDUSTRY_CATEGORIES: IndustryCategory[] = [
  'tech',
  'finance',
  'health',
  'retail',
  'creative',
  'food',
  'other',
];
const VALID_ANIMATION_STYLES: GeneratedConfig['animationStyle'][] = [
  'particles',
  'flowing',
  'geometric',
  'typographic',
  'narrative',
  'timeline',
  'constellation',
  'spotlight',
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

function sanitizeAnimationStyle(value: unknown): GeneratedConfig['animationStyle'] {
  return VALID_ANIMATION_STYLES.includes(value as GeneratedConfig['animationStyle'])
    ? (value as GeneratedConfig['animationStyle'])
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

async function callClaudeForConfig(
  companyName: string,
  version: string,
  env: Env,
): Promise<object> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Generate brand identity and animation config for: ${companyName}. Requested style family version: ${version}.`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Claude API error:', response.status, errorText);
    throw new Error(`AI generation failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    content: Array<{ type: string; text?: string }>;
  };
  const textBlock = data.content.find((b) => b.type === 'text');
  if (!textBlock?.text) {
    throw new Error('Empty AI response');
  }

  let cleaned = textBlock.text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }
  return JSON.parse(cleaned) as object;
}

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
    const rawConfig = await callClaudeForConfig(companyName, version, env);
    const config = sanitizeGeneratedConfig(rawConfig, version);

    // Cache the result for future GET /config/ requests
    const key = cacheKey(companyName, version);
    await env.CONFIG_CACHE.put(key, JSON.stringify(config), { expirationTtl: 604800 });

    return jsonResponse(config, 200, headers);
  } catch (err) {
    console.error('Worker error:', err instanceof Error ? err.message : err);
    if (err instanceof Error && err.message.startsWith('AI generation failed')) {
      return jsonResponse({ error: 'AI generation failed' }, 502, headers);
    }
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

  // Check cache first
  const cached = await env.CONFIG_CACHE.get(key);
  if (cached) {
    const cachedConfig = sanitizeGeneratedConfig(JSON.parse(cached) as unknown, version);
    return new Response(JSON.stringify(cachedConfig), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json', 'X-Cache': 'HIT' },
    });
  }

  // Cache miss — rate limit and generate
  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return jsonResponse({ error: 'Rate limit exceeded. Try again in a minute.' }, 429, headers);
  }

  const companyName = decodeURIComponent(companySlug).replace(/-/g, ' ');
  if (!companyName || companyName.length > 100) {
    return jsonResponse({ error: 'Invalid company name' }, 400, headers);
  }

  try {
    const rawConfig = await callClaudeForConfig(companyName, version, env);
    const config = sanitizeGeneratedConfig(rawConfig, version);
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

    // Route: POST /checkout
    if (path === '/checkout' && request.method === 'POST') {
      return handleCheckout(request, env, headers);
    }

    // Route: GET /download
    if (path === '/download' && request.method === 'GET') {
      return handleDownload(request, env, headers);
    }

    // Route: GET /config/:company
    if (path.startsWith('/config/') && request.method === 'GET') {
      const companySlug = path.slice('/config/'.length);
      if (!companySlug) return jsonResponse({ error: 'Missing company name' }, 400, headers);
      return handleGetConfig(companySlug, request, env, headers);
    }

    // Route: POST / (generate — original endpoint)
    if ((path === '/' || path === '') && request.method === 'POST') {
      return handleGenerate(request, env, headers);
    }

    return jsonResponse({ error: 'Not found' }, 404, headers);
  },
};
