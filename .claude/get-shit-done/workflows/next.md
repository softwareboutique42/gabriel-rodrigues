<purpose>
Detect current project state and automatically advance to the next logical GSD workflow step.
Reads project state to determine: discuss → plan → execute → verify → complete progression.
</purpose>

<required_reading>
Read all files referenced by the invoking prompt's execution_context before starting.
</required_reading>

<process>

<step name="detect_state">
Read project state to determine current position:

```bash
# Get state snapshot
node "/home/gabriel/Documents/gabriel-rodrigues/.claude/get-shit-done/bin/gsd-tools.cjs" state json 2>/dev/null || echo "{}"
```

Also read:

- `.planning/STATE.md` — current phase, progress, plan counts
- `.planning/ROADMAP.md` — milestone structure and phase list

Extract:

- `current_phase` — which phase is active
- `plan_of` / `plans_total` — plan execution progress
- `progress` — overall percentage
- `status` — active, paused, etc.

If no `.planning/` directory exists:

```
No GSD project detected. Run `/gsd:new-project` to get started.
```

Exit.
</step>

<step name="determine_next_action">
Apply routing rules based on state:

**Route 1: No phases exist yet → discuss**
If ROADMAP has phases but no phase directories exist on disk:
→ Next action: `/gsd:discuss-phase <first-phase>`

**Route 2: Phase exists but has no CONTEXT.md or RESEARCH.md → discuss**
If the current phase directory exists but has neither CONTEXT.md nor RESEARCH.md:
→ Next action: `/gsd:discuss-phase <current-phase>`

**Route 3: Phase has context but no plans → plan**
If the current phase has CONTEXT.md (or RESEARCH.md) but no PLAN.md files:
→ Next action: `/gsd:plan-phase <current-phase>`

**Route 4: Phase has plans but incomplete summaries → execute**
If plans exist but not all have matching summaries:
→ Next action: `/gsd:execute-phase <current-phase>`

**Route 5: All plans have summaries → verify and complete**
If all plans in the current phase have summaries:
→ Next action: `/gsd:verify-work` then `/gsd:complete-phase`

**Route 6: Phase complete, next phase exists → advance**
If the current phase is complete and the next phase exists in ROADMAP:
→ Next action: `/gsd:discuss-phase <next-phase>`

**Route 7: All phases complete → complete milestone**
If all phases are complete:
→ Next action: `/gsd:complete-milestone`

**Route 8: Paused → resume**
If STATE.md shows paused_at:
→ Next action: `/gsd:resume-work`
</step>

<step name="show_and_execute">
Display the determination:

```
## GSD Next

**Current:** Phase [N] — [name] | [progress]%
**Status:** [status description]

▶ **Next step:** `/gsd:[command] [args]`
  [One-line explanation of why this is the next step]
```

**Verification debt check (Routes 6 and 7 only):**

When the determined next action routes to advancing to the next phase (`/gsd:discuss-phase <next>` after phase completion — Route 6) or completing the milestone (`/gsd:complete-milestone` — Route 7):

```bash
UNVERIFIED=()
for summary in .planning/phases/*-*/*-*-SUMMARY.md; do
  [ -e "$summary" ] || continue
  grep -q "^## Validation" "$summary" || UNVERIFIED+=("$summary")
done
```

If `${#UNVERIFIED[@]} -gt 0`, prepend before the `▶ Next step:` line:

```
⚠ Verification Debt: ${#UNVERIFIED[@]} completed phase(s) have no Validation section:
  - {phase-name}/{summary-file}
  - ...
Advancing anyway. Run /gsd:verify-work to address debt before milestone closure.
```

Do NOT trigger this check for Routes 1-5. Do NOT block routing — proceed to the next step immediately after showing debt (if any).

Then immediately invoke the determined command via SlashCommand.
Do not ask for confirmation — the whole point of `/gsd:next` is zero-friction advancement.
</step>

</process>

<success_criteria>

- [ ] Project state correctly detected
- [ ] Next action correctly determined from routing rules
- [ ] Command invoked immediately without user confirmation
- [ ] Clear status shown before invoking
      </success_criteria>
