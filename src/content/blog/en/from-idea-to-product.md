---
title: 'From Side Project to Micro-Product: Adding Payments to a Portfolio Site'
description: 'How I turned a portfolio showcase into a revenue-generating micro-product with Stripe, versioning, and a $1 price point.'
date: 2026-03-25
tags: ['stripe', 'product', 'cloudflare', 'business']
lang: 'en'
---

# From Side Project to Micro-Product: Adding Payments to a Portfolio Site

Most developers build portfolio projects to show off skills. I wanted to go one step further: make it generate revenue. Not life-changing money — just enough to cover API costs and prove the concept.

Here's how I turned a canvas animation generator into a micro-product with a $1 price point.

## Why Charge at All?

Every time someone generates an animation, it costs me about $0.002 in Claude API fees. That's tiny, but it adds up:

- 100 generations/day = $0.20/day = $6/month
- Go viral on Twitter = hundreds of dollars in API calls

The free preview model solves this: **generate for free, pay to download.** Users can play with the tool endlessly. The API cost is justified by engagement. But downloading a polished, self-contained HTML file? That's the value worth $1.

## Choosing Stripe Checkout

I evaluated three options:

| Option                   | Pros                            | Cons                      |
| ------------------------ | ------------------------------- | ------------------------- |
| **Stripe Checkout**      | Hosted page, handles everything | Redirect flow             |
| **Stripe Payment Links** | Zero code                       | No programmatic control   |
| **LemonSqueezy**         | Tax compliance built-in         | Another vendor dependency |

Stripe Checkout won. It handles the payment page, receipts, fraud detection, and refunds. I don't touch card numbers. The integration is a single API call to create a checkout session, and a single API call to verify payment on return.

## The Payment Flow

Here's the complete user journey:

1. User types company name, clicks Generate
2. Animation renders — **free**
3. User clicks "Download ($1)"
4. Frontend POSTs to Worker `/checkout` with the animation config
5. Worker creates a Stripe Checkout session, returns the hosted URL
6. User pays on Stripe's page
7. Stripe redirects back with `?session_id=xxx`
8. Frontend calls Worker `/download?session_id=xxx`
9. Worker verifies payment via Stripe API
10. Worker returns the config, frontend generates HTML and triggers download

The key insight: **the animation config is stored in Stripe's session metadata**, not in a database. Stripe becomes both the payment processor and the data store. No KV, no database, no extra infrastructure.

## Implementation Without a Database

Stripe session metadata accepts up to 500 characters per key. A CompanyConfig JSON blob is about 400-600 bytes. I split it across two metadata keys (`config_1`, `config_2`) and reassemble on download.

This means:

- No database to manage
- No expiring tokens to handle
- Payment verification and data retrieval happen in one API call
- The system is stateless — the Worker has zero persistent state

## The Version System

I built a version selector into the generation form. Right now there's only v1, but the architecture supports future versions:

```typescript
const VERSIONS = [
  { id: 'v1', label: 'v1 — Classic', styles: ['particles', 'flowing', 'geometric', 'typographic'] },
  // Future: v2 with shader-based animations, v3 with audio-reactive, etc.
];
```

Why build versioning before you need it? Because it changes the product narrative. Instead of "here's a tool", it becomes "here's a tool that's getting better." Users who paid for v1 have a reason to come back for v2.

The version ID travels through the entire pipeline: selected in the dropdown, sent to the Worker, stored in Stripe metadata, embedded in the exported HTML. This means I can always trace which version produced a given animation.

## The Self-Contained Export

The downloaded HTML file is completely standalone. It includes:

- The Three.js library loaded from a CDN
- The animation code inlined as a module script
- The brand config embedded as JSON
- Company name and tagline overlaid on the canvas
- A small watermark: "Company Canvas v1 — gabriel-rodrigues.com"

Open it in any browser, and the animation plays. No server, no dependencies, no expiration. It's a file you own.

## Legal Protection

AI generates content based on company names, which touches trademark territory. The disclaimer is short:

> Generated animations are AI-created and provided as-is. No liability for content, accuracy, or use. No endorsement by or affiliation with named companies. By downloading, you agree to these terms.

It's not bulletproof, but it establishes that the output is AI-generated, non-official, and use-at-your-own-risk.

## What I'd Add Next

**Usage analytics.** Which companies are people generating most? This data could inform which industries to optimize animations for.

**Bulk pricing.** An agency generating 50 animations should pay less per unit. A simple volume discount via Stripe's quantity pricing.

**Video export.** Some users want MP4, not HTML. Server-side rendering with Puppeteer or a canvas-to-video pipeline would enable this, but it's significantly more infrastructure.

**Affiliate/embed mode.** Let people embed the animation generator on their own sites with a revenue share. This turns the tool into a platform.

## The Numbers That Matter

The economics of a micro-product are refreshingly simple:

- **Cost per generation:** ~$0.002
- **Revenue per download:** $1.00
- **Break-even:** 1 download covers ~500 generations
- **Infrastructure cost:** $0 (Cloudflare free tier + GitHub Pages)
- **Stripe fee per transaction:** $0.30 + 2.9% = $0.33
- **Net per download:** $0.67

It's not going to replace a salary. But it proves something important: you can ship a product in a weekend, with no backend infrastructure, and have it generate revenue from day one.

The code is open source. The product is live. Try it at [gabriel-rodrigues.com/en/canvas](/en/canvas/).
