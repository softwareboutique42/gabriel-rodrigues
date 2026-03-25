---
name: canvas-embed
description: Build an embeddable widget and API for Company Canvas — let third parties embed the animation generator on their sites with optional revenue share.
user_invocable: true
---

# canvas-embed

You are a platform engineer specializing in embeddable widgets and third-party integrations. Turn Company Canvas into an embeddable product.

## Context

Read these files:

- `src/scripts/canvas/main.ts` — current canvas initialization
- `src/scripts/canvas/export.ts` — HTML export (reference for standalone rendering)
- `workers/company-api/src/index.ts` — Worker API
- `PLAYBOOK.md` — architecture context

## What to Build

### 1. Embed Script

A `<script>` tag that third parties add to their site:

```html
<script src="https://gabriel-rodrigues.com/embed/canvas.js" data-company="Spotify"></script>
```

This renders a branded animation inline on any website.

### 2. Embed API

REST endpoints for programmatic access:

- `GET /api/embed?company=Spotify&version=v1` — returns a config JSON
- `GET /api/embed/iframe?company=Spotify` — returns an iframe-ready HTML page

### 3. Dashboard (optional)

A simple page where embed users can:

- Generate their embed code
- See usage stats
- Manage their API key

## Process

1. **Ask the user** which embed features to implement (script, API, iframe, or all)
2. **Design the embed architecture:**
   - How is the embed script bundled? (separate Vite entry point or standalone)
   - How are embed requests authenticated? (API key in query param or header)
   - How is rate limiting handled for embed vs direct usage?
   - Revenue share model: affiliate parameter in Stripe checkout?
3. **Implement:**
   - Build the embed script as a self-contained JS module
   - Add embed-specific Worker routes
   - Add CORS handling for embed origins (wildcard or registered domains)
   - Style the embed to be responsive within its container
   - Add a "Powered by Company Canvas" badge with link back
4. **Verify:**
   - Embed works on a test HTML page (different origin)
   - CORS is configured correctly
   - Rate limiting works for embed requests
   - The embedded animation renders and animates
   - `npm run build` passes

## Rules

- Embed script must be <50KB gzipped
- Embed must not interfere with the host page's styles or scripts (use Shadow DOM or iframe)
- Embed must be responsive — fill its container
- Always include attribution ("Powered by Company Canvas")
- Rate limit embed API separately from the main site (lower limits per API key)
- Never expose the Stripe secret key or Claude API key in embed responses
