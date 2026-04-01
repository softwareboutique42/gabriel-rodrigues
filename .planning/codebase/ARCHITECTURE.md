# Architecture

## Pattern

**Static Site Generation (SSG)** — Astro 6 builds to fully static HTML/CSS/JS output. No server-side runtime required; deployed to Cloudflare Pages CDN.

**File-based routing** with explicit language duplication: every route exists under both `src/pages/en/` and `src/pages/pt/`. No dynamic `[lang]` catch-all — each language version is a discrete file.

**Content Collections** — blog posts stored as Markdown files in `src/content/blog/{en,pt}/` and loaded via Astro's `getCollection()` at build time.

## Layers

```
Browser
  ├── View Transitions (Astro ClientRouter — SPA-like navigation without full reload)
  ├── Client-side scripts (must use `astro:page-load` event, not top-level execution)
  └── Three.js canvas animations

Build-time (Astro SSG)
  ├── Pages (src/pages/) → static HTML
  ├── Content Collections (src/content/blog/) → blog post pages
  ├── OG Image Generation (src/pages/og/[...slug].png.ts) → PNG per post via satori + sharp
  └── i18n translations (src/i18n/en.json, src/i18n/pt.json)

Edge (Cloudflare)
  ├── Pages — static CDN hosting
  └── Workers (api/ directory) — Claude AI brand analysis, Stripe payments, KV caching
```

## Layouts

Two layout hierarchy levels:

1. `src/layouts/BaseLayout.astro` — root HTML shell: meta tags, OG/Twitter cards, GTM, AdSense, View Transitions, JSON-LD Person schema, canonical + hreflang links
2. `src/layouts/BlogPostLayout.astro` — wraps BaseLayout; adds article schema, OG image reference, ShareBar, AdUnit

## Data Flow

```
Build time:
  src/content/blog/{en,pt}/*.md
    → getCollection('blog')
      → [lang]/blog/[...slug].astro (individual posts)
      → [lang]/blog/index.astro (listing)
      → og/[...slug].png.ts (1200×630 OG images via satori+sharp)
      → public/blog-search-index.json (client-side search index)

Runtime (client):
  Navigation → astro:page-load event → reinitialize scripts
  Canvas page → Three.js animations + Cloudflare Worker API call
    → Worker: Claude AI brand analysis → Stripe payment check → KV cache

i18n:
  URL → getLangFromUrl(url) → 'en' | 'pt'
  lang → useTranslations(lang) → translation strings from src/i18n/{lang}.json
```

## Entry Points

| Route               | File                                | Description                  |
| ------------------- | ----------------------------------- | ---------------------------- |
| `/`                 | `src/pages/index.astro`             | Redirects to `/en/`          |
| `/en/`              | `src/pages/en/index.astro`          | EN homepage                  |
| `/pt/`              | `src/pages/pt/index.astro`          | PT homepage                  |
| `/en/blog/`         | `src/pages/en/blog/index.astro`     | EN blog listing              |
| `/en/blog/[slug]`   | `src/pages/en/blog/[...slug].astro` | EN blog post                 |
| `/en/canvas/`       | `src/pages/en/canvas/index.astro`   | Three.js animation generator |
| `/en/resume`        | `src/pages/en/resume.astro`         | Resume/CV page               |
| `/og/[...slug].png` | `src/pages/og/[...slug].png.ts`     | OG image API route           |
| `404`               | `src/pages/404.astro`               | 404 page                     |

## Key Abstractions

- **`getLangFromUrl(url)`** — extracts `'en' | 'pt'` from URL pathname
- **`useTranslations(lang)`** — returns typed translation function `t(key)`
- **`getCollection('blog')`** — returns all blog posts with schema-validated frontmatter
- **ClientRouter** — Astro View Transitions; requires `astro:page-load` for client scripts
- **AbortController pattern** — cleanup on re-navigation (reference: `src/scripts/canvas/main.ts`)

## OG Image Generation

`src/pages/og/[...slug].png.ts` runs at build time per blog post:

- Loads JetBrains Mono font from `node_modules/@fontsource/jetbrains-mono`
- Uses `satori` to render JSX-like layout to SVG
- Converts with `sharp` to 1200×630 PNG
- Output path: `/og/{lang}/blog/{slug}.png`

## Canvas Feature Architecture

```
src/pages/{en,pt}/canvas/index.astro
  → src/scripts/canvas/main.ts (Three.js, AbortController lifecycle)
    → src/scripts/canvas/animations/ (8 animation styles, v1/v2)
    → src/scripts/canvas/icons/
  → api/ (Cloudflare Worker)
    → Claude AI for brand analysis
    → Stripe for payments
    → KV for response caching
```

---

_Mapped: 2026-04-01_
