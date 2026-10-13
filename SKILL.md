---
name: make-it-playable
description: Build or improve an original browser game, from a concise game idea through a playable local prototype, art, controls, testing, and release handoff. Use for games, playful interactives, and game-like learning pieces; not for ordinary website interactions.
metadata:
  short-description: Build an original playable browser game
---

# Make It Playable

Make a game people can actually play, judge, and improve. Ship a small **tracer** early: a local browser loop with a real input, a meaningful failure or decision, a clear success state, and a retry. Keep one current local progress route. Do not mistake an art concept, menu, or forced QA state for the game.

## 1. Start with only what unlocks the tracer

Use supplied constraints as answered. Ask no more than three short questions at once:

1. What is the purpose and audience: a personal game, a product or brand piece, learning, an event, or something else?
2. What should the player do, feel, or learn in the first minute?
3. What style, gameplay, platforms, tools, or constraints are already decided?

Within that first batch, offer rather than require: “If useful, share a brand name, assets, voice, or colours. ‘No brand / personal game’ is a complete answer.”

Make a compact proposal: play fantasy, one core action, success/failure loop, first device targets, provisional runtime, and the first reviewable increment. Treat claims about real people, places, events, brands, or supplied media as a **source ledger** case; fictional and abstract work needs no performative research ledger. Record supported facts, creative translation, rights/consent status, and unresolved claims where applicable.

Read [creative brief](references/creative-brief.md) for the proposal and any factual or brand-sensitive work. **Before implementation**, initialize the project’s acceptance checklist and small progress file using [the acceptance matrix](references/acceptance-matrix.md). Turn the supplied brief into observable exit criteria with evidence, current revision, and status; choose applicable rows upfront. Preserve user decisions and accepted work when improving an existing game.

## 2. Choose the lightest capable runtime

Start with Canvas or DOM for a compact 2D loop. Choose Three.js when the experience needs real-time 3D space, camera, or lighting; choose Godot when its editor, scene workflow, or systems materially improve the game and its browser export has been inspected. Blender is an optional asset-production tool, not a runtime or a default. The included Canvas starter needs none of these optional tools.

This skill tells the agent how to choose and use tools; it does not bundle or install them, grant terminal or arbitrary GUI access, or require an MCP. Inspect available tools and the current project before committing. Explain missing setup before choosing a path. Three.js is a project dependency: follow the [Three.js installation guide](https://threejs.org/manual/pages/installation.html) for npm or CDN use. Godot and Blender may need separate installation in a machine or environment the agent can access; Godot browser exports also need matching [Web export templates](https://docs.godotengine.org/en/stable/tutorials/export/exporting_projects.html), and terminal-driven Blender use needs an executable the environment can reach (often via [PATH](https://docs.blender.org/manual/en/latest/advanced/command_line/launch/windows.html)). An agent can help with setup only within host permissions and suitable integration access. Detect an image-generation tool/provider when imagery would help; use it only when available and authorized. Do not pin a model, require an account, claim a tool is free, or depend on a private wrapper. Code-native final art is a valid intentional finish; clearly labelled final placeholders are not final art.

Build the tracer before costly art: movement or the primary verb, one visible decision or obstacle, labelled controls, success, failure, retry, keyboard and pointer/touch paths. Give the user the actual local command and clickable progress URL as soon as it runs. Keep it stable after that; follow the requester’s stated publishing scope and host rules, and ask only when that authority is absent.

## 3. Make the loop legible and fair

Put the goal, named gauges, and the consequence of action where a first-time player can see them. Give each meaningful counterplay its own control; avoid overloading one control with unrelated responses. Support ordinary keyboard, pointer, and touch input on the agreed devices. Check a short Android-sized landscape/portrait view where relevant and desktop alongside it.

Register every art object with its coordinate, scale, collision, and draw order. Moving actors and companions obey the same solid terrain and collision rules the player does. Hazards must read before they punish. Skilled counterplay must be visible and possible, rather than a hidden timing test.

For a real-time simulation, use a fixed simulation step and interpolate rendering between states. Where procedural generation or randomness affects play, use a deterministic seed. Daily challenges are optional. A careful solver/bot can prove a route is possible; a deliberately imperfect human-like probe helps estimate the curve. Measure enough seeds/runs for the decision: 72 seeds is a useful example for a fast deterministic game, not a law. State sample size, uncertainty, and what the probe cannot establish. A normal-input route through start, play, failure, retry, and win remains necessary.

Read [play, controls, and difficulty](references/play-controls-difficulty.md) before difficulty tuning, mobile controls, collision-heavy play, or a game with companions.

## 4. Direct art, audio, and accessibility deliberately

Before expensive final production, show the playable tracer alongside a representative visual mockup or gameplay frame. Use an available, authorized image generator when useful; code-native visuals are equally valid. Ask for focused feedback on visual direction and the actual play separately. Record accepted mechanics, camera, palette, composition, and finish criteria. Once the playable loop and visual direction are accepted, improve assets and detail in small passes against the same phone/desktop views. After each pass, check visual fidelity, readability, performance, and normal play; fix the largest remaining gap while preserving approved systems. Concept approval alone does not approve the implementation. Reopen the relevant mechanic, camera, art, UI, or audio criterion when feedback rejects it, and stop making variants once the agreed criteria pass. See [art, audio, and rights](references/art-audio-rights.md) for the visual target loop.

Make art production-ready: declare asset scale, crop, orientation, anchors, and collision companions. Use a contact sheet for sprite or image reviews. Use original, licensed, or permission-cleared source material and retain a receipt/attribution record when the work has real rights obligations.

Audio begins after a user gesture, has a visible mute control and non-audio-only route, responds to causes in the game, respects pause and hidden-tab lifecycle, and fails silently if unavailable. Avoid flashing/strobing effects; honour reduced motion and keep gameplay readable without motion or sound.

Read [art, audio, and rights](references/art-audio-rights.md) when adding imagery, source material, sound, generated assets, or accessibility work.

## 5. Keep going until the agreed checks pass

Run this completion loop within the user’s scope and host permissions: **build → play through normal inputs and capture → compare every applicable criterion → fix the largest remaining failure → rerun affected checks and relevant regressions**. A successful build, attractive screenshot, or debug-forced win does not close the task. Continue authorized local work while an actionable gap remains; do not end with an offer to continue.

Update the same progress file and local progress route at each milestone. Record user feedback and invalidate affected passes after changes. On resumption, read that record and inspect the current source before continuing; at milestones check for changed project/skill guidance without repeatedly loading unrelated context.

Request human fun, art, and listening review early and continue independent work while waiting. Only a human response can pass those rows. If review is still outstanding, report **incomplete — human review pending**, with the exact build to review.

Completion means every required row has current passing evidence or an explicit user waiver; report **complete with waivers** separately. Never weaken criteria or self-waive a failure to finish. Respect resource, permission, and time limits: stop dependent work at a real blocker, record its owner/next action and the last green build, and report incomplete. Diagnose repeated failures; after three unchanged failed attempts, change approach or report the blocker, subject to any stricter host stop rule. Keep the loop bounded by those limits, not by an arbitrary number of polish passes.

## 6. Prove the browser product, then hand it over

Test at the actual route and representative phone/desktop sizes. Exercise ordinary keys/taps/clicks, focus, start, pause, mute, background/return, failure, retry, and success. Keep technical evidence distinct from requested human acceptance.

Measure the browser’s encoded initial gameplay load: assets necessary to **start real gameplay**, rather than a menu-only shell. The default is a soft target below 5 MB. Deferred full packages, end cards, and optional assets are measured separately. Make a hard cap only when the user asks for one.

Use a release closure: an allowlist of browser-reachable files, hashes, tested fallbacks, and network evidence. Keep source/provenance/evidence out of the shipped runtime package. Report source revision, local command/URL, actual package and encoded-load costs, rights/attribution, tests run, and unresolved acceptance rows. Publication may remain local; completion still requires the acceptance checklist above.

Read [performance, release, and handoff](references/performance-release-handoff.md) for packaging or browser-network measurement, and close the project checklist in [the acceptance matrix](references/acceptance-matrix.md) against the tested build.

## Starter

`assets/starter/` is a dependency-free Canvas tracer with finished geometric art, configurable title/colours, deterministic simulation, fixed-step interpolation, mouse/touch/keyboard controls, lifecycle-safe gesture audio, reduced motion, and Node tests. Copy it into the target project only when its small collect-and-avoid loop helps; replace its theme and mechanics deliberately.
