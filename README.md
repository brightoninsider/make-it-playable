# Make It Playable

An open, brand-neutral agent skill for turning a game idea into something you can play, review, and improve. Your coding agent agrees the checks upfront, then builds, playtests, fixes, and retests until those checks pass or a real blocker needs your help. A small progress record keeps your decisions and feedback intact between sessions.

It includes concise production guidance, a finished dependency-free Canvas starter, release verification, and a reproducible GitHub-ready export. Results depend on a capable coding agent, available tools and art assets, time, and your feedback; the skill cannot guarantee a particular visual finish or that a game will be fun.

## Start here

Open `START-HERE.html` in a browser. It is a polished offline guide with examples, a practical sequence, and exact commands. It needs no network connection, account, font, CDN, or analytics.

The smallest working path is:

```bash
cd assets/starter
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000). The starter is intentionally a small finished collect-and-avoid loop: keyboard, pointer and touch controls; start/pause/mute/win/fail/retry; fixed-step simulation with interpolation; deterministic seed; reduced motion; gesture-started audio; and hidden-tab pause.

```bash
node --test assets/starter/*.test.mjs
python3 scripts/test_verify_release.py
python3 scripts/build_release.py --source . --output dist
```

`node --test` needs Node 20+; Python commands need Python 3.10+. No `npm install` is required. Browser automation is optional: use it when the host already has a suitable tool, otherwise record that limitation and test normal input by hand.

## Use as an agent skill

General coding agents can read this whole folder. Ordinary chat without file access or a runnable workspace cannot build and verify the game.

- Codex: follow [OpenAI’s Build Skills guide](https://learn.chatgpt.com/docs/build-skills), install this folder as `.agents/skills/make-it-playable` for a project or `~/.agents/skills/make-it-playable` for your user profile, then invoke `$make-it-playable`.
- Claude Code: follow [Claude Code skills documentation](https://code.claude.com/docs/en/skills), install it as `.claude/skills/make-it-playable`, then invoke `/make-it-playable`.

Ordinary ChatGPT without local file access and a runnable workspace cannot install, run, or verify this package.

The skill asks at most three short intake questions at a time and treats already supplied style, gameplay, platform, and constraints as answered. Brand material is optional: “no brand / personal game” is valid.

The process is simple:

1. Describe your idea and agree what “finished” should look and play like.
2. Try an early playable loop and review a visual mockup or representative gameplay image.
3. Give focused feedback and lock the core play and visual direction. The agent brings assets and detail into the game in small passes, comparing the same views while preserving the choices you accepted.
4. Playtest, check, fix, and repeat until the agreed checks pass. Compare the running game with the accepted visual direction along the way.

An available image generator can help explore a look or produce assets. It is optional: visuals drawn directly in code can also be the finished style. A beautiful mockup and a game that feels good to play need separate reviews.

Expect to steer the brief, review the first playable loop and visual direction, and judge the final play, art, and sound where applicable. More reviews may be needed when a decision changes; the instructions ask the agent to continue autonomously between available checkpoints.

The agent continues independent work while waiting for feedback, keeps one local progress link current, and preserves accepted choices. Technical checks cannot approve fun, art, or the sound mix for you. If a required review or resource is still missing, the handoff says what is incomplete, who can unblock it, and which build to resume. Any waived check must be your explicit decision.

## What is included

| Path | Use |
| --- | --- |
| `SKILL.md` | Agent workflow, routing, and practical guardrails. |
| `START-HERE.html` | Offline visual guide for people. |
| `assets/starter/` | No-dependency Canvas game starter and Node core tests. |
| `references/` | Brief, play, art/audio/rights, release, and acceptance guidance. |
| `scripts/verify_release.py` | Runtime closure, hashes, fallback, and network-budget verifier. |
| `scripts/build_release.py` | Reproducible one-folder ZIP, manifest, and checksum export. |

The soft default target is under 5 MB for the assets needed to start real gameplay. Later levels, endings, or optional packages are measured separately. It becomes a hard cap only when a project explicitly asks for one.

## Tool choice and setup

The skill guides your coding agent in choosing and using tools such as Godot, Blender and Three.js. These tools are optional and aren’t included in the download. Your agent checks what’s available and explains any installation or setup needed before using them. The agent can help with setup where its environment allows.

- **Canvas / DOM:** the included starter needs none of the optional tools below.
- **Three.js:** a project library for real-time 3D. Add it only when the game needs it; follow the [Three.js installation guide](https://threejs.org/manual/pages/installation.html).
- **Godot:** an engine and editor worth choosing when its scenes or systems materially help. It is a separate app; browser exports also require matching [Godot export templates](https://docs.godotengine.org/en/stable/tutorials/export/exporting_projects.html).
- **Blender:** an optional separate app for 3D assets, not a browser runtime or default. It needs to be available to the agent; see [Blender setup](https://docs.blender.org/manual/en/latest/advanced/command_line/launch/windows.html).

## Examples

The same workflow works for:

- **Indie product or brand:** a fictional tea maker’s one-minute blending game, where each choice explains a real product characteristic without becoming an ad.
- **Learning or museum:** a gallery conservation puzzle that teaches how light, humidity, and handling change a collection object.
- **Kitchen party:** a local pass-the-phone sauce-timing game with short rounds and a shared final score.
- **Personal game:** a small “catch the constellations” game for a friend, with no brand at all.

## Package an export

```bash
python3 scripts/build_release.py --source . --output dist
```

This creates `dist/make-it-playable-v1.0.0.zip`, a matching JSON manifest, and a SHA-256 checksum. The ZIP has exactly one top-level folder and excludes `dist/`, source-control files, caches, node modules, evidence/screenshots/videos, and private material. It does not publish anything.

Before shipping a browser game, make a game-specific runtime manifest and network evidence, then run:

```bash
python3 scripts/verify_release.py --root build/game --manifest release-manifest.json --network network.json --require-network
```

See `references/performance-release-handoff.md` for the schema and intended measurements.

## Licence and attribution

This package is MIT-licensed: retain its copyright and licence notices when redistributing it. Keep third-party asset licences and required credits with the game that uses them. No in-game branding, endorsement, or trademark licence is required or granted by this package. “Atlas51” remains a name of its contributors and is not a default game brand.

Downloading this package is free. A host, paid tool, image-generation provider, API, or third-party asset can have its own cost, account, licence, or terms.

## Contributing

Keep changes small, runnable, and brand-neutral. Add a meaningful test for changed deterministic code or release behavior, run the relevant commands above, and avoid adding private artwork, account material, generated evidence, or deployment assumptions to an export.
