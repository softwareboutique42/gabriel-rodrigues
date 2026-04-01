# External Integrations

**Analysis Date:** 2026-04-01

## APIs & External Services

**AI / Machine Learning:**

- Anthropic Claude API - Brand identity and animation config generation for the Canvas feature
  - Endpoint: `https://api.anthropic.com/v1/messages`
  - Model: `claude-sonnet-4-20250514`
  - Auth: `ANTHROPIC_API_KEY` (Cloudflare Worker secret, set via `wrangler secret put`)
  - Called from: `workers/company-api/src/index.ts` (`callClaudeForConfig`)
  - Note: `@anthropic-ai/sdk` is listed in `workers/company-api/package.json` but the worker uses raw `fetch` to the REST API, not the SDK

**Payments:**

- Stripe - One-time payments ($1.00 USD) for Canvas animation downloads
  - Endpoint: `https://api.stripe.com/v1/checkout/sessions`
  - Auth: `STRIPE_SECRET_KEY` (Cloudflare Worker secret); publishable key stored as plain var in `workers/company-api/wrangler.toml`
  - Implementation: `workers/company-api/src/stripe.ts` — uses raw `fetch` (no Stripe SDK)
  - Flow: `POST /checkout` creates a session; `GET /download?session_id=...` verifies payment and returns config

**Analytics:**

- Google Tag Manager (GTM-PJMHB5GM) - Page tracking
  - Injected inline in `src/layouts/BaseLayout.astro` (GTM snippet + noscript fallback)
  - No server-side component; client-side only

**Advertising:**

- Google AdSense (ca-pub-9809167954901529) - Display ads
  - Script injected inline in `src/layouts/BaseLayout.astro`
  - Loads `pagead2.googlesyndication.com/pagead/js/adsbygoogle.js`

## Data Storage

**Databases:**

- None - The site is fully static with no application database

**Cloudflare KV:**

- Namespace: `CONFIG_CACHE` (binding name), KV id `4ad154bfd20a4e7bbbfdee395f886a29`
- Configured in `workers/company-api/wrangler.toml`
- Purpose: Cache Claude-generated brand configs keyed by company slug + version
- TTL: 604800 seconds (7 days)
- Used in: `workers/company-api/src/index.ts` (read in `handleGetConfig`, write in `handleGenerate` and `handleGetConfig`)

**File Storage:**

- Static assets served from `public/` — `favicon.svg`, `favicon.ico`, `manifest.json`, `resume.pdf`, `sw.js`, etc.
- OG images generated at build time and written to `dist/og/{lang}/blog/{slug}.png`

**Caching:**

- Cloudflare KV for brand config caching (see above)
- Service worker (`public/sw.js`) registered client-side for offline support

## Authentication & Identity

**Auth Provider:**

- None — no user authentication in the main site

**Payment Identity:**

- Stripe Checkout handles payment identity; config is stored in Stripe session metadata and retrieved via session ID after payment

## Monitoring & Observability

**Error Tracking:**

- None detected — no Sentry, Datadog, or similar service integrated

**Logs:**

- Cloudflare Worker uses `console.error()` for server-side error logging (`workers/company-api/src/index.ts`)
- Client-side errors are untracked beyond GTM/AdSense

## CI/CD & Deployment

**Hosting:**

- GitHub Pages — static site output from `npm run build` (Astro static output to `dist/`)
- CNAME file at `public/CNAME` points to `gabriel-rodrigues.com`
- Cloudflare Worker deployed separately via `wrangler deploy` (manual or separate workflow)

**CI Pipeline:**

- GitHub Actions — `.github/workflows/deploy.yml`
- Trigger: push to `main` branch or manual `workflow_dispatch`
- Steps: checkout → Node 22 setup → `npm ci` → `npx astro build` → upload artifact → deploy to GitHub Pages
- No test step in CI; tests are expected to be run locally

## Environment Configuration

**Required env vars (Cloudflare Worker — set via `wrangler secret put`):**

- `ANTHROPIC_API_KEY` — Anthropic API access for brand config generation
- `STRIPE_SECRET_KEY` — Stripe payment session creation and verification

**Plain vars (in `workers/company-api/wrangler.toml`):**

- `ALLOWED_ORIGINS` — CORS allowlist: `https://gabriel-rodrigues.com,http://localhost:4321`
- `STRIPE_PUBLISHABLE_KEY` — Stripe public key (safe to commit)

**Main site:**

- No runtime environment variables required — fully static build

**Secrets location:**

- Worker secrets stored in Cloudflare's secret manager; referenced by name in `workers/company-api/src/index.ts` via the `Env` interface

## Webhooks & Callbacks

**Incoming:**

- None — static site has no incoming webhook endpoints

**Outgoing:**

- Stripe Checkout success/cancel URLs redirect back to the Canvas page with `?session_id={CHECKOUT_SESSION_ID}` appended — handled client-side
- No server-initiated outbound webhooks

## SEO & Social Integrations

**Open Graph / Twitter Cards:**

- OG images generated at build time via `src/pages/og/[...slug].png.ts` using `satori` + `sharp`
- Image served at `/og/{lang}/blog/{slug}.png`; referenced from `src/layouts/BlogPostLayout.astro`
- Twitter card type: `summary_large_image` when OG image is present, else `summary`

**RSS Feeds:**

- `@astrojs/rss` generates feeds at `/rss.xml` (EN) and `/pt/rss.xml` (PT)
- Page source: `src/pages/en/rss.xml.ts` and `src/pages/pt/rss.xml.ts`

**Sitemap:**

- `@astrojs/sitemap` auto-generates `/sitemap-index.xml` at build time

**Schema.org:**

- JSON-LD `Person` schema injected in `src/layouts/BaseLayout.astro` linking to LinkedIn and GitHub profiles

**PWA:**

- `public/manifest.json` — web app manifest
- `public/sw.js` — service worker registered in `BaseLayout.astro` for offline support

---

_Integration audit: 2026-04-01_
