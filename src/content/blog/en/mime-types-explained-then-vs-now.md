---
title: 'MIME Types Explained: What Browsers Actually Do with Content-Type'
description: 'From a 2015 Stack Overflow question about why script tags work without type attributes, to the security-critical MIME enforcement of 2026.'
date: 2026-03-29
tags: ['web-development', 'http', 'stackoverflow', 'fundamentals']
lang: 'en'
---

# MIME Types Explained: What Browsers Actually Do with Content-Type

In 2015, I came across a question on Stack Overflow in Portuguese that caught my attention: what exactly are MIME types, why do they matter for rendering, and are they even mandatory? It scored 17 upvotes — a sign that plenty of developers were wondering the same thing.

The question made me think. I had been writing `<script type="text/javascript">` for years without ever questioning it. Why did `<script>` without any `type` attribute work just as well? And if the browser could figure it out on its own, why did MIME types exist in the first place?

That curiosity led me down a rabbit hole. Here's what I understood then, what I know now, and what changed in between.

## The 2015 Understanding: Content Labels

Back then, MIME types felt like polite labels. You'd set `Content-Type: text/html` in your server response, and the browser would know to render HTML. You'd write `type="text/javascript"` on a script tag, and... well, it worked. But so did omitting it entirely.

The basics were straightforward. MIME stands for **Multipurpose Internet Mail Extensions** — originally designed for email attachments, later adopted by HTTP. The format is always `type/subtype`:

- `text/html` — HTML document
- `text/css` — stylesheet
- `application/javascript` — JavaScript file
- `image/png` — PNG image
- `application/json` — JSON data

The `Content-Type` header told the browser what kind of resource was coming. If you forgot it, browsers would perform **MIME sniffing** — they'd inspect the first few bytes of the response and guess the content type. And honestly, it worked most of the time.

HTML5 had already made `type="text/javascript"` the default for script tags, so you could safely drop it. The `type` attribute on `<style>` tags defaulted to `text/css`. Everything just... worked. MIME types were important in theory but forgiving in practice.

That was 2015. Browsers were lenient. Servers were sloppy. And nobody got hurt — or so we thought.

## The 2026 Reality: MIME Types as Security Gates

Fast forward to today, and MIME types have gone from "nice to have" to "get this wrong and your site breaks." Here's what changed.

### X-Content-Type-Options: nosniff

Remember that helpful MIME sniffing behavior? It turned out to be a massive security hole. Attackers discovered they could upload malicious files with misleading extensions, and browsers would happily sniff them as executable scripts.

The fix was the `X-Content-Type-Options: nosniff` header. When set, it tells the browser: "Don't guess. Trust the Content-Type header and nothing else." By 2026, this is standard. Every major framework sets it by default. Every security audit flags its absence.

```
X-Content-Type-Options: nosniff
Content-Type: application/javascript
```

If your server sends a JavaScript file with `Content-Type: text/plain` and `nosniff` is enabled, the browser will refuse to execute it. Period.

### CORB and CORP

Cross-Origin Read Blocking (CORB) and Cross-Origin Resource Policy (CORP) took things further. These policies use MIME types to decide whether a cross-origin resource should be readable at all.

If a cross-origin response has a MIME type of `text/html`, `application/json`, or `text/xml`, CORB will strip the response body before it reaches the requesting page. This blocks Spectre-style side-channel attacks that could read sensitive data through cross-origin requests.

### Module Scripts Require type="module"

In 2015, `type="text/javascript"` was redundant. In 2026, `type="module"` is essential. ES modules won't load without it:

```html
<!-- Classic script — type is optional -->
<script src="app.js"></script>

<!-- Module script — type is REQUIRED -->
<script type="module" src="app.mjs"></script>
```

And here's the catch: module scripts enforce MIME type checking strictly. If your server responds with anything other than a valid JavaScript MIME type, the module will not load. No sniffing, no fallback.

### New MIME Types for Modern Formats

The web's media landscape has expanded since 2015. Here are MIME types that didn't exist or weren't widely used back then:

| Format      | MIME Type          | Notes                     |
| ----------- | ------------------ | ------------------------- |
| AVIF        | `image/avif`       | Next-gen image format     |
| WebP        | `image/webp`       | Widely adopted since 2020 |
| WOFF2       | `font/woff2`       | Standard web font format  |
| JSON module | `application/json` | Import assertions in JS   |
| WebAssembly | `application/wasm` | Strict MIME required      |

WebAssembly is a good example of the new strictness. Browsers will flat-out refuse to compile a `.wasm` file if it's not served with `application/wasm`. No sniffing. No exceptions.

## The Security Angle: Why This Matters

MIME sniffing attacks were more creative than you'd expect. Here's the classic scenario:

1. A web app lets users upload files (say, profile pictures)
2. An attacker uploads a file named `avatar.jpg` that actually contains JavaScript
3. The server stores it and serves it without a strict Content-Type
4. The browser sniffs the content, detects JavaScript, and executes it
5. The attacker now has XSS in the context of your domain

The `nosniff` header killed this attack vector. But the lesson goes deeper. Modern browsers treat MIME types as a trust boundary. Cross-origin isolation, Content Security Policy, and service workers all rely on correct MIME types to make security decisions.

## What Happens When You Get It Wrong

Here's a quick reference for common mistakes and their consequences in 2026:

**Serving JS with `text/plain`:** Browser refuses to execute it. Console shows a MIME type error. Your app breaks silently.

**Serving CSS with wrong MIME:** Stylesheet is blocked in strict mode. Your page renders unstyled.

**Serving WASM without `application/wasm`:** `WebAssembly.instantiateStreaming()` throws a TypeError. Fallback to `instantiate()` with array buffer still works but is slower.

**Missing Content-Type on API responses:** CORB may strip the response body on cross-origin requests. Your fetch calls return empty data with no obvious error.

**Serving JSON with `text/html`:** Potential XSS if the JSON contains user-controlled HTML strings and someone navigates to the URL directly.

## Key Takeaway

In 2015, MIME types were polite suggestions. Browsers would sniff, guess, and usually get it right. You could omit `type` attributes, misconfigure Content-Type headers, and everything would still work.

In 2026, MIME types are security-critical infrastructure. `nosniff` is the default. CORB strips mistyped responses. Module scripts enforce strict MIME checking. WebAssembly refuses to compile without the right header.

The original Stack Overflow question asked whether MIME types are mandatory. The 2015 answer was "technically yes, practically no." The 2026 answer is "yes, and if you get them wrong, modern browsers will refuse to load your resources."

Get your Content-Type headers right. It's not optional anymore.
