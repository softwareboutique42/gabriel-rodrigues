---
title: 'SVG Explained: From XML Curiosity to First-Class Web Citizen'
description: 'From a 2015 Stack Overflow answer explaining what SVG is to the component-driven, optimized SVG workflows of 2026 — how vector graphics won the web.'
date: 2026-03-29
tags: ['svg', 'html', 'stackoverflow', 'graphics']
lang: 'en'
---

# SVG Explained: From XML Curiosity to First-Class Web Citizen

In 2015, I wrote an answer on Stack Overflow in Portuguese explaining what SVG is. The question was simple enough — someone wanted to understand this format they kept hearing about. Back then, most developers still reached for PNG sprites or icon fonts when they needed icons on a page. SVG felt like an oddity: an XML-based image format that lived in your markup. My answer got 17 upvotes, which told me people genuinely needed this explanation.

Eleven years later, SVG isn't just understood — it's the default. Here's what I explained back then, what changed since, and why understanding SVG's XML roots still matters in 2026.

## The 2015 Answer: SVG Basics

SVG stands for **Scalable Vector Graphics**. It's an XML-based format for describing two-dimensional graphics. Unlike raster formats (PNG, JPG, GIF), SVG doesn't store pixels — it stores instructions. A circle is a `<circle>` element with coordinates and a radius. A rectangle is a `<rect>` with width and height. The browser reads those instructions and renders the shape at whatever resolution you need.

That's the key selling point I emphasized in 2015: **SVG scales to any size without losing quality**. A 16x16 icon and a billboard-sized logo can use the exact same file.

Here's the kind of code I showed in that answer — a simple rectangle:

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100">
  <rect x="10" y="10" width="180" height="80" fill="#3498db" stroke="#2c3e50" stroke-width="2" />
</svg>
```

And a circle:

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
  <circle cx="50" cy="50" r="40" fill="#e74c3c" stroke="#c0392b" stroke-width="2" />
</svg>
```

Plain XML. You can open it in a text editor, change the `fill` color, adjust the dimensions, and it just works. I also mentioned that SVG is **free and open** — it's a W3C standard, not tied to any proprietary tool.

For creating SVGs, I recommended **Inkscape**, the open-source vector editor. For programmatic manipulation in JavaScript, libraries like **RaphaelJS** were popular at the time. The answer covered the basics: you can embed SVG inline in HTML, reference it as an `<img>` source, or use it as a CSS background.

That was the state of SVG knowledge most developers needed in 2015. Know what it is, know it scales, know you can edit the XML. Done.

## What Changed: SVG in 2026

Almost everything about how we use SVG day-to-day has evolved. The format itself hasn't changed much — the SVG 2 spec moved slowly — but the ecosystem around it transformed completely.

### Icon Fonts Are Dead

In 2015, Font Awesome was king. You'd load a web font containing hundreds of icons, use CSS classes to display them, and accept the trade-offs: poor accessibility, rendering quirks, single-color limitation, and the overhead of loading an entire font for twenty icons.

SVG icon libraries killed that pattern. **Lucide**, **Heroicons**, **Phosphor Icons** — these all ship as individual SVG files or framework components. You import only what you use. Each icon is a real DOM element you can style, animate, and make accessible. The "icon font vs SVG" debate is settled. SVG won.

### Inline SVG in Component Frameworks

This is the biggest workflow shift. In 2015, embedding SVG meant copy-pasting XML into your HTML. In 2026, every major framework treats SVG as a first-class component:

```astro
---
import IconArrow from '../icons/Arrow.astro';
---

<IconArrow class="w-5 h-5 text-neon" />
```

```jsx
import { ArrowRight } from 'lucide-react';

export default function Button() {
  return (
    <button>
      Next <ArrowRight size={20} />
    </button>
  );
}
```

SVG lives inside your component tree. You pass props to control size and color. It's no different from any other component.

### SVG Animation with CSS

In 2015, animating SVG meant reaching for JavaScript libraries like Snap.svg or GSAP. Today, CSS handles most SVG animation natively:

```css
.icon-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.path-draw {
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  animation: draw 1.5s ease forwards;
}

@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}
```

The `stroke-dasharray` / `stroke-dashoffset` technique for path drawing animations is especially powerful — you can make SVG illustrations appear to draw themselves with pure CSS.

### SVG Sprites with `<use>`

For projects with many icons, the `<use>` pattern became standard. You define all icons in a hidden SVG sprite sheet, then reference them by ID:

```html
<!-- Hidden sprite sheet -->
<svg style="display: none;">
  <symbol id="icon-home" viewBox="0 0 24 24">
    <path d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3..." />
  </symbol>
</svg>

<!-- Usage anywhere in the page -->
<svg class="icon"><use href="#icon-home" /></svg>
```

One HTTP request, zero duplication, and the browser caches the sprite sheet efficiently.

### SVGO and the Optimization Pipeline

Raw SVG exported from design tools is bloated. Figma, Sketch, and Illustrator all add editor metadata, redundant attributes, and unnecessary precision. **SVGO** (SVG Optimizer) strips all of that:

```bash
npx svgo icon.svg -o icon.min.svg
# Typically 30-60% size reduction
```

In 2026, SVGO runs automatically in most build pipelines. Vite, Astro, Next.js — they all have plugins or built-in support for optimizing SVG at build time.

### Accessibility

This is something I didn't cover in 2015, and it matters. An `<img>` with `alt` text is accessible by default. Inline SVG is not — screen readers need explicit hints:

```html
<svg role="img" aria-label="Home">
  <use href="#icon-home" />
</svg>
```

For decorative icons, you hide them from assistive technology:

```html
<svg aria-hidden="true">
  <use href="#icon-arrow" />
</svg>
```

Small detail, big impact for users who rely on screen readers.

## The Modern Workflow

Here's what a typical SVG workflow looks like in 2026:

1. **Design** in Figma (or any vector tool)
2. **Export** as SVG
3. **Optimize** with SVGO (automated in CI or build step)
4. **Import** as a framework component
5. **Style** with Tailwind or CSS custom properties
6. **Animate** with CSS transitions/keyframes if needed
7. **Accessible** — add `role="img"` and `aria-label`, or `aria-hidden="true"` for decorative use

The designer-to-developer handoff for icons went from "here's a sprite sheet PNG and a coordinate map" to "here's a Figma file, export what you need." The format is the same on both sides. No conversion step, no quality loss.

## The Takeaway

SVG won the icon war. It replaced icon fonts, it replaced PNG sprites, and it became the universal format for vector graphics on the web. But here's what's interesting: **understanding the XML roots I explained in 2015 still matters**.

When SVGO strips an attribute you actually needed, you need to know what `viewBox` does. When an icon doesn't scale correctly in your component, you need to understand `width`, `height`, and coordinate systems. When you want to animate a specific path, you need to read the `<path d="...">` syntax.

The tools got better. The workflows got smoother. But SVG is still XML under the hood, and the developers who know that have an edge over those who treat it as a black box.

That 2015 answer covered the fundamentals — and fundamentals have a longer shelf life than any framework.
