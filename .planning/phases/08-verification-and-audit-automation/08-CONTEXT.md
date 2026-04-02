# Phase 8: Verification and Audit Automation - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning
**Source:** /gsd:next -> /gsd:discuss-phase 8

<domain>
## Phase Boundary

Standardize verification artifacts and make milestone closure audit-first by default.

In scope:

- Audit gate behavior in /gsd:complete-milestone
- Verification artifact structure requirements for each phase SUMMARY.md
- Verification debt surfacing in /gsd:next advances

Out of scope:

- New phase types or milestone formats
- Changes to plan structure or plan execution flow
- Analytics or telemetry collection
  </domain>

<decisions>
## Implementation Decisions

### Audit gate mechanics

- Use a **soft gate**: /gsd:complete-milestone shows audit status and warns when phases have missing or incomplete summaries, but does not block completion.
- Display which phases are missing summaries and what validation sections are absent.
- Do not error out or abort the command — the warning is informational, not a hard stop.

### Verification artifact structure

- Each phase SUMMARY.md must contain a **Validation section** with test and build outcomes to count as verified.
- A summary that exists but has no Validation section is considered verification-incomplete.
- The check is structural (section presence), not semantic (content quality is discretionary).

### Debt surfacing

- Surface outstanding verification debt in **/gsd:next only** — when the workflow is about to advance to the next phase or complete a milestone.
- Do not add debt reporting to every /gsd:progress call (too noisy for routine checks).
- When /gsd:next detects unverified phases before advancing, show a debt summary inline before routing to the next action.

### Claude's Discretion

- Exact format and wording of audit warnings and debt summaries
- Whether the soft gate warning is shown before or after the completion action
- Specific field names or heading text in the Validation section check
- How to handle phases that have SUMMARY.md files created by earlier workflow versions without a Validation section
  </decisions>

<canonical_refs>

## Canonical References

### Phase and requirement contracts

- .planning/ROADMAP.md — Phase 8 goal and success criteria
- .planning/REQUIREMENTS.md — QVER-01, QVER-02, QVER-03 definitions
- .planning/PROJECT.md — milestone intent and constraints

### GSD workflow and tooling surfaces

- .claude/get-shit-done/workflows/next.md — /gsd:next routing logic (debt surfacing target)
- .claude/get-shit-done/workflows/complete-milestone.md — milestone closeout (audit gate target)
- .claude/get-shit-done/bin/gsd-tools.cjs — CLI tool for state and progress queries

### Prior phase summaries (verification artifact examples)

- .planning/phases/06-vertical-style-pack-foundation/06-01-SUMMARY.md
- .planning/phases/07-export-funnel-conversion-uplift/07-01-SUMMARY.md
  </canonical_refs>
