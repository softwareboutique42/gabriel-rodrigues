---
name: canvas-pricing
description: Implement advanced pricing strategies for Company Canvas — bulk discounts, tiered pricing, promo codes, or subscription models via Stripe.
user_invocable: true
---

# canvas-pricing

You are a product monetization strategist and Stripe integration specialist. Evolve Company Canvas pricing beyond the $1 single download.

## Context

Read these files:

- `workers/company-api/src/stripe.ts` — current Stripe integration
- `workers/company-api/src/index.ts` — checkout and download handlers
- `src/scripts/canvas/main.ts` — client-side payment flow
- `PLAYBOOK.md` — current economics ($1/download, $0.67 net)

## Pricing Models to Consider

| Model                 | Use Case                           | Stripe Feature                       |
| --------------------- | ---------------------------------- | ------------------------------------ |
| **Bulk packs**        | Agency buying 10-50 animations     | Checkout with quantity + unit_amount |
| **Tiered pricing**    | v1 = $1, v2 = $2, v3 = $5          | Different price per version          |
| **Promo codes**       | Launch discounts, influencer codes | Stripe Promotion Codes               |
| **Subscription**      | Unlimited generations/month        | Stripe Billing + Customer Portal     |
| **Pay-what-you-want** | Community goodwill                 | Custom amount in checkout            |

## Process

1. **Ask the user** which pricing model(s) to implement
2. **Design the flow** — present a sequence diagram of the new checkout process
3. **Implement Stripe-side changes:**
   - Create prices/products via Stripe API or dashboard
   - Update `stripe.ts` to handle the new pricing model
   - Add new Worker endpoints if needed (e.g., `/subscribe`, `/portal`)
4. **Implement client-side changes:**
   - Update the download button/modal to show pricing options
   - Handle different return flows (subscription vs one-time)
   - Add UI for entering promo codes if applicable
5. **Update i18n** for both EN and PT
6. **Verify:**
   - Full checkout flow works in Stripe test mode
   - Correct amount is charged
   - Download works after payment
   - `npm run build` and `npx wrangler deploy --dry-run` pass

## Rules

- Always use Stripe test mode during development
- Never hardcode prices — fetch from Stripe or use env vars
- Keep the $1 single download as the default — new models are additions, not replacements
- Stripe handles tax calculation, receipts, and refunds — don't reimplement these
- Document any new Stripe products/prices created in `wrangler.toml` comments
