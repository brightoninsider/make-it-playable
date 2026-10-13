# Acceptance matrix

Initialize this checklist **before implementation**, using the supplied brief and the rows below. Choose applicable rows and make each criterion observable for this project: target devices, normal-input route, specific visual promise, and required reviewer. Split technical and human criteria so a technical pass cannot conceal pending review. Add project-specific requirements; these defaults are not a universal feature list.

Keep one small project file, for example `GAME-PROGRESS.md`, outside the shipped runtime. Use it throughout the run and on resumption:

```markdown
# Game progress
Brief / scope:
Locked decisions and accepted work:
Current source revision / local changes / build ID:
Stable local run command and URL:
Last green build / recovery command:
User feedback and explicit scope changes (date, source):
Next largest gap / owner / next action:

| ID | Required criterion / device | Status | Evidence + tested revision | Owner / next action |
| --- | --- | --- | --- | --- |
| loop | Normal inputs reach start, failure, retry, and success | pending | | agent / playtest |
| human-fun | Reviewer accepts the first-minute loop | pending review | | user / play build |
```

Identify uncommitted builds with a build ID or source hashes; a commit alone does not identify later edits. Evidence may be a repeatable command and result, capture/recording path, measurement report, or dated human response. Name the tested revision on every pass.

Allowed states:

- **pending** — not tested or invalidated by a change; name the next check.
- **failed** — observed mismatch; retain evidence and name the fix.
- **passed** — criterion met with current evidence; human rows require that human’s response.
- **pending review** — specified human judgment is outstanding; name the reviewer and build to review.
- **not applicable** — give the scope-based reason; an unmet requirement is not inapplicable.
- **blocked** — an external dependency, unavailable resource, permission, or limit prevents progress; name owner and next action.
- **waived** — cite the user’s explicit decision and remaining limitation; the agent cannot grant itself a waiver.

After each fix, reset affected passes to pending, rerun their checks and relevant regressions, and update this file plus the same local progress route. Retain still-valid evidence and accepted decisions. Make scope changes explicit; do not quietly delete a difficult requirement. On resumption, compare the record with current source and guidance, then continue at the largest remaining gap.

**Complete:** all applicable required rows pass. **Complete with waivers:** every remaining required row has an explicit user waiver, listed in the handoff. Pending, failed, pending-review, and blocked required rows mean **incomplete**. A build, screenshot, solver result, or export cannot stand in for this decision.

## Candidate criteria

| Area | Observable acceptance | Evidence |
| --- | --- | --- |
| Core loop | A player can start, act, face a meaningful risk/choice, win or fail, and retry. | Normal-input recording or repeatable browser test. |
| Clarity | Goal, named gauges, and controls are visible and comprehensible at target sizes. | Phone and desktop captures plus first-play review. |
| Controls | Keyboard/pointer/touch scope works after menus and on a second run. | Real event route tests. |
| Fairness | Every required route is possible; difficulty evidence states samples and uncertainty. | Seed/run report; solver and human-like probe if useful. |
| Art | Integrated game matches the accepted visual target at fixed states/sizes; final-asset success path has no unintended stand-ins. | Contact sheet and repeated capture comparisons. |
| Human review | Fun, art direction, and listening (if audio is present) each receive explicit acceptance. | Separate dated responses naming the reviewed build. |
| Accessibility | Focus, labels, reduced motion, no flashing, and a non-audio-only route work. | Keyboard/muted/reduced-motion checks. |
| Audio | Gesture start, mute, pause/hidden-tab lifecycle, and causal cues work. | Browser lifecycle test. |
| Rights | Every third-party shipped asset has a usable licence/permission and required attribution. | Source ledger / credit notice. |
| Reliability | Start, pause, hidden tab, failure, retry, success, and offline/asset failure state are safe. | Browser test or manual path record. |
| Performance | Encoded initial gameplay load and package size are measured separately. | Network evidence / manifest. |
| Release closure | Allowlisted runtime files, hashes, fallbacks, and first-party requests match. | `verify_release.py` output. |
| Recovery | A clean-checkout rebuild recreates the tested package, with any nondeterminism explained. | Rebuild command/tool versions, source revision, package hash comparison. |
| Handoff | Local command, source revision, limits, and publication state are explicit. | Handoff note. |
