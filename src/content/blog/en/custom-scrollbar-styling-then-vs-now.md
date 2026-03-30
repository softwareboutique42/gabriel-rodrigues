---
title: 'Custom Scrollbar Styling: From WebKit Hacks to W3C Standards'
description: 'My 2015 Stack Overflow answer used ::-webkit-scrollbar pseudo-elements for custom scrollbars. In 2026, two standard CSS properties replace dozens of pseudo-elements.'
date: 2026-03-29
tags: ['css', 'ux', 'stackoverflow', 'design']
lang: 'en'
---

# Custom Scrollbar Styling: From WebKit Hacks to W3C Standards

In 2015, I answered a [question on Stack Overflow in Portuguese](https://pt.stackoverflow.com/questions/87413) about styling scrollbars with CSS. It scored 4 upvotes — one of those problems where the answer worked perfectly in Chrome and didn't work at all anywhere else.

That was the fundamental issue with scrollbar styling for nearly a decade. It was a WebKit-only world, and everyone else was locked out.

## The 2015 Approach: WebKit Pseudo-Elements

Styling scrollbars in 2015 meant using a family of vendor-prefixed pseudo-elements that only Chrome and Safari understood:

```css
/* 2015: The WebKit scrollbar pseudo-elements */
::-webkit-scrollbar {
  width: 12px;
}

::-webkit-scrollbar-track {
  background: #1a1a1a;
  border-radius: 6px;
}

::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 6px;
  border: 2px solid #1a1a1a;
}

::-webkit-scrollbar-thumb:hover {
  background: #888;
}

::-webkit-scrollbar-corner {
  background: #1a1a1a;
}
```

It looked great in Chrome. The problem? Firefox displayed the default system scrollbar. Internet Explorer had its own `scrollbar-*` properties from the IE5 era that barely worked. Every other browser — Edge (pre-Chromium), Opera Mini, mobile browsers — showed whatever they wanted.

### The Full List of Pseudo-Elements

The WebKit scrollbar API was surprisingly detailed. You could target:

- `::-webkit-scrollbar` — the entire scrollbar
- `::-webkit-scrollbar-track` — the track behind the thumb
- `::-webkit-scrollbar-thumb` — the draggable handle
- `::-webkit-scrollbar-track-piece` — the parts of the track not covered by the thumb
- `::-webkit-scrollbar-corner` — the intersection of horizontal and vertical scrollbars
- `::-webkit-scrollbar-button` — the up/down arrows (if present)

And each of these could take pseudo-class states like `:hover`, `:active`, `:horizontal`, `:vertical`, `:increment`, `:decrement`. The combination matrix was enormous.

In practice, most developers used three: the scrollbar itself, the track, and the thumb. But the fact that you needed at minimum three selectors for a simple visual change was already a sign that the API was overengineered for most use cases.

### The Firefox Problem

Firefox had no CSS scrollbar support in 2015. The options were:

1. **Accept the default scrollbar** — technically fine, visually inconsistent
2. **Hide the scrollbar and build a custom one** — JavaScript libraries like Perfect Scrollbar, SimpleBar, or custom implementations using `overflow: hidden` with a JavaScript-driven scroll container
3. **Use a Firefox-specific overlay** — some developers placed a colored div over where the scrollbar would appear, which was fragile and broke on resize

Most projects picked option 1 or 2. Option 2 meant adding a JavaScript dependency for a purely visual concern, which never felt right.

## The 2026 Approach: Two Properties, Full Browser Support

The W3C standardized scrollbar styling with just two properties:

```css
/* 2026: Standard scrollbar styling */
.container {
  scrollbar-width: thin; /* auto | thin | none */
  scrollbar-color: #555 #1a1a1a; /* thumb-color track-color */
}
```

That's it. Two properties replace the entire WebKit pseudo-element family for the most common use case.

### What Each Property Does

**`scrollbar-width`** accepts three values:

- `auto` — default browser scrollbar
- `thin` — a narrower scrollbar (browser determines exact size)
- `none` — hides the scrollbar entirely (content remains scrollable)

```css
/* Hide scrollbar but keep scrolling */
.horizontal-scroll {
  overflow-x: auto;
  scrollbar-width: none;
}
```

**`scrollbar-color`** takes exactly two color values:

- First value: thumb color (the draggable part)
- Second value: track color (the background)

```css
/* Dark theme scrollbar */
.dark-panel {
  scrollbar-color: #8eff71 #0e0e0e;
}

/* Subtle scrollbar that blends in */
.sidebar {
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}
```

### Browser Support

As of 2026, `scrollbar-width` and `scrollbar-color` work in:

- Firefox (supported since 2019 — they were ahead of the standard)
- Chrome/Edge (supported since 2024)
- Safari (supported since 2024)

Cross-browser scrollbar styling is finally real without vendor prefixes.

### scrollbar-gutter: The Bonus Property

There's a third property that solves a layout problem nobody talked about in 2015:

```css
/* Reserve space for the scrollbar, preventing layout shift */
.content {
  scrollbar-gutter: stable;
}

/* Reserve space on both sides for symmetric layout */
.centered-content {
  scrollbar-gutter: stable both-edges;
}
```

`scrollbar-gutter: stable` reserves the scrollbar's width even when the content doesn't overflow. This prevents the annoying layout shift that happens when content grows enough to trigger a scrollbar — the entire page jumps sideways by the scrollbar's width.

This was a problem we all knew about in 2015 but had no clean solution for. The usual workaround was `overflow-y: scroll` to force a scrollbar permanently, which looked bad.

## WebKit Pseudo-Elements vs Standard Properties

| What You Want      | 2015 (WebKit)                                      | 2026 (Standard)                |
| ------------------ | -------------------------------------------------- | ------------------------------ |
| Change thumb color | `::-webkit-scrollbar-thumb { background: ... }`    | `scrollbar-color: thumb track` |
| Change track color | `::-webkit-scrollbar-track { background: ... }`    | `scrollbar-color: thumb track` |
| Make it thinner    | `::-webkit-scrollbar { width: 8px }`               | `scrollbar-width: thin`        |
| Hide scrollbar     | `::-webkit-scrollbar { display: none }`            | `scrollbar-width: none`        |
| Rounded corners    | `::-webkit-scrollbar-thumb { border-radius: ... }` | Browser handles it             |
| Hover effects      | `::-webkit-scrollbar-thumb:hover { ... }`          | Not available (by design)      |

The standard API is intentionally simpler. You can't set exact pixel widths, you can't add border-radius, and you can't style hover states. This was a conscious decision — browsers should control the exact rendering for accessibility and platform consistency, while developers control the colors and general appearance.

### When You Still Need WebKit Pseudo-Elements

If your design requires pixel-perfect scrollbar dimensions, custom border-radius, or hover/active state changes, the WebKit pseudo-elements still work in Chromium and Safari. Some projects use both:

```css
/* Standard properties for Firefox and future-proofing */
.panel {
  scrollbar-width: thin;
  scrollbar-color: #555 #1a1a1a;
}

/* WebKit pseudo-elements for extra polish in Chromium/Safari */
.panel::-webkit-scrollbar {
  width: 8px;
}
.panel::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 4px;
}
.panel::-webkit-scrollbar-thumb:hover {
  background: #888;
}
```

This progressive enhancement pattern gives you cross-browser base styling with enhanced visuals where supported.

## The Takeaway

Scrollbar styling went from a WebKit hack to a W3C standard. Two CSS properties — `scrollbar-width` and `scrollbar-color` — replace dozens of pseudo-elements for the common case. Add `scrollbar-gutter` for layout stability, and you have a complete, cross-browser solution that would have saved me hours of vendor-prefix juggling in 2015. The standard API is deliberately simpler than the WebKit one, and that's a feature, not a limitation.
