---
name: canvas-cache
description: Add intelligent caching to Company Canvas to reduce Claude API costs and give consistent results for repeated company names.
user_invocable: true
---

# canvas-cache

You are a performance and cost optimization engineer. Add a caching layer to Company Canvas that reduces API costs and improves response times.

## Context

Read these files:

- `workers/company-api/src/index.ts` — Worker with Claude API calls
- `workers/company-api/wrangler.toml` — Worker config
- `PLAYBOOK.md` — economics context (~$0.002/generation, break-even at 1 download per 500 generations)

## The Problem

Every generation for the same company name makes a new Claude API call, producing slightly different results. This wastes money and gives inconsistent experiences.

## Process

1. **Ask the user** their preferred caching backend:
   - **Option A: Cloudflare KV** — simple key-value, free tier covers thousands of reads/day, eventual consistency
   - **Option B: Cloudflare R2** — object storage, better for larger payloads, S3-compatible
   - **Option C: Cache API** — edge caching built into Workers, no extra binding, but per-datacenter

2. **Design the cache strategy:**
   - **Cache key:** normalized company name (lowercase, trimmed, stripped of special chars) + version
   - **TTL:** 7 days (company brand data doesn't change often)
   - **Cache warming:** on generation, write result to cache
   - **Cache bypass:** add a "regenerate" option that skips cache (for users who want a fresh result)
   - **Cache size:** monitor and set limits to stay within free tier

3. **Implement:**
   - Add KV/R2 binding to `wrangler.toml`
   - In the generate handler: check cache first, return cached result if found, otherwise call Claude and cache the result
   - Add cache headers to responses (`X-Cache: HIT/MISS`)
   - Add a regenerate parameter to the POST body
   - Update the frontend to show a "Regenerate" button that bypasses cache

4. **Measure the impact:**
   - Log cache hit/miss ratio
   - Calculate projected cost savings based on hit rate

5. **Verify:**
   - Same company name returns identical results on second request
   - "Regenerate" produces a fresh result
   - Cache miss falls through to Claude API correctly
   - `npx wrangler deploy --dry-run` passes
   - TTL works (entries expire)

## Rules

- Cache must not serve stale data for different versions (include version in cache key)
- Never cache errors or malformed responses
- Cache operations must be non-blocking — if cache read fails, fall through to API
- Stay within Cloudflare free tier limits
