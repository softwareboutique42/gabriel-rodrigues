---
phase: 09-navigation-and-i18n-primitives
type: research
---

# Phase 9 Research

## Current State

- Header nav currently exposes Canvas directly via `nav.canvas` in `src/components/Header.astro`.
- Active-state logic is per-link and currently marks Canvas active only when path includes `/canvas`.
- EN/PT translation files already contain `nav.canvas` but no `nav.projects` or primitive `projects.*` / `slots.*` key set.
- Phase contract for this phase is HUB-01 + I18N-01 only; projects page delivery, slots shell delivery, and compatibility hardening are later phases.

## Strategy

- Replace top-level Canvas nav entry with Projects in header (HUB-01) while keeping canonical Canvas routes unchanged (`/en/canvas/`, `/pt/canvas/`).
- Implement route-group active-state primitive for Projects so one nav item is active on `/projects/`, `/canvas/`, and `/slots/` across EN/PT.
- Add minimal bilingual primitives for new user-facing labels only (I18N-01): `nav.projects`, and baseline `projects.*` + `slots.*` keys needed by downstream phases.
- Enforce EN/PT key parity in same change-set; no placeholder language divergence.
- Keep copy concise with experimental/playful tone consistent with milestone direction.
- Explicitly avoid alias route planning or implementation in this phase.

## File-Level Changes

- `src/components/Header.astro`
  - Swap nav link target/label from Canvas to Projects (`/${lang}/projects/` + `t('nav.projects')`).
  - Add consolidated Projects active matcher for `/projects`, `/canvas`, `/slots` to avoid drift.
  - Keep all existing canonical Canvas route references outside header untouched.
- `src/i18n/en.json`
  - Add `nav.projects`.
  - Add primitive `projects.*` and `slots.*` labels/descriptors required for upcoming pages.
  - Maintain concise, playful EN tone.
- `src/i18n/pt.json`
  - Mirror all new EN keys with PT equivalents in same commit.
  - Preserve same semantic meaning and playful tone (not literal robotic translation).

## Risk

- Parity drift between EN/PT keys can block later phases and break labels at runtime.
- Over-scoping into page implementation can create hidden dependency churn before Phase 10.
- Incorrect active-state matching may fail under nested paths or locale prefixes.
- Accidental route aliasing could conflict with requirement to preserve canonical Canvas routes only.

## Validation

- Translation parity check: verify every added `nav.*`, `projects.*`, and `slots.*` key exists in both locale files.
- Header behavior check (EN/PT):
  - Projects nav visible.
  - Canvas nav removed from top menu.
  - Projects nav active on `/projects/`, `/canvas/`, `/slots/`.
- Route safety check: confirm canonical Canvas paths remain `/en/canvas/` and `/pt/canvas/` with no alias introduced.
- Regression sanity: run existing project lint/test commands after implementation phase work.

## Acceptance Criteria

- HUB-01: Header top nav exposes Projects and no longer exposes direct Canvas menu item, while user access to canonical Canvas routes is preserved.
- I18N-01: New user-facing navigation/projects/slots primitive strings are present in both `src/i18n/en.json` and `src/i18n/pt.json` with key parity.
- Scope guard: no Projects page implementation, no Slots page implementation, and no alias route work is included in Phase 9.
- Tone guard: EN/PT copy remains concise and experimental/playful.
