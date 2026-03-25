---
title: 'AI-Powered Frontend: Shipping Claude-Generated Code to Production'
description: 'Practical lessons from using Claude API as a backend service — prompt engineering, structured output, error handling, and the Worker proxy pattern.'
date: 2026-03-25
tags: ['ai', 'claude', 'cloudflare', 'architecture']
lang: 'en'
---

# AI-Powered Frontend: Shipping Claude-Generated Code to Production

Most tutorials show you how to build a chatbot. This post is about something different: using an LLM as a structured backend service that powers a real-time frontend experience.

## Claude as a JSON API

When you think of AI APIs, you probably think of chat interfaces. But Claude is equally powerful as a structured data generator. In Company Canvas, Claude acts as a brand analysis engine:

**Input:** `"Spotify"`

**Output:**

```json
{
  "companyName": "Spotify",
  "colors": {
    "primary": "#1DB954",
    "secondary": "#191414",
    "accent": "#1ED760",
    "background": "#0a0a0a"
  },
  "tagline": "Music for everyone",
  "industry": "Music Streaming",
  "animationStyle": "flowing",
  "animationParams": { "speed": 1.2, "density": 0.7, "complexity": 0.6 }
}
```

No conversation history, no streaming, no follow-ups. One request, one JSON response. The LLM is a function.

## Prompt Engineering for Reliability

The biggest challenge isn't getting Claude to generate good data — it's getting it to generate **consistent** data. Here's what worked:

### 1. Explicit schema in the prompt

Don't describe the output informally. Paste the exact JSON schema with types and constraints. Claude follows concrete examples far better than abstract descriptions.

### 2. Decision criteria, not vibes

Instead of "pick an appropriate style", I provide a mapping table:

- `particles` → tech, SaaS, AI
- `flowing` → health, nature, logistics
- `geometric` → finance, enterprise
- `typographic` → media, creative

This eliminates ambiguity and makes results predictable.

### 3. "Return ONLY valid JSON"

This one instruction eliminates markdown code fences, explanatory text, and apologies. Claude respects it almost perfectly.

### 4. Bounded numeric ranges

`"speed": <number 0.5-2.0>` is better than `"speed": <number>`. Without bounds, you occasionally get extreme values that break animations.

## The Worker Proxy Pattern

Never expose API keys in client-side code. This should be obvious, but I've seen it in production. The pattern:

```
Browser → Cloudflare Worker → Claude API
         (rate limit, validate, proxy)
```

The Worker does three things:

1. **Rate limiting** — 10 requests per minute per IP. Simple in-memory map with timestamp arrays.
2. **Input validation** — Company name must exist and be under 100 characters.
3. **API proxying** — Forwards to Claude, parses the response, returns clean JSON.

Cloudflare Workers run on the edge, so latency is low regardless of where your users are. The free tier handles thousands of daily requests.

## Handling AI Unpredictability

LLMs are probabilistic. Even with a perfect prompt, things can go wrong:

**Malformed JSON:** Rarely, Claude might return JSON with a trailing comma or missing quote. I wrap `JSON.parse` in try/catch and return a 502 to the client, which shows a friendly "generation failed" message.

**Unexpected values:** What if Claude returns `"animationStyle": "abstract"` — a style that doesn't exist in my registry? The factory pattern handles this with a fallback: `registry[style] ?? ParticlesAnimation`. Unknown styles gracefully degrade to particles.

**Latency variance:** Claude responses range from 1-4 seconds. The UI shows a loading animation with a progress bar that moves at a fixed pace. Users don't see the actual API latency — they see smooth feedback.

## The Cost Question

Claude API calls cost money. For a portfolio project, I needed the economics to work:

- Each generation uses ~400 input tokens and ~300 output tokens
- At Claude Sonnet pricing, that's roughly $0.002 per generation
- A $1 download fee covers ~500 generations

The math works. Even with generous free previews, the paid downloads more than cover API costs. The Stripe integration uses a simple checkout session — no subscriptions, no recurring billing. One dollar, one download.

## What Would I Do Differently?

**Add caching.** Right now, generating "Spotify" twice makes two API calls with slightly different results. A simple KV cache keyed by company name would save money and give consistent results.

**Stream the response.** Three seconds of loading is fine, but streaming the JSON fields as they arrive could let the animation start building before the response is complete. The UI could show colors appearing, then the tagline, then the animation spinning up.

**Use tool_use.** Claude's tool calling feature would let me define the output schema more formally, with guaranteed JSON output. I built this before tool_use was mature, but it's the right choice now.

Building with AI APIs taught me that the interesting problems aren't in the AI — they're in the engineering around it. Rate limiting, error handling, cost management, and UX design matter just as much as the prompt.
