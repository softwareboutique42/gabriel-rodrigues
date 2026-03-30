---
title: 'jQuery DOM Traversal to Vanilla JS: siblings(), next(), and Beyond'
description: 'My Stack Overflow answer explained jQuery siblings() and next(). In 2026, native DOM methods like closest() and :has() cover everything jQuery offered.'
date: 2026-03-29
tags: ['javascript', 'jquery', 'dom', 'stackoverflow']
lang: 'en'
---

# jQuery DOM Traversal to Vanilla JS: siblings(), next(), and Beyond

I answered a question on Stack Overflow in Portuguese about jQuery's `siblings()` and `next()` methods — how they work, when to use each. It scored 7 upvotes. At the time, jQuery wasn't just popular; it was the default way to interact with the DOM. Nobody questioned whether you needed it.

## The Then: jQuery as the DOM API

The question was about navigating between sibling elements. In jQuery, this was elegant:

```javascript
// Get all siblings of an element
$('.current').siblings().addClass('faded');

// Get the next sibling
$('.current').next().addClass('highlighted');

// Get the previous sibling
$('.current').prev().addClass('highlighted');

// Get all next siblings until a match
$('.current').nextUntil('.stop').addClass('selected');

// Traverse up to a parent
$('.current').closest('.container').addClass('active');

// Filter siblings
$('.current')
  .siblings('.item')
  .each(function () {
    $(this).toggle();
  });
```

This was genuinely nice API design. jQuery's traversal methods were chainable, readable, and consistent. The native DOM API in 2012-2016 felt primitive by comparison — `nextSibling` returned text nodes, `parentNode` didn't filter, and there was no `closest()`.

People didn't use jQuery because they were lazy. They used it because the native alternative was painful.

## The Now: Native DOM Caught Up

In 2026, every jQuery traversal method has a native equivalent that's just as clean:

```javascript
const el = document.querySelector('.current');

// Next element sibling (skips text nodes automatically)
el.nextElementSibling.classList.add('highlighted');

// Previous element sibling
el.previousElementSibling.classList.add('highlighted');

// Closest ancestor matching a selector
el.closest('.container').classList.add('active');

// All siblings — no direct method, but easy pattern
const siblings = [...el.parentElement.children].filter((child) => child !== el);
siblings.forEach((sib) => sib.classList.add('faded'));

// QuerySelector from a parent
el.parentElement.querySelectorAll('.item').forEach((item) => {
  item.classList.toggle('visible');
});
```

### The :has() Game-Changer

CSS `:has()` — shipped in all browsers by 2023 — eliminated entire categories of JavaScript DOM traversal:

```css
/* Style a parent based on its children — no JS needed */
.container:has(.current) {
  border-color: var(--highlight);
}

/* Style siblings of a checked input */
.item:has(+ .item.active) {
  opacity: 0.5;
}

/* Complex conditional styling that used to require jQuery */
.nav:has(.dropdown:hover) .backdrop {
  display: block;
}
```

Things that required `siblings()` calls and class toggling in jQuery can now be pure CSS.

### Modern Patterns Replace Traversal

The deeper shift is architectural. In React, Vue, or Svelte, you rarely traverse the DOM at all:

```javascript
// Instead of traversing siblings, you manage state
const [activeIndex, setActiveIndex] = useState(0);

items.map((item, i) => <div className={i === activeIndex ? 'active' : 'faded'}>{item.label}</div>);
```

## What I Learned

jQuery traversal was a symptom of a DOM API that wasn't designed for application development. The browser vendors saw what developers needed and eventually shipped it natively: `closest()`, `nextElementSibling`, `:has()`, `classList`, `querySelectorAll()`.

My Stack Overflow answer was teaching the jQuery way. Today, I'd say: learn the native API first. It's not 2014 anymore — the platform caught up, and the extra 30KB of jQuery buys you almost nothing.
