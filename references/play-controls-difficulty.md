# Play, controls, and difficulty

## Build a legible first minute

Show the goal, progress, and immediate risk in the opening view. Name gauges (“Time”, “Signals”, “Lives”), show their direction of change, and teach a new control just before its first necessary use. A player should identify the intended route and a safe response before a hazard can punish them.

Give one meaningful action one control. If dodge and interact need different decisions, give them distinct labels and inputs. A game may be simple, but it should not make a player guess whether one button means jump, brake, talk, or collect this time.

Test normal input rather than only setting state through a debug API:

- keyboard after clicking Start, Pause, and Mute;
- pointer and touch controls at the real play size;
- a second run after a fail/retry;
- focus order and visible labels;
- a compact Android-sized viewport and a desktop viewport.

Test the primary renderer and play mode promised by the brief. A passing 2D fallback does not verify the primary 3D game. Debug states can accelerate captures only when they preserve the prerequisites of the displayed state; distinguish injected state from normal-input evidence of reachability or play quality.

Give one-shot input a single owner. Clear held input when pausing or changing modes so a held key cannot trigger a fresh action across a transition; restore gameplay focus after menu actions. Test rapid pause/resume/retry as well as the normal sequence.

Touch controls need a stable footprint. Do not make the playfield resize or move when menus appear. Keep targets comfortably tappable and leave the player/world unobscured. Capture the shortest supported portrait, phone landscape, and desktop views with the fullest HUD/result state; check overlap, clipping, unintended scrolling, and score contrast. For a signature action, inspect anticipation → action → result: keep the player and consequence visible instead of losing the moment beneath the HUD or between disconnected modes.

## Simulation and collision

Use a fixed simulation step, for example 1/60 second, and retain previous state for interpolated drawing. Seed random generation so a reported run can be replayed. Keep gameplay state deterministic enough for tests; rendering effects must not change collision or timing.

Register art with world coordinates, scale, draw order, and collision shape. The collision companion is part of the object’s definition, not an afterthought. Actors that move with the player, including companions, obey the same solids and passable surfaces unless their difference is visible and intentional.

## Fairness evidence

Use two complementary probes:

| Probe | Can establish | Cannot establish |
| --- | --- | --- |
| Careful solver / route script | A route is possible and counterplay is reachable. | That it feels fair or fun. |
| Human-like probe | A rough difficulty curve under reaction delay, error, and hesitation. | Human enjoyment or accessibility for everyone. |

Use a sample that matches speed and risk. For a short deterministic course, 72 seeds can expose rare bad layouts; for a costly simulation, fewer measured runs plus uncertainty may be more honest. Report seeds/runs, clear rate, confidence caveat, and seed-by-seed changes before declaring a balance shift. When a probe reports a regression, replay the same seeds against old and new builds and diagnose the probe’s assumptions before changing gameplay. Difficulty rises through clearer demands, tighter recovery, or richer decisions, while keeping early teaching generous.

## Motion and attention

Hazards must be visible at the target phone size. Keep decoration out of the active path. Avoid flashes and strobing; warnings can use steady contrast, shape, sound with a visual equivalent, and calm easing. Respect `prefers-reduced-motion` by removing nonessential camera shake, zoom, and decorative motion.
