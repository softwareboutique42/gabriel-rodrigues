interface Env {
  ANTHROPIC_API_KEY: string;
  ALLOWED_ORIGINS: string;
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
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
  "animationStyle": "<one of: particles | flowing | geometric | typographic>",
  "animationParams": {
    "speed": <number 0.5-2.0>,
    "density": <number 0.3-1.0>,
    "complexity": <number 0.3-1.0>
  },
  "visualElements": ["<3-5 keywords for visual motifs>"]
}

Animation style selection guide:
- "particles": tech, SaaS, AI, startups — dynamic particle systems
- "flowing": logistics, health, nature, food — organic flowing shapes
- "geometric": finance, enterprise, consulting — structured geometric patterns
- "typographic": media, creative agencies, entertainment — bold type animations

Use real brand colors if the company is well-known. For unknown companies, infer appropriate colors from the name and likely industry.`;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin') ?? '';
    const headers = corsHeaders(origin, env.ALLOWED_ORIGINS);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    if (!checkRateLimit(ip)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Try again in a minute.' }),
        {
          status: 429,
          headers: { ...headers, 'Content-Type': 'application/json' },
        },
      );
    }

    let companyName: string;
    try {
      const body = (await request.json()) as { companyName?: string };
      companyName = (body.companyName ?? '').trim();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    if (!companyName || companyName.length > 100) {
      return new Response(
        JSON.stringify({ error: 'Company name is required (max 100 characters)' }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } },
      );
    }

    try {
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
        return new Response(JSON.stringify({ error: 'AI generation failed' }), {
          status: 502,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }

      const data = (await response.json()) as {
        content: Array<{ type: string; text?: string }>;
      };
      const textBlock = data.content.find((b) => b.type === 'text');
      if (!textBlock?.text) {
        return new Response(JSON.stringify({ error: 'Empty AI response' }), {
          status: 502,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }

      const config = JSON.parse(textBlock.text);

      return new Response(JSON.stringify(config), {
        status: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.error('Worker error:', err);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }
  },
};
