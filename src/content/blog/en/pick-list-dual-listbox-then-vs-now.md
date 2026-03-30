---
title: 'Pick List / Dual Listbox: From jQuery Sortable to Headless Drag-and-Drop'
description: 'My Stack Overflow answer about building a dual listbox pick list scored 5 upvotes. In 2026, headless UI libraries and the native drag-and-drop API make this pattern accessible by default.'
date: 2026-03-29
tags: ['ui', 'ux', 'javascript', 'stackoverflow']
lang: 'en'
---

# Pick List / Dual Listbox: From jQuery Sortable to Headless Drag-and-Drop

I answered a [question on Stack Overflow in Portuguese](https://pt.stackoverflow.com/questions/118459) about building a pick list — that dual listbox pattern where users move items between two columns. It scored 5 upvotes, because this UI component showed up in every enterprise app and nobody could find a clean way to build it.

The solution worked with what we had at the time. But the tooling has changed so much that the same pattern is now almost trivial to implement correctly.

## The 2016 Problem: jQuery UI Sortable and Manual DOM Wrangling

The standard approach was jQuery UI Sortable with connected lists:

```javascript
// 2016: jQuery UI connected sortable lists
$('#available, #selected')
  .sortable({
    connectWith: '.connectable',
    placeholder: 'ui-state-highlight',
    receive: function (event, ui) {
      updateHiddenField();
    },
  })
  .disableSelection();
```

```html
<ul id="available" class="connectable">
  <li>Item A</li>
  <li>Item B</li>
</ul>
<button onclick="moveSelected()">→</button>
<button onclick="moveBack()">←</button>
<ul id="selected" class="connectable"></ul>
```

You also needed arrow buttons for users who didn't know they could drag. And the `moveSelected()` function was always a mess — manually cloning DOM nodes, removing originals, updating hidden form fields that actually submitted the data.

## What Made It Painful

The dual listbox was a perfect storm of UI challenges:

1. **Accessibility was an afterthought** — jQuery UI Sortable had no ARIA support. Screen readers couldn't tell users what was happening during drag operations
2. **State lived in the DOM** — The source of truth was the list of `<li>` elements, not a JavaScript data structure. Every operation was a DOM mutation
3. **Mobile was broken** — jQuery UI Sortable didn't support touch events natively. You needed jquery.ui.touch-punch.js, which was a hack on top of a hack
4. **Form submission was fragile** — You had to sync the visible list with hidden inputs on every change, and hope nothing got out of sync

I saw implementations where the hidden field update failed silently, and users would carefully arrange their selections only to submit an empty list. Fun times.

## The 2026 Approach: Headless UI and Native APIs

### Headless Listbox Components

Modern UI libraries separate behavior from presentation:

```jsx
// 2026: Headless dual listbox with proper accessibility
function DualListbox({ options, selected, onChange }) {
  return (
    <div role="group" aria-label="Item selection">
      <Listbox
        aria-label="Available items"
        items={options.filter((o) => !selected.includes(o.id))}
        onSelect={(items) => onChange([...selected, ...items])}
      />
      <div role="toolbar">
        <button aria-label="Move selected to chosen">→</button>
        <button aria-label="Remove selected from chosen">←</button>
      </div>
      <Listbox
        aria-label="Selected items"
        items={options.filter((o) => selected.includes(o.id))}
        onSelect={(items) => onChange(selected.filter((s) => !items.includes(s)))}
      />
    </div>
  );
}
```

State lives in JavaScript. The UI is a projection of that state. No DOM wrangling.

### Native Drag and Drop with ARIA Live Regions

```html
<!-- 2026: ARIA live region announces drag operations -->
<div aria-live="polite" class="sr-only" id="drag-announce"></div>
```

```javascript
// Announce drag operations for screen readers
element.addEventListener('dragstart', () => {
  document.getElementById('drag-announce').textContent =
    `Dragging ${item.name}. Drop on selected list to add.`;
});
```

The native Drag and Drop API now works on touch devices. Combined with ARIA live regions, screen reader users get real-time feedback about what's happening.

## What Changed

The pick list pattern itself hasn't changed — users still move items between two columns. What changed is that state management moved from the DOM to JavaScript, accessibility became a first-class concern rather than a retrofit, and touch support comes free with platform APIs.

That Stack Overflow answer solved the immediate implementation problem. But the bigger lesson is that complex interactive patterns only become reliable when the data model is separated from the presentation.
