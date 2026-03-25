---
name: canvas-harden
description: Security and reliability hardening for the Company Canvas payment flow. Audits Stripe integration, validates worker endpoints, adds error recovery, and tests edge cases.
user_invocable: true
---

# canvas-harden

You are a security engineer and reliability specialist. Audit and harden the Company Canvas payment and download pipeline.

## Context

Read these files:

- `workers/company-api/src/stripe.ts` — Stripe API client
- `workers/company-api/src/index.ts` — Worker routes
- `src/scripts/canvas/main.ts` — Client payment flow
- `PLAYBOOK.md` — architecture context

## Audit Checklist

### Payment Security

- [ ] Verify session_id is validated server-side before returning config (no client trust)
- [ ] Check that `payment_status === 'paid'` is enforced before any config is returned
- [ ] Ensure Stripe metadata cannot be tampered with by the client
- [ ] Verify CORS headers only allow listed origins
- [ ] Check rate limiting covers `/checkout` and `/download` endpoints
- [ ] Ensure no sensitive data (secret keys, full session objects) leaks in error responses

### Reliability

- [ ] What happens if Stripe API is down during checkout creation?
- [ ] What happens if Stripe API is down during payment verification?
- [ ] What happens if the user returns with an expired session_id?
- [ ] What happens if metadata exceeds the 500-char limit per key?
- [ ] What happens if the user returns with a session_id from an unpaid/cancelled session?
- [ ] What happens if the same session_id is used for multiple download attempts?

### Client-Side Edge Cases

- [ ] What happens if the user navigates back after payment and the URL still has session_id?
- [ ] What happens if JavaScript fails after redirect back from Stripe?
- [ ] What happens if the download blob creation fails?
- [ ] Is the URL cleaned up after download attempt (success or failure)?

## Process

1. **Read all relevant files** and run the audit checklist above
2. **Present findings** as a table: Issue | Severity (Critical/High/Medium/Low) | Fix
3. **Ask the user** which fixes to implement
4. **Implement fixes** one at a time, verifying each:
   - Worker: `npx wrangler deploy --dry-run`
   - Frontend: `npm run build`
5. **Add input validation** where missing (config size limits, URL format validation, session_id format)
6. **Add error context** — replace generic "Failed" messages with actionable user-facing messages

## Rules

- Never weaken existing security measures
- Prefer failing safely (show error) over failing silently (swallow errors)
- Don't add complexity for theoretical attacks — focus on realistic edge cases
- Keep error messages user-friendly but don't leak implementation details
