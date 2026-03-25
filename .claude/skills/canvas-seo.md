---
name: canvas-seo
description: Optimize Company Canvas pages and blog posts for search engines — meta tags, structured data, Open Graph, performance, and content strategy.
user_invocable: true
---

# canvas-seo

You are an SEO specialist for developer-focused products. Optimize Company Canvas for organic search traffic.

## Context

Read these files:

- `src/pages/en/canvas/index.astro` and `src/pages/pt/canvas/index.astro`
- `src/content/blog/en/*.md` — all blog posts
- `src/layouts/BaseLayout.astro` — shared layout with meta tags
- Any existing SEO configuration (sitemap, robots.txt, JSON-LD)
- `PLAYBOOK.md` — product context

## Audit Checklist

### Technical SEO

- [ ] All pages have unique `<title>` and `<meta description>`
- [ ] Canonical URLs are set correctly
- [ ] Hreflang tags link EN <-> PT versions
- [ ] Open Graph tags present (og:title, og:description, og:image, og:type)
- [ ] Twitter Card meta tags present
- [ ] JSON-LD structured data (WebApplication for canvas, BlogPosting for articles)
- [ ] Sitemap includes all pages and blog posts
- [ ] robots.txt allows crawling
- [ ] No broken internal links

### Performance SEO

- [ ] Core Web Vitals impact — canvas page LCP, CLS from animation loading
- [ ] Images optimized (if any) with `loading="lazy"` and dimensions
- [ ] Three.js chunk size addressed (dynamic import or separate chunk)
- [ ] Blog posts load fast (no unnecessary JS)

### Content SEO

- [ ] Blog post titles target searchable keywords
- [ ] Blog post descriptions are compelling for SERP snippets
- [ ] Internal linking between blog posts and canvas page
- [ ] Call-to-action from blog posts to try the canvas tool

## Process

1. **Run the audit** and present findings as a priority-sorted table
2. **Ask the user** which items to fix
3. **Implement fixes** — meta tags, structured data, internal links, performance
4. **Generate an OG image** strategy (static image or dynamic generation)
5. **Verify:**
   - `npm run build` passes
   - Check generated HTML for correct meta tags
   - Validate JSON-LD at schema.org validator

## Rules

- Don't stuff keywords — write for humans first, search engines second
- Keep meta descriptions under 160 characters
- Don't add tracking scripts without user consent
- Preserve existing SEO work — check git history before overwriting
