# Plan: Daily Continuous Improvement — Blog & Canvas

## Context

Gabriel's site (gabriel-rodrigues.com) has a blog (7 posts EN+PT), a Canvas generator (8 animation styles, Stripe monetization), and a resume. He works on improvements **flexibly, mostly on weekends**, balancing three goals equally: **SEO/traffic**, **monetization**, and **content/authority**.

**Canvas direction:** The canvas currently generates abstract animations. Gabriel wants it to **draw industry-relevant animated icons** based on the company's industry (e.g., a rocket for aerospace, a shopping cart for e-commerce) — making generations more meaningful and shareable.

## Schedule Philosophy

- **Weekdays (optional):** Light prep — research, plan, outline articles, review analytics
- **Weekends:** Implementation sprints — ship 1-2 features or 1 article per session
- **Each week** rotates focus: Week A = Blog, Week B = Canvas, Week C = SEO/Infrastructure
- Tasks are ordered by impact and build on each other incrementally

## Week 2 — Canvas: Industry Icons `~weekend sprint`

### W2.1 — Design Icon System `~1 hour`

**Goal:** Define how industry icons map to Three.js drawings

- Create `src/scripts/canvas/icons/` directory
- Define icon registry: `{ industry: string, drawFn: (scene, colors) => void }`
- Start with 8-10 industries: tech (circuit board), finance (chart), food (fork/knife), health (heartbeat), aerospace (rocket), e-commerce (cart), education (book), music (waveform), automotive (wheel), energy (lightning)
- Each icon is a simple geometric shape animated with Three.js (rotating, pulsing, or morphing)
- **Key decision:** Icons are procedural Three.js geometry, not loaded SVGs — keeps bundle small and animations smooth

### W2.2 — Implement Icon Renderers `~2 hours`

**Goal:** Build the actual Three.js icon drawing functions

- Create `src/scripts/canvas/icons/index.ts` — icon registry + factory
- Create individual icon files: `tech.ts`, `finance.ts`, `food.ts`, etc.
- Each exports a function that adds animated geometry to the Three.js scene
- Icons use the brand's color palette (already provided by Claude API)
- Position icon prominently in canvas (center or top-right, depending on animation style)

### W2.3 — Integrate Icons with Generation Flow `~1 hour`

**Goal:** Claude API already returns `industry` — use it to select an icon

- Modify `src/scripts/canvas/main.ts` to look up industry from config and render matching icon
- Update animation base class to support an optional icon layer
- Fallback: if industry doesn't match any icon, use a generic abstract shape
- **Files:** `main.ts`, `animations/base.ts`, `types.ts`

---

## Week 3 — SEO & Infrastructure

### W3.1 — Tag Archive Pages `~1 hour`

**Goal:** Create `/blog/tags/[tag]/` pages for better internal linking and SEO

- Create `src/pages/en/blog/tags/[tag].astro` — lists all posts with that tag
- Same for PT
- Make tags clickable in BlogCard and BlogPostLayout
- Add i18n: `blog.taggedWith`
- **Files:** New tag page, `BlogCard.astro`, `BlogPostLayout.astro`

---

## Week 4 — Canvas: Polish & Monetization

### W4.1 — Canvas Gallery Page `~1.5 hours`

**Goal:** Showcase generated canvases to attract visitors

- Create `/en/canvas/gallery/` and `/pt/canvas/gallery/`
- Fetch recent popular companies from KV (add a list endpoint to the Worker)
- Display grid of canvas thumbnails (static screenshots or re-rendered previews)
- Each links to the canvas generator with `?company=` pre-filled
- **Files:** New page, Worker API update

### W4.2 — Pricing Tiers `~1 hour`

**Goal:** Increase revenue per user

- Update Stripe integration: $1 PNG, $3 PNG+SVG, $5 PNG+SVG+MP4
- Show tier selection before checkout
- **Skill:** `.claude/skills/canvas-pricing.md` (detailed guidance exists)
- **Files:** `main.ts`, Worker `stripe.ts`

### W4.3 — Third SO Article `~1.5 hours`

**Goal:** Maintain weekly publishing

- Theme: "PHP Patterns That Still Hold Up" or "jQuery to Modern JS: Migration Patterns"

---

## Week 5+ — Rotating Improvements

After the first month, rotate weekly between these tracks:

### Blog Track (pick 1 per cycle)

- [ ] Newsletter signup CTA (ConvertKit/Buttondown integration)
- [ ] Comments system (giscus — GitHub Discussions-based, zero cost)
- [ ] Code block copy button in blog posts
- [ ] SO article: "Bootstrap Responsive Patterns"
- [ ] SO article: "MySQL Query Patterns for Frontend Devs"
- [ ] SO article: "My Stack Overflow Journey: From Beginner to Top 50"
- [ ] Pagination (when posts > 12)

### Canvas Track (pick 1 per cycle)

- [ ] Video export (MP4/WebM) — `.claude/skills/canvas-video-export.md`
- [ ] Embed widget — `.claude/skills/canvas-embed.md`
- [ ] More icon industries (20+ total)
- [ ] Icon animation variations (bounce, spin, morph, draw-on)
- [ ] Canvas sharing analytics — `.claude/skills/canvas-analytics.md`
- [ ] Promo codes system
- [ ] Canvas A/B test: different CTAs for download button

### SEO/Infra Track (pick 1 per cycle)

- [ ] Structured data: BreadcrumbList for blog posts
- [ ] Performance audit: Lighthouse 100 across all pages
- [ ] 404 page improvements (suggest recent posts)
- [ ] Projects showcase page (`/projects/`)
- [ ] Uses page (`/uses/`) — tech stack, tools, services
- [ ] Analytics dashboard (simple page showing blog/canvas stats)

---

## Skills Reference

Existing skills in `.claude/skills/` to use during implementation:
| Skill | When to use |
|-------|------------|
| `create-new-post-based-on-last-commit.md` | Writing any new blog post |
| `canvas-pricing.md` | Week 4 pricing tiers |
| `canvas-video-export.md` | Week 5+ video export |
| `canvas-embed.md` | Week 5+ embed widget |
| `canvas-analytics.md` | Week 5+ sharing analytics |
| `canvas-seo.md` | Any canvas page SEO work |
| `canvas-test.md` | E2E testing canvas changes |
| `canvas-harden.md` | Security review after canvas changes |

## Verification (per feature)

1. `npm run build` — no errors
2. `npm run lint` — no new warnings
3. `npm run test` — E2E tests pass
4. Manual check on dev server: feature works in both EN and PT
5. View Transitions: navigate back/forward, feature still works
