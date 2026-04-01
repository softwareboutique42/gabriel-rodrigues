# Codebase Concerns

**Analysis Date:** 2026-04-01

## Tech Debt

**Duplicated Resume Pages (No Shared Layout):**

- Issue: `src/pages/en/resume.astro` and `src/pages/pt/resume.astro` are 366 and 367 lines respectively, nearly identical in structure. Only the `useTranslations('en'/'pt')` call and `title`/`description` props differ. All job history content, skills, and structural HTML is duplicated.
- Files: `src/pages/en/resume.astro`, `src/pages/pt/resume.astro`
- Impact: Any update to work experience, contact info, or layout requires editing two files. Drift between versions is likely over time.
- Fix approach: Extract a shared `ResumeLayout.astro` or `Resume.astro` component that accepts `lang` as a prop. Both page files become thin wrappers.

**Duplicated Canvas Pages:**

- Issue: `src/pages/en/canvas/index.astro` and `src/pages/pt/canvas/index.astro` are 221 and 222 lines each, with identical HTML structure.
- Files: `src/pages/en/canvas/index.astro`, `src/pages/pt/canvas/index.astro`
- Impact: Same as resume — any UI change must be applied twice.
- Fix approach: Create a shared `CanvasPage.astro` component parameterized by `lang`.

**In-Memory Rate Limiting in Cloudflare Worker:**

- Issue: `RATE_LIMIT_MAP` is a module-level `Map<string, number[]>` in `workers/company-api/src/index.ts`. Cloudflare Workers spawn isolated V8 isolates per request (or recycle them), so this map does not persist reliably across requests from the same IP in high-traffic scenarios and is reset between isolate restarts.
- Files: `workers/company-api/src/index.ts` (lines 11–23)
- Impact: Rate limiting offers weak protection against abuse. Burst attacks from the same IP can bypass the 10-requests-per-minute limit during cold starts or across isolate instances.
- Fix approach: Replace with Cloudflare KV or Durable Objects for persistent per-IP counters.

**Stripe Metadata Config Split is Fragile:**

- Issue: `workers/company-api/src/stripe.ts` splits the `CompanyConfig` JSON string across two Stripe metadata keys (`config_1`, `config_2`) by slicing at the midpoint. Stripe metadata values have a 500-character limit per key; the config JSON can grow further with long taglines or visual element arrays.
- Files: `workers/company-api/src/stripe.ts` (lines 44–48, 82–83)
- Impact: If `config_1 + config_2` exceeds 1000 characters total, the Stripe API call fails silently at checkout creation. If the JSON is exactly split mid-character (unlikely for ASCII but possible with multibyte chars), `JSON.parse` on reassembly will throw.
- Fix approach: Store the config in KV using the Stripe `session_id` as the key immediately after generation, then retrieve it directly on download. Remove the metadata splitting entirely.

**`generateAnimationCode` Returns `undefined` for Unknown Styles:**

- Issue: `generateAnimationCode()` in `src/scripts/canvas/export.ts` has a `switch` with no `default` branch for the outer `case` group. If `animationStyle` is anything other than the 8 known values, it implicitly returns `undefined`. The exported HTML template then inlines `undefined` as the animation script, producing a broken HTML file.
- Files: `src/scripts/canvas/export.ts` (line 167, outer switch missing default)
- Impact: A future animation style added to the backend but not yet in `export.ts` will cause downloaded HTML files to be broken with no error.
- Fix approach: Add an explicit `default: return '';` (or a meaningful fallback) to the outer `switch` in `generateAnimationCode`.

**Module-Level Mutable State in Canvas Script:**

- Issue: `src/scripts/canvas/main.ts` declares `renderer`, `currentConfig`, and `controller` as module-level `let` variables. In Astro's SPA/View Transitions mode, the module is evaluated once but `initCanvas()` can be called multiple times (on each `astro:page-load`). The `AbortController` pattern correctly clears event listeners, but `currentConfig` persists between navigations. If a user navigates away and back, the state of the previous session remains.
- Files: `src/scripts/canvas/main.ts` (lines 26–28)
- Impact: Low — mostly cosmological stale state. The `renderDemo()` path re-sets `currentConfig`, but if `?company=` param is absent after navigation back, `currentConfig` from the prior session is not cleared before `handlePaymentReturn` is checked.
- Fix approach: Reset `currentConfig = null` inside `initCanvas()` before the auto-load logic.

## Known Bugs

**`alert()` for Payment Failure:**

- Symptoms: On checkout creation failure, the page calls `alert('Payment failed. Please try again.')` — a blocking native dialog, inconsistent with the rest of the UI which uses custom state panels.
- Files: `src/scripts/canvas/main.ts` (line 342)
- Trigger: When the `/checkout` worker endpoint returns a non-OK response.
- Workaround: None — user sees a browser-native alert.

**Blog Search Silently Fails if JSON Index Is Missing:**

- Symptoms: `src/scripts/blog-search.ts` calls `fetch(indexUrl)` and swallows all errors with `.catch(() => {})`. If the JSON index file is not built (e.g., first run before build), the search input appears functional but matches nothing.
- Files: `src/scripts/blog-search.ts` (line 19)
- Trigger: Serving the dev server before a build, or if `src/pages/en/blog-index.json.ts` / `src/pages/pt/blog-index.json.ts` fail to generate.
- Workaround: Run `npm run build` first; the index is generated at build time.

**Payment Return: No Demo Renders on `?session_id=` Param:**

- Symptoms: In `initCanvas()`, the condition `} else if (!params.has('session_id')) { renderDemo(); }` means when a user returns from Stripe checkout, neither the company config nor the demo is rendered while `handlePaymentReturn()` processes the session. The canvas area remains in its initial idle state until the download completes.
- Files: `src/scripts/canvas/main.ts` (lines 237–239, 302)
- Trigger: Returning from Stripe checkout with `?session_id=` in the URL.
- Workaround: None currently — the UI shows the idle canvas while the download resolves.

## Security Considerations

**Stripe Publishable Key in Committed `wrangler.toml`:**

- Risk: The Stripe publishable key (`pk_test_51TF0b...`) is hardcoded in `workers/company-api/wrangler.toml` under `[vars]`. While publishable keys are technically client-safe for Stripe, committing them to version control is a poor practice — especially if the project goes public or the key transitions to a live key.
- Files: `workers/company-api/wrangler.toml` (line 11)
- Current mitigation: The key is a test-mode key.
- Recommendations: Move `STRIPE_PUBLISHABLE_KEY` to a Wrangler secret or Cloudflare dashboard environment variable, not a committed `[vars]` block. If/when switching to live mode, this pattern would expose a live key.

**AI-Returned Data Injected Into Exported HTML Without Sanitization:**

- Risk: `src/scripts/canvas/export.ts` builds a standalone HTML file by directly interpolating `config.companyName`, `config.tagline`, `config.colors.*`, and `config.version` into template literal HTML (lines 507, 511, 520, 526, 541, 542, 544). These values come from the Claude AI API response, which is parsed from JSON but never sanitized for HTML contexts. A crafted response with `</title><script>...` in `companyName` would produce XSS in the downloaded file.
- Files: `src/scripts/canvas/export.ts` (lines 507–592)
- Current mitigation: `config.colors.*` values are validated with `isValidHex()` in `main.ts` before `applyBrandTheme`, but no equivalent sanitization is applied before building the export HTML. The AI model is trusted implicitly.
- Recommendations: HTML-encode string fields (`companyName`, `tagline`, `version`) before interpolating into the template. CSS values (`colors.*`) should be validated as valid hex before insertion into `<style>` blocks.

**No Security Headers (CSP, X-Frame-Options, etc.):**

- Risk: The site has no `public/_headers` file (Cloudflare Pages security headers mechanism). No Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, or Referrer-Policy headers are set.
- Files: `public/` (file missing), `astro.config.mjs`
- Current mitigation: None.
- Recommendations: Add `public/_headers` with at minimum `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and a CSP that allows GTM, AdSense, and the Three.js CDN used in exported files.

**Worker CORS Does Not Return Error on Disallowed Origin:**

- Risk: `corsHeaders()` in `workers/company-api/src/index.ts` (line 29) sets `Access-Control-Allow-Origin: ''` (empty string) when the origin is not in the allowlist. This is not a valid CORS header value and browser behavior differs. Some browsers may treat it as permissive.
- Files: `workers/company-api/src/index.ts` (lines 25–33)
- Current mitigation: Requests from unlisted origins still receive a response body — only the CORS header is wrong.
- Recommendations: Return `Access-Control-Allow-Origin: null` or omit the header entirely for disallowed origins. Alternatively, return a 403 response for OPTIONS preflight from unlisted origins.

**Phone Number Exposed in HTML Source:**

- Risk: The personal phone number `+55 81 99079346` is hardcoded as a `tel:` link in `src/components/Footer.astro` (line 69) and both resume pages, making it indexable and scrapable.
- Files: `src/components/Footer.astro`, `src/pages/en/resume.astro`, `src/pages/pt/resume.astro`
- Current mitigation: Intentional personal portfolio contact — may be acceptable.
- Recommendations: Consider whether phone exposure on a public crawlable page is desired; email-only contact is more common on public portfolios.

## Performance Bottlenecks

**Three.js Loaded as a Full npm Dependency:**

- Problem: `three` (0.183.2) is listed as a production dependency in `package.json`. This means the entire library is bundled by Vite for the canvas pages, even though only a subset of Three.js is used.
- Files: `package.json`, `src/scripts/canvas/renderer.ts`, `src/scripts/canvas/animations/`
- Cause: No tree-shaking configuration; Three.js is known to be difficult to tree-shake due to its module structure.
- Improvement path: Use dynamic `import()` to lazy-load the canvas scripts only when the canvas page is visited, or use the Three.js CDN import already present in `export.ts` (`THREE_CDN`) to load it at runtime and avoid bundling it entirely.

**Exported HTML Files Load Three.js From unpkg CDN:**

- Problem: `src/scripts/canvas/export.ts` uses `https://unpkg.com/three@0.183.2/build/three.module.js` (line 3) as the CDN for exported HTML files. unpkg is not a reliability-guaranteed CDN, and this creates a hard runtime dependency on a third-party CDN for the exported product.
- Files: `src/scripts/canvas/export.ts` (line 3)
- Cause: Keeping exported files self-contained would require inlining Three.js, which is large (~600KB minified).
- Improvement path: Switch to `cdn.jsdelivr.net` (more reliable SLA) or document the CDN dependency limitation clearly in the export.

**OG Image Generation Has Fragile Font Fallback Chain:**

- Problem: `src/pages/og/[...slug].png.ts` (lines 8–28) has a three-tier font loading fallback: (1) local woff file, (2) Google Fonts API fetch, (3) empty `ArrayBuffer`. An empty `ArrayBuffer` passed to satori will produce OG images with no visible text — silently broken.
- Files: `src/pages/og/[...slug].png.ts`
- Cause: The Google Fonts fallback fetches a CSS file then parses out a font URL with a regex — fragile against Google Fonts format changes.
- Improvement path: Pin the local woff file path as the sole source and fail the build loudly if it's missing, rather than silently generating blank images.

**Service Worker Cache Name is Static (`gr-v1`):**

- Problem: `public/sw.js` uses a hardcoded cache name `gr-v1`. When assets change, the cache version is never bumped programmatically — it requires a manual edit of `sw.js`.
- Files: `public/sw.js` (line 1)
- Cause: Static string with no build-time injection.
- Improvement path: Inject a build hash or timestamp into the cache name at build time (e.g., via an Astro integration or a build script that writes `sw.js`).

## Fragile Areas

**`getEl<T>()` Casts Are Unsafe:**

- Files: `src/scripts/canvas/main.ts` (line 30–31)
- Why fragile: `getEl<T>(id)` casts the result of `getElementById` directly to `T` without null checking. If any element ID is renamed in the Astro templates, this will throw a runtime error with no helpful message.
- Safe modification: When adding or renaming canvas page elements, ensure the IDs in both `src/pages/en/canvas/index.astro` and `src/pages/pt/canvas/index.astro` match the IDs used in `getEl()` calls throughout `main.ts`.
- Test coverage: Canvas E2E tests in `e2e/canvas.spec.ts` check element visibility but do not exhaustively verify all element IDs.

**`RelatedPosts.astro` Post ID Matching is Brittle:**

- Files: `src/components/RelatedPosts.astro` (line 17)
- Why fragile: The filter uses `post.id !== \`${lang}/${currentSlug}.md\``to exclude the current post. This relies on the slug derivation in`BlogPostLayout.astro`(line 28) stripping the lang prefix and trailing slash correctly. If the URL structure changes (e.g., removing`.md` suffix from IDs), the current post will appear in its own related posts.
- Safe modification: Treat the slug-to-ID mapping as a contract; changing URL structure requires updating both `RelatedPosts.astro` and `BlogPostLayout.astro` simultaneously.
- Test coverage: No tests verify related posts exclusion logic.

**`404.astro` Uses Inline Script for Redirect Logic:**

- Files: `src/pages/404.astro`
- Why fragile: The 404 page contains an `is:inline` script that parses the URL and redirects canvas company URLs. This is a client-side redirect — slow, causes a visible flash, and relies on JavaScript being enabled. The regex `/^\/(en|pt)\/canvas\/([^/]+)\/?$/` must be kept in sync with the canvas URL structure manually.
- Safe modification: Any change to the canvas route pattern requires updating the regex in `404.astro`.
- Test coverage: No E2E test covers the 404 redirect behavior.

## Scaling Limits

**Cloudflare KV for Config Caching:**

- Current capacity: KV is eventually consistent with ~60ms read latency for cache misses. The 7-day TTL (`604800` seconds) is appropriate.
- Limit: KV has a free tier limit of 100,000 reads/day and 1,000 writes/day. At scale, the write limit is reached faster (each new unique company name + version combo counts as one write, plus an additional write for caching during GET `/config/`).
- Scaling path: Consider adding a read-through cache in the worker's in-memory scope (valid within an isolate's lifetime) to reduce KV reads for repeated lookups of the same company within a short window.

**Anthropic API Cost with No Budget Guardrail:**

- Current capacity: Each canvas generation calls `claude-sonnet-4-20250514` with up to 1024 tokens output.
- Limit: The rate limiter allows 10 requests/IP/minute, but with the in-memory map reliability issue noted above, there is no hard daily or monthly budget cap on Anthropic API spend.
- Scaling path: Add Cloudflare Workers analytics to track generation counts, and consider a Durable Object or KV-based global counter to enforce a daily API call budget.

## Dependencies at Risk

**`satori` for OG Image Generation:**

- Risk: `satori` (^0.26.0) is a specialized library for rendering React-like JSX to SVG. The API in `src/pages/og/[...slug].png.ts` uses the raw object format (not JSX), which is less documented and more likely to break across versions.
- Impact: OG images break silently at build time if satori's internal object API changes.
- Migration plan: If satori becomes unmaintained, alternatives include `@vercel/og` (which wraps satori) or screenshot-based approaches using Playwright.

**`three` Version Pinning:**

- Risk: `three` is pinned to `^0.183.2` in `package.json` and also hardcoded as `three@0.183.2` in the CDN URL within `src/scripts/canvas/export.ts` (line 3). If the package is updated (e.g., to 0.184.x), the runtime code and the exported HTML will use different Three.js versions.
- Impact: Potential API divergence between the in-browser renderer and the downloaded exported file.
- Migration plan: Keep the CDN version in `export.ts` synchronized with the version in `package.json` manually, or inject the version dynamically at build time.

## Test Coverage Gaps

**Canvas E2E Tests Depend on External Worker API:**

- What's not tested: The actual brand generation flow requires a live call to `https://company-canvas-api.gabrielr47.workers.dev`. The E2E test in `e2e/canvas.spec.ts` (line 56–58) explicitly accepts either a result or an error state, meaning a broken API cannot be distinguished from a working one in CI.
- Files: `e2e/canvas.spec.ts`
- Risk: The worker could be down or returning errors and all canvas tests would still pass.
- Priority: Medium — acceptable for a personal portfolio but problematic if the Canvas feature is a paid product.

**No Tests for OG Image Generation:**

- What's not tested: `src/pages/og/[...slug].png.ts` is never exercised in the Playwright test suite. Font fallback failures and satori rendering errors would only be caught at production build time.
- Files: `src/pages/og/[...slug].png.ts`, `e2e/`
- Risk: A broken OG image pipeline would ship silently.
- Priority: Low — affects social sharing metadata only, not core functionality.

**No Tests for 404 Redirect Logic:**

- What's not tested: The client-side redirect in `src/pages/404.astro` for canvas company URLs is not covered by any spec.
- Files: `e2e/`, `src/pages/404.astro`
- Risk: URL pattern changes can break the redirect without CI catching it.
- Priority: Low.

**No Tests for Related Posts Exclusion:**

- What's not tested: `src/components/RelatedPosts.astro` has no test verifying that the current post is excluded from its own related list.
- Files: `e2e/blog.spec.ts`, `src/components/RelatedPosts.astro`
- Risk: A slug-matching regression would cause the current post to appear in its own related posts section.
- Priority: Low.

---

_Concerns audit: 2026-04-01_
