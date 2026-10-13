import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const directory = new URL(".", import.meta.url);
const coreSource = readFileSync(new URL("game-core.js", directory), "utf8");
const appSource = readFileSync(new URL("app.js", directory), "utf8");

class FakeElement {
  constructor(selector, focusCount) {
    this.selector = selector;
    this.focusCount = focusCount;
    this.listeners = new Map();
    this.textContent = "";
    this.hidden = false;
    this.disabled = false;
    this.style = {};
    this.dataset = {};
  }

  addEventListener(type, listener) {
    this.listeners.set(type, listener);
  }

  click() {
    this.listeners.get("click")?.({ preventDefault() {} });
  }

  focus() {
    this.focusCount.last = this.selector;
    if (this.selector === "[data-primary]") this.focusCount.value += 1;
  }

  setAttribute() {}
  setPointerCapture() {}
  getBoundingClientRect() { return { width: 900, left: 0 }; }
}

function canvasContext(rotations) {
  const gradient = { addColorStop() {} };
  return new Proxy({ createLinearGradient: () => gradient, rotate: (angle) => rotations.push(angle) }, { get: (target, key) => target[key] || (() => {}) });
}

function fixture({ reducedMotion = false } = {}) {
  const rotations = [];
  const focusCount = { value: 0 };
  const elements = new Map();
  for (const selector of [
    "canvas", ".game-shell", ".menu", "[data-menu-title]", "[data-menu-copy]",
    "[data-primary]", "[data-pause]", "[data-mute]", "[data-score]", "[data-clock]",
    "[data-live]", "[data-title]", "[data-subtitle]",
  ]) elements.set(selector, new FakeElement(selector, focusCount));
  elements.get("canvas").getContext = () => canvasContext(rotations);
  const listeners = new Map();
  const frames = [];
  let now = 0;
  let audioResumes = 0;
  class FakeGain { constructor() { this.gain = { setValueAtTime() {}, exponentialRampToValueAtTime() {} }; } connect() { return this; } }
  class FakeOscillator { constructor() { this.frequency = { value: 0 }; } connect() { return this; } start() {} stop() {} }
  class FakeAudioContext {
    constructor() { this.state = "suspended"; this.currentTime = 0; }
    resume() { audioResumes += 1; this.state = "running"; return Promise.resolve(); }
    suspend() { this.state = "suspended"; return Promise.resolve(); }
    createGain() { return new FakeGain(); }
    createOscillator() { return new FakeOscillator(); }
    get destination() { return {}; }
  }
  const sandbox = {
    console,
    Math,
    Number,
    Object,
    Array,
    Promise,
    AudioContext: FakeAudioContext,
    performance: { now: () => now },
    requestAnimationFrame: (callback) => { frames.push(callback); return frames.length; },
    cancelAnimationFrame() {},
    matchMedia: () => ({ matches: reducedMotion, addEventListener() {} }),
    addEventListener(type, listener) { listeners.set(type, listener); },
    document: {
      hidden: false,
      querySelector(selector) { return elements.get(selector); },
      addEventListener(type, listener) { listeners.set(`document:${type}`, listener); },
    },
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  vm.runInContext(coreSource, context, { filename: "game-core.js" });
  vm.runInContext(appSource, context, { filename: "app.js" });
  return {
    elements,
    sandbox,
    rotations,
    fire(type, properties = {}) { listeners.get(type)?.({ preventDefault() {}, ...properties }); },
    focusCount,
    audioResumes: () => audioResumes,
    advance(framesToRun, milliseconds = 33) {
      for (let index = 0; index < framesToRun; index += 1) {
        const callback = frames.shift();
        assert.ok(callback, "app should schedule the next animation frame");
        now += milliseconds;
        callback(now);
      }
    },
  };
}

test("idle and paused frames do not fast-forward the next running frame", () => {
  const app = fixture();
  app.advance(100);
  app.elements.get("[data-primary]").click();
  app.advance(1);
  assert.equal(app.elements.get("[data-clock]").textContent, "45s");
  app.elements.get("[data-pause]").click();
  app.advance(100);
  app.elements.get("[data-primary]").click();
  app.advance(1);
  assert.equal(app.elements.get("[data-clock]").textContent, "45s");
});

test("a terminal event focuses the retry action once", () => {
  const app = fixture();
  app.sandbox.SignalSprintCore.SignalSprintCore.prototype.spawn = function spawnFailure() {
    this.addItem({ kind: "hazard", x: this.player.x, y: this.player.y, size: 24, speed: 1 });
    this.spawnClock = 100;
  };
  app.elements.get("[data-primary]").click();
  app.advance(12);
  assert.equal(app.elements.get("[data-menu-title]").textContent, "Static got through.");
  assert.equal(app.focusCount.value, 2);
  app.advance(12);
  assert.equal(app.focusCount.value, 2);
});

test("unmuting a live round resumes its suspended audio context", () => {
  const app = fixture();
  app.elements.get("[data-primary]").click();
  app.elements.get("[data-mute]").click();
  const beforeUnmute = app.audioResumes();
  app.elements.get("[data-mute]").click();
  assert.equal(app.audioResumes(), beforeUnmute + 1);
});


test("muted resume keeps audio suspended", () => {
  const app = fixture();
  app.elements.get("[data-primary]").click();
  app.elements.get("[data-mute]").click();
  app.elements.get("[data-pause]").click();
  const beforeResume = app.audioResumes();
  app.elements.get("[data-primary]").click();
  assert.equal(app.audioResumes(), beforeResume);
});

test("held pause and mute keys do not repeatedly toggle", () => {
  const app = fixture();
  app.elements.get("[data-primary]").click();
  app.fire("keydown", { key: "p" });
  app.fire("keydown", { key: "p", repeat: true });
  assert.equal(app.elements.get("[data-pause]").textContent, "Resume");
  app.fire("keydown", { key: "m" });
  app.fire("keydown", { key: "m", repeat: true });
  assert.equal(app.elements.get("[data-mute]").textContent, "Sound off");
});

test("start and mute actions return focus to the playable canvas", () => {
  const app = fixture();
  app.elements.get("[data-primary]").click();
  assert.equal(app.focusCount.last, "canvas");
  app.elements.get("[data-mute]").focus();
  app.elements.get("[data-mute]").click();
  assert.equal(app.focusCount.last, "canvas");
});

test("reduced motion retains items without decorative rotation", () => {
  const app = fixture({ reducedMotion: true });
  app.elements.get("[data-primary]").click();
  app.advance(12);
  assert.ok(app.rotations.length > 0, "items should still be rendered");
  assert.ok(app.rotations.every((angle) => angle === 0));
});

test("losing window focus pauses a running round", () => {
  const app = fixture();
  app.elements.get("[data-primary]").click();
  app.fire("blur");
  assert.equal(app.elements.get("[data-pause]").textContent, "Resume");
  const clock = app.elements.get("[data-clock]").textContent;
  app.advance(30);
  assert.equal(app.elements.get("[data-clock]").textContent, clock);
});
