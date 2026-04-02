---
phase: 08-verification-and-audit-automation
type: research
---

# Phase 8 Research

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **Audit gate**: Soft gate — /gsd:complete-milestone shows audit status and warns, but does NOT block completion.
- **Verification artifact**: Each SUMMARY.md must contain a Validation section (with test/build outcomes) to count as verified. Structural check only (section presence), not semantic.
- **Debt surfacing**: /gsd:next only — surfaced when advancing, not on every /gsd:progress call.

### Claude's Discretion

- Exact format and wording of audit warnings and debt summaries
- Whether the soft gate warning is shown before or after the completion action
- Specific field names or heading text in the Validation section check
- How to handle phases that have SUMMARY.md files created by earlier workflow versions without a Validation section

### Deferred Ideas (OUT OF SCOPE)

- New phase types or milestone formats
- Changes to plan structure or plan execution flow
- Analytics or telemetry collection

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID      | Description                                                                                         | Research Support                                                                                        |
| ------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| QVER-01 | Milestone closeout workflow enforces a documented audit-first gate before completion.               | Add audit scan to `complete-milestone.md` `verify_readiness` step before confirmation prompt            |
| QVER-02 | Verification artifacts are standardized per phase (summary, validation, and UAT status visibility). | Add `## Validation` section to all 4 summary templates; section already used in Phase 6 and 7 summaries |
| QVER-03 | Progress reporting surfaces outstanding verification debt before milestone completion.              | Add debt check to `next.md` `show_and_execute` step when advancing to milestone completion              |

</phase_requirements>

## Current State

### complete-milestone.md

`verify_readiness` step uses `gsd-tools roadmap analyze` to check plan/summary completeness and requirements check-off. Currently reports:

- Which phases are complete (`disk_status === 'complete'`)
- Unchecked requirements

**No audit gate exists.** The step does not scan SUMMARY.md files for Validation section presence. The warning/proceed/abort flow is requirements-focused only.

### next.md

`determine_next_action` routes via 8 rules (discuss → plan → execute → verify → complete). `show_and_execute` displays the routing result and immediately invokes the next command.

**No verification debt surfacing exists.** The workflow does not inspect SUMMARY.md content before advancing. Routes 5, 6, 7 (which advance or trigger milestone completion) run without checking whether completed phases have Validation sections.

### SUMMARY.md templates

Four templates exist: `summary.md`, `summary-standard.md`, `summary-complex.md`, `summary-minimal.md`.

**None contain a `## Validation` section.** The section was added organically in Phase 6 (`06-01-SUMMARY.md`) and Phase 7 (`07-01-SUMMARY.md`) — both use the exact heading `## Validation` with bullet-point test/build outcomes. The templates have not been updated to codify this.

### Existing Validation section pattern (from Phase 6 and 7)

```markdown
## Validation

- node --test tests/foo.test.mjs: pass (23/23)
- npm run build: pass (existing non-blocking warnings only)
```

Shell-grep pattern to detect: `grep -q "^## Validation"` on each SUMMARY.md file.

---

## Strategy

### QVER-01: Soft audit gate in complete-milestone.md

Add an audit scan block inside the existing `verify_readiness` step, immediately before the interactive confirmation prompt (or before `gather_stats` in yolo mode). The scan:

1. Iterates all phase SUMMARY.md files belonging to the milestone.
2. Checks each for `^## Validation` heading presence.
3. Builds a list of phases missing the section.
4. If list is non-empty: renders a `⚠ Verification Debt` warning table showing phase name and summary path.
5. If list is empty: renders `✓ All phases verified`.
6. Does NOT abort or change exit behavior — warning is informational only.

Warning placement: **before** the `Ready to mark this milestone as shipped?` prompt in interactive mode, so users see debt before confirming. In yolo mode: show inline in the auto-approval block.

For legacy SUMMARY.md files (pre-Phase 6) that lack `## Validation`: the warning will flag them. This is acceptable — the intent is visibility, not blocking. The operator can proceed anyway per the soft gate decision.

### QVER-02: Standardize SUMMARY.md templates

Add `## Validation` section to all 4 templates. Position: after `## Accomplishments` / `## Task Commits` block, before `## Decisions` / `## Rollback Notes`. Pattern to use (consistent with Phase 6/7):

```markdown
## Validation

- [test command]: [result]
- [build command]: [result]
```

No semantic enforcement — template provides structure; content is discretionary.

### QVER-03: Debt surfacing in next.md

Add a verification debt check in the `show_and_execute` step, triggered **only** when the routing decision is Route 7 (all phases complete → complete milestone) or Route 6 (advance to next phase). This avoids noise on Routes 1–5.

The check:

1. Scans all completed phase SUMMARY.md files.
2. Looks for missing `## Validation` sections.
3. If debt found: renders a `⚠ Verification Debt` block inline before the `▶ Next step:` line showing which phases lack validation.
4. Then proceeds with the routed command immediately (no blocking, consistent with `/gsd:next` zero-friction principle).

---

## File-Level Changes

### 1. `.claude/get-shit-done/workflows/complete-milestone.md`

**Where:** Inside `<step name="verify_readiness">`, after the requirements completion check block, before the interactive confirmation prompt.

**Add:** An audit scan block:

````markdown
**Verification artifact audit (REQUIRED before presenting):**

Scan SUMMARY.md files for Validation section presence:

```bash
UNVERIFIED=()
for summary in .planning/phases/*-*/*-*-SUMMARY.md; do
  [ -e "$summary" ] || continue
  grep -q "^## Validation" "$summary" || UNVERIFIED+=("$summary")
done
```
````

Present audit result:

If `${#UNVERIFIED[@]} -gt 0`:

```
⚠ Verification Debt: {N} phase(s) missing Validation sections

| Phase Summary | Status |
|---|---|
| {path} | ⚠ Missing ## Validation |
| ... | ... |

These phases completed without documented test/build outcomes.
Completion is not blocked — this is informational.
```

If all verified:

```
✓ Verification audit passed — all phase summaries contain Validation sections.
```

````

### 2. `.claude/get-shit-done/workflows/next.md`

**Where:** In `<step name="show_and_execute">`, after the routing determination, before the `▶ Next step:` output line — but only trigger when route is 6 (advance) or 7 (complete milestone).

**Add:** A conditional debt check block:

```markdown
**Verification debt check (Routes 6 and 7 only):**

When the determined next action is `/gsd:complete-milestone` or `/gsd:discuss-phase <next>` after a phase completes:

```bash
UNVERIFIED=()
for summary in .planning/phases/*-*/*-*-SUMMARY.md; do
  [ -e "$summary" ] || continue
  grep -q "^## Validation" "$summary" || UNVERIFIED+=("$summary")
done
````

If `${#UNVERIFIED[@]} -gt 0`, prepend before the `▶ Next step:` line:

```
⚠ Verification Debt: {N} completed phase(s) have no Validation section:
  - {phase-name}/{summary-file}
  - ...
Advancing anyway. Run /gsd:verify-work to address debt before milestone closure.
```

````

### 3. `.claude/get-shit-done/templates/summary.md`

**Where:** After the `## Task Commits` section, before any `## Decisions` / `## Rollback` section.

**Add:**
```markdown
## Validation

- [test command and result]
- [build command and result]
````

### 4. `.claude/get-shit-done/templates/summary-standard.md`

Same insertion point and same content as template 3.

### 5. `.claude/get-shit-done/templates/summary-complex.md`

Same insertion point and same content as template 3.

### 6. `.claude/get-shit-done/templates/summary-minimal.md`

Same insertion point and same content as template 3.

---

## Risk

**Legacy SUMMARY.md files:** Phase 6 and 7 already have `## Validation`. Earlier phases (pre-v1.1) may not. The audit gate will flag them. This is by design — the gate is soft. The planner should scope the audit to the current milestone's phases to avoid false noise from historical work.

**`## Validation` heading collision:** If any SUMMARY.md uses `## Validation` as a heading for something other than test/build outcomes, the grep check will pass falsely. Structural check is intentionally shallow — this is a known limitation accepted by the locked decision (section presence only).

**`/gsd:next` route 5 ambiguity:** Route 5 says "all plans have summaries → verify and complete". This goes to `/gsd:verify-work` then `/gsd:complete-phase`, not directly to milestone completion. Verification debt check should NOT be added here — only to routes 6 and 7, which represent advancement or milestone closure.

**Template propagation:** Adding `## Validation` to templates only affects new SUMMARY.md files created after Phase 8. Existing summaries (Phase 6, 7) already have it organically. No backfill needed.

---

## Validation

Phase 8 has no automated test coverage (markdown workflow files, not code). Verification is manual:

```bash
# QVER-02: Confirm Validation section added to all templates
grep -l "## Validation" .claude/get-shit-done/templates/summary*.md
# Expected: 4 files listed

# QVER-01: Confirm audit scan block present in complete-milestone.md
grep -c "Verification artifact audit" .claude/get-shit-done/workflows/complete-milestone.md
# Expected: >= 1

# QVER-03: Confirm debt surfacing block present in next.md
grep -c "Verification debt check" .claude/get-shit-done/workflows/next.md
# Expected: >= 1
```

---

## Acceptance Criteria

| Req     | Done When                                                                                                                                                                           |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| QVER-01 | `complete-milestone.md` contains an audit scan block that checks SUMMARY.md files for `## Validation` and shows a warning table when any are missing — without blocking completion. |
| QVER-02 | All 4 summary templates (`summary.md`, `summary-standard.md`, `summary-complex.md`, `summary-minimal.md`) contain a `## Validation` section.                                        |
| QVER-03 | `next.md` contains a debt surfacing block that fires on Routes 6 and 7, lists unverified phase summaries inline before the `▶ Next step:` line, and does not block routing.         |
