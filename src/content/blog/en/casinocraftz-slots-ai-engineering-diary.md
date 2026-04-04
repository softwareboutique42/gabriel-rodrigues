---
title: 'How I Built CasinoCraftz Slots with AI: A Phase-by-Phase Engineering Diary'
description: 'A practical, first-person breakdown of how I used AI in real implementation loops across bridge safety, parity, deterministic behavior, and milestone closure.'
date: 2026-04-03
tags: ['ai', 'engineering', 'slots', 'testing', 'astro']
lang: 'en'
---

# How I Built CasinoCraftz Slots with AI: A Phase-by-Phase Engineering Diary

I wanted CasinoCraftz to feel fun, but never manipulative. That single product rule changed every technical decision.

This post is my build diary for the Slots module work around milestone `v1.8`: what I actually changed, where AI helped, where it failed, and which commit-level decisions made the system more reliable.

## The Ground Rule: Educational, Deterministic, and Explainable

From day one, the project direction was not "make a casino clone." It was:

- browser-first educational simulation
- deterministic runtime behavior
- explicit transparency signals
- no real-money framing

That meant product polish and engineering safety had to move in lockstep.

## How I Used AI in Practice (Not Hype)

I used AI as an implementation accelerator and review partner, not an autopilot.

My loop was usually:

1. Define the requirement and phase objective.
2. Ask AI to propose concrete code/test edits.
3. Apply only the minimal change set that preserved architecture.
4. Run contracts, Playwright slices, lint, and build.
5. Reject or revise AI output if it introduced ambiguity.

AI was fast at:

- producing first drafts of selectors, state plumbing, and copy variants
- highlighting consistency gaps across EN/PT routes
- tightening test assertions after behavior changes

AI was weak at (and needed strict human correction) when:

- maintaining semantic intent across multiple files when names were similar
- avoiding over-broad edits in UI text and animation classes
- understanding milestone-level release discipline by default

## Phase 33: Bridge Safety Before Feature Expansion

Before adding delight or richer tutorial behavior, I locked the bridge contract.

Key commits:

- `f46e8c8` - `feat(bridge): version ccz:spin-settled envelope and add safe parser (33-01/Task-1)`
- `65b96b5` - `test(bridge): versioning, backward compat, and authority isolation contracts (33-01/Task-2)`
- `ce80fb4` - `test(e2e): lock EN/PT casinocraftz bridge parity in compatibility suite (33-01/Task-3)`

What this changed in practical terms:

- event payload parsing became explicit and version-aware
- backward compatibility was tested instead of assumed
- route parity between English and Portuguese became contract-checked

This was one of the highest-leverage decisions in the entire cycle. It prevented more future regressions than any UI tweak could.

## Phase 34-36: Behavior, Parity, and Safety Closure

After bridge stability, the work shifted into three connected goals:

- tutorial progression realism and recap/replay clarity
- parity hardening (copy, selectors, and route behavior)
- safety closure with full validation chain

At that stage, AI-assisted edits increased throughput, but every change still had to satisfy deterministic and parity constraints.

## Delight Pass Without Breaking Guardrails

The visible UX pass happened later, in commit:

- `830ccda` - `feat(casinocraftz): add delightful tutorial microinteractions`

I added micro-interactions around tutorial transitions and card activation states. The non-negotiable rule was simple: motion can clarify state, but it can never hide state.

So the implementation kept:

- explicit labels for locked/unlocked utility cards
- progression cues tied to deterministic tutorial state
- reduced-motion-safe behavior for accessibility

## Validation Discipline Was the Real Velocity Multiplier

The highest-leverage habit was not generating code faster. It was running the same closure chain repeatedly:

- source contracts
- Playwright compatibility slice
- lint
- production build

That routine made AI genuinely useful because incorrect suggestions were cheap to reject.

Without tests, AI speed creates fragile output. With tests, AI speed creates faster convergence.

## Milestone Closure and Release Hygiene

When milestone confidence was locked, I archived planning artifacts and completed release bookkeeping.

Important closure commits:

- `6365c7d` - `chore(milestone): close v1.8 confidence lock and archives`
- `f86dab6` - `docs(state): mark v1.8 milestone as tagged complete`

This part is less glamorous than animations, but it matters. If planning state, requirements state, and git tags drift apart, teams lose trust in release history.

## What I’d Repeat

- define guardrails before visual flourish
- enforce EN/PT parity with automated checks, not manual spot checks
- use AI for proposal generation, not final authority
- keep milestone artifacts synchronized with actual git history

## What I’d Improve Next

- add even stricter assertion coverage around tutorial recap causality
- increase E2E checks for state re-entry after route transitions
- automate more release-state consistency checks in CI

## Final Take

AI was most valuable when paired with deterministic contracts and explicit product constraints.

If I remove either side of that equation, quality drops fast:

- AI without guardrails becomes noisy.
- Guardrails without AI become slower to iterate.

The sweet spot was using AI to accelerate implementation while treating tests, parity, and milestone discipline as the source of truth.
