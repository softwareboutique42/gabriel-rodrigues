---
title: 'HTTPS for Web Applications: From Optional to Mandatory'
description: "My 2015 Stack Overflow question asked about HTTPS for web apps. In 2026, it's not a question anymore — it's the baseline."
date: 2026-03-29
tags: ['security', 'web-development', 'stackoverflow', 'https']
lang: 'en'
---

# HTTPS for Web Applications: From Optional to Mandatory

In 2015, I asked a [question on Stack Overflow in Portuguese](https://pt.stackoverflow.com/questions/56539) about implementing HTTPS for web applications. It scored 9 upvotes. The question reflected a genuine dilemma at the time: HTTPS meant paying for certificates, configuring servers, and dealing with mixed content warnings. Was it really necessary for every site?

## The 2015 Landscape: HTTPS Was Optional

Back then, HTTPS was associated with e-commerce and banking. If your site handled payments or passwords, you used HTTPS. For everything else — blogs, portfolios, company websites — HTTP was the default.

The barriers were real:

- **SSL certificates cost money.** A basic DV certificate from a CA ran $50-100/year. Wildcard certs were even more expensive.
- **Server configuration was complex.** You needed to generate CSRs, install certificates, configure cipher suites, and redirect HTTP to HTTPS manually.
- **Mixed content was a nightmare.** One `http://` image or script on an HTTPS page would trigger browser warnings.
- **Performance was a concern.** The TLS handshake added latency. The "HTTPS is slow" myth persisted.

Many developers concluded: "My site doesn't handle sensitive data, so I don't need HTTPS."

## The 2026 Reality: HTTP Is the Exception

### Let's Encrypt Changed Everything

In late 2015, Let's Encrypt launched free, automated SSL certificates. By 2026, it has issued billions of certificates. The cost barrier vanished overnight.

```bash
# 2015: Buy certificate, generate CSR, wait for validation, install manually
# 2026: One command
certbot --nginx -d example.com
```

Most hosting providers (Cloudflare, Vercel, Netlify) provision HTTPS automatically. You don't even think about it.

### Browsers Enforce HTTPS

Chrome started marking HTTP sites as "Not Secure" in 2018. By 2026, browsers actively discourage HTTP:

- HTTP pages show a warning icon in the address bar
- Many browser APIs require secure context (HTTPS): Geolocation, Clipboard, Service Workers, Web Bluetooth, WebAuthn
- Mixed content (HTTP resources on HTTPS pages) is blocked by default

### HTTP/3 Requires TLS

HTTP/3, the latest version of the protocol, runs exclusively over QUIC — which always uses TLS 1.3. There's no unencrypted HTTP/3. If you want the fastest protocol, you need HTTPS.

### HSTS Preload

Sites can submit to the HSTS preload list, telling browsers to never attempt an HTTP connection:

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

Once preloaded, even the first visit to your site goes directly to HTTPS. No redirect, no brief HTTP exposure.

### The Performance Myth Is Dead

TLS 1.3 reduced the handshake to a single round trip. With 0-RTT resumption, reconnections have zero additional latency. HTTPS in 2026 is as fast as HTTP was in 2015.

## What Changed

| Aspect            | 2015                 | 2026                          |
| ----------------- | -------------------- | ----------------------------- |
| Certificate cost  | $50-100/year         | Free (Let's Encrypt)          |
| Setup             | Manual, complex      | Automatic (hosting providers) |
| Browser treatment | No difference        | HTTP marked "Not Secure"      |
| API access        | Full on HTTP         | Many APIs require HTTPS       |
| Protocol          | HTTP/1.1             | HTTP/3 requires TLS           |
| Performance       | Slower (TLS 1.0/1.1) | Same or faster (TLS 1.3)      |

## Key Takeaway

In 2015, "do I need HTTPS?" was a legitimate question. The cost was real, the complexity was real, and the benefit wasn't always clear. In 2026, the question is irrelevant — every serious hosting platform provides HTTPS by default, browsers penalize HTTP, and modern web APIs won't work without it. HTTPS isn't a security feature you add. It's the foundation you start with.
