---
phase: 53
slug: slots-side-drawer
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-04
---

# Phase 53 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright + project shell assertions |
| **Config file** | `playwright.config.ts` |
| **Quick run command** | `node -e "const fs=require('fs');const en=fs.readFileSync('src/pages/en/slots/index.astro','utf8');const pt=fs.readFileSync('src/pages/pt/slots/index.astro','utf8');['data-slots-menu-toggle','data-slots-menu','data-casinocraftz-curriculum','data-casinocraftz-dialogue','data-casinocraftz-zone=\"cards\"'].forEach(k=>{if(!en.includes(k))throw new Error('EN missing '+k);if(!pt.includes(k))throw new Error('PT missing '+k)});const main=fs.readFileSync('src/scripts/slots/main.ts','utf8');['sessionStorage','Escape','aria-expanded'].forEach(k=>{if(!main.includes(k))throw new Error('main.ts missing '+k)});console.log('quick-structure-ok');"` |
| **Full suite command** | `npm run build && npm run test -- --grep "slots|drawer"` |
| **Estimated runtime** | ~90 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick structure command
- **After every plan wave:** Run full suite command
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 90 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 53-01-01 | 01 | 1 | LBY-03 | T-53-01 | Drawer zones render only from static trusted templates | build+structure | `npm run build` | ✅ | ⬜ pending |
| 53-01-02 | 01 | 1 | LBY-04 | T-53-02 | Keyboard/focus handling blocks focus escape when drawer open | smoke | `npm run test -- --grep "slots|drawer"` | ✅ | ⬜ pending |
| 53-02-01 | 02 | 2 | LBY-03 | T-53-03 | PT locale preserves same controls/contracts as EN | structure | `npm run build` | ✅ | ⬜ pending |
| 53-02-02 | 02 | 2 | LBY-04 | T-53-04 | PT keyboard and persistence parity with EN | smoke | `npm run test -- --grep "slots|drawer"` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Drawer visual composition quality on mobile and desktop | LBY-03 | Visual design quality judgement | Open `/en/slots/` and `/pt/slots/`, toggle drawer, verify section hierarchy and spacing at 390px and 1280px widths |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 90s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
