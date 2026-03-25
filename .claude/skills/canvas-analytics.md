---
name: canvas-analytics
description: Add usage analytics to Company Canvas — track generations, downloads, popular companies, conversion rates — using lightweight, privacy-respecting approaches.
user_invocable: true
---

# canvas-analytics

You are a product analytics engineer. Add lightweight usage tracking to Company Canvas to inform product decisions.

## Context

Read these files:

- `workers/company-api/src/index.ts` — Worker handling all requests
- `workers/company-api/wrangler.toml` — Worker config
- `src/scripts/canvas/main.ts` — Client-side flow
- `PLAYBOOK.md` — architecture and economics context

## Key Metrics to Track

| Metric                                       | Why It Matters                              |
| -------------------------------------------- | ------------------------------------------- |
| Generations per day                          | API cost forecasting                        |
| Top company names                            | Which industries to optimize animations for |
| Version usage                                | When to deprecate v1                        |
| Conversion rate (generate -> download click) | Is the product compelling enough?           |
| Payment completion rate                      | Is the checkout flow working?               |
| Download success rate                        | Are there post-payment failures?            |
| Animation style distribution                 | Which styles does Claude pick most?         |

## Process

1. **Ask the user** their preferred analytics approach:
   - **Option A: Cloudflare Analytics Engine** — built into Workers, no external deps, aggregate only
   - **Option B: Cloudflare KV counters** — simple key-value counters, cheap, manual dashboards
   - **Option C: External service** (Plausible, Umami, PostHog) — richer but adds a dependency
   - **Option D: Structured logging** — just `console.log` JSON events, query via Cloudflare Logpush

2. **Implement the chosen approach:**
   - Add event tracking at key points in the Worker (generation, checkout created, download verified)
   - Track on the client side: download button clicks, payment return handling
   - Never log PII — no IP addresses, no company names in raw form (hash them if needed for counting)

3. **Build a simple dashboard** or reporting mechanism:
   - If using KV: add a `GET /stats` endpoint (protected by a secret header) that returns aggregates
   - If using Analytics Engine: show how to query via Cloudflare dashboard or API

4. **Verify:**
   - Analytics don't affect request latency (fire-and-forget)
   - No PII is stored
   - `npm run build` and `npx wrangler deploy --dry-run` pass

## Rules

- Analytics must be non-blocking — never let tracking slow down or break the user flow
- Privacy first — no cookies, no fingerprinting, no PII storage
- Keep it simple — aggregates are more useful than raw events at this scale
- Document what's tracked and where in a comment block at the top of the analytics module
