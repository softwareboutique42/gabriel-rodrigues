---
title: 'Scaling a Micro-Product with Strategic Skills: The Company Canvas Toolkit'
description: 'How I built 10 reusable AI-assisted skills to systematically iterate Company Canvas from MVP to polished product — covering security, testing, caching, analytics, pricing, and more.'
date: 2026-03-25
tags: ['product', 'ai', 'architecture', 'developer-tools']
lang: 'en'
---

# Scaling a Micro-Product with Strategic Skills: The Company Canvas Toolkit

Shipping the MVP is the easy part. The hard part is what comes next: hardening security, adding tests, cutting costs, reaching new audiences, and evolving the product — all without breaking what already works.

After launching [Company Canvas](/en/canvas/) (an AI-powered brand animation generator with Stripe payments), I needed a system for iterating. Not a vague roadmap, but a set of repeatable, focused playbooks I could invoke whenever I had 30 minutes to improve the product.

I built 10 strategic skills — each one a self-contained guide for a specific improvement axis. Here's what they do, why they exist, and the order I'd run them.

## What's a Skill?

A skill is a structured prompt that turns a complex, multi-step task into a guided workflow. Instead of starting from scratch every time ("how do I add caching to my Worker?"), the skill already knows:

- Which files to read for context
- What questions to ask before starting
- The implementation steps in order
- How to verify the work

Think of them as reusable playbooks that encode architectural decisions and best practices specific to the project.

## The 10 Skills

### 1. canvas-harden — Security & Reliability Audit

**The problem:** The payment pipeline handles real money. A bug in session verification or a missing CORS check could mean giving away free downloads or leaking data.

**What it does:** Runs a structured security audit across the Stripe integration, Worker endpoints, and client-side payment flow. It checks 20+ specific scenarios:

- Is `payment_status === 'paid'` enforced before returning config?
- What happens if the Stripe API is down during verification?
- What happens if the same session_id is used twice?
- Are error responses leaking implementation details?

**Why it's first:** You harden what's live before adding features. Every new feature increases attack surface — better to start from a secure baseline.

### 2. canvas-test — Test Suite

**The problem:** No tests means every change is a leap of faith. The payment flow is especially risky — a regression could silently break downloads after payment.

**What it does:** Guides the creation of three test layers:

- **Unit tests** for the export module (valid HTML output, correct colors, watermark embedded)
- **Integration tests** for Worker endpoints (rate limiting, input validation, mock Stripe responses)
- **E2E tests** for the browser flow (form submission, version dropdown, download button, disclaimer)

All external APIs (Claude, Stripe) are mocked — tests never make real API calls.

**Why it's second:** Tests are the safety net for everything that follows. Every subsequent skill can be verified against this test suite.

### 3. canvas-cache — Intelligent Caching

**The problem:** Every generation for the same company calls Claude API (~$0.002 each). "Spotify" typed 100 times costs $0.20 and gives 100 slightly different results.

**What it does:** Adds a caching layer (Cloudflare KV, R2, or Cache API) that:

- Caches by normalized company name + version
- Returns cached results instantly (cache HIT)
- Falls through to Claude on cache MISS
- Supports a "regenerate" bypass for fresh results
- Sets 7-day TTL

**The math:** At a 50% cache hit rate, API costs drop by half. Popular companies like "Apple" or "Tesla" get cached after the first generation, making subsequent requests free and instant.

### 4. canvas-translate — Portuguese Translations

**The problem:** The site supports English and Portuguese, but the three blog posts only exist in English. Half the potential audience sees an incomplete blog.

**What it does:**

- Audits en.json vs pt.json for missing i18n keys
- Translates all English blog posts to natural Brazilian Portuguese
- Keeps technical terms in English where they're industry standard
- Preserves code blocks and markdown structure unchanged

**Why it's a quick win:** Translation is pure content work — no architectural changes, no risk of breaking the payment flow. It doubles the blog's reach overnight.

### 5. canvas-analytics — Usage Tracking

**The problem:** Without data, every product decision is a guess. Which companies do people generate most? What's the conversion rate from generation to download? Are there post-payment failures?

**What it does:** Adds lightweight, privacy-respecting analytics tracking:

| Metric                       | Purpose                        |
| ---------------------------- | ------------------------------ |
| Generations per day          | API cost forecasting           |
| Top company names            | Which industries to optimize   |
| Conversion rate              | Is the product compelling?     |
| Payment completion rate      | Is checkout working?           |
| Animation style distribution | Which styles Claude picks most |

Four implementation options are offered: Cloudflare Analytics Engine, KV counters, external service (Plausible/Umami), or structured logging. All approaches are fire-and-forget — analytics never slow down the user flow.

**Why before pricing:** You need data to make pricing decisions. Running analytics for a week before touching pricing gives you real numbers instead of assumptions.

### 6. canvas-v2 — New Animation Version

**The problem:** v1 has four solid animation styles, but they're all 2D and relatively simple. A v2 with shader effects, 3D depth, or audio-reactive animations justifies a higher price and gives users a reason to come back.

**What it does:** Guides the design and implementation of 3-4 new animation styles:

- Extends the existing `BaseAnimation` class
- Registers the new version in `versions.ts`
- Updates the export pipeline to inline new animation code
- Updates the Claude prompt with new style options
- Ensures v1 animations remain untouched

**The constraint:** Every new animation must work with the orthographic camera, loop at 12 seconds, and export as self-contained HTML. This keeps the architecture clean.

### 7. canvas-pricing — Advanced Monetization

**The problem:** $1 flat pricing is simple but leaves money on the table. An agency generating 50 animations should get bulk pricing. A v2 animation with shaders might be worth more than v1.

**What it does:** Implements one or more Stripe pricing models:

| Model                           | Stripe Feature               |
| ------------------------------- | ---------------------------- |
| Bulk packs (10 for $7)          | Checkout with quantity       |
| Tiered versions ($1 v1, $2 v2)  | Different prices per product |
| Promo codes                     | Stripe Promotion Codes       |
| Subscriptions (unlimited/month) | Stripe Billing               |

The $1 single download stays as the default — new models are additions, not replacements.

### 8. canvas-seo — Search Optimization

**The problem:** Organic search is free traffic. But if meta tags are missing, structured data is absent, or blog posts aren't targeting searchable keywords, Google won't send anyone.

**What it does:** Runs a full SEO audit:

- **Technical:** unique titles, canonical URLs, hreflang, Open Graph, Twitter Cards, JSON-LD structured data
- **Performance:** Core Web Vitals impact from Three.js, lazy loading, chunk splitting
- **Content:** keyword targeting in blog titles, internal linking between posts and the canvas tool, compelling SERP descriptions

### 9. canvas-video-export — MP4/WebM Output

**The problem:** Some users want a video file, not an HTML file. Embedding an animation in a presentation or social media post requires MP4.

**What it does:** Offers two approaches:

- **Client-side:** `canvas.captureStream()` + `MediaRecorder` API — free, works offline, browser-dependent quality
- **Server-side:** Headless browser rendering on Cloudflare Browser — consistent quality, supports MP4, requires paid tier

Both capture exactly one 12-second loop with the company overlay and watermark.

### 10. canvas-embed — Embeddable Widget

**The problem:** The animation generator only lives on one site. An embed script would let agencies, blogs, and other developers embed it on their sites — turning the tool into a platform.

**What it does:**

- Builds a `<script>` tag embed (Shadow DOM or iframe for isolation)
- Adds API endpoints for programmatic access
- Handles CORS for third-party origins
- Includes "Powered by Company Canvas" attribution
- Supports affiliate revenue tracking

This is the platform play — the highest complexity but also the highest potential reach.

## The Iteration Order

The skills are designed to be run in sequence, where each one builds on the previous:

```
1. /canvas-harden    — secure what's live
2. /canvas-test      — add safety net
3. /canvas-cache     — cut costs
4. /canvas-translate — quick reach win
5. /canvas-analytics — understand usage
6. /canvas-v2        — new value
7. /canvas-pricing   — capture value
8. /canvas-seo       — drive traffic
9. /canvas-video-export — premium feature
10. /canvas-embed    — platform play
```

The first five are defensive: they make the existing product better, safer, and cheaper. The last five are offensive: they add new features and revenue streams.

You don't have to run all 10. After each skill, you have a strictly better product. Stop whenever you're satisfied.

## The Meta-Lesson

The real insight isn't the skills themselves — it's the pattern. Any project can be decomposed into focused improvement axes:

1. **Security** — audit and harden what's live
2. **Testing** — build the safety net
3. **Cost optimization** — reduce ongoing expenses
4. **Reach** — translations, SEO, content
5. **Analytics** — measure before you decide
6. **Features** — add new value
7. **Monetization** — capture the value you added
8. **Distribution** — embeds, APIs, partnerships

Each axis is independent enough to tackle in one session, but they compound when stacked. A cached, tested, translated product with analytics is a fundamentally different thing from a raw MVP — even if the core feature is identical.

The skills encode this thinking so you don't have to re-derive it every time you sit down to work.

Try Company Canvas at [gabriel-rodrigues.com/en/canvas](/en/canvas/).
