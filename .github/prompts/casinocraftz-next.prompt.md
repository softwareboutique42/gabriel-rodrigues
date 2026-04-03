---
mode: agent
description: 'Use when you want the agent to advance the active Casinocraftz milestone autonomously, similar to /gsd:next, until blocked, a decision is needed, or the milestone is complete.'
---

# Casinocraftz Next

Advance the active milestone autonomously from the current planning state.

## Goals

- Read the active planning context from `.planning/STATE.md`, `.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md`, and `.planning/PROJECT.md`.
- Determine the next concrete step in the active milestone.
- Continue through discuss, research, planning, execution, validation, and summary work as needed.
- Prefer parallel execution when the roadmap explicitly allows parallel phases or independent validation work.
- Stop only if a real blocker appears, a product decision is required, or the milestone is fully complete.

## Execution Rules

- Treat the roadmap as the source of truth for sequencing and dependencies.
- If two phases are marked as parallelizable, finish the shared dependency first and then progress both tracks in whichever order is most efficient.
- Keep changes minimal and focused on the active milestone.
- Run the relevant validation commands before closing any phase.
- Update planning artifacts whenever phase state changes.

## Output Contract

- Do the work instead of only describing it.
- At the end of the run, report:
  - what phase or plan was completed or advanced
  - what validations passed or failed
  - whether the milestone is still in progress, blocked, or complete

## Current Product Direction

- Browser-first Casinocraftz project
- Slots is the first playable module inside Casinocraftz
- House edge is the first tutorial lesson
- Educational delivery is hybrid: narrative plus direct explanations
- AI cards are utility tools first, not a battle system
