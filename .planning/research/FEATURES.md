# Feature Landscape

**Domain:** Projects Hub + Slots foundation (no gameplay yet)
**Researched:** 2026-04-02
**Milestone:** v1.2 Projects Hub & Slots Foundation
**Confidence:** HIGH (project-context aligned), MEDIUM (market-style differentiators)

This milestone should make the product structure obvious (Projects first, tools second), while preparing Slots to ship fast in a later milestone without architectural rework.

## Navigation/Hub

| Feature                                                                      | Type           | Why It Matters Now                                                     | Complexity | Notes                                                  |
| ---------------------------------------------------------------------------- | -------------- | ---------------------------------------------------------------------- | ---------- | ------------------------------------------------------ |
| Projects index page in EN/PT listing Canvas and Slots                        | Table-stake    | Becomes the primary discovery surface after removing direct Canvas nav | LOW        | Must be the new source of truth for project navigation |
| Top navigation update: replace direct Canvas link with Projects              | Table-stake    | Prevents split navigation paths and IA confusion                       | LOW        | Apply in both locales                                  |
| Project cards with status labels (Live, Foundation, Coming Next)             | Table-stake    | Users need immediate clarity on what is usable today                   | LOW        | Avoid dead-end expectations for Slots                  |
| Consistent URL hierarchy: /{lang}/projects/, /{lang}/canvas/, /{lang}/slots/ | Table-stake    | Future-proof information architecture and breadcrumbs                  | MEDIUM     | Requires link audit + redirect decisions               |
| "Continue where you left off" quick entry from hub                           | Differentiator | Improves repeat engagement for returning visitors                      | MEDIUM     | Could use last-visited localStorage hint               |
| Narrative positioning block ("Build visuals", "Play experiments")            | Differentiator | Makes hub feel curated, not just a link list                           | LOW        | Strong portfolio storytelling value                    |

## Slots Pre-Game UX

| Feature                                                         | Type           | Why It Matters Now                                   | Complexity | Notes                                             |
| --------------------------------------------------------------- | -------------- | ---------------------------------------------------- | ---------- | ------------------------------------------------- |
| Slots shell pages at /en/slots/ and /pt/slots/                  | Table-stake    | Required deliverable for v1.2                        | LOW        | No gameplay mechanics yet                         |
| Clear pre-game framing: "In development" + "No real money"      | Table-stake    | Sets correct expectations and legal/safety framing   | LOW        | Always visible above fold                         |
| Hero section with machine theme direction (visual concept only) | Table-stake    | Gives concrete identity before mechanics exist       | LOW        | Use static/looping visual mock, not playable reel |
| CTA for updates/waitlist/notify intent                          | Table-stake    | Captures demand signal before implementation         | MEDIUM     | Could be lightweight email/form endpoint later    |
| Theme selector prototype (non-functional preview tabs)          | Differentiator | Demonstrates planned extensibility and design intent | MEDIUM     | UI-only scaffold; no RNG logic                    |
| "How it will work" explainer module                             | Differentiator | Builds trust early with transparent future mechanics | LOW        | Include fairness and virtual-credit framing       |

## Research Artifacts

| Feature                                                      | Type           | Why It Matters Now                                       | Complexity | Notes                                       |
| ------------------------------------------------------------ | -------------- | -------------------------------------------------------- | ---------- | ------------------------------------------- |
| Theme shortlist with rationale (e.g., Classic, Space, Cyber) | Table-stake    | Prevents art/style thrash in implementation phase        | LOW        | Keep to 2-3 themes for v1.x                 |
| Sprite/source licensing inventory                            | Table-stake    | Avoids blocked development due to unclear usage rights   | MEDIUM     | Track source URL, license, attribution need |
| Gameplay rules decision memo for next milestone              | Table-stake    | Locks baseline scope (reels/rows/paylines) before coding | LOW        | Explicitly deferred from v1.2 delivery      |
| Competitor/reference teardown board                          | Differentiator | Speeds UI decisions and avoids generic slot UX           | MEDIUM     | Annotated screenshots + what to copy/avoid  |
| Audio direction board (spin/stop/win mood references)        | Differentiator | Lets future implementation ship with cohesive feel       | LOW        | Keep as links and tags, not asset pack yet  |

## i18n Parity

| Feature                                                    | Type           | Why It Matters Now                                     | Complexity | Notes                                            |
| ---------------------------------------------------------- | -------------- | ------------------------------------------------------ | ---------- | ------------------------------------------------ |
| Full EN/PT parity for all hub + slots shell strings        | Table-stake    | Existing product standard; avoids split-quality launch | LOW        | No untranslated placeholders                     |
| Locale-consistent navigation labels and project statuses   | Table-stake    | Prevents mixed-language IA cues                        | LOW        | Same information density in both locales         |
| Localization QA checklist for new routes                   | Table-stake    | Catches missing keys, overflow, and semantic drift     | LOW        | Add as milestone exit criterion                  |
| Locale-aware content nuance (not literal translation only) | Differentiator | Improves perceived polish for bilingual audience       | MEDIUM     | Adjust copy tone for PT-BR naturalness           |
| Future-proof key naming for Slots gameplay strings         | Differentiator | Reduces refactor churn in next milestone               | MEDIUM     | Namespaced keys like slots.shell._, slots.game._ |

## Technical Readiness

| Feature                                                           | Type           | Why It Matters Now                                              | Complexity | Notes                                              |
| ----------------------------------------------------------------- | -------------- | --------------------------------------------------------------- | ---------- | -------------------------------------------------- |
| Routing + internal links validated for new hierarchy              | Table-stake    | Broken links would undermine the IA migration                   | MEDIUM     | Include navigation, footer, and in-page CTAs       |
| Redirect/alias strategy for old Canvas entry points               | Table-stake    | Protects discoverability and avoids 404s                        | MEDIUM     | Keep old links resilient where possible            |
| Shared project metadata model (title, status, locale path, badge) | Table-stake    | Enables scalable Projects hub as more entries are added         | MEDIUM     | Could be JSON/content collection-backed            |
| Slots page shell component boundaries defined                     | Table-stake    | Prevents mixing temporary shell copy with future gameplay logic | MEDIUM     | Separate shell sections from future game container |
| Analytics events for hub clicks and slots intent CTA              | Differentiator | Creates evidence-based prioritization for v1.3                  | MEDIUM     | Track locale + project card source                 |
| Feature-flag placeholder for "Slots gameplay coming" sections     | Differentiator | Allows incremental reveal without route rewrites                | LOW        | Useful for staged rollout                          |

## Prioritization Recommendation (v1.2)

1. Build all table-stakes across the five categories first.
2. Add differentiators that improve learning signal, not implementation risk.
3. Defer any mechanic simulation (RNG/reels/paylines) to next milestone.

## Suggested v1.2 Differentiators (Pick 2)

1. Theme selector prototype (non-functional visual tabs)
2. Analytics events for hub and slots intent
3. Narrative positioning block on Projects hub

## Feature Dependencies

Hub hierarchy migration -> i18n parity -> technical link validation
Slots shell copy and status framing -> research artifacts finalization -> gameplay milestone scoping
Project metadata model -> hub card rendering -> analytics instrumentation

## Sources

- .planning/PROJECT.md (active milestone goals and constraints)
- .planning/MILESTONES.md (current delivery baseline and shipped context)
- Existing architecture constraints from repo guidance (Astro static output, EN/PT parity, navigation consistency)
