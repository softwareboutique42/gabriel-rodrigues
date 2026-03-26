---
title: '10 JavaScript Patterns I Learned from 300+ Stack Overflow Answers'
description: 'Real patterns from real questions — DOM performance, debounce, clipboard, file uploads, and more. Each one taught me something I still use today.'
date: 2026-03-26
tags: ['javascript', 'stackoverflow', 'patterns', 'web development']
lang: 'en'
---

# 10 JavaScript Patterns I Learned from 300+ Stack Overflow Answers

Between 2014 and 2020, I answered over 300 questions on [Stack Overflow in Portuguese](https://pt.stackoverflow.com/users/17658/gabriel-rodrigues), reaching the top 50 in overall reputation. Most answers were about JavaScript, PHP, HTML, and CSS — the bread and butter of the web.

Looking back at those answers, I realized many of them teach the same core patterns that I still use professionally. Here are 10 of them — updated for 2026.

## 1. appendChild vs innerHTML vs insertAdjacentHTML

**The question:** What's the best way to add elements to the DOM?

My [most voted answer](https://pt.stackoverflow.com/questions/120708) compared these three approaches with benchmarks. The short version:

```javascript
// Slow: re-parses entire container
container.innerHTML += '<div>New item</div>';

// Fast: appends without re-parsing
const el = document.createElement('div');
el.textContent = 'New item';
container.appendChild(el);

// Best of both worlds: fast + HTML string support
container.insertAdjacentHTML('beforeend', '<div>New item</div>');
```

`innerHTML +=` re-parses the entire container. `appendChild` is fast but verbose. `insertAdjacentHTML` gives you the convenience of HTML strings with the performance of targeted insertion.

**Modern take:** This pattern is just as relevant in 2026. Even with frameworks handling most DOM updates, understanding _why_ virtual DOMs exist starts here.

## 2. The Debounce Pattern

**The question:** How to trigger an action after the user stops typing?

This is one of the most reusable patterns in frontend development:

```javascript
let timer;
input.addEventListener('input', () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    search(input.value);
  }, 300);
});
```

The trick is `clearTimeout` — every keystroke cancels the previous timer. Only when the user pauses for 300ms does the function actually fire.

**Modern take:** You can still write this by hand for simple cases, but libraries like `lodash.debounce` or the [`Scheduler API`](https://developer.mozilla.org/en-US/docs/Web/API/Scheduler) handle edge cases (leading/trailing calls, cancellation) more robustly.

## 3. Clipboard Copy

**The question:** How to copy text to the clipboard across browsers?

My [second highest answer](https://pt.stackoverflow.com/questions/89498) showed the `execCommand('copy')` approach. That API is now deprecated.

```javascript
// 2016 approach (deprecated)
input.select();
document.execCommand('copy');

// 2026 approach
await navigator.clipboard.writeText('text to copy');
```

The modern Clipboard API is async, promise-based, and works without creating hidden input elements. I actually use this exact pattern in the [ShareBar](/en/blog/shareable-brand-urls/) on this blog.

**Modern take:** Always use `navigator.clipboard.writeText()`. It requires a secure context (HTTPS) and user gesture, which is the right security model.

## 4. Checking if an Object is Empty

**The question:** How to check if a JavaScript object has no properties — without jQuery?

```javascript
// The classic for...in approach
function isEmpty(obj) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) return false;
  }
  return true;
}

// The modern one-liner
const isEmpty = (obj) => Object.keys(obj).length === 0;
```

**Modern take:** `Object.keys(obj).length === 0` is the standard idiom. For edge cases with symbols or non-enumerable properties, use `Reflect.ownKeys(obj).length === 0`.

## 5. FormData for File Uploads

**The question:** How to upload files with AJAX?

The `FormData` API makes file uploads trivial, but the configuration trips people up:

```javascript
const form = document.getElementById('upload-form');
const formData = new FormData(form);

// jQuery (2016)
$.ajax({
  url: '/upload',
  type: 'POST',
  data: formData,
  contentType: false, // Don't set Content-Type (browser adds multipart boundary)
  processData: false, // Don't serialize FormData to string
});

// Modern fetch (2026)
const response = await fetch('/upload', {
  method: 'POST',
  body: formData, // fetch handles Content-Type automatically
});
```

**Modern take:** `fetch` with `FormData` just works — no special flags needed. The browser sets the `multipart/form-data` boundary automatically.

## 6. JSON + Web Storage

**The question:** How to store objects in sessionStorage?

Web Storage only accepts strings. The pattern is simple but fundamental:

```javascript
// Store
const user = { name: 'Gabriel', role: 'engineer' };
sessionStorage.setItem('user', JSON.stringify(user));

// Retrieve
const stored = JSON.parse(sessionStorage.getItem('user'));
```

**Modern take:** Still the same pattern. For complex state, consider IndexedDB or libraries like `idb-keyval`. And always handle the case where `getItem` returns `null`.

## 7. Input Filtering at the Keystroke Level

**The question:** How to block special characters in an input field?

The original approach used `keypress` and `String.fromCharCode`:

```javascript
// 2016: keypress + char code
input.onkeypress = (e) => {
  const char = String.fromCharCode(e.which);
  if (!/[a-zA-Z0-9]/.test(char)) e.preventDefault();
};

// 2026: input event + regex replace
input.addEventListener('input', () => {
  input.value = input.value.replace(/[^a-zA-Z0-9]/g, '');
});
```

**Modern take:** The `input` event is more reliable — it catches paste, autofill, and speech input. Combine with `pattern` attribute for native validation.

## 8. Dynamic Script Loading

**The question:** How to include a JS file inside another JS file?

Before ES modules, this was how you loaded scripts dynamically:

```javascript
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

await loadScript('https://cdn.example.com/lib.js');
```

**Modern take:** Use ES modules with `import()` for dynamic loading. But the `createElement('script')` pattern is still how analytics snippets, third-party widgets, and tag managers work under the hood — including the [Google Tag Manager snippet](/en/blog/ai-powered-frontend/) on this very site.

## 9. Custom Right-Click Context Menu

**The question:** How to create a custom context menu?

```javascript
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  const menu = document.getElementById('context-menu');
  menu.style.display = 'block';
  menu.style.left = `${e.clientX}px`;
  menu.style.top = `${e.clientY}px`;
});

document.addEventListener('click', () => {
  document.getElementById('context-menu').style.display = 'none';
});
```

**Modern take:** The `contextmenu` event + `clientX/Y` positioning is still the core pattern. Modern implementations add boundary detection (so the menu doesn't overflow the viewport) and keyboard support for accessibility.

## 10. Event Delegation for Dynamic Elements

**The question:** How to handle click events on elements that don't exist yet?

This is probably the most important pattern on this list:

```javascript
// Won't work for dynamically added .delete-btn elements
document.querySelectorAll('.delete-btn').forEach((btn) => {
  btn.addEventListener('click', handleDelete);
});

// Works for current AND future elements
document.getElementById('list').addEventListener('click', (e) => {
  if (e.target.closest('.delete-btn')) {
    handleDelete(e);
  }
});
```

The key insight: attach the listener to a stable parent, then check `e.target` to see if the clicked element matches your selector.

**Modern take:** Event delegation is fundamental to how React, Vue, and every modern framework handles events internally. Understanding it helps you debug framework behavior and write efficient vanilla JS.

## What I Learned from Stack Overflow

Answering 300+ questions taught me more than any course:

- **Explaining forces understanding.** If you can't explain `appendChild` vs `innerHTML` to a beginner, you don't really understand the DOM.
- **Patterns repeat.** The same 20-30 patterns solve 80% of frontend questions.
- **The web platform evolves.** Half of my 2015 answers have better solutions in 2026. That's a feature, not a bug.

If you want to level up, try answering questions on Stack Overflow. The community teaches you as much as you teach it.
