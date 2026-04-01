# Structure

## Root Directory

```
/home/gabriel/Documents/gabriel-rodrigues/
├── src/                    # Application source
├── e2e/                    # Playwright E2E tests
├── workers/                # (likely Cloudflare Worker source — see api/)
├── api/                    # Cloudflare Worker — Claude AI + Stripe + KV
├── public/                 # Static assets served as-is
├── dist/                   # Build output (gitignored)
├── astro.config.mjs        # Astro configuration
├── playwright.config.ts    # E2E test configuration
├── tsconfig.json           # TypeScript configuration
├── eslint.config.js        # ESLint flat config
├── package.json            # Dependencies and scripts
├── CLAUDE.md               # Claude Code project instructions
├── PLAYBOOK.md             # Project playbook
└── README.md               # Project documentation
```

## Source Tree

```
src/
├── pages/                  # File-based routing
│   ├── index.astro         # Root redirect → /en/
│   ├── 404.astro           # 404 error page
│   ├── og/
│   │   └── [...slug].png.ts  # Build-time OG image generation
│   ├── en/                 # English routes
│   │   ├── index.astro     # Homepage
│   │   ├── resume.astro    # Resume/CV
│   │   ├── blog/
│   │   │   ├── index.astro         # Blog listing
│   │   │   └── [...slug].astro     # Individual blog posts
│   │   └── canvas/
│   │       └── index.astro         # Three.js animation generator
│   └── pt/                 # Portuguese routes (mirrors en/)
│       ├── index.astro
│       ├── resume.astro
│       ├── blog/
│       │   ├── index.astro
│       │   └── [...slug].astro
│       └── canvas/
│           └── index.astro
├── layouts/
│   ├── BaseLayout.astro    # Root HTML shell (meta, OG, GTM, AdSense, transitions)
│   └── BlogPostLayout.astro  # Blog wrapper (article schema, ShareBar, AdUnit)
├── components/
│   ├── Header.astro        # Site header with nav
│   ├── Footer.astro        # Site footer
│   ├── BlogCard.astro      # Blog post preview card
│   ├── ShareBar.astro      # Social share buttons
│   ├── TableOfContents.astro  # Blog post TOC
│   ├── RelatedPosts.astro  # Related posts section
│   ├── LanguageSwitcher.astro  # EN/PT toggle
│   ├── ExperienceCard.astro    # Resume experience item
│   └── AdUnit.astro        # Google AdSense unit
├── content/
│   ├── blog/
│   │   ├── en/             # English blog posts (.md)
│   │   └── pt/             # Portuguese blog posts (.md)
│   └── config.ts           # Content collection schema definition
├── i18n/
│   ├── en.json             # English translation strings
│   ├── pt.json             # Portuguese translation strings
│   └── utils.ts            # getLangFromUrl(), useTranslations()
├── scripts/
│   └── canvas/
│       ├── main.ts         # Three.js lifecycle (AbortController pattern)
│       ├── animations/     # 8 animation styles (v1 Classic, v2 Story)
│       └── icons/          # Icon assets for canvas
└── styles/
    └── global.css          # Tailwind CSS v4 + design tokens
```

## Key File Locations

| What                                    | Where                           |
| --------------------------------------- | ------------------------------- |
| Site config (URL, output, integrations) | `astro.config.mjs`              |
| Content schema                          | `src/content.config.ts`         |
| Design tokens (colors, fonts)           | `src/styles/global.css`         |
| i18n helpers                            | `src/i18n/utils.ts`             |
| Translation strings                     | `src/i18n/{en,pt}.json`         |
| OG image template                       | `src/pages/og/[...slug].png.ts` |
| Canvas entry                            | `src/scripts/canvas/main.ts`    |
| E2E tests                               | `e2e/`                          |
| Cloudflare Worker                       | `api/`                          |

## Naming Conventions

- **Pages**: lowercase, kebab-case filenames (`blog/index.astro`, `resume.astro`)
- **Components**: PascalCase (`.astro`) — `BlogCard.astro`, `ShareBar.astro`
- **Layouts**: PascalCase with `Layout` suffix — `BaseLayout.astro`, `BlogPostLayout.astro`
- **Blog posts**: kebab-case slugs in both `en/` and `pt/` — must exist in both languages
- **Scripts**: camelCase TypeScript (`main.ts`)
- **Styles**: `global.css` only — component styles in `<style>` blocks or Tailwind classes
- **i18n keys**: dot-notation strings referenced via `t('key')`

## Content Blog Post Structure

Each blog post is a `.md` file with frontmatter:

```markdown
---
title: 'Post Title'
description: 'Post description'
date: 2024-01-15
tags: ['html', 'css']
lang: 'en' # or "pt"
---

Post content here...
```

File must exist in both `src/content/blog/en/` and `src/content/blog/pt/` with the same filename.

---

_Mapped: 2026-04-01_
