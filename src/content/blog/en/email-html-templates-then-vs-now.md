---
title: 'Email HTML Templates: From Table Layouts to Modern Authoring Tools'
description: 'From a 2016 Stack Overflow answer on email HTML compatibility to 2026 — MJML, React Email, and why email development is still its own universe.'
date: 2026-03-29
tags: ['html', 'email', 'stackoverflow', 'css']
lang: 'en'
---

# Email HTML Templates: From Table Layouts to Modern Authoring Tools

In 2016, I answered a question on Stack Overflow in Portuguese about making HTML emails work across different email clients. The person was struggling with layouts breaking in Outlook, Gmail stripping their styles, and the general chaos of email rendering. I explained the rules of email HTML — tables for layout, inline styles for everything, forget about `<div>` and `float`, and test in every client you can. The answer scored 7 upvotes.

Ten years later, I still get a little anxious when someone says "can you build an email template?" But the tooling has changed everything about how we write them, even if the underlying constraints haven't fully gone away.

## The 2016 Answer: Tables, Inline Styles, and Pain

Back then, if you wanted an HTML email that looked the same in Gmail, Outlook, Yahoo Mail, and Apple Mail, you had exactly one reliable approach: nested HTML tables with inline styles on every single element.

No `<div>` layouts. No external stylesheets. No `flexbox`. No `grid`. Outlook used the Word rendering engine (yes, Microsoft Word) to display HTML emails, which meant it supported a bizarre subset of CSS that roughly corresponded to what Word could handle. Gmail aggressively stripped `<style>` tags from the `<head>`, so any CSS that wasn't inline simply didn't exist.

A typical email layout looked like this:

```html
<table width="600" cellpadding="0" cellspacing="0" border="0" align="center">
  <tr>
    <td style="padding: 20px; font-family: Arial, sans-serif; font-size: 14px; color: #333333;">
      Your content here
    </td>
  </tr>
</table>
```

Every. Single. Element. Got inline styles. Want consistent spacing? `cellpadding` and `cellspacing`. Want columns? Nested tables inside `<td>` elements. Want a button? A table cell with a background color and a centered link, because `<button>` elements don't render predictably.

It was like writing HTML in 2002, except it was 2016 and you had to do it on purpose.

## Why It Was So Painful

The core problem was that email clients aren't browsers. They don't follow web standards. Each one has its own rendering engine with its own quirks:

- **Outlook (desktop)** used Microsoft Word's HTML renderer. No `background-image` on `<div>`, no `max-width`, broken `padding` on certain elements.
- **Gmail** stripped `<style>` blocks entirely, killing any class-based styling.
- **Yahoo Mail** added its own CSS that could override yours.
- **Lotus Notes** (yes, people still used it) was a nightmare I won't describe further.

Testing meant sending your email to fifteen different clients and checking each one manually. Tools like Litmus and Email on Acid existed, but they were expensive and still required you to fix things by hand.

## What Changed: The Authoring Revolution

The email rendering landscape improved somewhat — Gmail finally started supporting embedded `<style>` tags around 2016-2017, which was a massive win. But the real transformation was in how we write email HTML, not in how clients render it.

**MJML** was the first tool that clicked for me. It's a markup language that compiles to email-compatible HTML. Instead of writing nested tables by hand, you write semantic components:

```html
<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text>Your content here</mj-text>
        <mj-button href="https://example.com">Click me</mj-button>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
```

MJML compiles this into the horrifying table-based HTML that email clients need, but you never have to look at it. It handles Outlook conditionals, inline style generation, and responsive breakpoints.

**React Email** brought the component model to email development. If your team already thinks in React, you can build email templates with JSX components that compile to email-safe HTML. It integrates with Resend for sending and has a local preview server.

**Maizzle** took a different approach — it's basically Tailwind CSS for email. You write your email HTML with utility classes, and Maizzle processes it into inlined, email-compatible output. For teams already comfortable with Tailwind, it's the fastest path.

## The Dark Mode Problem

One thing that didn't exist in 2016 and is now a constant headache: **dark mode in email**. Apple Mail, Outlook, and Gmail all have dark mode now, and each one handles email colors differently.

Some clients invert your colors automatically. Some respect `prefers-color-scheme` media queries. Some do both, depending on the phase of the moon. You can add dark mode styles, but you can't guarantee they'll be applied consistently.

The practical advice in 2026: design with dark mode in mind from the start. Use transparent PNGs instead of JPGs with white backgrounds. Test your color contrast in both modes. And accept that some clients will make your email look different than you intended.

## AMP for Email: A Brief Detour

Google launched AMP for Email around 2019 with the promise of interactive emails — carousels, forms, live data right in your inbox. It was ambitious. It was also a Google-only initiative that required email senders to register with Google and maintain a special version of every email.

By 2026, AMP for Email is essentially dead for most senders. The adoption never reached critical mass, and the maintenance burden wasn't worth the marginal interactivity gains. A few large senders (Google's own services, Pinterest) still use it, but the industry largely moved on. Interactive email turned out to be a solution looking for a problem.

## The 2026 Landscape

Here's what email HTML development looks like now:

- **Authoring**: MJML, React Email, or Maizzle. Nobody writes raw table HTML anymore unless they're maintaining legacy templates.
- **Testing**: Litmus and Email on Acid are still the standards, but their preview rendering has gotten much better.
- **Sending**: Resend, Postmark, and SendGrid handle delivery. The ESP market consolidated.
- **CSS support**: Better than 2016, but still years behind browsers. Outlook desktop still uses Word's renderer. That hasn't changed and probably never will.
- **Dark mode**: A real design consideration now, not an edge case.

## What I'd Write Today

If someone asked me that same Stack Overflow question in 2026, I'd still warn them that email HTML is its own world with its own rules. That hasn't changed. But I'd immediately point them to MJML or React Email instead of explaining how to hand-code table layouts.

The underlying constraints are still there — Outlook still uses Word, some clients still strip styles, and responsive email is still harder than responsive web. But modern tools abstract the pain so thoroughly that you rarely have to think about it.

Email HTML is a perfect example of a problem that wasn't solved by standards improving (though they did, slowly) but by tooling that accepted the constraints and built a better authoring experience on top of them. Sometimes the answer isn't "wait for the platform to get better." Sometimes it's "build a compiler."
