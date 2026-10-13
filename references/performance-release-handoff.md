# Performance, release closure, and handoff

## Measure the runtime closure

Measure a clean browser session at the actual route, not the development folder. The initial gameplay load means files required for a player to begin real gameplay: HTML, entry code, critical art/audio, fonts, and any immediate data. A ready menu which later downloads the real game is not an initial gameplay measure.

The default target is below **5 MB** and is soft. Preserve accepted usability and art; a target overrun is an optimization finding. Apply a hard cap only where the requester set one. Record deferred packages separately (such as endings, later levels, optional sound, and fallbacks) and say when they load.

Use browser network `encodedBodySize` / `encodedDataLength` when possible. Development disk size and decoded transfer values are diagnostics, not substitutes for encoded initial gameplay load. Test cold and cached starts, constrained bandwidth where relevant, early Start, and a blocked asset at the actual subfolder route. Measure time to usable Start and real play; early Start must wait safely for essential assets.

## Optimize the chosen view, conditionally

For a scrolling Canvas world, cache static terrain and scenery once the approved composition is stable instead of redrawing it every frame. Export sprites and textures for their measured maximum on-screen density, not the source master’s resolution. Compare fixed captures before and after each optimization; optimize after the composition works.

For a Three.js scene using HDR, bloom, or post-processing, guard against non-finite colour output and inspect moving-camera captures for flashes or unstable lighting. Measure frame-time spikes as well as average frame rate in the primary renderer. For Godot, inspect the installed editor, matching Web export templates, selected renderer, and intended host constraints before committing to its browser path. Test production or subfolder asset paths, deferred loads, error paths, and fallbacks at the route where the game will actually run.

## Release closure

The browser release is an allowlisted closure, not an entire source directory:

1. Build from a known source revision.
2. Exercise start, ordinary play, failure, retry, success, and deferred states.
3. Capture every reachable first-party request, including fallback formats.
4. Put only runtime files in the package and hash them.
5. Verify no extra file, symlink, unexpected request, or hash drift remains.
6. For a recoverable release, rebuild from a clean checkout of the recorded source with the documented tool versions and asset inputs. Compare runtime hashes with the tested package; explain any unavoidable nondeterminism. A manifest verifies package contents, not that the source can recreate them.

`scripts/verify_release.py` validates a JSON manifest, fallback groups, hashes, and optional network evidence. It warns on the soft budget, and fails only if `budget.enforce` is explicitly true. `scripts/build_release.py` makes a one-folder ZIP export plus a manifest and checksum; it intentionally excludes `dist/`, caches, source-control files, and transient test artefacts.

Minimal `release-manifest.json` (keep it beside, rather than inside, the shipped directory unless it is intentionally shipped):

```json
{
  "schemaVersion": 1,
  "publicBasePath": "/",
  "budget": { "encodedInitialGameplayBytes": 5000000, "enforce": false },
  "entryPoints": ["index.html"],
  "files": [{ "path": "index.html", "sha256": "<64-lowercase-hex>", "role": "entry" }],
  "fallbackGroups": []
}
```

The optional network file accepts either `{"responses":[{"path":"index.html","encodedBodySize":1234}]}` or a HAR-like `log.entries` list with request URLs and encoded response sizes. First-party paths must resolve beneath `publicBasePath`; mark a deliberately third-party response with `"external": true` so it bypasses that allowlist check. Every captured response, including a third-party runtime, font, image, or audio file, still counts toward the encoded initial-gameplay budget. Exclude analytics only by excluding it from the documented initial-gameplay evidence scope, never by setting `external: true`. With `--require-network`, include at least one measurable first-party entry-point response; an empty capture is not a measurement.

```bash
python3 scripts/verify_release.py --root build/game --manifest release-manifest.json --print-hashes
python3 scripts/verify_release.py --root build/game --manifest release-manifest.json --network network.json --require-network
python3 scripts/build_release.py --source . --output dist
```

## Handoff

Report:

- source revision and local run command/URL;
- runtime choice and tests actually run;
- normal-input and lifecycle coverage;
- encoded initial gameplay load, package size, and deferred cost;
- asset rights/attribution and any release notice;
- human acceptance evidence separately from technical checks;
- known limits, recovery/rebuild command, and publication state;
- acceptance checklist/progress-file location, overall completion state, explicit waivers, and owner/next action for every unresolved required row.

No external publication follows from making an export. “Local only; not published” describes publication state; completion still depends on the project acceptance checklist.
