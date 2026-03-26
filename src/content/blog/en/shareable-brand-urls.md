---
title: 'Shareable Brand URLs with KV Caching and XSS Hardening'
description: 'How I added branded shareable links to Company Canvas — with Cloudflare KV caching to cut API costs and a security fix I almost missed.'
date: 2026-03-26
tags: ['cloudflare', 'security', 'canvas', 'architecture']
lang: 'en'
---

# Shareable Brand URLs with KV Caching and XSS Hardening

After launching [Company Canvas](/en/canvas/), people wanted to share their results. Someone generates a Spotify animation, and they want to send the link to a friend — but the URL was just `/en/canvas/` with no state. Refresh the page, animation's gone.

I needed three things: shareable URLs that load a specific brand, caching so the same company doesn't burn an API call every time someone opens the link, and — as I discovered mid-build — a security fix in the rendering code.

## The Static Site Problem

The site is built with Astro in static mode and deployed to GitHub Pages. There's no server to handle dynamic routes. A path like `/en/canvas/spotify` would just 404 because there's no `spotify/index.html` file.

Two options:

1. **Query parameters**: `/en/canvas/?company=spotify` — works natively, no routing tricks needed.
2. **Pretty URLs via 404.html**: `/en/canvas/spotify` → GitHub Pages serves 404.html → JS detects the pattern → redirects to the query param version.

I did both. The canonical URL uses query params (reliable, works everywhere), and the pretty URL is a progressive enhancement handled by a tiny 404 page:

```javascript
var match = path.match(/^\/(en|pt)\/canvas\/([^/]+)\/?$/);
if (match) {
  window.location.replace('/' + lang + '/canvas/?company=' + encodeURIComponent(company));
  return;
}
window.location.replace('/');
```

No Astro layout, no styles, no framework overhead — just a redirect. If the URL doesn't match the canvas pattern, it bounces to the homepage.

## KV Caching: Don't Call Claude Twice for the Same Brand

Every time someone generates a canvas, the Worker calls the Claude API (~$0.002 per request). Not expensive individually, but if a Spotify link gets shared on social media and 500 people click it, that's 500 API calls for the same result.

Cloudflare KV is perfect here — globally distributed key-value storage with millisecond reads. The flow:

1. **POST /** (manual generation): call Claude, cache the result in KV, return to client.
2. **GET /config/:company** (branded URL): check KV first. Cache hit → return immediately with `X-Cache: HIT`. Cache miss → call Claude, cache, return with `X-Cache: MISS`.

```typescript
const cached = await env.CONFIG_CACHE.get(key);
if (cached) {
  return new Response(cached, {
    headers: { ...headers, 'X-Cache': 'HIT' },
  });
}
```

The cache key includes a normalized company name and version: `v1:v1:spotify`. Normalization strips special characters and collapses whitespace to hyphens, so "Spotify!", "spotify", and " SPOTIFY " all hit the same cache entry.

One subtle bug I caught: the initial implementation used fire-and-forget for the KV write — `env.CONFIG_CACHE.put(key, data).catch(() => {})`. On Cloudflare Workers, if you don't `await` a promise, the runtime can terminate before it completes. The cache was never being written. The fix was simply `await`:

```typescript
await env.CONFIG_CACHE.put(key, configJson, { expirationTtl: 604800 });
```

Seven-day TTL means brand configs refresh weekly. Long enough to be useful, short enough that if a company rebrands, the animation eventually updates.

## The XSS I Almost Shipped

While refactoring the client-side code to support branded URLs, I noticed this in the `renderInfo` function:

```typescript
// Before (vulnerable)
swatch.innerHTML = `<span style="background:${hex}">...${hex}</span>`;
```

The `hex` value comes from the API response — which comes from Claude's output. If someone manipulates the response or the AI returns malformed data, that's a direct XSS injection point. A color value like `"><script>alert(1)</script>` would execute in the user's browser.

The fix was switching to DOM API methods and adding validation:

```typescript
function isValidHex(color: string): boolean {
  return /^#[0-9a-fA-F]{3,8}$/.test(color);
}

const colorBox = document.createElement('span');
if (isValidHex(hex)) colorBox.style.background = hex;

const label = document.createElement('span');
label.textContent = `${name}: ${hex}`; // textContent, not innerHTML
```

`textContent` escapes HTML automatically. The `isValidHex` check ensures only actual hex colors reach `style.background`. No sanitization library needed — just using the right DOM APIs.

This is the kind of bug that passes every happy-path test. The AI always returns valid hex colors, so you'd never see it fail during development. But security isn't about what happens when things work correctly.

## Brand Theming: Make the Whole Page Match

With branded URLs, the user lands on a page that already shows the company's animation. But the rest of the UI — buttons, borders, glows — still uses the default neon green theme. It felt disconnected.

The site already uses CSS custom properties for theming (`--color-neon`, `--color-cyan`, `--color-gold`). Overriding them at the document root instantly themes the entire page:

```typescript
function applyBrandTheme(config: CompanyConfig): void {
  const root = document.documentElement;
  root.style.setProperty('--color-neon', config.colors.primary);
  root.style.setProperty('--color-cyan', config.colors.secondary);
  root.style.setProperty('--color-gold', config.colors.accent);
}
```

Generate Coca-Cola → the whole page turns red. Click Retry → `resetBrandTheme()` removes the overrides and the defaults come back. No class toggling, no style recalculation — just five CSS property changes.

## The Share Button

The simplest part, but the one that ties everything together:

```typescript
getEl('canvas-share')?.addEventListener('click', () => {
  navigator.clipboard.writeText(window.location.href).then(() => {
    const btn = getEl('canvas-share');
    const orig = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => {
      btn.textContent = orig;
    }, 2000);
  });
});
```

After generating or loading a branded canvas, the URL already contains `?company=spotify`. The Share button copies it. The recipient opens it, KV cache serves the config instantly, and they see the same animation — no payment required (downloads are still gated by Stripe).

## Trade-offs and Future Improvements

- **404.html redirect adds a flash** — users see a blank page for a split second before the redirect fires. A service worker could intercept the request and rewrite it client-side without the redirect.
- **KV is eventually consistent** — a config written in one region might not be readable in another for a few seconds. For this use case, that's fine. Users generating and sharing aren't racing across continents.
- **No cache invalidation** — if the AI generates a bad config, it's stuck in KV for 7 days. Adding a purge endpoint or admin tool would be the natural next step.
- **The `isValidHex` regex allows 4-8 character hex** — this technically permits `#RRGGBBAA` (with alpha), which is valid CSS but unusual for brand colors. A stricter check could enforce exactly 3 or 6 hex digits.

The bigger lesson: every feature that touches external data — even from your own AI — needs to be treated as untrusted input. The XSS vector was invisible in normal use, but it's exactly the kind of thing an attacker would probe for.
