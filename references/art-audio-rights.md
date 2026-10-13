# Art, audio, accessibility, and rights

## Deliberate art direction

An intentional code-native visual system—geometry, colour, typography, rhythm, and motion—can be final art. A placeholder becomes final only after a person explicitly accepts it as the intended visual language.

For every visual asset, record the role, pixel scale, crop, orientation, anchor, collision companion, source, and transformation. Use a labelled contact sheet for sprites, alternate crops, and generated candidates. Check fixed phone and desktop captures after changing camera or assets; desktop composition is not proof of phone readability. Export for the measured maximum on-screen size, keeping masters outside the runtime package.

When using a visual-generation capability, inspect what is actually available. Use a current available tool only with the project/user’s authorization, and state its provenance and limitations. Do not assume a provider, model, account, price, or commercial licence.

## Visual target loop

1. Derive a small visual target from the brief: camera, composition, character scale, palette, density, and which qualities the user will judge. Show an early playable loop alongside a representative gameplay frame or clearly labelled concept/mockup. An image generator is optional; use available, authorized tools or code-native art.
2. Ask which specific visual qualities to keep and which to change. Record the response against the reviewed build/image, locking accepted mechanics, camera, palette, composition, and observable finish criteria. Refine the rejected qualities while preserving accepted decisions; request further review when material changes need it. Continue unrelated authorized work while waiting.
3. Turn the accepted direction into assets with declared crops, anchors, scales, and collision companions. Integrate them into the real game in small passes of asset and detail improvements, then capture the same phone/desktop views and gameplay states used for comparison. Check visual fidelity, readability, normal play, and performance after each pass. A beautiful concept cannot prove that the camera, small-screen legibility, or gameplay matches it.
4. Compare the running result to the agreed target and feedback. Reopen failed criteria, fix the largest mismatch, and recapture affected views. Stop generating variants when the visual criteria pass; broaden the direction only when the user changes the brief. Keep normal-input play evidence separate from visual acceptance.

On the final-asset success path, inspect every reachable play state for unintended placeholders or stand-ins. Separately block or slow asset loading to test graceful fallbacks: a useful fallback does not justify leaving the successful path unfinished.

## Rights and attribution

For any non-original shipped asset, retain: source URL, creator, licence text/URL, version/variant, date accessed, allowed commercial use/modification/redistribution, attribution wording, asset hash, and transformation recipe. Reject unclear rights instead of guessing. Put required credit in a visible release notice or credits surface; preserve receipts outside the runtime package.

## Audio that follows the game

Start or resume browser audio only from a user gesture. Provide a visible mute control, remember its state if appropriate, and ensure every important cue has a visual route. Map cues to causal events—move, collect, impact, success—rather than arbitrary timers. Pause/silence on visibility loss and resume only when the game state, gesture, and mute state permit it. Failed audio setup must leave the game playable.

Listen on an ordinary phone speaker and headphones before claiming a mix passes. Record listening approval separately from source, lifecycle, and browser checks.

## Inclusive interactions

Keep controls focusable and labelled; use semantic DOM controls for menus around a canvas. Honour reduced motion by freezing nonessential decoration while retaining readable static art. Keep prototype/build/debug labels on the progress surface, unless players need them to understand a real limitation. Do not rely on colour alone, audio alone, rapid flashes, a precise hover, or a narrow timing window for essential progress. Test keyboard focus, touch, visual contrast, and a muted run.
