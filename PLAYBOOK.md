# Company Canvas Masterplan Playbook

A repeatable playbook for turning a portfolio feature into a revenue-generating micro-product. Built in one session, shipped the same day.

---

## What Was Built

A canvas animation generator where users type a company name, AI infers brand identity, and Three.js renders a living animation. Free to generate, $1 to download as a self-contained HTML file.

**Stack:** Astro (static frontend) + Cloudflare Workers (API proxy + payments) + Claude API (brand generation) + Stripe Checkout (payments) + Three.js (rendering)

**Revenue model:** Freemium. Unlimited free previews, paid downloads at $1 each. Net ~$0.67 after Stripe fees. Break-even at 1 download per 500 generations.

---

## The Playbook

### Phase 1: Version System

**Goal:** Future-proof the product with a version selector before adding paid features.

**Why first:** Versioning changes the product narrative from "a tool" to "a tool that's getting better." It also travels through the entire pipeline (frontend -> worker -> Stripe metadata -> exported HTML), so it's easier to wire before payments exist.

1. Create `src/scripts/canvas/versions.ts`
   - Define `AnimationVersion` type: `{ id, label, description, styles[] }`
   - Export `VERSIONS` array, `getVersion()`, `getDefaultVersion()`
2. Add `version?: string` to `CompanyConfig` type in `types.ts`
3. Add `createAnimationForVersion(style, version)` to animation factory — delegates to existing code for v1
4. Add `<select id="version-select">` to both canvas pages (en + pt)
5. Wire dropdown into `main.ts` — read value, send with worker request
6. Add i18n keys: `canvas.version.label`, `canvas.version.description`

**Verify:** Dropdown renders, generation works with v1 selected, version value reaches the worker.

---

### Phase 2: HTML Export System

**Goal:** Generate a self-contained HTML file that plays the animation offline with zero dependencies.

**Key decisions:**

- Three.js loaded from CDN (`unpkg.com/three@0.183.2`) — keeps file small (~5KB of custom code)
- Animation code inlined as ES module — no external scripts
- Brand config embedded as JSON constant
- Company name + tagline overlaid on canvas
- Watermark: `Company Canvas {version} -- gabriel-rodrigues.com`

1. Create `src/scripts/canvas/export.ts`
   - `generateExportHTML(config, version)` — builds complete HTML document
   - `downloadHTML(html, filename)` — Blob URL + `<a download>` trick
   - Each animation style has its own inline code generator (switch/case)
2. Add download button to canvas pages — visible only after generation
3. Add i18n keys: `canvas.download`, `canvas.download.processing`

**Verify:** Generated HTML opens in any browser and plays the animation standalone.

---

### Phase 3: Stripe Payment Integration

**Goal:** Gate downloads behind a $1 payment using Stripe Checkout.

**Key architectural decisions:**

- **Raw fetch to Stripe API** — no SDK. Cloudflare Workers don't fully support Node.js Stripe SDK.
- **Config stored in Stripe session metadata** — no database needed. Stripe is both payment processor and data store.
- **Metadata splitting** — CompanyConfig is ~400-600 bytes. Split across `config_1` and `config_2` metadata keys (500 char limit per key).
- **Server-side checkout session creation** — only the secret key is needed server-side. The publishable key is stored as a public env var for potential future client-side use.

#### Worker side

1. Create `workers/company-api/src/stripe.ts`
   - `createCheckoutSession(apiKey, params)` — POST to `/v1/checkout/sessions`
     - Price: $1.00, quantity: 1, mode: payment
     - Store config + version in session metadata
     - success_url includes `?session_id={CHECKOUT_SESSION_ID}`
   - `verifyAndGetConfig(apiKey, sessionId)` — GET session, check `payment_status === 'paid'`, reassemble config from metadata
2. Add routes to `workers/company-api/src/index.ts`
   - `POST /checkout` — accepts config + version + returnUrl, creates session, returns `{ url }`
   - `GET /download?session_id=xxx` — verifies payment, returns `{ config, version }`
3. Add `STRIPE_SECRET_KEY` to `Env` interface
4. Document secrets in `wrangler.toml` comments
5. Set secret: `wrangler secret put STRIPE_SECRET_KEY`
6. Add `STRIPE_PUBLISHABLE_KEY` to `[vars]` in `wrangler.toml`

#### Client side

7. In `main.ts`, add `handleDownload(config)`:
   - POST to `/checkout` with config + version + returnUrl
   - Redirect browser to Stripe's hosted checkout page
8. Add `handlePaymentReturn()`:
   - On page load, check for `?session_id=` in URL
   - Fetch `/download?session_id=xxx`
   - Generate HTML with `generateExportHTML()`
   - Trigger browser download
   - Clean URL with `history.replaceState()`
9. Add download processing UI states (processing, success, failure)

**Verify:** Full e2e flow — generate -> click download -> pay on Stripe test mode -> redirect back -> file downloads.

---

### Phase 4: Legal Disclaimer

**Goal:** Protect against trademark/liability claims from AI-generated brand content.

1. Add disclaimer text to both canvas pages (en + pt)
   - Position: below the info panel
   - Style: `font-mono text-xs text-text-muted`
   - Content: AI-generated, provided as-is, no liability, no endorsement, terms accepted on download
2. Add i18n keys: `canvas.disclaimer`

**Verify:** Disclaimer visible on both language versions.

---

### Phase 5: Self-Demo Animation

**Goal:** Show the product's own animation on page load so visitors immediately understand what it does.

1. Hardcode a `DEMO_CONFIG` constant for "Company Canvas" with the portfolio's brand colors
2. On page load (if no `?session_id` in URL), call `renderDemo()` which renders the demo config without hitting the API
3. Demo uses `particles` style with neon green/cyan/gold palette

**Verify:** Landing on the canvas page shows a live animation immediately, no input needed.

---

### Phase 6: Blog Articles

**Goal:** Document the build process as content marketing. Three articles, each targeting a different audience.

#### Article 1: "Building a Canvas Animation Generator with AI"

- **File:** `src/content/blog/en/building-canvas-generator.md`
- **Audience:** Creative developers, Three.js enthusiasts
- **Topics:** The idea, architecture decisions (Astro + Workers + Claude), animation system design, 4 styles, orthographic camera choice, animation parameters
- **Tags:** `three.js, ai, canvas, project`

#### Article 2: "AI-Powered Frontend: Shipping Claude-Generated Code to Production"

- **File:** `src/content/blog/en/ai-powered-frontend.md`
- **Audience:** Backend/fullstack engineers exploring AI integration
- **Topics:** Claude as JSON API, prompt engineering for reliability, Worker proxy pattern, handling unpredictability, cost analysis
- **Tags:** `ai, claude, cloudflare, architecture`

#### Article 3: "From Side Project to Micro-Product"

- **File:** `src/content/blog/en/from-idea-to-product.md`
- **Audience:** Indie hackers, developers considering monetization
- **Topics:** Why charge, Stripe Checkout choice, payment flow, stateless architecture, version system, economics breakdown
- **Tags:** `stripe, product, cloudflare, business`

**Verify:** All posts render at `/en/blog/{slug}`, appear in blog index, frontmatter is correct.

---

### Phase 7: Polish & Testing (not yet done)

These are the next steps to harden the product:

1. **E2E tests** — canvas flow (form submission, version dropdown, download button, disclaimer presence)
2. **Worker tests** — checkout/download endpoints with mock Stripe responses
3. **Responsive/a11y review** — mobile dropdown sizing, ARIA labels on canvas, keyboard navigation
4. **Caching** — KV cache keyed by company name to reduce API costs and give consistent results
5. **PT blog translations** — translate all 3 articles to Portuguese

---

## Dependency Graph

```
Phase 1 (Versions) --+--> Phase 2 (Export) --> Phase 3 (Stripe) --> Phase 5 (Self-Demo)
Phase 4 (Disclaimer) -+
Phase 6 (Blog) ---------- parallel, no dependencies
Phase 7 (Polish) --------- after all others
```

---

## File Map

| File                                     | Action | Purpose                                      |
| ---------------------------------------- | ------ | -------------------------------------------- |
| `src/scripts/canvas/versions.ts`         | Create | Version registry and helpers                 |
| `src/scripts/canvas/export.ts`           | Create | Self-contained HTML generator + download     |
| `workers/company-api/src/stripe.ts`      | Create | Raw Stripe API client (no SDK)               |
| `src/content/blog/en/*.md` (3)           | Create | Blog articles documenting the build          |
| `workers/company-api/src/index.ts`       | Modify | Add `/checkout` and `/download` routes       |
| `src/scripts/canvas/main.ts`             | Modify | Version selector, payment flow, demo         |
| `src/scripts/canvas/types.ts`            | Modify | Add `version` field to CompanyConfig         |
| `src/scripts/canvas/animations/index.ts` | Modify | Version-aware animation factory              |
| `src/pages/{en,pt}/canvas/index.astro`   | Modify | Dropdown, download btn, disclaimer, states   |
| `src/i18n/{en,pt}.json`                  | Modify | New i18n keys for all UI additions           |
| `workers/company-api/wrangler.toml`      | Modify | Add STRIPE_PUBLISHABLE_KEY, document secrets |

---

## Key Architectural Decisions

| Decision                      | Rationale                                                         |
| ----------------------------- | ----------------------------------------------------------------- |
| Raw `fetch` to Stripe API     | Workers don't fully support Node.js Stripe SDK                    |
| Config in Stripe metadata     | Eliminates the need for a database entirely                       |
| Metadata split across 2 keys  | 500-char limit per key, config is ~400-600 bytes                  |
| Three.js via CDN in exports   | Self-contained HTML stays small (~5KB custom code)                |
| Orthographic camera           | 2D-style animations without perspective distortion                |
| Version system is client-side | Versions map to animation factories; Worker just logs version ID  |
| Server-side checkout session  | Only secret key needed; no publishable key in frontend            |
| Demo on page load             | Visitors understand the product instantly without typing anything |
| 12-second seamless loop       | `elapsed % LOOP_DURATION` prevents drift and float errors         |

---

## Economics

| Metric                     | Value                                    |
| -------------------------- | ---------------------------------------- |
| Cost per generation        | ~$0.002 (Claude API)                     |
| Revenue per download       | $1.00                                    |
| Stripe fee per transaction | $0.33 ($0.30 + 2.9%)                     |
| Net per download           | $0.67                                    |
| Break-even                 | 1 download covers ~500 generations       |
| Infrastructure cost        | $0 (Cloudflare free tier + GitHub Pages) |

---

## How to Repeat This

1. **Start with something free and visible.** The canvas generator is a portfolio piece first. It works without payments.
2. **Add versioning early.** Even with one version. It shapes the product narrative and travels through the whole pipeline.
3. **Gate the premium artifact, not the experience.** Users play for free. The download is where the value is.
4. **Use hosted checkout.** Stripe Checkout handles the payment page, fraud, receipts. You never touch card data.
5. **Abuse metadata for storage.** If your payload fits in Stripe's metadata limits, you don't need a database.
6. **Ship the blog alongside the feature.** The articles are content marketing and technical documentation in one. Write them while the decisions are fresh.
7. **Test the build, not just the code.** `npm run build` + `wrangler deploy --dry-run` catch most issues before push.

---

## Future Roadmap

- **v2 animations** — Shader-based effects, audio-reactive, more complex visual styles
- **Video export** — MP4 output via server-side Puppeteer or canvas-to-video pipeline
- **Caching layer** — KV cache keyed by company name for consistent results and lower costs
- **Bulk pricing** — Volume discounts via Stripe quantity pricing for agencies
- **Embed mode** — Let others embed the generator on their sites with revenue share
- **Usage analytics** — Track which companies are generated most to inform optimization
- **Streaming response** — Stream JSON fields as they arrive to start building the animation progressively
- **Tool use** — Migrate to Claude's tool_use for guaranteed JSON schema compliance
