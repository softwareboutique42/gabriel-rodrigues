---
name: canvas-test
description: Write and run tests for Company Canvas — E2E tests for the canvas flow, unit tests for the worker endpoints, and integration tests for the Stripe payment pipeline.
user_invocable: true
---

# canvas-test

You are a test engineer. Write comprehensive tests for Company Canvas covering the frontend flow, worker endpoints, and payment integration.

## Context

Read these files:

- `src/scripts/canvas/main.ts` — Client-side canvas flow
- `src/scripts/canvas/export.ts` — HTML export generation
- `src/scripts/canvas/versions.ts` — Version registry
- `workers/company-api/src/index.ts` — Worker routes
- `workers/company-api/src/stripe.ts` — Stripe integration
- `package.json` — check existing test setup
- `PLAYBOOK.md` — full architecture context

## Process

### 1. Assess Current Test Infrastructure

- Check if a test runner is configured (Vitest, Playwright, etc.)
- Check for existing tests
- Ask the user: "Which test layers do you want? Unit tests (fast, isolated), integration tests (worker + mock Stripe), E2E tests (browser automation), or all three?"

### 2. Unit Tests

**Export module (`export.ts`):**

- Generated HTML is valid (contains `<!DOCTYPE html>`, `<canvas>`, Three.js import)
- Company name and tagline appear in the HTML
- Version watermark is embedded
- All 4 animation styles generate valid code
- Colors from config appear in the output

**Version registry (`versions.ts`):**

- `getDefaultVersion()` returns v1
- `getVersion('v1')` returns correct version
- `getVersion('nonexistent')` returns undefined or fallback

### 3. Worker Integration Tests

**Generate endpoint (POST /):**

- Returns 400 for missing company name
- Returns 400 for name > 100 chars
- Returns 429 when rate limited
- Returns valid CompanyConfig JSON on success (mock Claude API)
- CORS headers are set correctly for allowed origins
- CORS headers reject disallowed origins

**Checkout endpoint (POST /checkout):**

- Returns 400 for missing config or returnUrl
- Returns valid `{ url }` on success (mock Stripe API)
- Stripe session includes config in metadata

**Download endpoint (GET /download):**

- Returns 400 for missing session_id
- Returns 402 for unpaid session (mock Stripe)
- Returns `{ config, version }` for paid session (mock Stripe)
- Config is correctly reassembled from split metadata

### 4. E2E Tests (if Playwright)

- Page loads and shows demo animation
- Form submission triggers loading state
- Version dropdown contains v1
- After generation: info panel shows, download button visible
- Disclaimer text is present
- Retry button resets to idle state
- Download button triggers checkout flow (intercept network call)

### 5. Implementation

- Set up the test runner if not configured
- Write tests following the project's existing patterns
- Use MSW or manual fetch mocks for API calls
- Run all tests and fix any failures

## Verify

- All tests pass: `npm test`
- Build still works: `npm run build`
- No test files imported in production code

## Rules

- Mock external APIs (Claude, Stripe) — never make real API calls in tests
- Test behavior, not implementation — don't test private functions
- Each test should be independent — no shared mutable state between tests
- Name tests descriptively: `"returns 402 when payment is not completed"`
