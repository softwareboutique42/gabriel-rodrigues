---
title: 'Bootstrap Responsive Navbar: From jQuery Collapse to CSS-Only Navigation'
description: 'I answered a Stack Overflow question about Bootstrap 3 responsive navbars in 2017. Today you can build the same thing with zero JavaScript.'
date: 2026-03-29
tags: ['bootstrap', 'css', 'responsive', 'stackoverflow']
lang: 'en'
---

# Bootstrap Responsive Navbar: From jQuery Collapse to CSS-Only Navigation

Back in 2017, I wrote an answer on Stack Overflow in Portuguese about making a responsive navbar with Bootstrap 3. The answer got 4 upvotes and covered the standard approach — `navbar-collapse`, `data-toggle`, and the jQuery plugin that powered the hamburger menu animation. It was the bread and butter of front-end development at the time. Nearly every website I built between 2014 and 2018 had that exact same navbar pattern.

## The jQuery-Powered Collapse

Bootstrap 3's responsive navbar was elegant for its era, but it came with baggage. Here's what the typical setup looked like:

```html
<nav class="navbar navbar-default">
  <div class="container">
    <div class="navbar-header">
      <button
        type="button"
        class="navbar-toggle collapsed"
        data-toggle="collapse"
        data-target="#main-nav"
      >
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
      </button>
      <a class="navbar-brand" href="/">MySite</a>
    </div>
    <div class="collapse navbar-collapse" id="main-nav">
      <ul class="nav navbar-nav">
        <li><a href="/about">About</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
    </div>
  </div>
</nav>
```

To make this work, you needed Bootstrap's CSS, Bootstrap's JavaScript, and jQuery. Three dependencies for a hamburger menu. The collapse plugin would toggle a class, jQuery would animate the height, and if you had any custom behavior you were writing more jQuery on top of it. I remember debugging z-index issues, dealing with the navbar not collapsing when a link was clicked on mobile, and fighting the transition timing.

Bootstrap 4 improved things by moving to vanilla JavaScript options and flexbox, and Bootstrap 5 dropped jQuery entirely. But the mental model stayed the same — a JavaScript-driven toggle mechanism.

## CSS-Only Navigation in 2026

Today you can build a fully responsive navbar without a single line of JavaScript. Modern CSS has closed the gap entirely.

**The `<details>` element** gives you a disclosure widget with built-in toggle behavior, no JS required:

```html
<nav class="site-nav">
  <a href="/" class="brand">MySite</a>
  <details class="nav-menu">
    <summary aria-label="Menu">☰</summary>
    <ul>
      <li><a href="/about">About</a></li>
      <li><a href="/contact">Contact</a></li>
    </ul>
  </details>
</nav>
```

```css
.site-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-menu > summary {
  display: none;
  font-size: 1.5rem;
  cursor: pointer;
  list-style: none;
}

.nav-menu ul {
  display: flex;
  gap: 1.5rem;
  list-style: none;
}

@container (max-width: 600px) {
  .nav-menu > summary {
    display: block;
  }
  .nav-menu ul {
    flex-direction: column;
  }
  .nav-menu:not([open]) ul {
    display: none;
  }
}
```

**Container queries** make the navbar responsive to its own container size, not the viewport. This is a fundamental shift. Your navbar component can be dropped into a sidebar, a modal, or a full-width header, and it adapts based on the space available to it.

**The `:has()` selector** opens up patterns that were impossible without JavaScript. Want to style the navbar differently when the menu is open? No toggle class needed:

```css
.site-nav:has(details[open]) {
  background: var(--color-surface);
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.1);
}
```

You can even use `:has()` to prevent body scrolling when the mobile menu is open — something that used to require JavaScript event listeners:

```css
body:has(.nav-menu[open]) {
  overflow: hidden;
}
```

## The Bigger Picture

The shift here is not just about navbars. It is about the entire category of UI interactions that used to require JavaScript becoming pure CSS. Accordions, tabs, dropdown menus, tooltips — CSS can handle all of these now. When I answered that Bootstrap question in 2017, I could not have imagined building a production navbar with zero JavaScript dependencies. Today it is not just possible, it is the better approach for most cases — fewer bytes, no hydration cost, and it works even when JavaScript fails to load.
