import test from "node:test";
import assert from "node:assert/strict";
import "./game-core.js";

const game = globalThis.SignalSprintCore;

test("the same seed produces the same spawned course", () => {
  const first = new game.SignalSprintCore({ seed: 72, spawnInterval: 0.1 });
  const second = new game.SignalSprintCore({ seed: 72, spawnInterval: 0.1 });
  first.start(); second.start();
  for (let step = 0; step < 20; step += 1) { first.step(1 / 60); second.step(1 / 60); }
  assert.deepEqual(first.snapshot().items, second.snapshot().items);
});

test("a signal at the player advances the named goal and wins", () => {
  const core = new game.SignalSprintCore({ seed: 1, target: 1, duration: 10 });
  core.start();
  core.addItem({ kind: "signal", x: 480, y: 442, size: 24, speed: 1 });
  const state = core.step(1 / 60);
  assert.equal(state.collected, 1);
  assert.equal(state.phase, "won");
});

test("a hazard at the player fails a running round", () => {
  const core = new game.SignalSprintCore({ seed: 1, duration: 10 });
  core.start();
  core.addItem({ kind: "hazard", x: 480, y: 442, size: 24, speed: 1 });
  assert.equal(core.step(1 / 60).phase, "failed");
});

test("pause freezes simulation and clears a held direction before resume", () => {
  const core = new game.SignalSprintCore();
  core.start(); core.setInput(1); core.step(1 / 60);
  const paused = core.pause();
  assert.equal(paused.phase, "paused");
  assert.equal(paused.input, 0);
  for (let index = 0; index < 120; index += 1) core.step(1 / 60);
  assert.deepEqual(core.snapshot(), paused);
  core.setInput(-1); core.start();
  assert.equal(core.snapshot().input, 0);
  assert.equal(core.snapshot().phase, "running");
});
