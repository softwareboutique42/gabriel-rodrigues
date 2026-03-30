---
title: 'Rewrite vs Incremental Improvement: The Question Every Team Faces'
description: 'From a 2015 Stack Overflow answer about rewriting billing software to the strangler fig reality of 2026 — when to rewrite, when to improve, and why the answer is usually both.'
date: 2026-03-29
tags: ['architecture', 'stackoverflow', 'engineering-management', 'best-practices']
lang: 'en'
---

# Rewrite vs Incremental Improvement: The Question Every Team Faces

In 2015, I worked at a billing software company that was rewriting a system originally built in 2004. Someone on [Stack Overflow in Portuguese](https://pt.stackoverflow.com/questions/50590) asked about convincing clients and teams to adopt a rewrite, and I shared my experience in an answer that scored 4 upvotes. Not a viral hit, but enough to tell me other developers were wrestling with the same question.

Eleven years later, I've seen rewrites succeed and fail. The question hasn't changed — but the tooling, the patterns, and the way I think about the answer have changed completely.

## The 2015 Perspective: Sell the Rewrite With Metrics

Back then, my approach was straightforward: build a case the client can't ignore. The billing system we were replacing was a desktop-only application tied to a specific Windows version. Our pitch to clients had three pillars:

**More devices.** The old system ran on one machine. The new one was web-based — access it from a phone, a tablet, any browser. For a billing company with field technicians, that alone was a compelling argument.

**Faster development time.** The legacy codebase had zero separation of concerns. Business logic lived inside UI event handlers. Adding a new invoice type meant touching dozens of files across multiple layers that weren't really layers at all. We adopted MVC, and suddenly features that took weeks took days.

**Less database redundancy.** The original schema had been extended so many times that the same customer data lived in four different tables. We normalized the database, reduced storage costs, and — more importantly — eliminated a whole class of bugs where data got out of sync.

We also made the new system responsive, which in 2015 still felt like a differentiator. The client could show their customers a modern interface instead of something that looked like it shipped with Windows XP.

It worked. The client signed off, we did the rewrite, and the new system went to production. Victory, right?

## Joel Spolsky Said Never Do This

There's a famous blog post by Joel Spolsky from the year 2000 — "Things You Should Never Do, Part I" — where he argues that rewriting software from scratch is the single worst strategic mistake a company can make. His example was Netscape, which rewrote their browser and lost the market to Internet Explorer in the process.

Joel's argument is compelling: working code contains years of accumulated knowledge. Every weird conditional, every edge case handler, every seemingly pointless null check — those exist because someone hit a real bug in production. When you rewrite from scratch, you throw all of that away and start re-discovering those edge cases one by one, in production, with real users.

In 2015, I acknowledged this argument but didn't fully internalize it. Our billing rewrite went well, so I figured the key was just having good metrics and a solid plan. What I didn't see was survivorship bias — I was looking at the rewrite that succeeded and ignoring all the ones that didn't.

## The 2026 Reality: You Don't Have to Choose

The biggest shift in my thinking is that "rewrite vs improve" is a false binary. The industry figured this out, and the answer has a name: the **strangler fig pattern**.

The idea is simple. Instead of replacing the old system all at once, you build new functionality alongside it. New features go in the new system. Old features get migrated one at a time. The old system gradually shrinks until there's nothing left to strangle.

Martin Fowler coined the term, but it took a decade for the tooling to catch up. In 2026, this approach is genuinely practical:

**Micro-frontends make incremental UI migration real.** You can run a React module inside an Angular app, or mount a new component alongside legacy jQuery code. Module federation, import maps, and web components mean the old and new can coexist in the same page without a complete rewrite of the shell.

**API gateways handle the routing.** You point `/api/invoices` at the new service and `/api/legacy-reports` at the old one. The client doesn't know or care which system handles which request.

**AI-assisted migration tools changed the calculus.** Tools like ast-grep and codemod can automate the tedious parts of migration — renaming APIs, updating import paths, converting patterns. What used to take a developer a week of mind-numbing find-and-replace now takes an afternoon of reviewing AI-generated diffs.

This is the approach I'd recommend for most teams today. Not a big-bang rewrite. Not "leave it alone." A deliberate, incremental replacement where you always have a working system in production.

## When a Full Rewrite Still Makes Sense

That said, there are situations where incremental improvement hits a wall. I've seen three patterns that consistently push teams toward a rewrite:

**The tech stack is fundamentally limiting.** If your application only runs in Internet Explorer, or depends on a runtime that's been end-of-lifed with no migration path, wrapping it with a strangler fig doesn't help. The foundation itself is the problem. Our 2015 billing system fell into this category — a desktop-only Windows app couldn't become a web app incrementally.

**Hiring is impossible.** If your system is written in a language or framework that nobody wants to work with, every sprint gets slower as your team shrinks. I've seen this with COBOL systems, classic ASP, and even early PHP codebases with no framework. You can't incrementally improve what you can't staff.

**Security is structurally unfixable.** When authentication was bolted on as an afterthought, when user input flows through the system without any sanitization layer, when the database credentials are hardcoded in 200 files — sometimes the cost of securing the existing system exceeds the cost of rebuilding with security baked in.

## When Incremental Improvement Is the Right Call

On the flip side, there are strong signals that you should _not_ rewrite:

**Working software with paying users.** If the system generates revenue and the users are mostly happy, a rewrite introduces risk with no immediate value to them. Every month you spend rewriting is a month you're not shipping features your customers are asking for.

**Domain logic too complex to re-derive.** Some systems encode decades of business rules that nobody fully understands anymore. The billing rules, the tax calculations, the edge cases for specific client configurations — that knowledge lives in the code, not in anyone's head. Rewriting means re-discovering all of it, and you will miss things.

**The team doesn't have rewrite experience.** A rewrite is a project management challenge as much as a technical one. You need to keep the old system running, build the new one, migrate data, and coordinate the cutover. If your team hasn't done this before, the risk of the rewrite dragging on for years is very real.

## What I'd Tell 2015-Me

The answer isn't rewrite OR improve — it's understanding which parts to rewrite and which to wrap. The strangler fig pattern lets you do both simultaneously. Start with the part of the system that causes the most pain. Build a new version of that piece. Route traffic to it. Repeat.

If I went back to that billing company today, I wouldn't pitch a complete rewrite. I'd identify the three most painful modules, build modern replacements behind an API gateway, and let the old system handle everything else until we were ready to migrate the next piece.

The 2015 rewrite worked because the system was small enough and the tech gap was wide enough. But that's not always the case, and betting the company on a big-bang rewrite is a gamble I'm no longer willing to take when better options exist.

The best migration strategy is the one where your users never notice a thing.
