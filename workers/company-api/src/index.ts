import { createCheckoutSession, verifyAndGetConfig } from './stripe';
import { cacheKey } from './normalize';

interface Env {
  ANTHROPIC_API_KEY: string;
  STRIPE_SECRET_KEY: string;
  ALLOWED_ORIGINS: string;
  CONFIG_CACHE: KVNamespace;
}

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
  const isAllowed = allowed.includes(origin);
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : '',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

const SYSTEM_PROMPT = `You are a brand identity and motion graphics expert. Given a company name, infer their brand identity and recommend a canvas animation style.

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
  "animationStyle": "<one of: particles | flowing | geometric | typographic | narrative | timeline | constellation | spotlight>",
  "animationParams": {
    "speed": <number 0.5-2.0>,
    "density": <number 0.3-1.0>,
    "complexity": <number 0.3-1.0>
  },
  "visualElements": ["<3-5 keywords describing what the company does — used as visible text in story animations>"]
}

Animation style selection guide:

v1 — Classic (abstract patterns):
- "particles": tech, SaaS, AI, startups — dynamic particle systems
- "flowing": logistics, health, nature, food — organic flowing shapes
- "geometric": finance, enterprise, consulting — structured geometric patterns
- "typographic": media, creative agencies, entertainment — bold type animations

v2 — Story (text-driven, tells what the company does):
- "narrative": brands with a strong mission or story — words appear one by one as cinematic captions
- "timeline": companies with milestones or multi-step processes — horizontal timeline with labeled nodes
- "constellation": companies with interconnected services or ecosystems — star-map with labeled nodes
- "spotlight": bold brands or product launches — large centered text cycling with cinematic zoom

Prefer v2 styles when the company has a clear story to tell. Use v1 for abstract branding.
The "visualElements" array is critical for v2 styles — each keyword becomes visible text in the animation.

Use real brand colors if the company is well-known. For unknown companies, infer appropriate colors from the name and likely industry.`;

function jsonResponse(data: unknown, status: number, headers: HeadersInit): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

async function callClaudeForConfig(companyName: string, env: Env): Promise<object> {
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
          content: `Generate brand identity and animation config for: ${companyName}`,
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
  try {
    const body = (await request.json()) as { companyName?: string };
    companyName = (body.companyName ?? '').trim();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400, headers);
  }

  if (!companyName || companyName.length > 100) {
    return jsonResponse({ error: 'Company name is required (max 100 characters)' }, 400, headers);
  }

  try {
    const config = await callClaudeForConfig(companyName, env);

    // Cache the result for future GET /config/ requests
    const key = cacheKey(companyName);
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
    return new Response(cached, {
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
    const config = await callClaudeForConfig(companyName, env);
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

    return jsonResponse({ config: result.config, version: result.version }, 200, headers);
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
