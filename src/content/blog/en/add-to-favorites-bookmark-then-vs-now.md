---
title: 'Add to Favorites: From Browser APIs to PWA Install'
description: 'My 2015 SO answer showed window.external.AddFavorite() for IE. In 2026, browsers removed programmatic bookmarking entirely — but PWA Install replaced it.'
date: 2026-03-29
tags: ['javascript', 'browsers', 'stackoverflow', 'ux']
lang: 'en'
---

# Add to Favorites: From Browser APIs to PWA Install

In 2015, I answered a question on Stack Overflow in Portuguese about adding a site to browser favorites with JavaScript. It scored 4 upvotes.

## The 2015 Answer: Browser-Specific Hacks

```javascript
function addToFavorites(url, title) {
  if (window.external && 'AddFavorite' in window.external) {
    // Internet Explorer
    window.external.AddFavorite(url, title);
  } else if (window.sidebar && 'addPanel' in window.sidebar) {
    // Firefox
    window.sidebar.addPanel(title, url, '');
  } else {
    // Chrome, Safari — no API existed
    alert('Press Ctrl+D (or Cmd+D on Mac) to bookmark this page.');
  }
}
```

Even then, Chrome and Safari had no programmatic bookmark API. You were already falling back to telling users to press Ctrl+D.

## The 2026 Reality: APIs Removed

Every browser has removed programmatic bookmark access. `window.external.AddFavorite` disappeared with IE. Firefox's sidebar API was removed. There is no `navigator.bookmark()`. This was intentional — browsers treat bookmarks as private user data that sites shouldn't control.

The Ctrl+D fallback from 2015 is now the only option for traditional bookmarking. And that's fine.

## The Modern Equivalent: PWA Install

What replaced the "save this site" use case is much more powerful: Progressive Web Apps with `beforeinstallprompt`:

```javascript
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallButton();
});

document.getElementById('install-btn').addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === 'accepted') {
    console.log('User installed the PWA');
  }
  deferredPrompt = null;
});
```

The user gets the site on their home screen, in their app drawer, with offline support — far more valuable than a browser bookmark.

## Key Takeaway

The "add to favorites" API died because browsers made bookmarking a user-controlled action. PWA install gave that use case a better answer: instead of saving a URL, users install an app-like experience. The intent (quick return to a site) remained; the implementation improved.
